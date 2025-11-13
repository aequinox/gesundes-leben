/**
 * @module categories
 * @description
 * Utility functions for managing categories in blog posts.
 * Provides functionality for extracting, filtering, and manipulating categories.
 */
import { SITE } from "@/config";
import { slugify } from "@/utils/slugs";

import type { Post } from "./types";

/**
 * Category information with both slugified and original forms
 */
export interface CategoryInfo {
  /** Slugified form of the category for URLs */
  category: string;
  /** Original category name for display */
  categoryName: string;
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
 * Extract unique categories from a list of blog posts
 * @param posts - Collection of blog posts
 * @returns Array of unique category information
 */
export function extractUniqueCategories(posts: Post[]): CategoryInfo[] {
  // Filter out draft posts
  const filteredPosts = posts.filter(post => !post.data.draft);

  // Extract and deduplicate categories
  const uniqueCategories = new Map<string, string>();

  filteredPosts
    .flatMap(post => post.data.categories ?? [])
    .forEach(category => {
      const slugifiedCategory = slugify(category);
      // Keep first occurrence of category name for consistent display
      if (!uniqueCategories.has(slugifiedCategory)) {
        uniqueCategories.set(slugifiedCategory, category);
      }
    });

  // Convert to array and sort alphabetically
  return Array.from(uniqueCategories.entries())
    .map(([category, categoryName]) => ({ category, categoryName }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Filter posts by category
 * @param posts - Collection of blog posts
 * @param category - Category to filter by
 * @returns Filtered collection of blog posts
 */
export function filterPostsByCategory(posts: Post[], category: string): Post[] {
  const slugifiedCategory = slugify(category);

  return posts.filter(post =>
    post.data.categories?.some(
      (postCategory: string) => slugify(postCategory) === slugifiedCategory
    )
  );
}

/**
 * Get category count for each category in posts
 * @param posts - Collection of blog posts
 * @returns Map of category to count
 */
export function getCategoryCounts(posts: Post[]): Map<string, number> {
  const categoryCounts = new Map<string, number>();

  // Filter posts
  const filteredPosts = filterPosts(posts);

  // Count categories
  filteredPosts.forEach(post => {
    post.data.categories?.forEach((category: string) => {
      const slugifiedCategory = slugify(category);
      const currentCount = categoryCounts.get(slugifiedCategory) ?? 0;
      categoryCounts.set(slugifiedCategory, currentCount + 1);
    });
  });

  return categoryCounts;
}
