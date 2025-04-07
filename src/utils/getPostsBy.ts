/**
 * @module getPostsBy
 * @description
 * Utility module for filtering and retrieving blog posts based on various criteria
 * such as tags, categories, groups, and authors. Uses the BlogPostProcessor for consistent
 * content handling and filtering.
 *
 * @example
 * ```typescript
 * import { getPostsByTag, getPostsByCategory, getPostsByAuthor } from './utils/getPostsBy';
 *
 * const tagPosts = await getPostsByTag(posts, 'typescript');
 * const categoryPosts = await getPostsByCategory(posts, 'Ernährung');
 * const authorPosts = await getPostsByAuthor(posts, 'sandra-pfeiffer');
 * ```
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { slugService } from "@/services/format/SlugService";
import { handleAsync } from "./core/errors";

/**
 * Filters and sorts posts based on a specified type and its corresponding value.
 * Maintains original post order after filtering.
 *
 * @param posts - Array of blog posts to filter
 * @param type - Type of filtering criteria ('tags', 'categories', or 'group')
 * @param value - Value to filter by (will be slugified for comparison)
 * @returns Promise resolving to filtered blog post entries
 *
 * @internal
 */
const getPostsBy = async (
  posts: CollectionEntry<"blog">[],
  type: "tags" | "categories" | "group",
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return handleAsync(async () => {
    const slugifiedValue = slugService.slugifyStr(value);

    // Filter posts while maintaining original order
    return type === "group"
      ? posts.filter(
          post => slugService.slugifyStr(post.data[type]) === slugifiedValue
        )
      : posts.filter(post =>
          post.data[type]?.some(
            (item: string) => slugService.slugifyStr(item) === slugifiedValue
          )
        );
  });
};

/**
 * Retrieves posts by category with case-insensitive matching.
 * Categories are slugified for consistent comparison.
 *
 * @param posts - Array of blog posts to filter
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
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "categories", value);
};

/**
 * Retrieves posts by group with case-insensitive matching.
 * Groups provide a way to organize related posts together.
 *
 * @param posts - Array of blog posts to filter
 * @param value - Group to filter by
 * @returns Promise resolving to array of posts in the group
 *
 * @example
 * ```typescript
 * const seriesPosts = await getPostsByGroup(posts, 'pro');
 * const featurePosts = await getPostsByGroup(posts, 'kontra');
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
 * const publishedPosts = await getAllPostsByGroup('pro');
 *
 * // In development: includes draft posts
 * const allPosts = await getAllPostsByGroup('kontra');
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
 * @param posts - Array of blog posts to filter
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

/**
 * Retrieves posts by author with case-insensitive matching.
 * Handles both string author slugs and reference objects.
 *
 * @param posts - Array of blog posts to filter
 * @param authorSlug - Author slug to filter by
 * @returns Promise resolving to array of posts by the author
 *
 * @example
 * ```typescript
 * const authorPosts = await getPostsByAuthor(posts, 'sandra-pfeiffer');
 * ```
 */
export const getPostsByAuthor = async (
  posts: CollectionEntry<"blog">[],
  authorSlug: string
): Promise<CollectionEntry<"blog">[]> => {
  return handleAsync(async () => {
    // Normalize author slug by removing file extension and slugifying
    const normalizedAuthorSlug = slugService.slugifyStr(
      authorSlug.replace(/\.(md|mdx)$/, "")
    );

    return posts.filter(post => {
      const postAuthor = post.data.author;

      // Handle both string and reference objects
      let postAuthorSlug =
        typeof postAuthor === "string" ? postAuthor : postAuthor.id;

      // Normalize post author slug by removing file extension
      postAuthorSlug = postAuthorSlug.replace(/\.(md|mdx)$/, "");

      return slugService.slugifyStr(postAuthorSlug) === normalizedAuthorSlug;
    });
  });
};
