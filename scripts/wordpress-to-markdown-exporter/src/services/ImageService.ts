import axios from "axios";
import * as fs from "fs/promises";
import * as http from "http";
import * as https from "https";
import { inject, injectable } from "inversify";
import * as path from "path";
import { IImageService } from "../domain/interfaces/IImageService.js";
import { ILoggerService } from "../domain/interfaces/ILoggerService.js";
import { Configuration } from "../domain/models/Configuration.js";
import { Image, Post } from "../domain/models/Post.js";
import { PathUtils } from "../utils/PathUtils.js";
import { Result } from "../utils/Result.js";

/**
 * Implementation of the Image service
 */
@injectable()
export class ImageService implements IImageService {
  /**
   * Creates a new Image service
   * @param loggerService Logger service
   */
  constructor(
    @inject("ILoggerService") private readonly loggerService: ILoggerService
  ) {}

  /**
   * Process images for posts
   * @param posts Array of posts with images
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  public async processImages(
    posts: Post[],
    config: Configuration
  ): Promise<Result<void>> {
    try {
      // Skip if no images to process
      if (!config.saveAttachedImages && !config.saveScrapedImages) {
        this.loggerService.info("Skipping image processing (disabled in config)");
        return Result.success(undefined);
      }
      
      // Download images
      const downloadResult = await this.downloadImages(posts, config);
      if (downloadResult.isFailure) {
        return downloadResult;
      }
      
      return Result.success(undefined);
    } catch (error) {
      return Result.failure("Failed to process images", error as Error);
    }
  }

  /**
   * Download and save images for posts
   * @param posts Array of posts with images
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  public async downloadImages(
    posts: Post[],
    config: Configuration
  ): Promise<Result<void>> {
    try {
      this.loggerService.info("Downloading and saving images...");
      
      // Track skipped and downloaded images
      let skipCount = 0;
      let downloadCount = 0;
      let failCount = 0;
      
      // Collect all image URLs from all posts
      const imagePayloads: { post: Post; url: string; destinationPath: string }[] = [];
      
      posts.forEach((post) => {
        post.meta.imageUrls.forEach((imageUrl) => {
          const filename = this.getFilenameFromUrl(imageUrl);
          const destinationPath = this.getImagePath(
            { id: "", postId: post.meta.id, url: imageUrl },
            post,
            config
          );
          
          if (this.imageExists(destinationPath)) {
            // Already exists, don't need to download again
            skipCount++;
          } else {
            imagePayloads.push({
              post,
              url: imageUrl,
              destinationPath,
            });
          }
        });
      });
      
      // Download images one by one with delay between requests
      for (const payload of imagePayloads) {
        try {
          // Download image
          const imageDataResult = await this.downloadImage(
            payload.url,
            config
          );
          
          if (imageDataResult.isFailure) {
            this.loggerService.error(
              `Failed to download image: ${payload.url}`,
              new Error(imageDataResult.error)
            );
            failCount++;
            continue;
          }
          
          let imageData = imageDataResult.value;
          
          // Optimize image if enabled
          if (config.astro.optimizeImages) {
            const optimizedResult = await this.optimizeImage(
              imageData,
              config
            );
            
            if (optimizedResult.isSuccess) {
              imageData = optimizedResult.value;
            } else {
              this.loggerService.warn(
                `Failed to optimize image: ${payload.url} (using original)`
              );
            }
          }
          
          // Save image
          const saveResult = await this.saveImage(
            imageData,
            payload.destinationPath
          );
          
          if (saveResult.isFailure) {
            this.loggerService.error(
              `Failed to save image: ${payload.destinationPath}`,
              new Error(saveResult.error)
            );
            failCount++;
            continue;
          }
          
          downloadCount++;
          this.loggerService.debug(
            `Downloaded and saved image: ${path.basename(payload.destinationPath)}`
          );
        } catch (error) {
          this.loggerService.error(
            `Failed to process image: ${payload.url}`,
            error as Error
          );
          failCount++;
        }
        
        // Delay between requests
        if (
          config.imageFileRequestDelay > 0 &&
          imagePayloads.indexOf(payload) < imagePayloads.length - 1
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, config.imageFileRequestDelay)
          );
        }
      }
      
      if (failCount > 0) {
        this.loggerService.warn(
          `Downloaded ${downloadCount} images, ${skipCount} already existed, ${failCount} failed`
        );
      } else {
        this.loggerService.success(
          `Downloaded ${downloadCount} images (${skipCount} already existed)`
        );
      }
      
      return Result.success(undefined);
    } catch (error) {
      return Result.failure("Failed to download images", error as Error);
    }
  }

  /**
   * Get destination path for an image
   * @param image Image to get path for
   * @param post Parent post
   * @param config Configuration options
   * @returns Destination path
   */
  public getImagePath(
    image: Image,
    post: Post,
    config: Configuration
  ): string {
    // Get post path
    const postPath = this.getPostPath(post, config);
    
    // Get images directory
    const imagesDir = path.join(path.dirname(postPath), "images");
    
    // Get filename
    const filename = this.getFilenameFromUrl(image.url);
    
    // Return full path
    return path.join(imagesDir, filename);
  }

  /**
   * Download an image from a URL
   * @param imageUrl URL to download image from
   * @param config Configuration options
   * @returns Result containing the image data or an error
   */
  public async downloadImage(
    imageUrl: string,
    config: Configuration
  ): Promise<Result<Buffer>> {
    try {
      // Only encode the URL if it doesn't already have encoded characters
      const url = /%[\da-f]{2}/i.test(imageUrl)
        ? imageUrl
        : encodeURI(imageUrl);
      
      const axiosConfig: any = {
        method: "get",
        url,
        headers: {
          "User-Agent": "wordpress-to-markdown-exporter",
        },
        responseType: "arraybuffer" as const,
      };
      
      if (!config.strictSsl) {
        // Custom agents to disable SSL errors
        axiosConfig.httpAgent = new http.Agent({ rejectUnauthorized: false } as any);
        axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false } as any);
      }
      
      const response = await axios(axiosConfig);
      return Result.success(Buffer.from(response.data, "binary"));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Request was made, but server responded with an error status code
        return Result.failure(
          `HTTP ${error.response.status} error downloading image`
        );
      }
      return Result.failure("Failed to download image", error as Error);
    }
  }

  /**
   * Save an image to disk
   * @param data Image data
   * @param path Destination path
   * @returns Result indicating success or failure
   */
  public async saveImage(data: Buffer, path: string): Promise<Result<void>> {
    try {
      // Create directory if it doesn't exist
      const dirPath = PathUtils.getDirname(path);
      await fs.mkdir(dirPath, { recursive: true });
      
      // Write file
      await fs.writeFile(path, data);
      
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(`Failed to save image: ${path}`, error as Error);
    }
  }

  /**
   * Optimize an image for web
   * @param data Image data
   * @param config Configuration options
   * @returns Result containing the optimized image data or an error
   */
  public async optimizeImage(
    data: Buffer,
    config: Configuration
  ): Promise<Result<Buffer>> {
    // TODO: Implement image optimization
    // For now, just return the original data
    return Result.success(data);
  }

  /**
   * Extract filename from URL
   * @param url URL to extract filename from
   * @returns Decoded filename
   */
  public getFilenameFromUrl(url: string): string {
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

  /**
   * Check if an image exists
   * @param path Path to check
   * @returns Whether image exists
   */
  public imageExists(path: string): boolean {
    return PathUtils.fileExists(path);
  }

  /**
   * Get post path (helper method)
   * @param post Post to get path for
   * @param config Configuration options
   * @returns Post path
   */
  private getPostPath(post: Post, config: Configuration): string {
    // This is a simplified version of MarkdownService.getPostPath
    // In a real implementation, we would inject the MarkdownService
    // and use its getPostPath method
    
    // Start with base output dir
    const pathSegments = [config.output];
    
    // Add Astro content collection if enabled
    if (config.astro.useContentCollections) {
      pathSegments.push(config.astro.contentCollection);
    }
    
    // Create segment for post type if we're dealing with more than just "post"
    if (config.includeOtherTypes && post.meta.type !== "post") {
      pathSegments.push(post.meta.type);
    }
    
    // Use slug as folder or filename as specified
    if (config.postFolders) {
      pathSegments.push(post.meta.slug, "index" + config.astro.fileExtension);
    } else {
      pathSegments.push(post.meta.slug + config.astro.fileExtension);
    }
    
    return path.join(...pathSegments);
  }
}
