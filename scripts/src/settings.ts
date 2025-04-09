/**
 * Application settings for the WordPress to Markdown exporter.
 */

/**
 * Interface defining the structure of the settings object.
 */
export interface Settings {
  /**
   * Fields to include in frontmatter.
   * Look in /src/frontmatter to see available fields.
   * Order is preserved.
   * If a field has an empty value, it will not be included.
   * You can rename a field by providing an alias after a ':'.
   * For example, 'date:created' will include 'date' in frontmatter, but renamed to 'created'.
   */
  frontmatter_fields: string[];

  /**
   * Time in ms to wait between requesting image files.
   * Increase this if you see timeouts or server errors.
   */
  image_file_request_delay: number;

  /**
   * Time in ms to wait before timing out an image download request.
   */
  image_download_timeout: number; // Added this setting

  /**
   * Time in ms to wait between saving Markdown files.
   * Increase this if your file system becomes overloaded.
   */
  markdown_file_write_delay: number;

  /**
   * Enable this to include time with post dates.
   * For example, "2020-12-25" would become "2020-12-25T11:20:35.000Z".
   */
  include_time_with_date: boolean;

  /**
   * Override post date formatting with a custom formatting string.
   * For example: 'yyyy LLL dd'.
   * Tokens are documented here: https://moment.github.io/luxon/#/parsing?id=table-of-tokens
   * If set, this takes precedence over include_time_with_date.
   */
  custom_date_formatting: string;

  /**
   * Specify the timezone used for post dates.
   * See available zone values and examples here:
   * https://moment.github.io/luxon/#/zones?id=specifying-a-zone
   */
  custom_date_timezone: string;

  /**
   * Categories to be excluded from post frontmatter.
   * This does not filter out posts themselves, just the categories listed in their frontmatter.
   */
  filter_categories: string[];

  /**
   * Whether to enforce strict SSL when downloading images.
   * Strict SSL is enabled as the safe default, but will not work with self-signed certificates.
   * You can disable it if you're getting a "self-signed certificate" error.
   */
  strict_ssl: boolean;
}

// --- Exported Settings Constants ---

export const frontmatter_fields: string[] = [
  'id',
  'title',
  'author',
  'date',
  'pubDatetime',
  'modDatetime',
  'slug',
  'excerpt:description',
  'categories',
  'taxonomy:group',
  'tags',
  'coverImage:heroImage',
];

export const image_file_request_delay: number = 500;

// Added: Default image download timeout (30 seconds)
export const image_download_timeout: number = 30000;

export const markdown_file_write_delay: number = 25;

export const include_time_with_date: boolean = true;

export const custom_date_formatting: string = '';

export const custom_date_timezone: string = 'utc';

export const filter_categories: string[] = ['uncategorized'];

export const strict_ssl: boolean = true;

// Optional: Export all settings as a single object conforming to the interface
// This can be useful if you need to pass all settings around easily.
/*
export const allSettings: Settings = {
  frontmatter_fields,
  image_file_request_delay,
  image_download_timeout,
  markdown_file_write_delay,
  include_time_with_date,
  custom_date_formatting,
  custom_date_timezone,
  filter_categories,
  strict_ssl,
};
*/