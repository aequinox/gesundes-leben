/**
 * Core blog types and interfaces for the Astro blog system.
 * @module blog
 */

import type { CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import type { CategoryName, GroupName } from "./taxonomies";

/** Represents a blog entry from the content collection */
export type BlogEntry = CollectionEntry<"blog">;

/** Author reference structure */
export interface AuthorReference {
  readonly slug: string;
  readonly collection: "authors";
}

/** Image reference with metadata */
export interface ImageReference {
  readonly alt: string;
  readonly src: ImageMetadata;
}

/** Blog post frontmatter structure */
export interface BlogFrontmatter {
  /** Post title */
  readonly title: string;
  /** Post author (slug or full reference) */
  readonly author: string | AuthorReference;
  /** Post description/excerpt */
  readonly description: string;
  /** Publication date */
  readonly pubDatetime: Date;
  /** Last modification date */
  readonly modDatetime?: Date;
  /** Whether post is featured */
  readonly featured?: boolean;
  /** Whether post is in draft state */
  readonly draft?: boolean;
  /** Post tags */
  readonly tags: readonly string[];
  /** Post category */
  readonly category?: CategoryName;
  /** Post group */
  readonly group?: GroupName;
  /** Estimated reading time in minutes */
  readonly readingTime?: number;
  /** Hero image */
  readonly heroImage?: string | ImageReference;
  /** Open Graph image */
  readonly ogImage?: string;
  /** Canonical URL */
  readonly canonicalURL?: string;
}

/** Blog post data structure */
export type BlogData = BlogFrontmatter;

/** Extended blog entry with reading time */
export interface PostWithReadingTime extends Omit<BlogEntry, "data"> {
  readonly data: BlogFrontmatter;
}

/** Reading time mapping */
export type ReadingTimeMap = Readonly<Record<string, number>>;

/** Post filter options */
export interface PostFilter {
  /** Filter by draft status */
  readonly draft?: boolean;
  /** Filter by featured status */
  readonly featured?: boolean;
  /** Filter by category */
  readonly category?: CategoryName;
  /** Filter by tag */
  readonly tag?: string;
}

/** Complete post structure with body content */
export interface Post extends Omit<BlogEntry, "data"> {
  readonly data: BlogFrontmatter & {
    readonly body: string;
  };
}

/** Post sorting options */
export const enum PostSortOrder {
  DateAsc = "date-asc",
  DateDesc = "date-desc",
  TitleAsc = "title-asc",
  TitleDesc = "title-desc",
}

/** Post view mode */
export const enum PostViewMode {
  Grid = "grid",
  List = "list",
}

/** Post status */
export const enum PostStatus {
  Published = "published",
  Draft = "draft",
  Scheduled = "scheduled",
}
