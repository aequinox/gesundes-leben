/**
 * @module getUniqueTags
 * @description
 * Utility module for extracting and managing unique tags from blog posts.
 * Handles tag deduplication, slugification, and sorting for consistent presentation.
 *
 * @example
 * ```typescript
 * import extractUniqueTags from './utils/getUniqueTags';
 *
 * const posts = await getCollection('blog');
 * const uniqueTags = extractUniqueTags(posts);
 * // Returns: [{ tag: 'typescript', tagName: 'TypeScript' }, ...]
 * ```
 */

import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

/**
 * Extracts and returns unique tags from a list of blog posts.
 * Performs the following operations:
 * 1. Filters posts using postFilter (removes drafts in production)
 * 2. Extracts all tags from filtered posts
 * 3. Slugifies tags for consistent comparison
 * 4. Deduplicates tags while preserving original tag names
 * 5. Sorts tags alphabetically
 *
 * @param posts - Array of blog posts to extract tags from
 * @returns Array of unique tag objects containing slugified tag and original name
 *
 * @example
 * ```typescript
 * // Basic usage
 * const uniqueTags = extractUniqueTags(posts);
 *
 * // Using in templates
 * uniqueTags.map(({ tag, tagName }) => (
 *   <a href={`/tags/${tag}`}>{tagName}</a>
 * ));
 *
 * // Getting tag counts
 * const tagCounts = new Map();
 * posts.flatMap(post => post.data.tags).forEach(tag => {
 *   const slugged = slugifyStr(tag);
 *   tagCounts.set(slugged, (tagCounts.get(slugged) || 0) + 1);
 * });
 * ```
 *
 * @remarks
 * - Case-insensitive tag comparison
 * - Maintains original tag casing for display
 * - Handles special characters through slugification
 * - Sorts tags alphabetically for consistent presentation
 */
const extractUniqueTags = (
  posts: CollectionEntry<"blog">[]
): {
  tag: string;
  tagName: string;
}[] => {
  const uniqueTags = new Map<string, string>();

  posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .forEach(tag => {
      const slugifiedTag = slugifyStr(tag);
      // Keep first occurrence of tag name for consistent display
      if (!uniqueTags.has(slugifiedTag)) {
        uniqueTags.set(slugifiedTag, tag);
      }
    });

  return Array.from(uniqueTags.entries())
    .map(([tag, tagName]) => ({ tag, tagName }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
};

export default extractUniqueTags;
