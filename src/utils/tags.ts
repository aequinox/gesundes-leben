/**
 * @module tags
 * @description
 * Utility functions for managing tags in blog posts.
 * Provides functionality for extracting, filtering, and manipulating tags.
 */
import type { Post } from "./types";

import { SITE } from "@/config";
import { slugify } from "@/utils/slugs";

/**
 * Tag information with both slugified and original forms
 */
export interface TagInfo {
  /** Slugified form of the tag for URLs */
  tag: string;
  /** Original tag name for display */
  tagName: string;
}

/**
 * Filter posts based on draft status and publication date
 * @param posts - Collection of blog posts
 * @returns Filtered collection of blog posts
 */
export function filterPosts(posts: Post[]): Post[] {
  const isDevelopment = import.meta.env.DEV;
  const scheduledPostMargin = SITE.scheduledPostMargin;

  return posts.filter(({ data }) => {
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
      (!draft && pubDate.getTime() <= Date.now() + scheduledPostMargin)
    );
  });
}

/**
 * Extract unique tags from a list of blog posts
 * @param posts - Collection of blog posts
 * @returns Array of unique tag information
 */
export function extractUniqueTags(posts: Post[]): TagInfo[] {
  // Filter out draft posts
  const filteredPosts = posts.filter(post => !post.data.draft);

  // Extract and deduplicate tags
  const uniqueTags = new Map<string, string>();

  filteredPosts
    .flatMap(post => post.data.tags || [])
    .forEach(tag => {
      const slugifiedTag = slugify(tag);
      // Keep first occurrence of tag name for consistent display
      if (!uniqueTags.has(slugifiedTag)) {
        uniqueTags.set(slugifiedTag, tag);
      }
    });

  // Convert to array and sort alphabetically
  return Array.from(uniqueTags.entries())
    .map(([tag, tagName]) => ({ tag, tagName }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * Filter posts by tag
 * @param posts - Collection of blog posts
 * @param tag - Tag to filter by
 * @returns Filtered collection of blog posts
 */
export function filterPostsByTag(posts: Post[], tag: string): Post[] {
  const slugifiedTag = slugify(tag);

  return posts.filter(post =>
    post.data.tags?.some((postTag: string) => slugify(postTag) === slugifiedTag)
  );
}

/**
 * Get tag count for each tag in posts
 * @param posts - Collection of blog posts
 * @returns Map of tag to count
 */
export function getTagCounts(posts: Post[]): Map<string, number> {
  const tagCounts = new Map<string, number>();

  // Filter posts
  const filteredPosts = filterPosts(posts);

  // Count tags
  filteredPosts.forEach(post => {
    post.data.tags?.forEach((tag: string) => {
      const slugifiedTag = slugify(tag);
      const currentCount = tagCounts.get(slugifiedTag) || 0;
      tagCounts.set(slugifiedTag, currentCount + 1);
    });
  });

  return tagCounts;
}
