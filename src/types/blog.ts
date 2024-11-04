import type { CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import type { CategoryName, GroupName } from "./taxonomies";

export type BlogEntry = CollectionEntry<"blog">;

export interface AuthorReference {
  slug: string;
  collection: "authors";
}

export interface ImageReference {
  alt: string;
  src: ImageMetadata;
}

export interface BlogFrontmatter {
  readonly title: string;
  readonly author: string | AuthorReference;
  readonly description: string;
  readonly pubDatetime: Date;
  readonly modDatetime?: Date | undefined;
  readonly featured?: boolean;
  readonly draft?: boolean;
  readonly tags: string[];
  readonly category?: CategoryName;
  readonly group?: GroupName;
  readonly readingTime?: number;
  readonly heroImage?: string | ImageReference;
  readonly ogImage?: string;
  readonly canonicalURL?: string;
}

export type BlogData = BlogFrontmatter;

export interface PostWithReadingTime extends Omit<BlogEntry, "data"> {
  readonly data: BlogFrontmatter;
}

export interface ReadingTimeMap {
  readonly [key: string]: number;
}

export interface PostFilter {
  readonly draft?: boolean;
  readonly featured?: boolean;
  readonly category?: CategoryName;
  readonly tag?: string;
}

export interface Post extends Omit<BlogEntry, "data"> {
  readonly data: BlogFrontmatter & {
    readonly body: string;
  };
}
