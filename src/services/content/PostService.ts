/**
 * @module PostService
 * @description
 * Service for managing blog posts with comprehensive filtering, sorting,
 * and transformation capabilities. Centralizes post-related operations
 * following SOLID principles.
 */

import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { handleAsync } from "@/core/errors/handleAsync";
import { slugifyStr } from "@/utils/slugify";
import { createBlogPostProcessor } from "@/utils/core/content";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Interface for post service operations
 */
export interface IPostService {
  /**
   * Get all posts, optionally filtered by draft status
   */
  getAllPosts(includeDrafts?: boolean): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get posts sorted by date (newest first)
   */
  getSortedPosts(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get posts with reading time information
   */
  getPostsWithReadingTime(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get posts by tag
   */
  getPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get posts by category
   */
  getPostsByCategory(
    posts: CollectionEntry<"blog">[],
    category: string
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get posts by group
   */
  getPostsByGroup(
    posts: CollectionEntry<"blog">[],
    group: string
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get all posts by group (including fetching posts)
   */
  getAllPostsByGroup(group: string): Promise<CollectionEntry<"blog">[]>;
}

/**
 * Implementation of the post service
 */
export class PostService implements IPostService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Get all posts, optionally filtered by draft status
   */
  async getAllPosts(includeDrafts = false): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      const allPosts = await getCollection("blog");

      if (includeDrafts || this.config.get<boolean>("env.isDev", false)) {
        return allPosts;
      }

      const now = Date.now();
      const scheduledPostMargin = this.config.get<number>(
        "scheduledPostMargin",
        0
      );

      return allPosts.filter(post => {
        const { draft, pubDatetime } = post.data;

        if (!pubDatetime) {
          return false;
        }

        const pubDate = new Date(pubDatetime);
        if (isNaN(pubDate.getTime())) {
          return false;
        }

        return !draft && pubDate.getTime() <= now + scheduledPostMargin;
      });
    });
  }

  /**
   * Get posts sorted by date (newest first)
   */
  async getSortedPosts(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      const processor = createBlogPostProcessor({
        sortDirection: "desc",
        includeDrafts: this.config.get<boolean>("env.isDev", false),
      });

      return processor.processContent(posts);
    });
  }

  /**
   * Get posts with reading time information
   */
  async getPostsWithReadingTime(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      const processor = createBlogPostProcessor({
        includeDrafts: true,
        sortDirection: "asc",
      });

      return processor.transform(posts);
    });
  }

  /**
   * Private method to filter posts by a specific attribute
   */
  private async getPostsBy(
    posts: CollectionEntry<"blog">[],
    type: "tags" | "categories" | "group",
    value: string
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      const slugifiedValue = slugifyStr(value);

      return type === "group"
        ? posts.filter(post => slugifyStr(post.data[type]) === slugifiedValue)
        : posts.filter(post =>
            post.data[type]?.some(item => slugifyStr(item) === slugifiedValue)
          );
    });
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): Promise<CollectionEntry<"blog">[]> {
    return this.getPostsBy(posts, "tags", tag);
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(
    posts: CollectionEntry<"blog">[],
    category: string
  ): Promise<CollectionEntry<"blog">[]> {
    return this.getPostsBy(posts, "categories", category);
  }

  /**
   * Get posts by group
   */
  async getPostsByGroup(
    posts: CollectionEntry<"blog">[],
    group: string
  ): Promise<CollectionEntry<"blog">[]> {
    return this.getPostsBy(posts, "group", group);
  }

  /**
   * Get all posts by group (including fetching posts)
   */
  async getAllPostsByGroup(group: string): Promise<CollectionEntry<"blog">[]> {
    const posts = await this.getAllPosts();
    return this.getPostsByGroup(posts, group);
  }
}

// Export singleton instance for convenience
export const postService = new PostService();
