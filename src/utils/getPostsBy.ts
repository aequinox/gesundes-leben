/**
 * @module getPostsBy
 * @description
 * Utility module for filtering and retrieving blog posts based on various criteria
 * such as tags, categories, groups, and authors.
 *
 * @deprecated This module is deprecated. Please use the PostService methods instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PostService instead
 * import { getPostsByTag, getPostsByCategory, getPostsByAuthor } from './utils/getPostsBy';
 *
 * // RECOMMENDED
 * import { postService } from '@/services/content/PostService';
 * const tagPosts = await postService.getPostsByTag(posts, 'typescript');
 * const categoryPosts = await postService.getPostsByCategory(posts, 'Ernährung');
 * ```
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { postService } from "@/services/content/PostService";

/**
 * Retrieves posts by category with case-insensitive matching.
 *
 * @deprecated This function is deprecated. Please use PostService.getPostsByCategory instead.
 *
 * @param posts - Array of blog posts to filter
 * @param value - Category to filter by
 * @returns Promise resolving to array of posts in the category
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const healthPosts = await getPostsByCategory(posts, 'Ernährung');
 *
 * // RECOMMENDED
 * const healthPosts = await postService.getPostsByCategory(posts, 'Ernährung');
 * ```
 */
export const getPostsByCategory = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: getPostsByCategory is deprecated. Please use postService.getPostsByCategory instead."
  );
  return postService.getPostsByCategory(posts, value);
};

/**
 * Retrieves posts by group with case-insensitive matching.
 *
 * @deprecated This function is deprecated. Please use PostService.getPostsByGroup instead.
 *
 * @param posts - Array of blog posts to filter
 * @param value - Group to filter by
 * @returns Promise resolving to array of posts in the group
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const seriesPosts = await getPostsByGroup(posts, 'pro');
 *
 * // RECOMMENDED
 * const seriesPosts = await postService.getPostsByGroup(posts, 'pro');
 * ```
 */
export const getPostsByGroup = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: getPostsByGroup is deprecated. Please use postService.getPostsByGroup instead."
  );
  return postService.getPostsByGroup(posts, value);
};

/**
 * Retrieves all non-draft blog posts by group with case-insensitive matching.
 *
 * @deprecated This function is deprecated. Please use PostService.getAllPostsByGroup instead.
 *
 * @param value - Group to filter by
 * @returns Promise resolving to array of posts in the group
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const publishedPosts = await getAllPostsByGroup('pro');
 *
 * // RECOMMENDED
 * const publishedPosts = await postService.getAllPostsByGroup('pro');
 * ```
 */
export const getAllPostsByGroup = async (
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: getAllPostsByGroup is deprecated. Please use postService.getAllPostsByGroup instead."
  );
  return postService.getAllPostsByGroup(value);
};

/**
 * Retrieves posts by tag with case-insensitive matching.
 *
 * @deprecated This function is deprecated. Please use PostService.getPostsByTag instead.
 *
 * @param posts - Array of blog posts to filter
 * @param value - Tag to filter by
 * @returns Promise resolving to array of posts with the tag
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const healthTips = await getPostsByTag(posts, 'health-tips');
 *
 * // RECOMMENDED
 * const healthTips = await postService.getPostsByTag(posts, 'health-tips');
 * ```
 */
export const getPostsByTag = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: getPostsByTag is deprecated. Please use postService.getPostsByTag instead."
  );
  return postService.getPostsByTag(posts, value);
};

/**
 * Retrieves posts by author with case-insensitive matching.
 *
 * @deprecated This function is not directly available in PostService. Please use a combination of PostService methods or implement a custom solution.
 *
 * @param posts - Array of blog posts to filter
 * @param authorSlug - Author slug to filter by
 * @returns Promise resolving to array of posts by the author
 */
export const getPostsByAuthor = async (
  posts: CollectionEntry<"blog">[],
  authorSlug: string
): Promise<CollectionEntry<"blog">[]> => {
  console.warn(
    "Warning: getPostsByAuthor is deprecated. Consider using PostService methods or implementing a custom solution."
  );

  // Since PostService doesn't have a direct equivalent, we keep the original implementation
  // but mark it as deprecated
  const normalizedAuthorSlug = authorSlug
    .replace(/\.(md|mdx)$/, "")
    .toLowerCase();

  return posts.filter(post => {
    const postAuthor = post.data.author;
    let postAuthorSlug =
      typeof postAuthor === "string" ? postAuthor : postAuthor.id;
    postAuthorSlug = postAuthorSlug.replace(/\.(md|mdx)$/, "").toLowerCase();

    return postAuthorSlug === normalizedAuthorSlug;
  });
};
