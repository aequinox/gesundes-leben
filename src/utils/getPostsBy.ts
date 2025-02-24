/**
 * @module getPostsBy
 * @description
 * Utility module for filtering and retrieving blog posts based on various criteria
 * such as tags, categories, and groups. Includes support for draft post handling
 * and case-insensitive matching.
 *
 * @example
 * ```typescript
 * import { getPostsByTag, getPostsByCategory } from './utils/getPostsBy';
 *
 * const tagPosts = await getPostsByTag(posts, 'typescript');
 * const categoryPosts = await getPostsByCategory(posts, 'tutorial');
 * ```
 */

import { getCollection, type CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll, slugifyStr } from "./slugify";

/**
 * Filters and sorts posts based on a specified type and its corresponding value.
 * Handles case-insensitive matching and proper slug comparison.
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
  return await getSortedPosts(
    type === "group"
      ? posts.filter(post => slugifyStr(post.data[type]) === slugifiedValue)
      : posts.filter(post =>
          slugifyAll(post.data[type]).some(item => item === slugifiedValue)
        )
  );
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
 * const tutorialPosts = await getPostsByCategory(posts, 'Tutorials');
 * const guidePosts = await getPostsByCategory(posts, 'Getting Started');
 * ```
 */
export const getPostsByCategory = async (
  posts: CollectionEntry<"blog">[],
  value: string
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
 * const seriesPosts = await getPostsByGroup(posts, 'TypeScript Series');
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
  // Get all posts first
  const posts = await getCollection("blog");

  // Filter by group
  const groupPosts = await getPostsBy(posts, "group", value);

  // Then filter by draft status based on environment
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment
    ? groupPosts
    : groupPosts.filter(post => !post.data.draft);
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
 * const typescriptPosts = await getPostsByTag(posts, 'TypeScript');
 * const beginnerPosts = await getPostsByTag(posts, 'Beginner Friendly');
 * ```
 */
export const getPostsByTag = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "tags", value);
};
