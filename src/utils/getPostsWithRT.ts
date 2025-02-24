/**
 * @module getPostsWithRT
 * @description
 * Utility module for adding reading time data to blog posts.
 * Calculates and attaches reading time estimates to post metadata.
 * Reading time is calculated based on word count and average reading speed.
 *
 * @example
 * ```typescript
 * import addReadingTimeToPosts from './utils/getPostsWithRT';
 *
 * const posts = await getCollection('blog');
 * const postsWithRT = await addReadingTimeToPosts(posts);
 * console.log(postsWithRT[0].data.readingTime); // e.g., "5 min read"
 * ```
 */

import type { CollectionEntry } from "astro:content";
import { contentManager } from "./content";

/**
 * Adds reading time data to an array of blog posts.
 * Uses the content manager to calculate and update reading times.
 * The reading time calculation considers:
 * - Word count in the post content
 * - Average reading speed (configurable)
 * - Content complexity
 *
 * @param posts - Array of blog posts to process
 * @returns Promise resolving to posts with reading time data added
 *
 * @example
 * ```typescript
 * // Basic usage
 * const postsWithRT = await addReadingTimeToPosts(posts);
 *
 * // Accessing reading time in templates
 * posts.map(post => (
 *   <article>
 *     <h1>{post.data.title}</h1>
 *     <span>{post.data.readingTime}</span>
 *   </article>
 * ));
 * ```
 *
 * @remarks
 * - Reading time is calculated once and cached
 * - Updates automatically when content changes
 * - Handles both markdown and MDX content
 * - Excludes code blocks from reading time calculation
 */
const addReadingTimeToPosts = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return contentManager.posts.updateReadingTimes(posts);
};

export default addReadingTimeToPosts;
