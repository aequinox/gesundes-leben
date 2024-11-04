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

const SLUGIFY_OPTIONS: SlugifyOptions = {
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
 * @returns The slugified string.
 */
export const slugifyStr = (str: string): string =>
  slugifier(str, SLUGIFY_OPTIONS);

/**
 * Converts an array of strings to URL-friendly slugs.
 * @param arr - The array of strings to convert.
 * @returns An array of slugified strings.
 */
export const slugifyAll = (arr: readonly string[]): readonly string[] =>
  arr.map((str) => slugifyStr(str));

/**
 * Generic slugify function that handles both single strings and arrays.
 * @param value - The string or array of strings to convert.
 * @returns The slugified string or array of slugified strings.
 */
export const slugify = <T extends SlugifyInput>(value: T): SlugifyOutput<T> => {
  if (Array.isArray(value)) {
    return slugifyAll(value) as SlugifyOutput<T>;
  }
  return slugifyStr(value as string) as SlugifyOutput<T>;
};
