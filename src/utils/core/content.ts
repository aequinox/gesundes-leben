/**
 * @module content
 * @description
 * Content processing abstractions for consistent content handling
 * across the application. Provides interfaces and base implementations
 * for content filtering, sorting, and transformation.
 *
 * @example
 * ```typescript
 * import { BlogPostProcessor } from './utils/core/content';
 *
 * const processor = new BlogPostProcessor();
 * const processedPosts = await processor.processContent(posts);
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { ContentProcessingError } from "./errors";
import { ConfigManager, type ConfigObject } from "./config";
import { handleAsync } from "./errors";

/**
 * Valid blog post categories
 */
export type BlogCategory =
  | "Ernährung"
  | "Immunsystem"
  | "Lesenswertes"
  | "Lifestyle & Psyche"
  | "Mikronährstoffe"
  | "Organsysteme"
  | "Wissenschaftliches"
  | "Wissenswertes";

/**
 * Base interface for content processors.
 * Defines the contract for content processing operations.
 */
export interface ContentProcessor<T, C extends ConfigObject = ConfigObject> {
  /**
   * Processes content items according to configuration.
   *
   * @param items - Content items to process
   * @param config - Optional processing configuration
   * @returns Processed content items
   */
  processContent(items: T[], config?: Partial<C>): Promise<T[]>;

  /**
   * Filters content items.
   *
   * @param items - Content items to filter
   * @returns Filtered content items
   */
  filter(items: T[]): T[];

  /**
   * Sorts content items.
   *
   * @param items - Content items to sort
   * @returns Sorted content items
   */
  sort(items: T[]): T[];

  /**
   * Transforms content items.
   *
   * @param items - Content items to transform
   * @returns Transformed content items
   */
  transform(items: T[]): Promise<T[]>;
}

/**
 * Configuration for blog post processing.
 */
export interface BlogPostProcessorConfig extends ConfigObject {
  includeDrafts: boolean;
  sortDirection: "asc" | "desc";
  limit?: number;
  offset?: number;
  filterByTag?: string;
  filterByCategory?: BlogCategory;
}

/**
 * Default configuration for blog post processing.
 */
const DEFAULT_BLOG_CONFIG: BlogPostProcessorConfig = {
  includeDrafts: false,
  sortDirection: "desc",
};

/**
 * Blog post processor implementation.
 * Handles filtering, sorting, and transforming blog posts.
 */
export class BlogPostProcessor
  implements ContentProcessor<CollectionEntry<"blog">, BlogPostProcessorConfig>
{
  private config: BlogPostProcessorConfig;

  constructor(config?: Partial<BlogPostProcessorConfig>) {
    this.config = ConfigManager.merge(DEFAULT_BLOG_CONFIG, config);
  }

  /**
   * Processes blog posts with optional configuration.
   *
   * @param posts - Blog posts to process
   * @param config - Optional processing configuration
   * @returns Processed blog posts
   */
  async processContent(
    posts: CollectionEntry<"blog">[],
    config?: Partial<BlogPostProcessorConfig>
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      const processingConfig = ConfigManager.merge(this.config, config);

      let processed = this.filter(posts);
      processed = this.sort(processed);
      processed = await this.transform(processed);

      // Apply pagination if configured
      if (processingConfig.offset) {
        processed = processed.slice(processingConfig.offset);
      }
      if (processingConfig.limit) {
        processed = processed.slice(0, processingConfig.limit);
      }

      return processed;
    });
  }

  /**
   * Validates a post's publication date.
   *
   * @param post - Blog post to validate
   * @returns Valid Date object or null
   * @internal
   */
  private validatePostDate(post: CollectionEntry<"blog">): Date | null {
    if (!post.data.pubDatetime) {
      return null;
    }

    const pubDate = new Date(post.data.pubDatetime);
    return isNaN(pubDate.getTime()) ? null : pubDate;
  }

  /**
   * Filters blog posts based on configuration.
   *
   * @param posts - Blog posts to filter
   * @returns Filtered blog posts
   */
  filter(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
    return posts.filter(post => {
      // Draft filtering
      if (!this.config.includeDrafts && post.data.draft) {
        return false;
      }

      // Tag filtering
      if (
        this.config.filterByTag &&
        !post.data.tags?.includes(this.config.filterByTag)
      ) {
        return false;
      }

      // Category filtering
      if (
        this.config.filterByCategory &&
        !post.data.categories?.includes(this.config.filterByCategory)
      ) {
        return false;
      }

      // Publication date filtering
      const pubDate = this.validatePostDate(post);
      if (!pubDate) {
        return false;
      }

      return pubDate.getTime() <= Date.now();
    });
  }

  /**
   * Sorts blog posts based on configuration.
   *
   * @param posts - Blog posts to sort
   * @returns Sorted blog posts
   */
  sort(posts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] {
    return [...posts].sort((a, b) => {
      const dateA = new Date(
        a.data.modDatetime || a.data.pubDatetime
      ).getTime();
      const dateB = new Date(
        b.data.modDatetime || b.data.pubDatetime
      ).getTime();

      return this.config.sortDirection === "desc"
        ? dateB - dateA
        : dateA - dateB;
    });
  }

  /**
   * Transforms blog posts by updating reading times.
   *
   * @param posts - Blog posts to transform
   * @returns Transformed blog posts with reading times
   */
  async transform(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      // Process each post to add reading time if not already present
      return Promise.all(
        posts.map(async post => {
          // Skip if reading time is already calculated
          if (post.data.readingTime) {
            return post;
          }

          try {
            // Calculate reading time based on post content
            const { remarkPluginFrontmatter } = await post.render();

            // If the remark plugin has already calculated reading time, use it
            if (remarkPluginFrontmatter?.readingTime) {
              post.data.readingTime = remarkPluginFrontmatter.readingTime;
            }

            return post;
          } catch (error) {
            console.error(
              `Error calculating reading time for post ${post.id}:`,
              error
            );
            return post;
          }
        })
      );
    });
  }
}

/**
 * Creates a blog post processor with configuration.
 * Factory function for creating preconfigured processors.
 *
 * @param config - Processor configuration
 * @returns Configured blog post processor
 *
 * @example
 * ```typescript
 * const processor = createBlogPostProcessor({
 *   includeDrafts: true,
 *   sortDirection: 'asc',
 *   limit: 10
 * });
 * ```
 */
export function createBlogPostProcessor(
  config?: Partial<BlogPostProcessorConfig>
): BlogPostProcessor {
  return new BlogPostProcessor(config);
}

/**
 * Type guard for checking if a value is a blog post.
 *
 * @param value - Value to check
 * @returns Boolean indicating if value is a blog post
 */
export function isBlogPost(value: unknown): value is CollectionEntry<"blog"> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "data" in value &&
    typeof (value as any).data === "object" &&
    "pubDatetime" in (value as any).data
  );
}
