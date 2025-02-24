/**
 * @module getUniqueTags
 * @description
 * Utility module for extracting and managing unique tags from blog posts.
 * Uses the BlogPostProcessor for consistent content handling and filtering
 * before extracting tags.
 *
 * @example
 * ```typescript
 * import extractUniqueTags from './utils/getUniqueTags';
 *
 * const posts = await getCollection('blog');
 * const uniqueTags = extractUniqueTags(posts);
 * ```
 */

import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import { createBlogPostProcessor } from "./core/content";
import { handleAsync } from "./core/errors";

/**
 * Tag information with both slugified and original forms.
 */
export interface TagInfo {
  /** Slugified form of the tag for URLs */
  tag: string;
  /** Original tag name for display */
  tagName: string;
}

/**
 * Extracts and returns unique tags from a list of blog posts.
 * Uses BlogPostProcessor for filtering posts before extracting tags.
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
 */
const extractUniqueTags = async (
  posts: CollectionEntry<"blog">[]
): Promise<TagInfo[]> => {
  return handleAsync(async () => {
    // Create processor for filtering posts
    const processor = createBlogPostProcessor({
      includeDrafts: import.meta.env.DEV,
    });

    // Filter posts first
    const filteredPosts = await processor.processContent(posts);

    // Extract and deduplicate tags
    const uniqueTags = new Map<string, string>();

    filteredPosts
      .flatMap(post => post.data.tags || [])
      .forEach(tag => {
        const slugifiedTag = slugifyStr(tag);
        // Keep first occurrence of tag name for consistent display
        if (!uniqueTags.has(slugifiedTag)) {
          uniqueTags.set(slugifiedTag, tag);
        }
      });

    // Convert to array and sort alphabetically
    return Array.from(uniqueTags.entries())
      .map(([tag, tagName]) => ({ tag, tagName }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  });
};

export default extractUniqueTags;
