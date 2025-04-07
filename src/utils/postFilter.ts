/**
 * @module postFilter
 * @description
 * Utility module for filtering blog posts based on draft status and publication date.
 *
 * @deprecated This module is deprecated. Please use the PostService.getAllPosts method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PostService instead
 * import filterBlogPosts from './utils/postFilter';
 *
 * // RECOMMENDED
 * import { postService } from '@/services/content/PostService';
 * const posts = await postService.getAllPosts(import.meta.env.DEV);
 * ```
 */

import { SITE } from "@/config";
import type { CollectionEntry } from "astro:content";
import { postService } from "@/services/content/PostService";

/**
 * Filters blog posts based on draft status and publication date.
 *
 * @deprecated This function is deprecated. Please use PostService.getAllPosts instead.
 *
 * @param post - Blog post entry to evaluate
 * @returns Boolean indicating if the post should be included
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const publishedPosts = posts.filter(filterBlogPosts);
 *
 * // RECOMMENDED
 * const publishedPosts = await postService.getAllPosts(import.meta.env.DEV);
 * ```
 */
const filterBlogPosts = ({ data }: CollectionEntry<"blog">): boolean => {
  console.warn(
    "Warning: filterBlogPosts is deprecated. Please use postService.getAllPosts instead."
  );

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
 *
 * @deprecated This function is deprecated. Please use PostService.getAllPosts instead.
 *
 * @param posts - Array of blog posts to filter
 * @returns Promise resolving to filtered posts
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const filteredPosts = await filterBlogPostsAsync(posts);
 *
 * // RECOMMENDED
 * const filteredPosts = await postService.getAllPosts(import.meta.env.DEV);
 * ```
 */
export const filterBlogPostsAsync = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: filterBlogPostsAsync is deprecated. Please use postService.getAllPosts instead."
  );

  // Since we're given posts already, we'll filter them directly rather than fetching new ones
  const includeDrafts = import.meta.env.DEV;
  const now = Date.now();
  const scheduledPostMargin = SITE.scheduledPostMargin || 0;

  return posts.filter(post => {
    const { draft, pubDatetime } = post.data;

    if (!pubDatetime) return false;

    const pubDate = new Date(pubDatetime);
    if (isNaN(pubDate.getTime())) return false;

    return (
      includeDrafts ||
      (!draft && pubDate.getTime() <= now + scheduledPostMargin)
    );
  });
};

export default filterBlogPosts;
