/**
 * @module getPostsWithRT
 * @description
 * Utility module for adding reading time data to blog posts.
 *
 * @deprecated This module is deprecated. Please use the PostUtils.addReadingTimeToPosts method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PostUtils instead
 * import addReadingTimeToPosts from './utils/getPostsWithRT';
 *
 * // RECOMMENDED
 * import { PostUtils } from './utils/content/posts';
 * const posts = await getCollection('blog');
 * const postsWithRT = await PostUtils.addReadingTimeToPosts(posts);
 * console.log(postsWithRT[0].data.readingTime);
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { PostUtils } from "./content/posts";

/**
 * Adds reading time data to an array of blog posts.
 *
 * @deprecated This function is deprecated. Please use PostUtils.addReadingTimeToPosts instead.
 *
 * @param posts - Array of blog posts to process
 * @returns Promise resolving to posts with reading time data
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const postsWithRT = await addReadingTimeToPosts(posts);
 *
 * // RECOMMENDED
 * const postsWithRT = await PostUtils.addReadingTimeToPosts(posts);
 * ```
 */
const addReadingTimeToPosts = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: addReadingTimeToPosts is deprecated. Please use PostUtils.addReadingTimeToPosts instead."
  );
  return PostUtils.addReadingTimeToPosts(posts);
};

export default addReadingTimeToPosts;
