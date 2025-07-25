import fs from "fs";

import * as xml2js from "xml2js";

import { XmlConversionError, XmlValidationError } from "./errors.js";
// Import all frontmatter getters manually since require-directory doesn't work with ES modules
import author from "./frontmatter/author.js";
import categories from "./frontmatter/categories.js";
import coverImage from "./frontmatter/coverImage.js";
import date from "./frontmatter/date.js";
import draft from "./frontmatter/draft.js";
import excerpt from "./frontmatter/excerpt.js";
import featured from "./frontmatter/featured.js";
import group from "./frontmatter/group.js";
import heroImage from "./frontmatter/heroImage.js";
import id from "./frontmatter/id.js";
import keywords from "./frontmatter/keywords.js";
import modDatetime from "./frontmatter/modDatetime.js";
import pubDatetime from "./frontmatter/pubDatetime.js";
import slug from "./frontmatter/slug.js";
import tags from "./frontmatter/tags.js";
import taxonomy from "./frontmatter/taxonomy.js";
import title from "./frontmatter/title.js";
import type from "./frontmatter/type.js";
import logger from "./logger.js";
import * as settings from "./settings.js";
import * as shared from "./shared.js";
import * as translator from "./translator.js";
import type {
  Post,
  PostMeta,
  Image,
  RawXmlItem,
  WordPressPostData,
  XmlConverterConfig,
  FrontmatterGetter,
  FrontmatterValue,
  ImageImport,
} from "./types.js";

// Create frontmatter getters object manually
const frontmatterGetters: Record<string, FrontmatterGetter> = {
  author,
  categories,
  coverImage,
  date,
  draft,
  excerpt,
  featured,
  group,
  heroImage,
  id,
  keywords,
  modDatetime,
  pubDatetime,
  slug,
  tags,
  taxonomy,
  title,
  type,
};

// Types are now imported from types.ts

/**
 * Reads the WordPress export file and parses it into an array of post objects.
 *
 * @param config - Configuration options.
 * @returns A promise that resolves to an array of post objects.
 * @throws {XmlConversionError} When parsing or processing fails
 */
async function parseFilePromise(config: XmlConverterConfig): Promise<Post[]> {
  try {
    logger.info("Parsing WordPress XML export...");
    
    // Read and validate file content
    const content = await fs.promises.readFile(config.input, "utf8");
    if (!content.trim()) {
      throw XmlValidationError.forInvalidXmlStructure("non-empty content");
    }

    // Parse XML with error handling
    const allData = await xml2js.parseStringPromise(content, {
      trim: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
      explicitArray: true,
      normalizeTags: false,
    });

    // Validate XML structure
    if (!allData?.rss?.channel?.[0]?.item) {
      throw XmlValidationError.forInvalidXmlStructure("RSS channel with items");
    }

    const channelData = allData.rss.channel[0].item as RawXmlItem[];
    logger.info(`Found ${channelData.length} items in XML export`);

    // Process posts and images
    const postTypes = getPostTypes(channelData, config);
    const posts = collectPosts(channelData, postTypes, config);

    let images: Image[] = [];
    if (config.saveAttachedImages || config.saveScrapedImages) {
      const attachedImages = config.saveAttachedImages
        ? collectAttachedImages(channelData)
        : [];
      const scrapedImages = config.saveScrapedImages
        ? collectScrapedImages(channelData, postTypes)
        : [];
      images = [...attachedImages, ...scrapedImages];
    }

    mergeImagesIntoPosts(images, posts);
    const completePosts = populateFrontmatter(posts);

    logger.info(`Successfully parsed ${completePosts.length} posts with ${images.length} images`);
    return completePosts;
  } catch (error) {
    if (error instanceof XmlValidationError) {
      throw error;
    }
    
    const originalError = error instanceof Error ? error : new Error(String(error));
    throw XmlConversionError.forParsingFailure(originalError, config.input);
  }
}

/**
 * Get post types to process based on configuration
 */
function getPostTypes(
  channelData: RawXmlItem[],
  config: XmlConverterConfig
): string[] {
  if (config.includeOtherTypes) {
    // Excluded post types - use Set for O(1) lookup performance
    const excludedTypes = new Set([
      "attachment",
      "revision",
      "nav_menu_item",
      "custom_css",
      "customize_changeset",
      "oembed_cache",
      "user_request",
      "wp_block",
    ]);

    // Use Set for automatic deduplication and better performance
    const typeSet = new Set<string>();
    
    // Process in batches for memory efficiency with large exports
    const BATCH_SIZE = 1000;
    for (let i = 0; i < channelData.length; i += BATCH_SIZE) {
      const batch = channelData.slice(i, i + BATCH_SIZE);
      
      for (const item of batch) {
        const postType = item.post_type?.[0];
        if (postType && !excludedTypes.has(postType)) {
          typeSet.add(postType);
        }
      }
    }
    
    const types = Array.from(typeSet);
    logger.info(`Found post types: ${types.join(", ")}`);
    return types;
  } else {
    // Default to just blog posts
    return ["post"];
  }
}

/**
 * Filter channel data by post type
 */
function getItemsOfType(channelData: RawXmlItem[], type: string): RawXmlItem[] {
  return channelData.filter(item => item.post_type?.[0] === type);
}

/**
 * Collect posts from channel data
 */
function collectPosts(
  channelData: RawXmlItem[],
  postTypes: string[],
  config: XmlConverterConfig
): Omit<Post, "frontmatter">[] {
  // this is passed into getPostContent() for the markdown conversion
  const turndownService = translator.initTurndownService();

  const allPosts: Omit<Post, "frontmatter">[] = [];
  postTypes.forEach(postType => {
    const postsForType = getItemsOfType(channelData, postType)
      .filter(
        postData =>
          postData.status?.[0] !== "trash" && postData.status?.[0] !== "draft"
      )
      .map(postData => {
        const contentResult = translator.getPostContent(
          postData,
          turndownService,
          config
        );
        const post: Omit<Post, "frontmatter"> = {
          data: postData as unknown as WordPressPostData,
          meta: {
            id: getPostId(postData),
            slug: getPostSlug(postData),
            coverImageId: getPostCoverImageId(postData),
            coverImage: undefined,
            type: postType,
            imageUrls: [],
          } as PostMeta,
          content: contentResult.content,
          imageImports: contentResult.imageImports || ([] as ImageImport[]),
        };

        return post;
      });

    if (postTypes.length > 1) {
      logger.info(`${postsForType.length} "${postType}" posts found.`);
    }

    allPosts.push(...postsForType);
  });

  if (postTypes.length === 1) {
    logger.info(`${allPosts.length} posts found.`);
  }
  return allPosts;
}

/**
 * Get post ID from post data
 */
function getPostId(postData: RawXmlItem): string {
  return postData.post_id?.[0] ?? "";
}

/**
 * Get post slug from post data
 */
function getPostSlug(postData: RawXmlItem): string {
  return decodeURIComponent(postData.post_name?.[0] ?? "");
}

/**
 * Get cover image ID from post data
 */
function getPostCoverImageId(postData: RawXmlItem): string | undefined {
  if (postData.postmeta === undefined) {
    return undefined;
  }

  const postmeta = postData.postmeta?.find(
    (meta: unknown) =>
      (meta as { meta_key: string[]; meta_value: string[] }).meta_key[0] ===
      "_thumbnail_id"
  );
  const id = postmeta
    ? (postmeta as { meta_key: string[]; meta_value: string[] }).meta_value[0]
    : undefined;
  return id;
}

/**
 * Collect attached images from channel data
 * Optimized with compiled regex and early validation
 */
function collectAttachedImages(channelData: RawXmlItem[]): Image[] {
  // Interface for attachment items with additional WordPress fields
  interface AttachmentItem extends RawXmlItem {
    attachment_url?: string[];
    post_parent?: string[];
  }

  // Precompile regex and use more comprehensive image extensions
  const imageExtRegex = /\.(gif|jpe?g|png|webp|avif|svg|bmp|tiff?)$/i;
  const attachments = getItemsOfType(channelData, "attachment");
  
  // Pre-allocate array with estimated size for better memory performance
  const images: Image[] = [];
  images.length = 0; // Ensure clean start

  // Process attachments in batches to avoid memory pressure
  const BATCH_SIZE = 100;
  for (let i = 0; i < attachments.length; i += BATCH_SIZE) {
    const batch = attachments.slice(i, i + BATCH_SIZE);
    
    for (const attachment of batch) {
      const attachmentItem = attachment as AttachmentItem;
      const attachmentUrl = attachmentItem.attachment_url?.[0];

      if (attachmentUrl && imageExtRegex.test(attachmentUrl)) {
        // Validate URL structure before adding
        try {
          new URL(attachmentUrl); // Will throw if invalid
          images.push({
            id: attachment.post_id?.[0] ?? "",
            postId: attachmentItem.post_parent?.[0] ?? "",
            url: attachmentUrl,
          });
        } catch {
          logger.warn(`Invalid attachment URL skipped: ${attachmentUrl}`);
        }
      }
    }
  }

  logger.info(`${images.length} attached images found and validated.`);
  return images;
}

/**
 * Collect images from post content
 * Optimized with compiled regex and reduced allocations
 */
function collectScrapedImages(
  channelData: RawXmlItem[],
  postTypes: string[]
): Image[] {
  const images: Image[] = [];
  const imgRegex =
    /<img[^>]*src="(.+?\.(?:gif|jpe?g|png|webp|avif|svg))"[^>]*>/gi;
  const seenUrls = new Set<string>(); // Deduplicate images

  for (const postType of postTypes) {
    const postsOfType = getItemsOfType(channelData, postType);

    for (const postData of postsOfType) {
      const postId = postData.post_id?.[0] ?? "";
      const postContent = postData.encoded?.[0] ?? "";
      const postLink = postData.link?.[0] ?? "";

      if (!postContent) continue;

      let match;
      imgRegex.lastIndex = 0; // Reset regex state

      while ((match = imgRegex.exec(postContent)) !== null) {
        try {
          const url = new URL(match[1], postLink).href;
          
          // Skip duplicates
          if (seenUrls.has(url)) {
            continue;
          }
          seenUrls.add(url);
          
          images.push({
            id: "-1",
            postId,
            url,
          });
        } catch (urlError) {
          logger.warn(`Invalid image URL in post ${postId}:`, {
            url: match[1],
            postLink,
            error: urlError instanceof Error ? urlError.message : String(urlError),
          });
        }
      }
    }
  }

  logger.info(`${images.length} unique images scraped from post body content.`);
  return images;
}

// Note: generateImageVariableName function removed - available in frontmatter/heroImage.ts if needed

/**
 * Update hero image metadata for post (no longer adds to imports since heroImage uses string paths)
 */
function updateHeroImageMetadata(
  post: Omit<Post, "frontmatter">,
  imageUrl: string
): void {
  if (!post.meta.coverImage) {
    return;
  }

  // Just update the coverImage filename if we have AI-enhanced metadata
  if (post.meta.aiImageMetadata && post.meta.aiImageMetadata.has(imageUrl)) {
    const aiMetadata = post.meta.aiImageMetadata.get(imageUrl);
    if (aiMetadata) {
      post.meta.coverImage = aiMetadata.filename; // Use AI-enhanced filename
    }
  }
}

/**
 * Merge images into posts
 * Optimized with Map-based lookups for O(1) post access
 */
function mergeImagesIntoPosts(
  images: Image[],
  posts: Omit<Post, "frontmatter">[]
): void {
  // Early return if no images to process
  if (images.length === 0) {
    logger.debug("No images to merge into posts");
    return;
  }

  // Create maps for O(1) lookups instead of nested loops
  const postsByIdMap = new Map<string, Omit<Post, "frontmatter">>();
  const postsByCoverIdMap = new Map<string, Omit<Post, "frontmatter">>();
  
  // Create sets for efficient duplicate checking
  const postImageSets = new Map<string, Set<string>>();

  // Initialize maps and sets
  for (const post of posts) {
    postsByIdMap.set(post.meta.id, post);
    postImageSets.set(post.meta.id, new Set(post.meta.imageUrls));
    
    if (post.meta.coverImageId) {
      postsByCoverIdMap.set(post.meta.coverImageId, post);
    }
  }

  // Process images in batches for memory efficiency
  const BATCH_SIZE = 50;
  let processedCount = 0;
  
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    
    for (const image of batch) {
      // Check if image is attached to a post
      const attachedPost = postsByIdMap.get(image.postId);
      if (attachedPost) {
        const imageSet = postImageSets.get(image.postId);
        if (imageSet && !imageSet.has(image.url)) {
          (attachedPost.meta.imageUrls as string[]).push(image.url);
          imageSet.add(image.url);
        }
      }

      // Check if image is a featured image
      const featuredPost = postsByCoverIdMap.get(image.id);
      if (featuredPost) {
        featuredPost.meta.coverImage = shared.getFilenameFromUrl(image.url);
        updateHeroImageMetadata(featuredPost, image.url);

        const imageSet = postImageSets.get(featuredPost.meta.id);
        if (imageSet && !imageSet.has(image.url)) {
          (featuredPost.meta.imageUrls as string[]).push(image.url);
          imageSet.add(image.url);
        }
      }
      
      processedCount++;
    }
  }

  logger.debug(`Merged ${processedCount} images into ${posts.length} posts`);
}

/**
 * Populate post frontmatter with data from each post
 * @throws {XmlValidationError} When frontmatter getter is not found
 */
function populateFrontmatter(posts: Omit<Post, "frontmatter">[]): Post[] {
  return posts.map((post, index) => {
    try {
      const frontmatter: Record<string, FrontmatterValue> = {};
      
      settings.frontmatter_fields.forEach(field => {
        const [key, alias] = field.split(":");

        const frontmatterGetter = frontmatterGetters[key];
        if (!frontmatterGetter) {
          throw XmlValidationError.forMissingFrontmatterGetter(key);
        }

        try {
          frontmatter[alias || key] = frontmatterGetter(post as Post);
        } catch (error) {
          const originalError = error instanceof Error ? error : new Error(String(error));
          throw XmlValidationError.forInvalidPostData(
            post.meta.id || `post-${index}`,
            `Failed to generate frontmatter field '${key}': ${originalError.message}`
          );
        }
      });

      return {
        ...post,
        frontmatter,
      } as Post;
    } catch (error) {
      if (error instanceof XmlValidationError) {
        throw error;
      }
      
      const originalError = error instanceof Error ? error : new Error(String(error));
      throw XmlValidationError.forInvalidPostData(
        post.meta.id || `post-${index}`,
        `Failed to populate frontmatter: ${originalError.message}`
      );
    }
  });
}

export { parseFilePromise };
