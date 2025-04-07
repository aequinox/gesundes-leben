/**
 * @module TagService
 * @description
 * Service for managing tags in blog posts.
 * Provides functionality for extracting, filtering, and manipulating tags.
 */

import type { CollectionEntry } from "astro:content";
import { slugService } from "@/services/format/SlugService";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

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
 * Interface for tag service operations
 */
export interface ITagService {
  /**
   * Extract unique tags from a list of blog posts
   */
  extractUniqueTags(posts: CollectionEntry<"blog">[]): TagInfo[];

  /**
   * Filter posts by tag
   */
  filterPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): CollectionEntry<"blog">[];

  /**
   * Get tag count for each tag in posts
   */
  getTagCounts(posts: CollectionEntry<"blog">[]): Map<string, number>;
}

/**
 * Implementation of the tag service
 */
export class TagService implements ITagService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Filter posts based on draft status and publication date
   */
  private filterPosts(
    posts: CollectionEntry<"blog">[]
  ): CollectionEntry<"blog">[] {
    const isDevelopment = this.config.get<boolean>("env.isDev", false);
    const scheduledPostMargin = this.config.get<number>(
      "scheduledPostMargin",
      0
    );

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
   */
  extractUniqueTags(posts: CollectionEntry<"blog">[]): TagInfo[] {
    // Filter out draft posts
    const filteredPosts = posts.filter(post => !post.data.draft);

    // Extract and deduplicate tags
    const uniqueTags = new Map<string, string>();

    filteredPosts
      .flatMap(post => post.data.tags || [])
      .forEach(tag => {
        const slugifiedTag = slugService.slugifyStr(tag);
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
   */
  filterPostsByTag(
    posts: CollectionEntry<"blog">[],
    tag: string
  ): CollectionEntry<"blog">[] {
    const slugifiedTag = slugService.slugifyStr(tag);

    return posts.filter(post =>
      post.data.tags?.some(
        (postTag: string) => slugService.slugifyStr(postTag) === slugifiedTag
      )
    );
  }

  /**
   * Get tag count for each tag in posts
   */
  getTagCounts(posts: CollectionEntry<"blog">[]): Map<string, number> {
    const tagCounts = new Map<string, number>();

    // Filter posts
    const filteredPosts = this.filterPosts(posts);

    // Count tags
    filteredPosts.forEach(post => {
      post.data.tags?.forEach((tag: string) => {
        const slugifiedTag = slugService.slugifyStr(tag);
        const currentCount = tagCounts.get(slugifiedTag) || 0;
        tagCounts.set(slugifiedTag, currentCount + 1);
      });
    });

    return tagCounts;
  }
}

// Export singleton instance for convenience
export const tagService = new TagService();
