/**
 * @typedef {Object} Settings
 * @property {string[]} frontmatter_fields - Fields to include in frontmatter
 * @property {number} image_file_request_delay - Delay between image requests
 * @property {number} markdown_file_write_delay - Delay between file writes
 * @property {boolean} include_time_with_date - Whether to include time with dates
 * @property {string} custom_date_formatting - Custom date format string
 * @property {string} custom_date_timezone - Timezone for dates
 * @property {string[]} filter_categories - Categories to exclude
 * @property {boolean} strict_ssl - Whether to enforce strict SSL
 */

/**
 * Fields to include in frontmatter
 * Look in /src/frontmatter to see available fields
 * Order is preserved
 * If a field has an empty value, it will not be included
 * You can rename a field by providing an alias after a ':'
 * For example, 'date:created' will include 'date' in frontmatter, but renamed to 'created'
 * @type {string[]}
 */
exports.frontmatter_fields = [
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

/**
 * Time in ms to wait between requesting image files
 * Increase this if you see timeouts or server errors
 * @type {number}
 */
exports.image_file_request_delay = 500;

/**
 * Time in ms to wait between saving Markdown files
 * Increase this if your file system becomes overloaded
 * @type {number}
 */
exports.markdown_file_write_delay = 25;

/**
 * Enable this to include time with post dates
 * For example, "2020-12-25" would become "2020-12-25T11:20:35.000Z"
 * @type {boolean}
 */
exports.include_time_with_date = true;

/**
 * Override post date formatting with a custom formatting string
 * For example: 'yyyy LLL dd'
 * Tokens are documented here: https://moment.github.io/luxon/#/parsing?id=table-of-tokens
 * If set, this takes precedence over include_time_with_date
 * @type {string}
 */
exports.custom_date_formatting = '';

/**
 * Specify the timezone used for post dates
 * See available zone values and examples here:
 * https://moment.github.io/luxon/#/zones?id=specifying-a-zone
 * @type {string}
 */
exports.custom_date_timezone = 'utc';

/**
 * Categories to be excluded from post frontmatter
 * This does not filter out posts themselves, just the categories listed in their frontmatter
 * @type {string[]}
 */
exports.filter_categories = ['uncategorized'];

/**
 * Whether to enforce strict SSL when downloading images
 * Strict SSL is enabled as the safe default, but will not work with self-signed certificates
 * You can disable it if you're getting a "self-signed certificate" error
 * @type {boolean}
 */
exports.strict_ssl = true;
