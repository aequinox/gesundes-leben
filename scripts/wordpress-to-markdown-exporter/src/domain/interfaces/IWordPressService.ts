import { Result } from "../../utils/Result.js";
import { Configuration } from "../models/Configuration.js";
import { Image, Post } from "../models/Post.js";

/**
 * Interface for WordPress service
 */
export interface IWordPressService {
  /**
   * Parse WordPress export file and convert to posts
   * @param config Configuration options
   * @returns Result containing the parsed posts or an error
   */
  parseExport(config: Configuration): Promise<Result<Post[]>>;

  /**
   * Get post types from WordPress export data
   * @param channelData Channel data from WordPress export
   * @param config Configuration options
   * @returns Array of post types to process
   */
  getPostTypes(channelData: any[], config: Configuration): string[];

  /**
   * Collect posts from WordPress export data
   * @param channelData Channel data from WordPress export
   * @param postTypes Post types to collect
   * @param config Configuration options
   * @returns Array of posts
   */
  collectPosts(channelData: any[], postTypes: string[], config: Configuration): Post[];

  /**
   * Collect attached images from WordPress export data
   * @param channelData Channel data from WordPress export
   * @returns Array of images
   */
  collectAttachedImages(channelData: any[]): Image[];

  /**
   * Collect images from post content
   * @param channelData Channel data from WordPress export
   * @param postTypes Post types to collect from
   * @returns Array of images
   */
  collectScrapedImages(channelData: any[], postTypes: string[]): Image[];

  /**
   * Merge images into posts
   * @param images Array of images
   * @param posts Array of posts
   */
  mergeImagesIntoPosts(images: Image[], posts: Post[]): void;

  /**
   * Populate post frontmatter with data from each post
   * @param posts Array of posts to populate frontmatter for
   * @param config Configuration options
   */
  populateFrontmatter(posts: Post[], config: Configuration): void;
}
