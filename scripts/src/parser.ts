import fs from 'fs';
import * as xml2js from 'xml2js';
import he from 'he'; // Used by translator, ensure types are installed

// Import converted modules
import * as shared from './shared';
import * as settings from './settings';
import logger from './logger';
import { ConversionError } from './errors';

// Import JS modules (assuming default exports for now, will need conversion later)
// TODO: Convert translator.js and frontmatter getters to TS
import * as translator from './translator';
import * as author from './frontmatter/author.js';
import * as categories from './frontmatter/categories.js';
import * as coverImage from './frontmatter/coverImage.js';
import * as date from './frontmatter/date.js';
import * as draft from './frontmatter/draft.js';
import * as example from './frontmatter/example.js';
import * as excerpt from './frontmatter/excerpt.js';
import * as featured from './frontmatter/featured.js';
import * as id from './frontmatter/id.js';
import * as modDatetime from './frontmatter/modDatetime.js';
import * as pubDatetime from './frontmatter/pubDatetime.js';
import * as slug from './frontmatter/slug.js';
import * as tags from './frontmatter/tags.js';
import * as taxonomy from './frontmatter/taxonomy.js';
import * as title from './frontmatter/title.js';
import * as type from './frontmatter/type.js';

// --- Interfaces and Types ---

// Represents a generic item from the WordPress XML channel
interface WordPressItem {
  post_id: string[];
  post_name: string[];
  post_type: string[];
  status: string[];
  encoded?: string[]; // Content
  link?: string[];
  postmeta?: { meta_key: string[]; meta_value: string[] }[];
  attachment_url?: string[];
  post_parent?: string[];
  // Allow other potential properties from XML
  [key: string]: any;
}

// Metadata extracted or derived for a post
interface PostMeta {
  id: string;
  slug: string;
  coverImageId?: string;
  coverImage?: string; // Filename derived later
  type: string;
  imageUrls: string[];
}

// Structure for frontmatter (can be extended)
interface PostFrontmatter {
  [key: string]: any; // Flexible structure
}

// Represents a parsed post ready for writing
export interface Post {
  data: WordPressItem; // Raw data from XML
  meta: PostMeta;
  content: string; // Markdown content
  frontmatter: PostFrontmatter;
}

// Represents an image found (attached or scraped)
interface Image {
  id: string | number; // Attachment ID or -1 for scraped
  postId: string; // Parent post ID
  url: string;
}

// Configuration specific to the parser
interface ParserConfig {
  input: string;
  includeOtherTypes?: boolean;
  saveAttachedImages?: boolean;
  saveScrapedImages?: boolean;
  // Add other relevant config properties if needed
}

// Type for a function that gets a frontmatter value
type FrontmatterGetter = (post: Omit<Post, 'frontmatter'>) => any;

// Map of frontmatter keys to their getter functions
interface FrontmatterGettersMap {
  [key: string]: FrontmatterGetter;
}

// --- Frontmatter Getters Map ---

// Manually create the map to replace requireDirectory
// Assuming default exports from the JS files for now
const frontmatterGetters: FrontmatterGettersMap = {
  id: (id as any).default,
  title: (title as any).default,
  author: (author as any).default,
  pubDatetime: (pubDatetime as any).default,
  modDatetime: (modDatetime as any).default,
  categories: (categories as any).default,
  taxonomy: (taxonomy as any).default,
  tags: (tags as any).default,
  coverImage: (coverImage as any).default,
  date: (date as any).default,
  draft: (draft as any).default,
  example: (example as any).default,
  excerpt: (excerpt as any).default,
  featured: (featured as any).default,
  slug: (slug as any).default,
  type: (type as any).default,
};

// --- Helper Functions ---

/** Safely gets the first element of a potential array from XML data. */
function getXmlValue(field: any[] | undefined): string | undefined {
    return Array.isArray(field) && field.length > 0 ? String(field[0]) : undefined;
}

/** Safely gets post ID. */
function getPostId(postData: WordPressItem): string {
    return getXmlValue(postData.post_id) ?? ''; // Provide default empty string
}

/** Safely gets and decodes post slug. */
function getPostSlug(postData: WordPressItem): string {
    const slugEncoded = getXmlValue(postData.post_name);
    if (!slugEncoded) return ''; // Return empty if no slug
    try {
        return decodeURIComponent(slugEncoded);
    } catch (e) {
        logger.warn(`Failed to decode slug: "${slugEncoded}". Using raw value.`);
        return slugEncoded;
    }
}

/** Safely gets cover image ID from postmeta. */
function getPostCoverImageId(postData: WordPressItem): string | undefined {
    if (!Array.isArray(postData.postmeta)) {
        return undefined;
    }
    const postmeta = postData.postmeta.find(pm => getXmlValue(pm.meta_key) === '_thumbnail_id');
    return postmeta ? getXmlValue(postmeta.meta_value) : undefined;
}

/** Filters WordPress items by post type. */
function getItemsOfType(channelData: WordPressItem[], type: string): WordPressItem[] {
    return channelData.filter(item => getXmlValue(item.post_type) === type);
}

// --- Core Parsing Logic ---

/**
 * Determines which post types to process based on configuration.
 * @param channelData - Array of items from the WordPress XML channel.
 * @param config - Parser configuration.
 * @returns Array of unique post type strings to process.
 */
function getPostTypes(channelData: WordPressItem[], config: ParserConfig): string[] {
  if (config.includeOtherTypes) {
    const excludedTypes = new Set([
      'attachment',
      'revision',
      'nav_menu_item',
      'custom_css',
      'customize_changeset',
      // Add any other types to always exclude
    ]);
    const types = channelData
      .map(item => getXmlValue(item.post_type))
      .filter((type): type is string => !!type && !excludedTypes.has(type)); // Filter out undefined and excluded types

    return [...new Set(types)]; // Unique types
  } else {
    return ['post', 'page']; // Default to 'post' and 'page' if not including others
  }
}

/**
 * Collects and performs initial processing of posts based on selected types.
 * @param channelData - Array of items from the WordPress XML channel.
 * @param postTypes - Array of post type strings to include.
 * @param config - Parser configuration.
 * @returns Array of partially processed Post objects (without frontmatter).
 */
function collectPosts(
    channelData: WordPressItem[],
    postTypes: string[],
    config: ParserConfig
): Omit<Post, 'frontmatter'>[] {

  // TODO: Define TurndownService type if possible, or use 'any'
  const turndownService = (translator as any).initTurndownService();
  const allPosts: Omit<Post, 'frontmatter'>[] = [];

  postTypes.forEach(postType => {
    const postsForType = getItemsOfType(channelData, postType)
      // Filter out trashed or draft posts
      .filter(postData => {
          const status = getXmlValue(postData.status);
          return status !== 'trash' && status !== 'draft' && status !== 'auto-draft';
      })
      .map((postData): Omit<Post, 'frontmatter'> => {
          const meta: PostMeta = {
            id: getPostId(postData),
            slug: getPostSlug(postData),
            coverImageId: getPostCoverImageId(postData),
            coverImage: undefined, // Will be populated by mergeImagesIntoPosts
            type: postType,
            imageUrls: [], // Will be populated by mergeImagesIntoPosts
          };
          const content = (translator as any).getPostContent(postData, turndownService, config);

          return { data: postData, meta, content };
      });

    if (postTypes.length > 1) {
      logger.info(`${postsForType.length} "${postType}" posts found.`);
    }
    allPosts.push(...postsForType);
  });

  if (postTypes.length === 1) {
    logger.info(`${allPosts.length} "${postTypes[0]}" posts found.`);
  } else {
    logger.info(`Total posts found: ${allPosts.length}`);
  }
  return allPosts;
}

/**
 * Collects image information for attachments.
 * @param channelData - Array of items from the WordPress XML channel.
 * @returns Array of Image objects for attachments.
 */
function collectAttachedImages(channelData: WordPressItem[]): Image[] {
  const images = getItemsOfType(channelData, 'attachment')
    .filter(attachment => {
        const url = getXmlValue(attachment.attachment_url);
        // Basic image extension check
        return url && /\.(gif|jpe?g|png|webp|svg)$/i.test(url);
    })
    .map((attachment): Image | null => {
        const id = getXmlValue(attachment.post_id);
        const postId = getXmlValue(attachment.post_parent);
        const url = getXmlValue(attachment.attachment_url);

        if (id && postId && url) {
            return { id, postId, url };
        }
        logger.warn(`Skipping attachment with missing data: ID=${id}, ParentID=${postId}, URL=${url}`);
        return null; // Skip if essential data is missing
    })
    .filter((image): image is Image => image !== null); // Filter out nulls

  logger.info(`${images.length} attached images found.`);
  return images;
}

/**
 * Collects image information by scraping <img> tags from post content.
 * @param channelData - Array of items from the WordPress XML channel.
 * @param postTypes - Array of post type strings to scrape from.
 * @returns Array of Image objects for scraped images.
 */
function collectScrapedImages(channelData: WordPressItem[], postTypes: string[]): Image[] {
  const images: Image[] = [];
  const processedUrls = new Set<string>(); // Avoid duplicates per post

  postTypes.forEach(postType => {
    getItemsOfType(channelData, postType).forEach(postData => {
      const postId = getPostId(postData);
      const postContent = getXmlValue(postData.encoded) ?? '';
      const postLink = getXmlValue(postData.link); // Base URL for relative paths

      if (!postContent || !postLink) return; // Skip if no content or link

      // Regex to find src attribute in img tags
      const imgRegex = /<img[^>]*src=["']([^"']+\.(?:gif|jpe?g|png|webp|svg))["'][^>]*>/gi;
      let match;

      while ((match = imgRegex.exec(postContent)) !== null) {
        const imageUrlRaw = match[1];
        try {
          // Resolve URL relative to the post's link
          const absoluteUrl = new URL(imageUrlRaw, postLink).href;

          // Add image only if not already added for this post
          if (!processedUrls.has(absoluteUrl)) {
              images.push({
                id: -1, // Indicate scraped image
                postId: postId,
                url: absoluteUrl,
              });
              processedUrls.add(absoluteUrl);
          }
        } catch (urlError: any) {
            logger.warn(`Invalid image URL "${imageUrlRaw}" found in post ${postId}: ${urlError.message}`);
        }
      }
      processedUrls.clear(); // Clear for the next post
    });
  });

  logger.info(`${images.length} images scraped from post content.`);
  return images;
}

/**
 * Merges image information (URLs, cover image filename) into the corresponding Post objects.
 * @param images - Array of all found Image objects.
 * @param posts - Array of Post objects to merge into.
 */
function mergeImagesIntoPosts(images: Image[], posts: Omit<Post, 'frontmatter'>[]): void {
  const postMap = new Map(posts.map(p => [p.meta.id, p]));

  images.forEach(image => {
    const post = postMap.get(image.postId);
    if (!post) return; // Image belongs to a post not being processed

    let shouldAttach = false;

    // Check if image was attached to this post
    if (image.id !== -1 && image.postId === post.meta.id) {
      shouldAttach = true;
    }

    // Check if image is the cover image for this post
    if (String(image.id) === post.meta.coverImageId) { // Ensure ID comparison is correct type
      shouldAttach = true;
      try {
          post.meta.coverImage = shared.getFilenameFromUrl(image.url);
      } catch (e: any) {
          logger.error(`Failed to get filename for cover image URL "${image.url}" in post ${post.meta.id}`, e);
      }
    }

    // Add URL to post's list if attached and not already present
    if (shouldAttach && !post.meta.imageUrls.includes(image.url)) {
      post.meta.imageUrls.push(image.url);
    }
  });
}

/**
 * Validates the structure and types of generated frontmatter.
 * Logs warnings for issues found.
 * @param frontmatter - The frontmatter object to validate.
 * @param postSlug - The slug of the post for context in logs.
 */
function validateFrontmatter(frontmatter: PostFrontmatter, postSlug: string): void {
    const errors: string[] = [];

    // Example validation: Check heroImage structure
    if ('heroImage' in frontmatter) {
        const img = frontmatter.heroImage;
        if (typeof img !== 'object' || img === null || Array.isArray(img)) {
            errors.push(`heroImage: Expected an object, received ${typeof img}`);
        } else {
            if (typeof img.src !== 'string' || !img.src) {
                errors.push('heroImage.src: Expected a non-empty string');
            }
            if (typeof img.alt !== 'string') { // Allow empty alt text? Check requirements.
                errors.push('heroImage.alt: Expected a string');
            }
        }
    }

    // Example validation: Check group value
    if ('group' in frontmatter) {
        const validGroups = ['pro', 'kontra', 'fragezeiten']; // Define valid groups
        if (typeof frontmatter.group !== 'string' || !validGroups.includes(frontmatter.group)) {
            errors.push(`group: Expected one of [${validGroups.join(', ')}], received "${frontmatter.group}"`);
        }
    }

    // Add more validations as needed...

    if (errors.length > 0) {
        logger.warn(`Frontmatter validation warnings for post "${postSlug}":`);
        errors.forEach(error => logger.warn(`- ${error}`));
    }
}

/**
 * Populates the `frontmatter` property for each post using configured getters.
 * @param posts - Array of Post objects (still missing `frontmatter`).
 * @throws {ConversionError} If a configured frontmatter getter is not found.
 */
function populateFrontmatter(posts: Omit<Post, 'frontmatter'>[]): void {
  (posts as Post[]).forEach(post => { // Cast needed to add 'frontmatter' property
    const frontmatter: PostFrontmatter = {};
    settings.frontmatter_fields.forEach(fieldSetting => {
      const [key, alias] = fieldSetting.split(':');
      const targetKey = alias || key;

      const getter = frontmatterGetters[key];
      if (!getter) {
        // Throw an error if a configured getter doesn't exist
        throw new ConversionError(`Frontmatter getter not found for key "${key}". Check settings.frontmatter_fields and frontmatter directory.`);
      }

      try {
          const value = getter(post);
          // Only add non-null/non-undefined values to frontmatter
          if (value !== null && value !== undefined) {
              frontmatter[targetKey] = value;
          }
      } catch (getterError: any) {
          logger.error(`Error running frontmatter getter "${key}" for post "${post.meta.slug}"`, getterError);
          // Decide whether to skip the field or throw
      }
    });

    // Validate the generated frontmatter
    validateFrontmatter(frontmatter, post.meta.slug);

    post.frontmatter = frontmatter; // Assign the populated frontmatter
  });
}

// --- Main Export ---

/**
 * Reads and parses a WordPress XML export file.
 * @param config - Parser configuration options.
 * @returns A promise resolving to an array of fully processed Post objects.
 * @throws {ConversionError} If file reading, XML parsing, or processing fails.
 */
export async function parseFilePromise(config: ParserConfig): Promise<Post[]> {
  try {
    logger.info('Starting WordPress XML parsing...');
    const xmlContent = await fs.promises.readFile(config.input, 'utf8');

    logger.info('Parsing XML content...');
    // Explicitly type the expected structure from xml2js
    const allData = await xml2js.parseStringPromise(xmlContent, {
      trim: true,
      tagNameProcessors: [xml2js.processors.stripPrefix],
      explicitArray: true, // Ensure arrays for consistency
    }) as { rss: { channel: { item: WordPressItem[] }[] } };

    // Basic validation of parsed structure
    if (!allData?.rss?.channel?.[0]?.item) {
        throw new Error('Invalid XML structure: Expected rss > channel > item path.');
    }
    const channelData: WordPressItem[] = allData.rss.channel[0].item;
    logger.info(`Found ${channelData.length} items in XML channel.`);

    const postTypes = getPostTypes(channelData, config);
    logger.info(`Processing post types: ${postTypes.join(', ')}`);

    const posts = collectPosts(channelData, postTypes, config);

    let images: Image[] = [];
    if (config.saveAttachedImages || config.saveScrapedImages) {
      const attachedImages = config.saveAttachedImages ? collectAttachedImages(channelData) : [];
      const scrapedImages = config.saveScrapedImages ? collectScrapedImages(channelData, postTypes) : [];
      images = [...attachedImages, ...scrapedImages];
      logger.info(`Total images found (attached + scraped): ${images.length}`);
    } else {
      logger.info('Image processing skipped by configuration.');
    }

    logger.info('Merging image data into posts...');
    mergeImagesIntoPosts(images, posts);

    logger.info('Populating frontmatter...');
    populateFrontmatter(posts); // Populates frontmatter in place

    logger.info('Parsing complete.');
    return posts as Post[]; // Cast as the frontmatter is now populated
  } catch (error: any) {
    // Ensure all errors are wrapped in ConversionError
    if (error instanceof ConversionError) {
        throw error;
    }
    throw new ConversionError(`Failed to parse WordPress export file "${config.input}"`, error);
  }
}