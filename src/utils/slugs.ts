import { logger } from "./logger";
import type { Post } from "./types";
import slugifier from "slugify";

/**
 * Configuration options for slug generation
 */
export type SlugifyOptions = {
  readonly replacement: string;
  readonly remove?: RegExp;
  readonly lower: boolean;
  readonly strict: boolean;
  readonly locale: string;
  readonly trim: boolean;
};

/**
 * Input types for slugification
 */
type SlugifyInput = string | readonly string[];

/**
 * Output type for slugification
 */
type SlugifyOutput<T> = T extends readonly string[]
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
 * Given a blog post, generates a slug from the title.
 * Strips any date prefix (YYYY-MM-DD-) from the title.
 * @param post The blog post object with a title.
 * @throws {Error} If the post object is invalid or missing a title.
 * @returns The slug for the blog post.
 */
export const getPostSlug = (post: Post): string => {
  if (!post || !post.data || !post.data.title) {
    throw new Error("Invalid post object or missing title");
  }

  // Get the title and remove any date prefix (YYYY-MM-DD-)
  const title = post.data.title;
  logger.info(title);
  const titleWithoutDate = title.replace(/^\d{4}-\d{2}-\d{2}-\s*/, "");

  return slugifyStr(titleWithoutDate);
};

/**
 * Convert a string to a URL-friendly slug
 */
const slugifyStr = (
  str: string,
  options: Partial<SlugifyOptions> = {}
): string => {
  if (!str || typeof str !== "string") {
    throw new Error("Invalid input: string required");
  }
  return slugifier(str.trim(), { ...DEFAULT_OPTIONS, ...options });
};

/**
 * Convert an array of strings to URL-friendly slugs
 */
const slugifyAll = (
  arr: readonly string[],
  options: Partial<SlugifyOptions> = {}
): readonly string[] => {
  if (!Array.isArray(arr)) {
    throw new Error("Invalid input: array required");
  }
  return arr.map(str => slugifyStr(str, options));
};

/**
 * Generic slugify function that handles both single strings and arrays
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
