/**
 * @module getPostsBy
 * @description
 * Utility module for filtering and retrieving blog posts based on various criteria
 * such as tags, categories, and groups. Uses the BlogPostProcessor for consistent
 * content handling and processing.
 *
 * @example
 * ```typescript
 * import { getPostsByTag, getPostsByCategory } from './utils/getPostsBy';
 *
 * const tagPosts = await getPostsByTag(posts, 'typescript');
 * const categoryPosts = await getPostsByCategory(posts, 'Ernährung');
 * ```
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { createBlogPostProcessor, type BlogCategory } from "./core/content";
import { slugifyStr } from "./slugify";
import { handleAsync } from "./core/errors";

/**
 * Filters and sorts posts based on a specified type and its corresponding value.
 * Uses the BlogPostProcessor for consistent content handling.
 *
 * @param posts - Array of blog post entries to filter and sort
 * @param type - Type of filtering criteria ('tags', 'categories', or 'group')
 * @param value - Value to filter by (will be slugified for comparison)
 * @returns Promise resolving to filtered and sorted blog post entries
 *
 * @internal
 */
const getPostsBy = async (
  posts: CollectionEntry<"blog">[],
  type: "tags" | "categories" | "group",
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  const slugifiedValue = slugifyStr(value);
  const processor = createBlogPostProcessor({
    includeDrafts: import.meta.env.DEV,
  });

  return handleAsync(async () => {
    if (type === "group") {
      return processor.processContent(
        posts.filter(post => slugifyStr(post.data[type]) === slugifiedValue)
      );
    }

    return processor.processContent(
      posts.filter(post =>
        post.data[type]?.some(item => slugifyStr(item) === slugifiedValue)
      )
    );
  });
};

/**
 * Retrieves posts by category with case-insensitive matching.
 * Categories are slugified for consistent comparison.
 *
 * @param posts - Array of blog post entries to filter
 * @param value - Category to filter by
 * @returns Promise resolving to array of posts in the category
 *
 * @example
 * ```typescript
 * const healthPosts = await getPostsByCategory(posts, 'Ernährung');
 * const sciencePosts = await getPostsByCategory(posts, 'Wissenschaftliches');
 * ```
 */
export const getPostsByCategory = async (
  posts: CollectionEntry<"blog">[],
  value: BlogCategory
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "categories", value);
};

/**
 * Retrieves posts by group with case-insensitive matching.
 * Groups provide a way to organize related posts together.
 *
 * @param posts - Array of blog post entries to filter
 * @param value - Group to filter by
 * @returns Promise resolving to array of posts in the group
 *
 * @example
 * ```typescript
 * const seriesPosts = await getPostsByGroup(posts, 'Health Series');
 * const featurePosts = await getPostsByGroup(posts, 'Featured');
 * ```
 */
export const getPostsByGroup = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "group", value);
};

/**
 * Retrieves all non-draft blog posts by group with case-insensitive matching.
 * When run in development mode, all posts (including drafts) are included.
 *
 * @param value - Group to filter by
 * @returns Promise resolving to array of posts in the group
 *
 * @example
 * ```typescript
 * // In production: only published posts
 * const publishedPosts = await getAllPostsByGroup('Featured');
 *
 * // In development: includes draft posts
 * const allPosts = await getAllPostsByGroup('Featured');
 * ```
 */
export const getAllPostsByGroup = async (
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  const posts = await getCollection("blog");
  return await getPostsByGroup(posts, value);
};

/**
 * Retrieves posts by tag with case-insensitive matching.
 * Tags are slugified for consistent comparison.
 *
 * @param posts - Array of blog post entries to filter
 * @param value - Tag to filter by
 * @returns Promise resolving to array of posts with the tag
 *
 * @example
 * ```typescript
 * const healthTips = await getPostsByTag(posts, 'health-tips');
 * const nutrition = await getPostsByTag(posts, 'nutrition');
 * ```
 */
export const getPostsByTag = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "tags", value);
};
