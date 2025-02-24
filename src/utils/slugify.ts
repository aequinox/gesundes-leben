/**
 * @module slugify
 * @description
 * Utility module for converting strings to URL-friendly slugs.
 * Provides comprehensive slugification with support for arrays,
 * validation, and customization options. Handles special characters,
 * spaces, and ensures consistent URL-safe output.
 *
 * @example
 * ```typescript
 * import { slugify, slugifyStr } from './utils/slugify';
 *
 * const slug = slugifyStr('Hello World!'); // 'hello-world'
 * const slugs = slugify(['Hello', 'World']); // ['hello', 'world']
 * ```
 */

import slugifier from "slugify";

/**
 * Configuration options for slug generation.
 * Controls how strings are converted to slugs.
 *
 * @property replacement - Character to replace spaces with (default: '-')
 * @property remove - Regular expression pattern of characters to remove
 * @property lower - Convert to lowercase (default: true)
 * @property strict - Strip special characters (default: false)
 * @property locale - Language code for locale-specific handling
 * @property trim - Remove leading/trailing replacement chars (default: true)
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
 * Input types for slugification.
 * Can be either a single string or an array of strings.
 */
export type SlugifyInput = string | readonly string[];

/**
 * Output type for slugification.
 * Preserves the input type (string -> string, string[] -> string[]).
 */
export type SlugifyOutput<T> = T extends readonly string[]
  ? readonly string[]
  : string;

/**
 * Default configuration for slug generation.
 * Provides sensible defaults for most use cases.
 *
 * @internal
 */
const DEFAULT_OPTIONS: SlugifyOptions = {
  replacement: "-",
  remove: undefined,
  lower: true,
  strict: false,
  locale: "de",
  trim: true,
};

/**
 * Converts a string to a URL-friendly slug.
 * Handles special characters and ensures consistent output.
 *
 * @param str - The string to convert
 * @param options - Optional configuration for slugify
 * @returns The slugified string
 * @throws {Error} If input string is empty or invalid
 *
 * @example
 * ```typescript
 * // Basic usage
 * slugifyStr('Hello World'); // 'hello-world'
 *
 * // With options
 * slugifyStr('Hello World', {
 *   replacement: '_',
 *   strict: true
 * }); // 'hello_world'
 * ```
 */
export const slugifyStr = (
  str: string,
  options: Partial<SlugifyOptions> = {}
): string => {
  if (!str || typeof str !== "string") {
    throw new Error("Invalid input: string required");
  }
  return slugifier(str.trim(), { ...DEFAULT_OPTIONS, ...options });
};

/**
 * Converts an array of strings to URL-friendly slugs.
 * Processes each string individually with consistent rules.
 *
 * @param arr - The array of strings to convert
 * @param options - Optional configuration for slugify
 * @returns An array of slugified strings
 * @throws {Error} If input array is empty or contains invalid items
 *
 * @example
 * ```typescript
 * slugifyAll(['Hello World', 'Test String']);
 * // ['hello-world', 'test-string']
 * ```
 */
export const slugifyAll = (
  arr: readonly string[],
  options: Partial<SlugifyOptions> = {}
): readonly string[] => {
  if (!Array.isArray(arr)) {
    throw new Error("Invalid input: array required");
  }
  return arr.map(str => slugifyStr(str, options));
};

/**
 * Generic slugify function that handles both single strings and arrays.
 * Type-safe implementation that preserves input type in output.
 *
 * @param value - The string or array of strings to convert
 * @param options - Optional configuration for slugify
 * @returns The slugified string or array of slugified strings
 *
 * @example
 * ```typescript
 * // Single string
 * slugify('Hello World'); // 'hello-world'
 *
 * // Array of strings
 * slugify(['Hello', 'World']); // ['hello', 'world']
 *
 * // With options
 * slugify('Hello World', {
 *   replacement: '_',
 *   strict: true
 * }); // 'hello_world'
 * ```
 */
export const slugify = <T extends SlugifyInput>(
  value: T,
  options: Partial<SlugifyOptions> = {}
): SlugifyOutput<T> => {
  if (Array.isArray(value)) {
    return slugifyAll(value, options) as SlugifyOutput<T>;
  }
  return slugifyStr(value as string, options) as SlugifyOutput<T>;
};

/**
 * Validates if a string is a valid slug.
 * Checks against common slug format requirements.
 *
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidSlug('hello-world'); // true
 * isValidSlug('Hello World!'); // false
 * ```
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== "string") return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Ensures a string is a valid slug, converting if necessary.
 * Combines validation and conversion in one step.
 *
 * @param str - The string to ensure is a slug
 * @param options - Optional configuration for slugify
 * @returns A valid slug
 *
 * @example
 * ```typescript
 * ensureSlug('Hello World!'); // 'hello-world'
 * ensureSlug('already-a-slug'); // 'already-a-slug'
 * ```
 */
export const ensureSlug = (
  str: string,
  options: Partial<SlugifyOptions> = {}
): string => {
  if (isValidSlug(str)) return str;
  const slug = slugifyStr(str, options);
  // Remove trailing separators
  const separator = options.replacement || DEFAULT_OPTIONS.replacement;
  return slug.replace(new RegExp(`${separator}+$`), "");
};

/**
 * Combines multiple strings into a single slug.
 * Useful for creating composite slugs from multiple parts.
 *
 * @param parts - The strings to combine
 * @param options - Optional configuration for slugify
 * @returns A combined slug
 *
 * @example
 * ```typescript
 * combineSlug(['Hello', 'World', '2024']); // 'hello-world-2024'
 * ```
 */
export const combineSlug = (
  parts: string[],
  options: Partial<SlugifyOptions> = {}
): string => {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error("Invalid input: non-empty array required");
  }

  // Filter out empty strings before slugification
  const validParts = parts.filter(part => part && part.trim());
  if (validParts.length === 0) {
    throw new Error("No valid parts to combine");
  }

  const separator = options.replacement || DEFAULT_OPTIONS.replacement;
  return validParts
    .map(part => slugifyStr(part, options))
    .filter(Boolean)
    .join(separator);
};
