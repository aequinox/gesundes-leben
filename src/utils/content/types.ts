import type { CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";

export type Author = CollectionEntry<"authors">;
export type Blog = CollectionEntry<"blog">;
export type Favorite = CollectionEntry<"favorites">;
export type Glossary = CollectionEntry<"glossary">;
export type Reference = CollectionEntry<"references">;

export interface ImageReference {
  alt: string;
  src: ImageMetadata;
}

export interface ContentMetadata {
  title: string;
  author: Author | string;
  pubDatetime: Date;
  modDatetime?: Date | null;
}

export interface BlogMetadata extends ContentMetadata {
  heroImage: ImageReference;
  featured?: boolean;
  draft: boolean;
  tags: string[];
  categories: string[];
  group: string;
  favorites?: Record<string, Favorite[]>;
  ogImage?: ImageMetadata | string;
  description: string;
  canonicalURL?: string;
  readingTime?: number;
}

export interface GlossaryMetadata extends ContentMetadata {}

export interface FavoriteData {
  name: string;
  manufacturer: string;
  category?: "Basis" | "Premium" | "Profi";
  descriptions: string[];
  url: string;
}

export interface AuthorData {
  name: string;
  bio: string;
  avatar?: ImageMetadata | string;
}

export interface ReferenceData {
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: number;
  issue?: number;
  pages?: string;
  url?: string;
  doi?: string;
  pmid?: string;
  slug: string;
}
