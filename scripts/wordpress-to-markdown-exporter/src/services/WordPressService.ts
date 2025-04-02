import * as fs from "fs/promises";
import { inject, injectable } from "inversify";
import * as xml2js from "xml2js";
import { HtmlToMarkdownConverter } from "../utils/HtmlToMarkdownConverter.js";
import { ILoggerService } from "../domain/interfaces/ILoggerService.js";
import { IWordPressService } from "../domain/interfaces/IWordPressService.js";
import { Configuration } from "../domain/models/Configuration.js";
import { Image, Post } from "../domain/models/Post.js";
import { Result } from "../utils/Result.js";

/**
 * Implementation of the WordPress service
 */
@injectable()
export class WordPressService implements IWordPressService {
  /**
   * Creates a new WordPress service
   * @param loggerService Logger service
   */
  constructor(
    @inject("ILoggerService") private readonly loggerService: ILoggerService
  ) {}

  /**
   * Parse WordPress export file and convert to posts
   * @param config Configuration options
   * @returns Result containing the parsed posts or an error
   */
  public async parseExport(config: Configuration): Promise<Result<Post[]>> {
    try {
      this.loggerService.info(`Parsing WordPress export file: ${config.input}`);
      
      // Read the export file
      const content = await fs.readFile(config.input, "utf8");
      
      // Parse XML to JavaScript object
      const allData = await xml2js.parseStringPromise(content, {
        trim: true,
        tagNameProcessors: [xml2js.processors.stripPrefix],
      });
      
      // Get channel data
      const channelData = allData.rss.channel[0].item;
      
      // Get post types to process
      const postTypes = this.getPostTypes(channelData, config);
      
      // Collect posts
      const posts = this.collectPosts(channelData, postTypes, config);
      
      // Collect images if needed
      let images: Image[] = [];
      if (config.saveAttachedImages || config.saveScrapedImages) {
        const attachedImages = config.saveAttachedImages
          ? this.collectAttachedImages(channelData)
          : [];
        const scrapedImages = config.saveScrapedImages
          ? this.collectScrapedImages(channelData, postTypes)
          : [];
        images = [...attachedImages, ...scrapedImages];
      }
      
      // Merge images into posts
      this.mergeImagesIntoPosts(images, posts);
      
      // Populate frontmatter
      this.populateFrontmatter(posts, config);
      
      this.loggerService.success(`Parsed ${posts.length} posts successfully`);
      return Result.success(posts);
    } catch (error) {
      return Result.failure("Failed to parse WordPress export file", error as Error);
    }
  }

  /**
   * Get post types from WordPress export data
   * @param channelData Channel data from WordPress export
   * @param config Configuration options
   * @returns Array of post types to process
   */
  public getPostTypes(channelData: any[], config: Configuration): string[] {
    if (config.includeOtherTypes) {
      // Search export file for all post types minus some default types we don't want
      // Effectively this will be 'post', 'page', and custom post types
      const types = channelData
        .map((item) => item.post_type[0])
        .filter(
          (type) =>
            ![
              "attachment",
              "revision",
              "nav_menu_item",
              "custom_css",
              "customize_changeset",
            ].includes(type)
        );
      return [...new Set(types)]; // Remove duplicates
    } else {
      // Just plain old vanilla "post" posts
      return ["post"];
    }
  }

  /**
   * Collect posts from WordPress export data
   * @param channelData Channel data from WordPress export
   * @param postTypes Post types to collect
   * @param config Configuration options
   * @returns Array of posts
   */
  public collectPosts(
    channelData: any[],
    postTypes: string[],
    config: Configuration
  ): Post[] {
    // Initialize HTML to Markdown converter
    this.initHtmlToMarkdownConverter();
    
    const allPosts: Post[] = [];
    postTypes.forEach((postType) => {
      const postsForType = this.getItemsOfType(channelData, postType)
        .filter(
          (postData) =>
            postData.status[0] !== "trash" && postData.status[0] !== "draft"
        )
        .map((postData) => ({
          data: postData,
          meta: {
            id: this.getPostId(postData),
            slug: this.getPostSlug(postData),
            coverImageId: this.getPostCoverImageId(postData),
            coverImage: undefined,
            type: postType,
            imageUrls: [],
          },
          content: this.getPostContent(postData, config),
          frontmatter: {},
        }));
      
      if (postTypes.length > 1) {
        this.loggerService.info(`${postsForType.length} "${postType}" posts found.`);
      }
      
      allPosts.push(...postsForType);
    });
    
    if (postTypes.length === 1) {
      this.loggerService.info(`${allPosts.length} posts found.`);
    }
    
    return allPosts;
  }

  /**
   * Collect attached images from WordPress export data
   * @param channelData Channel data from WordPress export
   * @returns Array of images
   */
  public collectAttachedImages(channelData: any[]): Image[] {
    const images = this.getItemsOfType(channelData, "attachment")
      // Filter to certain image file types
      .filter(
        (attachment) =>
          attachment.attachment_url &&
          /\\.(gif|jpe?g|png|webp)$/i.test(attachment.attachment_url[0])
      )
      .map((attachment) => ({
        id: attachment.post_id[0],
        postId: attachment.post_parent[0],
        url: attachment.attachment_url[0],
      }));
    
    this.loggerService.info(`${images.length} attached images found.`);
    return images;
  }

  /**
   * Collect images from post content
   * @param channelData Channel data from WordPress export
   * @param postTypes Post types to collect from
   * @returns Array of images
   */
  public collectScrapedImages(channelData: any[], postTypes: string[]): Image[] {
    const images: Image[] = [];
    postTypes.forEach((postType) => {
      this.getItemsOfType(channelData, postType).forEach((postData) => {
        const postId = postData.post_id[0];
        const postContent = postData.encoded[0];
        const postLink = postData.link[0];
        
        const matches = [
          ...postContent.matchAll(
            /<img[^>]*src="(.+?\\.(?:gif|jpe?g|png|webp|avif|svg))"[^>]*>/gi
          ),
        ];
        matches.forEach((match) => {
          // Base the matched image URL relative to the post URL
          const url = new URL(match[1], postLink).href;
          images.push({
            id: "-1",
            postId: postId,
            url,
          });
        });
      });
    });
    
    this.loggerService.info(`${images.length} images scraped from post body content.`);
    return images;
  }

  /**
   * Merge images into posts
   * @param images Array of images
   * @param posts Array of posts
   */
  public mergeImagesIntoPosts(images: Image[], posts: Post[]): void {
    images.forEach((image) => {
      posts.forEach((post) => {
        let shouldAttach = false;
        
        // This image was uploaded as an attachment to this post
        if (image.postId === post.meta.id) {
          shouldAttach = true;
        }
        
        // This image was set as the featured image for this post
        if (image.id === post.meta.coverImageId) {
          shouldAttach = true;
          post.meta.coverImage = this.getFilenameFromUrl(image.url);
        }
        
        if (shouldAttach && !post.meta.imageUrls.includes(image.url)) {
          post.meta.imageUrls.push(image.url);
        }
      });
    });
  }

  /**
   * Populate post frontmatter with data from each post
   * @param posts Array of posts to populate frontmatter for
   * @param config Configuration options
   */
  public populateFrontmatter(posts: Post[], config: Configuration): void {
    posts.forEach((post) => {
      const frontmatter: Record<string, any> = {};
      
      // Add frontmatter fields based on configuration
      config.frontmatterFields.forEach((field) => {
        const [key, alias] = field.split(":");
        const fieldName = alias || key;
        
        // Get frontmatter value based on key
        const value = this.getFrontmatterValue(post, key, config);
        
        if (value !== undefined) {
          frontmatter[fieldName] = value;
        }
      });
      
      post.frontmatter = frontmatter;
    });
  }

  /**
   * Get frontmatter value for a post
   * @param post Post to get frontmatter value for
   * @param key Frontmatter key
   * @param config Configuration options
   * @returns Frontmatter value
   */
  private getFrontmatterValue(
    post: Post,
    key: string,
    config: Configuration
  ): any {
    switch (key) {
      case "id":
        return post.meta.id;
      case "title":
        return post.data.title ? post.data.title[0] : undefined;
      case "author":
        return post.data.creator ? post.data.creator[0] : undefined;
      case "date":
        return this.formatDate(post.data.pubDate[0], config);
      case "pubDatetime":
        return this.formatDate(post.data.pubDate[0], config);
      case "modDatetime":
        return post.data.modified
          ? this.formatDate(post.data.modified[0], config)
          : undefined;
      case "slug":
        return post.meta.slug;
      case "excerpt":
        return post.data.description ? post.data.description[0] : undefined;
      case "categories":
        return this.getCategories(post, config);
      case "taxonomy":
        return this.getTaxonomy(post);
      case "tags":
        return this.getTags(post);
      case "coverImage":
        return post.meta.coverImage;
      default:
        return undefined;
    }
  }

  /**
   * Format date for frontmatter
   * @param dateString Date string to format
   * @param config Configuration options
   * @returns Formatted date string
   */
  private formatDate(dateString: string, config: Configuration): string {
    // TODO: Implement date formatting based on configuration
    return dateString;
  }

  /**
   * Get categories for a post
   * @param post Post to get categories for
   * @param config Configuration options
   * @returns Array of categories
   */
  private getCategories(post: Post, config: Configuration): string[] {
    if (!post.data.category) {
      return [];
    }
    
    return post.data.category
      .filter((category: any) => {
        const categoryName = category._;
        return (
          categoryName &&
          !config.filterCategories.includes(categoryName.toLowerCase())
        );
      })
      .map((category: any) => category._);
  }

  /**
   * Get taxonomy for a post
   * @param post Post to get taxonomy for
   * @returns Array of taxonomy terms
   */
  private getTaxonomy(post: Post): string[] {
    // TODO: Implement taxonomy extraction
    return [];
  }

  /**
   * Get tags for a post
   * @param post Post to get tags for
   * @returns Array of tags
   */
  private getTags(post: Post): string[] {
    if (!post.data.category) {
      return [];
    }
    
    return post.data.category
      .filter((category: any) => {
        return category.$ && category.$.domain === "post_tag";
      })
      .map((category: any) => category._);
  }

  /**
   * Get post ID from post data
   * @param postData Post data
   * @returns Post ID
   */
  private getPostId(postData: any): string {
    return postData.post_id[0];
  }

  /**
   * Get post slug from post data
   * @param postData Post data
   * @returns Post slug
   */
  private getPostSlug(postData: any): string {
    return decodeURIComponent(postData.post_name[0]);
  }

  /**
   * Get cover image ID from post data
   * @param postData Post data
   * @returns Cover image ID if exists
   */
  private getPostCoverImageId(postData: any): string | undefined {
    if (postData.postmeta === undefined) {
      return undefined;
    }
    
    const postmeta = postData.postmeta.find(
      (postmeta: any) => postmeta.meta_key[0] === "_thumbnail_id"
    );
    return postmeta ? postmeta.meta_value[0] : undefined;
  }

  /**
   * Get post content from post data
   * @param postData Post data
   * @param config Configuration options
   * @returns Post content in markdown format
   */
  private getPostContent(
    postData: any,
    config: Configuration
  ): string {
    if (!postData.encoded || !postData.encoded[0]) {
      return "";
    }
    
    let content = postData.encoded[0];
    
    // Insert an empty div element between double line breaks
    // This nifty trick causes turndown to keep adjacent paragraphs separated
    // without mucking up content inside of other elements (like <code> blocks)
    content = content.replace(/(\r?\n){2}/g, "\n<div></div>\n");
    
    if (config.saveScrapedImages) {
      // Update image references to point to the local images folder
      content = content.replace(
        /(<img[^>]*src=").*?([^/"]+\\.(?:gif|jpe?g|png|webp))("[^>]*>)/gi,
        "$1images/$2$3"
      );
    }
    
    // Preserve "more" separator, max one per post, optionally with custom label
    // by escaping angle brackets (will be unescaped during turndown conversion)
    content = content.replace(/<(!--more( .*)?--)>/, "&lt;$1&gt;");
    
    // Use HtmlToMarkdownConverter to convert HTML to Markdown
    content = HtmlToMarkdownConverter.convert(content);
    
    // Clean up extra spaces in list items
    content = content.replace(/(-|\\d+\\.) +/g, "$1 ");
    
    return content;
  }

  /**
   * Initialize Turndown service for HTML to Markdown conversion
   * @returns Configured Turndown service
   */
  private initHtmlToMarkdownConverter(): void {
    // Nothing to do here, the converter is a static class
  }

  /**
   * Filter channel data by post type
   * @param channelData Channel data from WordPress export
   * @param type Post type to filter by
   * @returns Filtered channel data
   */
  private getItemsOfType(channelData: any[], type: string): any[] {
    return channelData.filter((item) => item.post_type[0] === type);
  }

  /**
   * Extract filename from URL
   * @param url URL to extract filename from
   * @returns Decoded filename
   */
  private getFilenameFromUrl(url: string): string {
    if (!url) {
      return "";
    }
    
    try {
      const filename = url.split("/").slice(-1)[0];
      try {
        return decodeURIComponent(filename);
      } catch (_error) {
        // If decoding fails, return filename as-is
        return filename;
      }
    } catch (_error) {
      return "";
    }
  }
}
