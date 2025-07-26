import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;
export type Author = CollectionEntry<"authors">;

/**
 * Tag type representing a string tag used in blog posts
 * Note: For tag objects with additional metadata, use the TagInfo interface from tags.ts
 */
export type Tag = string;

export const GROUPS = ["pro", "kontra", "fragezeiten"] as const;
export const CATEGORIES = [
  "Ernährung",
  "Immunsystem",
  "Lesenswertes",
  "Lifestyle & Psyche",
  "Mikronährstoffe",
  "Organsysteme",
  "Wissenschaftliches",
  "Wissenswertes",
] as const;

export type Category = (typeof CATEGORIES)[number];
