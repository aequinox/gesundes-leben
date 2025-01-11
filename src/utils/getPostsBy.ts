import { getCollection, type CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll, slugifyStr } from "./slugify";

/**
 * Filters and sorts posts based on a specified type and its corresponding value.
 *
 * @param posts - Array of blog post entries to filter and sort.
 * @param type - The type of filtering criteria; can be "tags", "categories", or "group".
 * @param value - The value used to filter the posts, which will be slugified for comparison.
 * @returns Promise resolving to an array of filtered and sorted blog post entries.
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
 * @param posts - Array of blog post entries to filter.
 * @param value - Category to filter by.
 * @returns Promise resolving to array of posts in the category.
 */
export const getPostsByCategory = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "categories", value);
};

/**
 * Retrieves posts by group with case-insensitive matching.
 * @param posts - Array of blog post entries to filter.
 * @param value - Group to filter by.
 * @returns Promise resolving to an array of posts in the specified group.
 */

export const getPostsByGroup = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "group", value);
};

/**
 * Retrieves all non-draft blog posts by group with case-insensitive matching.
 * When run in development mode, all posts are included.
 *
 * @param value - Group to filter by.
 * @returns Promise resolving to an array of posts in the specified group.
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
 * @param posts - Array of blog post entries to filter.
 * @param value - Tag to filter by.
 * @returns Promise resolving to an array of posts with the tag.
 */
export const getPostsByTag = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "tags", value);
};
