/**
 * @module getSortedPosts
 * @description
 * Utility module for sorting blog posts by date, considering both publication
 * and modification dates. Uses the BlogPostProcessor for consistent content
 * handling and processing.
 *
 * @example
 * ```typescript
 * import sortPostsByDate from './utils/getSortedPosts';
 *
 * const posts = await getCollection('blog');
 * const sortedPosts = await sortPostsByDate(posts);
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { createBlogPostProcessor } from "./core/content";
import { handleAsync } from "./core/errors";

/**
 * Sorts blog posts by modification or publication date (newest first).
 * Also ensures reading time is calculated and attached to each post.
 *
 * @param posts - Array of blog posts to sort
 * @returns Promise resolving to sorted array of blog posts
 *
 * @example
 * ```typescript
 * // Basic usage
 * const sortedPosts = await sortPostsByDate(posts);
 *
 * // With filtering
 * const recentPosts = await sortPostsByDate(
 *   posts.filter(post => !post.data.draft)
 * );
 *
 * // Access sorted posts
 * sortedPosts.forEach(post => {
 *   console.log(
 *     post.data.title,
 *     post.data.modDatetime || post.data.pubDatetime
 *   );
 * });
 * ```
 */
const sortPostsByDate = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return handleAsync(async () => {
    const processor = createBlogPostProcessor({
      sortDirection: "desc",
      includeDrafts: import.meta.env.DEV,
    });

    return processor.processContent(posts);
  });
};

export default sortPostsByDate;
