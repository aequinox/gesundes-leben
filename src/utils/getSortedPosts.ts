/**
 * @module getSortedPosts
 * @description
 * Utility module for sorting blog posts by date, considering both publication
 * and modification dates. Also ensures reading time data is available for all posts.
 * Posts are sorted in descending order (newest first).
 *
 * @example
 * ```typescript
 * import sortPostsByDate from './utils/getSortedPosts';
 *
 * const posts = await getCollection('blog');
 * const sortedPosts = await sortPostsByDate(posts);
 * // Posts are sorted by modDatetime || pubDatetime, newest first
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { contentManager } from "./content";

/**
 * Sorts blog posts by modification or publication date (newest first).
 * Also ensures reading time is calculated and attached to each post.
 *
 * Sorting logic:
 * 1. Uses modDatetime if available, falls back to pubDatetime
 * 2. Sorts in descending order (newest posts first)
 * 3. Updates reading time data for all posts
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
 * // Accessing sorted posts in templates
 * sortedPosts.map(post => (
 *   <article>
 *     <h1>{post.data.title}</h1>
 *     <time>{post.data.modDatetime || post.data.pubDatetime}</time>
 *     <span>{post.data.readingTime}</span>
 *   </article>
 * ));
 * ```
 *
 * @remarks
 * - Posts without dates are considered oldest
 * - Reading time is calculated and cached
 * - Handles both markdown and MDX content
 */
const sortPostsByDate = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return contentManager.posts.updateReadingTimes(
    posts.sort((a, b) => {
      return (
        new Date(b.data.modDatetime || b.data.pubDatetime).getTime() -
        new Date(a.data.modDatetime || a.data.pubDatetime).getTime()
      );
    })
  );
};

export default sortPostsByDate;
