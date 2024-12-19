import { getCollection } from "astro:content";
import { AuthorUtils } from "./authors";
import type { Blog } from "./types";
import type { Category } from "@/data/taxonomies";
import readingTime from "reading-time";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";

/**
 * Custom error class for post-related operations
 */
class PostError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "PostError";
  }
}

/**
 * Post filter options type
 */
interface PostFilterOptions {
  includeDrafts?: boolean;
  includeScheduled?: boolean;
}

/**
 * Post retrieval options type
 */
interface PostOptions extends PostFilterOptions {
  sort?: boolean;
  useCache?: boolean;
}

/**
 * @class PostUtils
 * @description Utility class for managing blog posts in the content system.
 * Provides methods for retrieving, filtering, sorting, and analyzing blog posts
 * with robust error handling and type safety.
 */
export class PostUtils {
  /**
   * Cache for storing posts collection to minimize database hits
   * @private
   */
  private static postsCache: Blog[] | null = null;

  /**
   * Default words per minute for reading time calculation
   * @private
   */
  private static readonly WORDS_PER_MINUTE = 200;

  /**
   * Clears the posts cache
   * @private
   */
  private static clearCache(): void {
    PostUtils.postsCache = null;
  }

  /**
   * Sorts posts by date (newest first), considering modification date if available
   * @param posts - Array of posts to sort
   * @returns Sorted array of posts
   */
  public static sortByDate(posts: ReadonlyArray<Blog>): Blog[] {
    return [...posts].sort((a, b) => {
      const dateA = a.data.modDatetime ?? a.data.pubDatetime;
      const dateB = b.data.modDatetime ?? b.data.pubDatetime;
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Filters out draft posts and scheduled posts based on options
   * @param posts - Array of posts to filter
   * @param options - Filter configuration options
   * @returns Filtered array of posts
   * @private
   */
  private static filterPosts(
    posts: ReadonlyArray<Blog>,
    options: PostFilterOptions = {}
  ): Blog[] {
    const { includeDrafts = false, includeScheduled = false } = options;
    const now = new Date();

    return posts.filter(post => {
      if (!includeDrafts && post.data.draft) return false;
      if (!includeScheduled && post.data.pubDatetime > now) return false;
      return true;
    });
  }

  /**
   * Retrieves all blog posts with optional filtering, sorting, and caching
   * @param options - Configuration options for retrieval
   * @returns Promise resolving to array of posts
   * @throws PostError if retrieval fails
   */
  public static async getAllPosts(options: PostOptions = {}): Promise<Blog[]> {
    const { sort = true, useCache = true, ...filterOptions } = options;

    try {
      if (useCache && PostUtils.postsCache) {
        const filteredPosts = PostUtils.filterPosts(
          PostUtils.postsCache,
          filterOptions
        );
        return sort ? PostUtils.sortByDate(filteredPosts) : filteredPosts;
      }

      const posts = await getCollection("blog");
      if (useCache) {
        PostUtils.postsCache = posts;
      }

      const filteredPosts = PostUtils.filterPosts(posts, filterOptions);
      return sort ? PostUtils.sortByDate(filteredPosts) : filteredPosts;
    } catch (error) {
      throw new PostError("Failed to fetch blog posts", error);
    }
  }

  /**
   * Retrieves featured posts with caching
   * @returns Promise resolving to array of featured posts
   */
  public static async getFeaturedPosts(): Promise<Blog[]> {
    try {
      const posts = await PostUtils.getAllPosts();
      return posts.filter(post => post.data.featured);
    } catch (error) {
      throw new PostError("Failed to fetch featured posts", error);
    }
  }

  /**
   * Retrieves posts by tag with case-insensitive matching
   * @param tag - Tag to filter by
   * @returns Promise resolving to array of posts with the tag
   */
  public static async getPostsByTag(tag: string): Promise<Blog[]> {
    try {
      const posts = await PostUtils.getAllPosts();
      const normalizedTag = tag.toLowerCase();
      return posts.filter(post =>
        post.data.tags.some(t => t.toLowerCase() === normalizedTag)
      );
    } catch (error) {
      throw new PostError(`Failed to fetch posts for tag: ${tag}`, error);
    }
  }

  /**
   * Retrieves posts by category with type safety
   * @param category - Category to filter by
   * @returns Promise resolving to array of posts in the category
   */
  public static async getPostsByCategory(category: Category): Promise<Blog[]> {
    try {
      const posts = await PostUtils.getAllPosts();
      return posts.filter(post => post.data.categories.includes(category));
    } catch (error) {
      throw new PostError(
        `Failed to fetch posts for category: ${category}`,
        error
      );
    }
  }

  /**
   * Retrieves posts by group with case-insensitive matching
   * @param group - Group to filter by
   * @returns Promise resolving to array of posts in the group
   */
  public static async getPostsByGroup(group: string): Promise<Blog[]> {
    try {
      const posts = await PostUtils.getAllPosts();
      const normalizedGroup = group.toLowerCase();
      return posts.filter(
        post => post.data.group.toLowerCase() === normalizedGroup
      );
    } catch (error) {
      throw new PostError(`Failed to fetch posts for group: ${group}`, error);
    }
  }

  /**
   * Retrieves posts by author with proper error handling
   * @param authorSlug - Author's unique identifier
   * @returns Promise resolving to array of posts by the author
   */
  public static async getPostsByAuthor(authorSlug: string): Promise<Blog[]> {
    try {
      const posts = await PostUtils.getAllPosts();
      const filteredPosts = await Promise.all(
        posts.map(async post => {
          try {
            const postAuthor = await AuthorUtils.getAuthorEntry(
              post.data.author
            );
            return postAuthor?.slug === authorSlug ? post : null;
          } catch {
            return null; // Skip posts with invalid authors
          }
        })
      );
      return filteredPosts.filter((post): post is Blog => post !== null);
    } catch (error) {
      throw new PostError(
        `Failed to fetch posts for author: ${authorSlug}`,
        error
      );
    }
  }

  /**
   * Calculates reading time for a post with improved accuracy
   * @param content - Post content to analyze
   * @returns Calculated reading time in minutes or undefined if calculation fails
   */
  public static calculateReadingTime(content: string): number | undefined {
    if (!content?.length) return undefined;

    try {
      const ast = fromMarkdown(content);
      const text = toString(ast);
      const { minutes } = readingTime(text, {
        wordsPerMinute: PostUtils.WORDS_PER_MINUTE,
      });

      return minutes > 0 ? Math.ceil(minutes) : undefined;
    } catch (error) {
      console.warn("Failed to calculate reading time:", error);
      return undefined;
    }
  }

  /**
   * Updates reading time for posts with parallel processing
   * @param posts - Array of posts to update
   * @returns Promise resolving to array of updated posts
   */
  public static async updateReadingTimes(
    posts: ReadonlyArray<Blog>
  ): Promise<Blog[]> {
    try {
      return await Promise.all(
        posts.map(async post => {
          if (!post.data.readingTime) {
            post.data.readingTime = PostUtils.calculateReadingTime(post.body);
          }
          return post;
        })
      );
    } catch (error) {
      throw new PostError("Failed to update reading times", error);
    }
  }

  /**
   * Validates if a post exists
   * @param slug - Post's unique identifier
   * @returns Promise resolving to boolean indicating existence
   */
  public static async postExists(slug: string): Promise<boolean> {
    try {
      const posts = await PostUtils.getAllPosts();
      return posts.some(post => post.slug === slug);
    } catch {
      return false;
    }
  }
}
