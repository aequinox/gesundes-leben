import type { CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";

/**
 * Collection entry type aliases for better readability and maintainability
 */
export type Author = CollectionEntry<"authors">;
export type Blog = CollectionEntry<"blog">;
export type Favorite = CollectionEntry<"favorites">;
export type Glossary = CollectionEntry<"glossary">;
export type Reference = CollectionEntry<"references">;

/**
 * Valid favorite categories
 */
export type FavoriteCategory = "Basis" | "Premium" | "Profi";

/**
 * Image reference with required alt text for accessibility
 * @property alt - Alternative text description of the image
 * @property src - Image metadata including dimensions and format
 */
export interface ImageReference {
  readonly alt: string;
  readonly src: ImageMetadata;
}

/**
 * Base metadata interface for content entries
 * @property title - Content title
 * @property author - Content author (reference or string)
 * @property pubDatetime - Original publication date
 * @property modDatetime - Last modification date (optional)
 */
export interface ContentMetadata {
  readonly title: string;
  readonly author: Author | string;
  readonly pubDatetime: Date;
  readonly modDatetime?: Date | null;
}

/**
 * Extended metadata interface for blog posts
 * @extends ContentMetadata
 */
export interface BlogMetadata extends ContentMetadata {
  readonly heroImage: ImageReference;
  readonly featured?: boolean;
  readonly draft: boolean;
  readonly tags: ReadonlyArray<string>;
  readonly categories: ReadonlyArray<string>;
  readonly group: string;
  readonly favorites?: Readonly<Record<string, ReadonlyArray<Favorite>>>;
  readonly ogImage?: ImageMetadata | string;
  readonly description: string;
  readonly canonicalURL?: string;
  readingTime?: number; // Mutable because it's calculated dynamically
}

/**
 * Metadata interface for glossary entries
 * @extends ContentMetadata
 */
export interface GlossaryMetadata extends ContentMetadata {
  // Currently same as base ContentMetadata
  // Reserved for future glossary-specific metadata
}

/**
 * Data interface for favorite items
 */
export interface FavoriteData {
  readonly name: string;
  readonly manufacturer: string;
  readonly category?: FavoriteCategory;
  readonly descriptions: ReadonlyArray<string>;
  readonly url: string;
}

/**
 * Data interface for author profiles
 */
export interface AuthorData {
  readonly name: string;
  readonly bio: string;
  readonly avatar?: ImageMetadata | string;
  readonly socialLinks?: Readonly<Record<string, string>>;
}

/**
 * Data interface for academic references
 */
export interface ReferenceData {
  readonly title: string;
  readonly authors: ReadonlyArray<string>;
  readonly year: number;
  readonly journal?: string;
  readonly volume?: number;
  readonly issue?: number;
  readonly pages?: string;
  readonly url?: string;
  readonly doi?: string;
  readonly pmid?: string;
  readonly slug: string;
  readonly keywords?: ReadonlyArray<string>;
  readonly abstract?: string;
}

/**
 * Type guard to check if a value is a valid favorite category
 * @param value - Value to check
 * @returns Boolean indicating if the value is a valid favorite category
 */
export function isFavoriteCategory(value: unknown): value is FavoriteCategory {
  return (
    typeof value === "string" && ["Basis", "Premium", "Profi"].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid image reference
 * @param value - Value to check
 * @returns Boolean indicating if the value is a valid image reference
 */
export function isImageReference(value: unknown): value is ImageReference {
  return (
    typeof value === "object" &&
    value !== null &&
    "alt" in value &&
    typeof value.alt === "string" &&
    "src" in value &&
    typeof value.src === "object"
  );
}
