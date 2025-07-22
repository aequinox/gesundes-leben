import { getCollection, render } from "astro:content";

import { handleAsync } from "./errors";
import { logger } from "./logger";
import { slugify } from "./slugs";
import type { Post, Category, Tag } from "./types";

import { SITE } from "@/config";

/**
 * Interface for post processing options
 */
export interface ProcessPostsOptions {
  /** Whether to include draft posts */
  includeDrafts?: boolean;
  /** Sorting direction for posts */
  sortDirection?: "asc" | "desc";
  /** Maximum number of posts to return */
  maxPosts?: number;
}

/**
 * Retrieves all blog posts, optionally including drafts.
 *
 * In development mode or if `includeDrafts` is set to true, all posts are returned.
 * Otherwise, the function filters out drafts and posts scheduled for future publication
 * based on their `pubDatetime` and the configured `scheduledPostMargin`.
 *
 * @param includeDrafts - A boolean indicating whether to include draft posts.
 * @returns A promise that resolves to an array of blog posts with drafts and future-scheduled posts filtered out unless specified.
 *
 * Logs various informational messages about the process and handles any errors
 * by returning an empty array.
 */

export const getAllPosts = async (includeDrafts = false): Promise<Post[]> => {
  return handleAsync(async () => {
    try {
      logger.log("Getting all posts, includeDrafts:", includeDrafts);
      const allPosts = await getCollection("blog");
      logger.log("Total posts found:", allPosts.length);

      // In development mode, include all posts
      if (includeDrafts || import.meta.env.DEV) {
        logger.log("Returning all posts (dev mode or includeDrafts=true)");
        return allPosts;
      }

      const now = Date.now();
      const scheduledPostMargin = SITE.scheduledPostMargin ?? 0;
      logger.log("Current time:", now);
      logger.log("Scheduled post margin:", scheduledPostMargin);

      const filteredPosts = allPosts.filter((post: Post) => {
        const { draft, pubDatetime } = post.data;

        if (!pubDatetime) {
          logger.log("Post", post.id, "has no pubDatetime, excluding");
          return false;
        }

        const pubDate = new Date(pubDatetime);
        if (isNaN(pubDate.getTime())) {
          logger.log("Post", post.id, "has invalid pubDatetime, excluding");
          return false;
        }

        const isPastPublication =
          pubDate.getTime() <= now + scheduledPostMargin;
        const isNotDraft = !draft;

        if (!isPastPublication) {
          logger.log(
            "Post",
            post.id,
            "is scheduled for future",
            pubDate.toISOString(),
            "excluding"
          );
        }

        if (!isNotDraft) {
          logger.log("Post", post.id, "is a draft, excluding");
        }

        return isNotDraft && isPastPublication;
      });

      logger.log("Filtered posts count:", filteredPosts.length);
      return filteredPosts;
    } catch (e) {
      logger.error("Error in getAllPosts:", e);
      return [];
    }
  });
};

/**
 * Sorts an array of blog posts by modification or publication date.
 *
 * The sorting is done in descending order by default, but can be changed
 * by passing the `sortDirection` parameter as `"asc"` or `"desc"`.
 *
 * If there's an error during sorting, the original unsorted posts array is returned.
 *
 * @param posts - Array of blog posts to sort, must be of type `Post[]`
 * @param sortDirection - Sorting direction, either `"asc"` or `"desc"` (default `"desc"`), must be of type `"asc"` | `"desc"`
 * @returns Sorted array of blog posts, of type `Post[]`
 */
export const getSortedPosts = (
  posts: Post[],
  sortDirection: "asc" | "desc" = "desc"
): Post[] => {
  try {
    logger.log("Sorting posts, count:", posts.length);

    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(
        a.data.modDatetime ?? a.data.pubDatetime ?? 0
      ).getTime();
      const dateB = new Date(
        b.data.modDatetime ?? b.data.pubDatetime ?? 0
      ).getTime();

      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    logger.log("Sorted posts count:", sortedPosts.length);
    return sortedPosts;
  } catch (error) {
    logger.error("Error in getSortedPosts:", error);
    return posts; // Return unsorted posts on error
  }
};

/**
 * Retrieves featured blog posts.
 *
 * Filters the provided array of posts to return only those marked as featured.
 * If no posts are provided, all posts are retrieved and filtered.
 *
 * @param posts - Optional array of blog posts to filter. If not provided, all posts are retrieved.
 * @returns A promise resolving to an array of featured blog posts.
 * Logs the featured posts count upon successful retrieval, or an error message if an error occurs.
 */

export const getFeaturedPosts = async (posts?: Post[]): Promise<Post[]> => {
  return handleAsync(async () => {
    try {
      logger.log("Getting featured posts");
      const postsToFilter = posts || (await getAllPosts());
      const featuredPosts = postsToFilter.filter(post => post.data.featured);
      logger.log("Featured posts count:", featuredPosts.length);
      return featuredPosts;
    } catch (error) {
      logger.error("Error in getFeaturedPosts:", error);
      return [];
    }
  });
};

/**
 * Retrieves recent blog posts (non-featured).
 *
 * Filters the provided array of posts to return only those not marked as featured.
 * If no posts are provided, all posts are retrieved and filtered.
 *
 * @param posts - Optional array of blog posts to filter. If not provided, all posts are retrieved.
 * @returns A promise resolving to an array of recent blog posts.
 * Logs the recent posts count upon successful retrieval, or an error message if an error occurs.
 */
export const getRecentPosts = async (posts?: Post[]): Promise<Post[]> => {
  return handleAsync(async () => {
    try {
      logger.log("Getting recent (non-featured) posts");
      const postsToFilter = posts || (await getAllPosts());
      const recentPosts = postsToFilter.filter(post => !post.data.featured);
      logger.log("Recent posts count:", recentPosts.length);
      return recentPosts;
    } catch (error) {
      logger.error("Error in getRecentPosts:", error);
      return [];
    }
  });
};

/**
 * Retrieves related blog posts based on a scoring algorithm.
 *
 * This function calculates relevance scores for each post in the `allPosts` array
 * relative to the `currentPost`. The relevance is determined by matching tags, categories,
 * and group association, each contributing differently to the score.
 *
 * - Tag matches contribute the highest score.
 * - Category matches contribute a medium score.
 * - Group matches contribute the lowest score.
 *
 * The function filters out the `currentPost` from the list of candidates, scores each
 * candidate, sorts them by score, and returns the top posts limited by `maxPosts`.
 *
 * @param currentPost - The blog post for which related posts are being sought.
 * @param allPosts - An array of all available blog posts.
 * @param maxPosts - Maximum number of related posts to return.
 * @returns An array of `Post` objects representing the most relevant related posts.
 */

export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  maxPosts: number
): Post[] {
  // Remove current post from candidates
  const candidates = allPosts.filter(post => post.id !== currentPost.id);

  // Calculate relevance scores
  const scoredPosts = candidates.map(post => {
    let score = 0;

    // Tag matching (highest relevance)
    const currentTags = currentPost.data.tags || [];
    const postTags = post.data.tags || [];

    const sharedTags = currentTags.filter((tag: Tag) => postTags.includes(tag));
    score += sharedTags.length * 3;

    // Category matching (medium relevance)
    const currentCategories = currentPost.data.categories || [];
    const postCategories = post.data.categories || [];

    const sharedCategories = currentCategories.filter((category: Category) =>
      postCategories.includes(category)
    );
    score += sharedCategories.length * 2;

    // Group matching (lowest relevance)
    if (post.data.group === currentPost.data.group) {
      score += 1;
    }

    return { post, score, sharedTags };
  });

  // Sort by score and limit results
  return scoredPosts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPosts)
    .map(item => item.post);
}

/**
 * Process an array of posts to add reading time to each post if it is not already present.
 * If the reading time is already present, it is skipped.
 *
 * @param posts Array of posts to process
 * @returns Promise resolving to an array of posts with reading time added
 */
export const getPostsWithReadingTime = async (
  posts: Post[]
): Promise<Post[]> => {
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
          const { remarkPluginFrontmatter } = await render(post);

          // If the remark plugin has already calculated reading time, use it
          if (remarkPluginFrontmatter?.readingTime) {
            post.data.readingTime = remarkPluginFrontmatter.readingTime;
            logger.log(
              "Reading time for post",
              post.id,
              "calculated:",
              remarkPluginFrontmatter.readingTime,
              "minutes"
            );
          }

          return post;
        } catch (e) {
          logger.error(
            "Error calculating reading time for post",
            post.id,
            ":",
            e
          );
          return post;
        }
      })
    );
  });
};

// A simple in-memory cache to store processed posts
const postCache: Record<string, Post[]> = {};

/**
 * Processes blog posts in a single unified operation to avoid duplicate processing.
 *
 * This function combines multiple post processing steps:
 * 1. Retrieves all posts (optionally including drafts)
 * 2. Sorts the posts by date
 * 3. Calculates reading time for each post
 * 4. Optionally limits the number of posts returned
 *
 * Results are cached based on the provided options to prevent redundant processing
 * when the function is called multiple times with the same parameters.
 *
 * @param options - Configuration options for post processing
 * @returns A promise that resolves to an array of processed blog posts
 *
 * Using this function instead of separate calls to getAllPosts, getSortedPosts,
 * and getPostsWithReadingTime avoids duplicate processing and improves performance.
 */
export const processAllPosts = async (
  options: ProcessPostsOptions = {}
): Promise<Post[]> => {
  return handleAsync(async () => {
    try {
      // Create a unique cache key based on options
      const cacheKey = JSON.stringify(options);

      // Return cached results if available
      if (postCache[cacheKey]) {
        logger.log("Returning cached posts for options:", cacheKey);
        return postCache[cacheKey];
      }

      const {
        includeDrafts = false,
        sortDirection = "desc",
        maxPosts = Infinity,
      } = options;

      logger.log("Processing all posts with options:", cacheKey);

      // Step 1: Get all posts (filtered by draft status)
      const filteredPosts = await getAllPosts(includeDrafts);

      // Step 2: Sort the posts
      const sortedPosts = getSortedPosts(filteredPosts, sortDirection);

      // Step 3: Calculate reading times
      const processedPosts = await getPostsWithReadingTime(sortedPosts);

      // Step 4: Limit the number of posts if specified
      const limitedPosts =
        maxPosts < Infinity
          ? processedPosts.slice(0, maxPosts)
          : processedPosts;

      // Cache the results
      postCache[cacheKey] = limitedPosts;

      logger.log("Processed posts count:", limitedPosts.length);
      return limitedPosts;
    } catch (e) {
      logger.error("Error in processAllPosts:", e);
      return [];
    }
  });
};

/**
 * Filters an array of blog posts by a specific attribute (tag, category or group).
 * The filtering is done in a case-insensitive manner.
 *
 * @param posts - Array of blog posts to filter
 * @param type - The type of attribute to filter by
 * @param value - The value to filter by
 * @returns Promise resolving to a filtered array of blog posts
 */
const getPostsBy = async (
  posts: Post[],
  type: "tags" | "categories" | "group",
  value: string
): Promise<Post[]> => {
  return handleAsync(async () => {
    try {
      logger.log(
        "Filtering posts by",
        type,
        ":",
        value,
        ", posts count:",
        posts.length
      );
      const slugifiedValue = slugify(value);
      logger.log("Slugified value:", slugifiedValue);

      const filteredPosts =
        type === "group"
          ? posts.filter(post => slugify(post.data[type]) === slugifiedValue)
          : posts.filter(post =>
              post.data[type]?.some(
                (item: string) => slugify(item) === slugifiedValue
              )
            );

      logger.log("Filtered posts count:", filteredPosts.length);
      return filteredPosts;
    } catch (err) {
      logger.error("Error in getPostsBy", type, ":", err);
      return []; // Return empty array on error
    }
  });
};

/**
 * Retrieves posts that contain a specific tag.
 * @param posts - Array of blog posts to filter.
 * @param tag - Tag to filter posts by.
 * @returns Promise resolving to an array of posts that contain the specified tag.
 */
export const getPostsByTag = async (
  posts: Post[],
  tag: string
): Promise<Post[]> => getPostsBy(posts, "tags", tag);

export const getPostsByTagX = (posts: Post[], tag: string) =>
  getSortedPosts(posts.filter(post => slugify(post.data.tags).includes(tag)));

export default getPostsByTag;

/**
 * Retrieves posts that contain a specific category.
 * @param posts - Array of blog posts to filter.
 * @param category - Category to filter posts by.
 * @returns Promise resolving to an array of posts that contain the specified category.
 */
export const getPostsByCategory = async (
  posts: Post[],
  category: string
): Promise<Post[]> => {
  return getPostsBy(posts, "categories", category);
};

/**
 * Retrieves posts that contain a specific group.
 * @param posts - Array of blog posts to filter.
 * @param group - Group to filter posts by.
 * @returns Promise resolving to an array of posts that contain the specified group.
 */
export const getPostsByGroup = async (
  posts: Post[],
  group: string
): Promise<Post[]> => {
  return getPostsBy(posts, "group", group);
};

/**
 * Retrieves all blog posts and filters them by the specified group.
 *
 * @param group - The group to filter posts by.
 * @returns Promise resolving to an array of posts belonging to the specified group.
 * Logs the number of posts before and after filtering.
 * Returns an empty array if an error occurs during retrieval or filtering.
 */

export const getAllPostsByGroup = async (group: string): Promise<Post[]> => {
  try {
    logger.log("Getting all posts by group:", group);
    const posts = await processAllPosts();
    logger.log("Posts count before filtering by group:", posts.length);
    const groupPosts = await getPostsByGroup(posts, group);
    logger.log("Posts count after filtering by group:", groupPosts.length);
    return groupPosts;
  } catch (err) {
    logger.error("Error in getAllPostsByGroup:", err);
    return []; // Return empty array on error
  }
};

/**
 * Type for keys used in grouping operations
 */
export type GroupKey = string | number | symbol;

/**
 * Interface for a function that determines the group key for an item
 * @template T The type of items being grouped
 */
export interface GroupFunction<T> {
  (item: T, index?: number): GroupKey;
}

/**
 * Groups an array of items by a condition defined by the provided grouping function.
 *
 * This function efficiently groups items into a record where each key is determined
 * by applying the groupFunction to each item, and the value is an array of items
 * that share the same key.
 *
 * @template T The type of items being grouped
 * @param items The array of items to group
 * @param groupFunction A function that determines the group key for each item
 * @param options Optional configuration for the grouping operation
 * @returns A record mapping group keys to arrays of items
 *
 * @example
 * // Group posts by publication year
 * const postsByYear = groupByCondition(
 *   posts,
 *   post => post.data.pubDatetime.getFullYear()
 * );
 *
 * @example
 * // Group posts by category with custom error handling
 * const postsByCategory = groupByCondition(
 *   posts,
 *   post => post.data.categories[0] || 'Uncategorized',
 *   {
 *     onError: (item, error) => {
 *       logger.error(`Error grouping post ${item.id}: ${error}`);
 *       return 'Error';
 *     }
 *   }
 * );
 */
export const groupByCondition = <T>(
  items: T[],
  groupFunction: GroupFunction<T>,
  options?: {
    /** Function to handle errors that occur during grouping */
    onError?: (item: T, error: unknown) => GroupKey;
    /** Initial value for the result object */
    initialGroups?: Record<GroupKey, T[]>;
  }
): Record<GroupKey, T[]> => {
  try {
    // Use provided initial groups or create a new empty object
    const result: Record<GroupKey, T[]> = options?.initialGroups || {};

    // Use forEach for better performance than for loop
    items.forEach((item, index) => {
      try {
        // Get the group key for this item
        const groupKey = groupFunction(item, index);

        // Initialize the group array if it doesn't exist
        if (!result[groupKey]) {
          result[groupKey] = [];
        }

        // Add the item to its group
        result[groupKey].push(item);
      } catch (error) {
        // Handle errors in the grouping function
        if (options?.onError) {
          const fallbackKey = options.onError(item, error);
          if (!result[fallbackKey]) {
            result[fallbackKey] = [];
          }
          result[fallbackKey].push(item);
        } else {
          // Re-throw if no error handler is provided
          throw error;
        }
      }
    });

    return result;
  } catch (error) {
    logger.error("Error in groupByCondition:", error);
    return options?.initialGroups || {};
  }
};

/**
 * Legacy function for backward compatibility.
 * @deprecated Use groupByCondition instead
 */
export const getPostsByGroupCondition = (
  posts: Post[],
  groupFunction: GroupFunction<Post>
): Record<GroupKey, Post[]> => {
  try {
    return groupByCondition(posts, groupFunction);
  } catch (error) {
    logger.error("Error in getPostsByGroupCondition:", error);
    return {};
  }
};
