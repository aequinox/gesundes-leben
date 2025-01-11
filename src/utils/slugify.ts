import slugifier from "slugify";

export interface SlugifyOptions {
  readonly replacement: string;
  readonly remove?: RegExp;
  readonly lower: boolean;
  readonly strict: boolean;
  readonly locale: string;
  readonly trim: boolean;
}

export type SlugifyInput = string | readonly string[];
export type SlugifyOutput<T> = T extends readonly string[]
  ? readonly string[]
  : string;

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
 * @param str - The string to convert.
 * @param options - Optional configuration for slugify.
 * @returns The slugified string.
 * @throws {Error} If input string is empty or invalid.
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
 * @param arr - The array of strings to convert.
 * @param options - Optional configuration for slugify.
 * @returns An array of slugified strings.
 * @throws {Error} If input array is empty or contains invalid items.
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
 * @param value - The string or array of strings to convert.
 * @param options - Optional configuration for slugify.
 * @returns The slugified string or array of slugified strings.
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
 * @param slug - The slug to validate.
 * @returns True if the slug is valid, false otherwise.
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== "string") return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Ensures a string is a valid slug, converting if necessary.
 * @param str - The string to ensure is a slug.
 * @param options - Optional configuration for slugify.
 * @returns A valid slug.
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
 * @param parts - The strings to combine.
 * @param options - Optional configuration for slugify.
 * @returns A combined slug.
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
