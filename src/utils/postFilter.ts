/**
 * @module postFilter
 * @description
 * Utility module for filtering blog posts based on draft status and publication date.
 * Handles environment-aware filtering (development vs. production) and scheduled posts.
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

/**
 * Filters blog posts based on draft status and publication date.
 * In development mode, all posts are included.
 * In production mode:
 * - Draft posts are excluded
 * - Posts with future publication dates are excluded (unless within margin)
 * - Posts without publication dates are excluded
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
 *
 * @remarks
 * - Uses SITE.scheduledPostMargin for future post scheduling
 * - Development mode (import.meta.env.DEV) shows all posts
 * - Production mode enforces publication rules
 * - Posts must have a valid pubDatetime
 */
const filterBlogPosts = ({ data }: CollectionEntry<"blog">): boolean => {
  const isDevelopment = import.meta.env.DEV;
  const { draft, pubDatetime } = data;

  if (!pubDatetime) {
    return false;
  }

  return (
    isDevelopment ||
    (!draft && pubDatetime.getTime() <= Date.now() + SITE.scheduledPostMargin)
  );
};

export default filterBlogPosts;
