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
import { handleAsync } from "./core/errors";

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
const filterBlogPosts = async (
  post: CollectionEntry<"blog">
): Promise<boolean> => {
  return handleAsync(async () => {
    const processor = createBlogPostProcessor({
      includeDrafts: import.meta.env.DEV,
    });

    // Process a single post to apply filtering
    const filtered = await processor.processContent([post]);
    return filtered.length > 0;
  });
};

/**
 * Synchronous version of filterBlogPosts.
 * Use this when async operations are not possible.
 *
 * @param post - Blog post entry to evaluate
 * @returns Boolean indicating if the post should be included
 */
export const filterBlogPostsSync = ({
  data,
}: CollectionEntry<"blog">): boolean => {
  const isDevelopment = import.meta.env.DEV;
  const { draft, pubDatetime } = data;

  if (!pubDatetime) {
    return false;
  }

  const pubDate = new Date(pubDatetime);
  if (isNaN(pubDate.getTime())) {
    return false;
  }

  return (
    isDevelopment ||
    (!draft && pubDate.getTime() <= Date.now() + SITE.scheduledPostMargin)
  );
};

export default filterBlogPosts;
