import path from 'path';
import { loggerService } from '../logger/LoggerService';
import { imageService } from '../image/ImageService';
import { TransformationError } from '../error/ErrorService';

/**
 * Interface for a WordPress post.
 */
export interface Post {
  meta: {
    id: string;
    slug: string;
    coverImageId?: string;
    coverImage?: string;
    type: string;
    imageUrls: string[];
  };
  content: string;
  frontmatter: Record<string, any>;
  data: any;
}

/**
 * Service for handling content operations.
 */
export class ContentService {
  /**
   * Fixes image paths in content to use relative paths.
   * @param content - The content to fix.
   * @param basePath - The base path for images.
   * @returns The content with fixed image paths.
   */
  public fixImagePaths(content: string, basePath: string): string {
    try {
      // Replace image paths in markdown image syntax: ![alt](path)
      let fixedContent = content.replace(
        /!\[(.*?)\]\((.*?)\)/g,
        (match, alt, src) => {
          const fixedSrc = this.getFixedImagePath(src, basePath);
          return `![${alt}](${fixedSrc})`;
        }
      );

      // Replace image paths in HTML img tags: <img src="path" alt="alt" />
      fixedContent = fixedContent.replace(
        /<img[^>]*src=["'](.*?)["'][^>]*>/gi,
        (match, src) => {
          const fixedSrc = this.getFixedImagePath(src, basePath);
          return match.replace(src, fixedSrc);
        }
      );

      return fixedContent;
    } catch (error) {
      loggerService.error('Error fixing image paths in content', error);
      throw new TransformationError('Failed to fix image paths in content', error);
    }
  }

  /**
   * Gets the fixed image path.
   * @param src - The original image source.
   * @param basePath - The base path for images.
   * @returns The fixed image path.
   */
  private getFixedImagePath(src: string, basePath: string): string {
    try {
      // Skip external URLs
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return src;
      }

      // Extract filename from path
      const filename = path.basename(src);
      
      // Normalize to use the images directory
      return `images/${filename}`;
    } catch (error) {
      loggerService.error(`Error fixing image path: ${src}`, error);
      return src;
    }
  }

  /**
   * Fixes image references in a post.
   * @param post - The post to fix.
   * @returns The post with fixed image references.
   */
  public fixPostImageReferences(post: Post): Post {
    try {
      // Create a copy of the post to avoid modifying the original
      const fixedPost = { ...post };
      
      // Fix content image references
      const postPath = path.join('src/content/blog', post.meta.slug);
      fixedPost.content = this.fixImagePaths(post.content, postPath);
      
      // Fix cover image reference in frontmatter if it exists
      if (post.frontmatter.heroImage && post.frontmatter.heroImage.src) {
        const src = post.frontmatter.heroImage.src;
        const fixedSrc = this.getFixedImagePath(src, postPath);
        
        fixedPost.frontmatter = {
          ...post.frontmatter,
          heroImage: {
            ...post.frontmatter.heroImage,
            src: fixedSrc,
          },
        };
      }
      
      return fixedPost;
    } catch (error) {
      loggerService.error(`Error fixing image references in post: ${post.meta.slug}`, error);
      throw new TransformationError(`Failed to fix image references in post: ${post.meta.slug}`, error);
    }
  }

  /**
   * Processes a post to fix image paths and other issues.
   * @param post - The post to process.
   * @returns The processed post.
   */
  public processPost(post: Post): Post {
    try {
      // Fix image references
      const postWithFixedImages = this.fixPostImageReferences(post);
      
      // Additional processing could be added here
      
      return postWithFixedImages;
    } catch (error) {
      loggerService.error(`Error processing post: ${post.meta.slug}`, error);
      throw new TransformationError(`Failed to process post: ${post.meta.slug}`, error);
    }
  }
}

// Export a singleton instance of the ContentService
export const contentService = new ContentService();
