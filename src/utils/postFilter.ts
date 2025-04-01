/**
 * @module postFilter
 * @description
 * Utility module for filtering blog posts based on draft status and publication date.
 * Uses the BlogPostProcessor for consistent content handling and filtering.
 *
 * @example
 * ```typescript
 * import filterBlogPosts from './utils/postFilter';
 *
 * const posts = await getCollection('blog');
 * const publishedPosts = posts.filter(filterBlogPosts);
 * ```
 */

import { SITE } from "@/config";
import type { CollectionEntry } from "astro:content";
import { createBlogPostProcessor } from "./core/content";

/**
 * Filters blog posts based on draft status and publication date.
 * Uses BlogPostProcessor for consistent filtering logic.
 *
 * @param post - Blog post entry to evaluate
 * @returns Boolean indicating if the post should be included
 *
 * @example
 * ```typescript
 * // Basic filtering
 * const publishedPosts = posts.filter(filterBlogPosts);
 *
 * // With additional criteria
 * const recentPublishedPosts = posts
 *   .filter(filterBlogPosts)
 *   .filter(post => {
 *     const postDate = new Date(post.data.pubDatetime);
 *     const threeMonthsAgo = new Date();
 *     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
 *     return postDate >= threeMonthsAgo;
 *   });
 * ```
 */
const filterBlogPosts = ({ data }: CollectionEntry<"blog">): boolean => {
  const isDevelopment = import.meta.env.DEV;
  const { draft, pubDatetime } = data;

  // Exclude posts with missing publication date
  if (!pubDatetime) {
    return false;
  }

  // Exclude posts with invalid publication date
  const pubDate = new Date(pubDatetime);
  if (isNaN(pubDate.getTime())) {
    return false;
  }

  // In development mode, include all posts with valid dates
  if (isDevelopment) {
    return true;
  }

  // In production mode:
  // 1. Exclude draft posts
  if (draft) {
    return false;
  }

  // 2. Exclude future posts outside the scheduled margin
  const scheduledMargin = SITE.scheduledPostMargin || 0;
  if (pubDate.getTime() > Date.now() + scheduledMargin) {
    return false;
  }

  // Include all other posts
  return true;
};

/**
 * Filters blog posts using the BlogPostProcessor.
 * This version provides more advanced filtering capabilities
 * but requires async/await usage.
 *
 * @param posts - Array of blog posts to filter
 * @returns Promise resolving to filtered posts
 *
 * @example
 * ```typescript
 * const posts = await getCollection('blog');
 * const filteredPosts = await filterBlogPostsAsync(posts);
 * ```
 */
export const filterBlogPostsAsync = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  const processor = createBlogPostProcessor({
    includeDrafts: import.meta.env.DEV,
  });

  return processor.processContent(posts);
};

export default filterBlogPosts;
