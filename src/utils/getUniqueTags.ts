/**
 * @module getUniqueTags
 * @description
 * Utility module for extracting and managing unique tags from blog posts.
 *
 * @deprecated This module is deprecated. Please use the TagService.extractUniqueTags method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use TagService instead
 * import extractUniqueTags from './utils/getUniqueTags';
 *
 * // RECOMMENDED
 * import { tagService } from '@/services/content/TagService';
 * const posts = await getCollection('blog');
 * const uniqueTags = tagService.extractUniqueTags(posts);
 * ```
 */

import { tagService } from "@/services/content/TagService";
import type { CollectionEntry } from "astro:content";
import type { TagInfo } from "@/services/content/TagService";

// Re-export interface for backward compatibility
export type { TagInfo };

/**
 * Extracts and returns unique tags from a list of blog posts.
 *
 * @deprecated This function is deprecated. Please use TagService.extractUniqueTags instead.
 *
 * @param posts - Array of blog posts to extract tags from
 * @returns Array of unique tag objects containing slugified tag and original name
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const uniqueTags = extractUniqueTags(posts);
 *
 * // RECOMMENDED
 * const uniqueTags = tagService.extractUniqueTags(posts);
 *
 * // Using in templates
 * uniqueTags.map(({ tag, tagName }) => (
 *   <a href={`/tags/${tag}`}>{tagName}</a>
 * ));
 * ```
 */
const extractUniqueTags = (posts: CollectionEntry<"blog">[]): TagInfo[] => {
  console.warn(
    "Warning: extractUniqueTags is deprecated. Please use tagService.extractUniqueTags instead."
  );
  return tagService.extractUniqueTags(posts);
};

export default extractUniqueTags;
