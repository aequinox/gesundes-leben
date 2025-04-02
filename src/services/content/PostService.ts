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
import { slugService } from "@/services/format/SlugService";
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

  /**
   * Get featured posts
   */
  getFeaturedPosts(
    posts?: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]>;

  /**
   * Get non-featured (recent) posts
   */
  getRecentPosts(
    posts?: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]>;
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
      try {
        console.log("Getting all posts, includeDrafts:", includeDrafts);
        const allPosts = await getCollection("blog");
        console.log("Total posts found:", allPosts.length);

        // In development mode, include all posts
        if (includeDrafts || import.meta.env.DEV) {
          console.log("Returning all posts (dev mode or includeDrafts=true)");
          return allPosts;
        }

        const now = Date.now();
        const scheduledPostMargin = this.config.get<number>(
          "scheduledPostMargin",
          0
        );
        console.log("Current time:", new Date(now).toISOString());
        console.log("Scheduled post margin:", scheduledPostMargin);

        const filteredPosts = allPosts.filter(
          (post: CollectionEntry<"blog">) => {
            const { draft, pubDatetime } = post.data;

            if (!pubDatetime) {
              console.log(`Post ${post.id} has no pubDatetime, excluding`);
              return false;
            }

            const pubDate = new Date(pubDatetime);
            if (isNaN(pubDate.getTime())) {
              console.log(`Post ${post.id} has invalid pubDatetime, excluding`);
              return false;
            }

            const isPastPublication =
              pubDate.getTime() <= now + scheduledPostMargin;
            const isNotDraft = !draft;

            if (!isPastPublication) {
              console.log(
                `Post ${post.id} is scheduled for future (${pubDate.toISOString()}), excluding`
              );
            }

            if (!isNotDraft) {
              console.log(`Post ${post.id} is a draft, excluding`);
            }

            return isNotDraft && isPastPublication;
          }
        );

        console.log("Filtered posts count:", filteredPosts.length);
        return filteredPosts;
      } catch (error) {
        console.error("Error in getAllPosts:", error);
        return [];
      }
    });
  }

  /**
   * Get posts sorted by date (newest first)
   */
  async getSortedPosts(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      try {
        console.log("Sorting posts, count:", posts.length);
        const processor = createBlogPostProcessor({
          sortDirection: "desc",
          includeDrafts: import.meta.env.DEV,
        });

        const sortedPosts = await processor.processContent(posts);
        console.log("Sorted posts count:", sortedPosts.length);
        return sortedPosts;
      } catch (error) {
        console.error("Error in getSortedPosts:", error);
        return posts; // Return unsorted posts on error
      }
    });
  }

  /**
   * Get posts with reading time information
   */
  async getPostsWithReadingTime(
    posts: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      try {
        console.log("Adding reading time to posts, count:", posts.length);
        const processor = createBlogPostProcessor({
          includeDrafts: true,
          sortDirection: "asc",
        });

        const transformedPosts = await processor.transform(posts);
        console.log("Transformed posts count:", transformedPosts.length);
        return transformedPosts;
      } catch (error) {
        console.error("Error in getPostsWithReadingTime:", error);
        return posts; // Return original posts on error
      }
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
      try {
        console.log(
          `Filtering posts by ${type}: ${value}, posts count:`,
          posts.length
        );
        const slugifiedValue = slugService.slugifyStr(value);
        console.log("Slugified value:", slugifiedValue);

        const filteredPosts =
          type === "group"
            ? posts.filter(
                post =>
                  slugService.slugifyStr(post.data[type]) === slugifiedValue
              )
            : posts.filter(post =>
                post.data[type]?.some(
                  (item: string) =>
                    slugService.slugifyStr(item) === slugifiedValue
                )
              );

        console.log("Filtered posts count:", filteredPosts.length);
        return filteredPosts;
      } catch (error) {
        console.error(`Error in getPostsBy (${type}):`, error);
        return []; // Return empty array on error
      }
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
    try {
      console.log(`Getting all posts by group: ${group}`);
      const posts = await this.getAllPosts();
      console.log(`Posts count before filtering by group: ${posts.length}`);
      const groupPosts = await this.getPostsByGroup(posts, group);
      console.log(`Posts count after filtering by group: ${groupPosts.length}`);
      return groupPosts;
    } catch (error) {
      console.error("Error in getAllPostsByGroup:", error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(
    posts?: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      try {
        console.log("Getting featured posts");
        const postsToFilter = posts || (await this.getAllPosts());
        const featuredPosts = postsToFilter.filter(post => post.data.featured);
        console.log("Featured posts count:", featuredPosts.length);
        return featuredPosts;
      } catch (error) {
        console.error("Error in getFeaturedPosts:", error);
        return [];
      }
    });
  }

  /**
   * Get non-featured (recent) posts
   */
  async getRecentPosts(
    posts?: CollectionEntry<"blog">[]
  ): Promise<CollectionEntry<"blog">[]> {
    return handleAsync(async () => {
      try {
        console.log("Getting recent (non-featured) posts");
        const postsToFilter = posts || (await this.getAllPosts());
        const recentPosts = postsToFilter.filter(post => !post.data.featured);
        console.log("Recent posts count:", recentPosts.length);
        return recentPosts;
      } catch (error) {
        console.error("Error in getRecentPosts:", error);
        return [];
      }
    });
  }
}

// Export singleton instance for convenience
export const postService = new PostService();
