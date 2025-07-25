import { FRONTMATTER_FIELDS } from "./config.js";

/**
 * Settings interface for the XML converter
 */
export interface Settings {
  frontmatter_fields: string[];
  image_file_request_delay: number;
  markdown_file_write_delay: number;
  include_time_with_date: boolean;
  custom_date_formatting: string;
  custom_date_timezone: string;
  filter_categories: string[];
  strict_ssl: boolean;
}

/**
 * Fields to include in frontmatter for Healthy Life blog
 * Now imported from centralized configuration
 */
export const frontmatter_fields: string[] = [...FRONTMATTER_FIELDS];

/**
 * Time in ms to wait between requesting image files
 * Increase this if you see timeouts or server errors
 */
export const image_file_request_delay = 500;

/**
 * Time in ms to wait between saving Markdown files
 * Increase this if your file system becomes overloaded
 */
export const markdown_file_write_delay = 25;

/**
 * Enable this to include time with post dates
 * For example, "2020-12-25" would become "2020-12-25T11:20:35.000Z"
 */
export const include_time_with_date = true;

/**
 * Override post date formatting with a custom formatting string
 * For example: 'yyyy LLL dd'
 * Tokens are documented here: https://moment.github.io/luxon/#/parsing?id=table-of-tokens
 * If set, this takes precedence over include_time_with_date
 */
export const custom_date_formatting = "";

/**
 * Specify the timezone used for post dates
 * See available zone values and examples here:
 * https://moment.github.io/luxon/#/zones?id=specifying-a-zone
 */
export const custom_date_timezone = "utc";

/**
 * Categories to be excluded from post frontmatter for Healthy Life blog
 * This does not filter out posts themselves, just the categories listed in their frontmatter
 * WordPress default categories that should be filtered out
 */
export const filter_categories: string[] = [
  "uncategorized",
  "Uncategorized",
  "Unkategorisiert",
];

/**
 * Whether to enforce strict SSL when downloading images
 * Strict SSL is enabled as the safe default, but will not work with self-signed certificates
 * You can disable it if you're getting a "self-signed certificate" error
 */
export const strict_ssl = true;
