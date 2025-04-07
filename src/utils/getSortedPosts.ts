/**
 * @module getSortedPosts
 * @description
 * Utility module for sorting blog posts by date, considering both publication
 * and modification dates.
 *
 * @deprecated This module is deprecated. Please use the PostUtils.sortPostsByDate method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PostUtils instead
 * import sortPostsByDate from './utils/getSortedPosts';
 *
 * // RECOMMENDED
 * import { PostUtils } from './utils/content/posts';
 * const posts = await getCollection('blog');
 * const sortedPosts = await PostUtils.sortPostsByDate(posts);
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { PostUtils } from "./content/posts";

/**
 * Sorts blog posts by modification or publication date (newest first).
 * Also ensures reading time is calculated and attached to each post.
 *
 * @deprecated This function is deprecated. Please use PostUtils.sortPostsByDate instead.
 *
 * @param posts - Array of blog posts to sort
 * @returns Promise resolving to sorted array of blog posts
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const sortedPosts = await sortPostsByDate(posts);
 *
 * // RECOMMENDED
 * const sortedPosts = await PostUtils.sortPostsByDate(posts);
 * ```
 */
const sortPostsByDate = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: sortPostsByDate is deprecated. Please use PostUtils.sortPostsByDate instead."
  );
  return PostUtils.sortPostsByDate(posts);
};

export default sortPostsByDate;
