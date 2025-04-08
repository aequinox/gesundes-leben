/**
 * @module SlugService
 * @description
 * Service for converting strings to URL-friendly slugs.
 * Provides a consistent API for slug operations throughout the application.
 */

import slugifier from "slugify";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Configuration options for slug generation
 */
export interface SlugifyOptions {
  readonly replacement: string;
  readonly remove?: RegExp;
  readonly lower: boolean;
  readonly strict: boolean;
  readonly locale: string;
  readonly trim: boolean;
}

/**
 * Input types for slugification
 */
export type SlugifyInput = string | readonly string[];

/**
 * Output type for slugification
 */
export type SlugifyOutput<T> = T extends readonly string[]
  ? readonly string[]
  : string;

/**
 * Interface for slug service operations
 */
export interface ISlugService {
  /**
   * Convert a string to a URL-friendly slug
   */
  slugifyStr(str: string, options?: Partial<SlugifyOptions>): string;

  /**
   * Convert an array of strings to URL-friendly slugs
   */
  slugifyAll(
    arr: readonly string[],
    options?: Partial<SlugifyOptions>
  ): readonly string[];

  /**
   * Generic slugify function that handles both single strings and arrays
   */
  slugify<T extends SlugifyInput>(
    value: T,
    options?: Partial<SlugifyOptions>
  ): SlugifyOutput<T>;

  /**
   * Validate if a string is a valid slug
   */
  isValidSlug(slug: string): boolean;

  /**
   * Ensure a string is a valid slug, converting if necessary
   */
  ensureSlug(str: string, options?: Partial<SlugifyOptions>): string;

  /**
   * Combine multiple strings into a single slug
   */
  combineSlug(parts: string[], options?: Partial<SlugifyOptions>): string;
}

/**
 * Implementation of the slug service
 */
export class SlugService implements ISlugService {
  private readonly DEFAULT_OPTIONS: SlugifyOptions = {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: false,
    locale: "de",
    trim: true,
  };

  constructor(private config: IConfigService = configService) {}

  /**
   * Get the canonical slug for a blog post
   * This becomes the single source of truth for post slugs
   * @param post The blog post entry
   * @returns A consistent slug derived from the post title
   */
  getPostSlug(post: any): string {
    if (!post || !post.data || !post.data.title) {
      throw new Error("Invalid post object or missing title");
    }
    return this.slugifyStr(post.data.title);
  }

  /**
   * Convert a string to a URL-friendly slug
   */
  slugifyStr(str: string, options: Partial<SlugifyOptions> = {}): string {
    if (!str || typeof str !== "string") {
      throw new Error("Invalid input: string required");
    }
    return slugifier(str.trim(), { ...this.DEFAULT_OPTIONS, ...options });
  }

  /**
   * Convert an array of strings to URL-friendly slugs
   */
  slugifyAll(
    arr: readonly string[],
    options: Partial<SlugifyOptions> = {}
  ): readonly string[] {
    if (!Array.isArray(arr)) {
      throw new Error("Invalid input: array required");
    }
    return arr.map(str => this.slugifyStr(str, options));
  }

  /**
   * Generic slugify function that handles both single strings and arrays
   */
  slugify<T extends SlugifyInput>(
    value: T,
    options: Partial<SlugifyOptions> = {}
  ): SlugifyOutput<T> {
    if (Array.isArray(value)) {
      return this.slugifyAll(value, options) as SlugifyOutput<T>;
    }
    return this.slugifyStr(value as string, options) as SlugifyOutput<T>;
  }

  /**
   * Validate if a string is a valid slug
   */
  isValidSlug(slug: string): boolean {
    if (!slug || typeof slug !== "string") return false;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Ensure a string is a valid slug, converting if necessary
   */
  ensureSlug(str: string, options: Partial<SlugifyOptions> = {}): string {
    if (this.isValidSlug(str)) return str;
    const slug = this.slugifyStr(str, options);
    // Remove trailing separators
    const separator = options.replacement || this.DEFAULT_OPTIONS.replacement;
    return slug.replace(new RegExp(`${separator}+$`), "");
  }

  /**
   * Combine multiple strings into a single slug
   */
  combineSlug(parts: string[], options: Partial<SlugifyOptions> = {}): string {
    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("Invalid input: non-empty array required");
    }

    // Filter out empty strings before slugification
    const validParts = parts.filter(part => part && part.trim());
    if (validParts.length === 0) {
      throw new Error("No valid parts to combine");
    }

    const separator = options.replacement || this.DEFAULT_OPTIONS.replacement;
    return validParts
      .map(part => this.slugifyStr(part, options))
      .filter(Boolean)
      .join(separator);
  }
}

// Export singleton instance for convenience
export const slugService = new SlugService();
