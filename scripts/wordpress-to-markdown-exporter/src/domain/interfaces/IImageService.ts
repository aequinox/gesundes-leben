import { Result } from "../../utils/Result.js";
import { Configuration } from "../models/Configuration.js";
import { Image, Post } from "../models/Post.js";

/**
 * Interface for Image service
 */
export interface IImageService {
  /**
   * Process images for posts
   * @param posts Array of posts with images
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  processImages(posts: Post[], config: Configuration): Promise<Result<void>>;

  /**
   * Download and save images for posts
   * @param posts Array of posts with images
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  downloadImages(posts: Post[], config: Configuration): Promise<Result<void>>;

  /**
   * Get destination path for an image
   * @param image Image to get path for
   * @param post Parent post
   * @param config Configuration options
   * @returns Destination path
   */
  getImagePath(image: Image, post: Post, config: Configuration): string;

  /**
   * Download an image from a URL
   * @param imageUrl URL to download image from
   * @param config Configuration options
   * @returns Result containing the image data or an error
   */
  downloadImage(imageUrl: string, config: Configuration): Promise<Result<Buffer>>;

  /**
   * Save an image to disk
   * @param data Image data
   * @param path Destination path
   * @returns Result indicating success or failure
   */
  saveImage(data: Buffer, path: string): Promise<Result<void>>;

  /**
   * Optimize an image for web
   * @param data Image data
   * @param config Configuration options
   * @returns Result containing the optimized image data or an error
   */
  optimizeImage(data: Buffer, config: Configuration): Promise<Result<Buffer>>;

  /**
   * Extract filename from URL
   * @param url URL to extract filename from
   * @returns Decoded filename
   */
  getFilenameFromUrl(url: string): string;

  /**
   * Check if an image exists
   * @param path Path to check
   * @returns Whether image exists
   */
  imageExists(path: string): boolean;
}
