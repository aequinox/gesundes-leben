/**
 * @module getPostsWithRT
 * @description
 * Utility module for adding reading time data to blog posts.
 * Uses the BlogPostProcessor for consistent content handling
 * and reading time calculation.
 *
 * @example
 * ```typescript
 * import addReadingTimeToPosts from './utils/getPostsWithRT';
 *
 * const posts = await getCollection('blog');
 * const postsWithRT = await addReadingTimeToPosts(posts);
 * console.log(postsWithRT[0].data.readingTime);
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { createBlogPostProcessor } from "./core/content";
import { handleAsync } from "./core/errors";

/**
 * Adds reading time data to an array of blog posts.
 * Uses the BlogPostProcessor's transform functionality to
 * calculate and attach reading times.
 *
 * @param posts - Array of blog posts to process
 * @returns Promise resolving to posts with reading time data
 *
 * @example
 * ```typescript
 * // Basic usage
 * const postsWithRT = await addReadingTimeToPosts(posts);
 *
 * // With filtering
 * const publishedPostsWithRT = await addReadingTimeToPosts(
 *   posts.filter(post => !post.data.draft)
 * );
 *
 * // Access reading time
 * postsWithRT.forEach(post => {
 *   console.log(`${post.data.title}: ${post.data.readingTime}`);
 * });
 * ```
 */
const addReadingTimeToPosts = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return handleAsync(async () => {
    const processor = createBlogPostProcessor({
      // Only transform for reading time, no filtering or sorting
      includeDrafts: true,
      sortDirection: "asc",
    });

    // Use the processor's transform functionality directly
    return processor.transform(posts);
  });
};

export default addReadingTimeToPosts;
