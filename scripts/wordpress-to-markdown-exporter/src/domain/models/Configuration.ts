/**
 * Configuration options for the WordPress to Markdown exporter
 */
export interface Configuration {
  /**
   * Path to the WordPress export XML file
   */
  input: string;

  /**
   * Path to the output directory
   */
  output: string;

  /**
   * Whether to create year folders
   */
  yearFolders: boolean;

  /**
   * Whether to create month folders
   */
  monthFolders: boolean;

  /**
   * Whether to create a folder for each post
   */
  postFolders: boolean;

  /**
   * Whether to prefix post folders/files with date
   */
  prefixDate: boolean;

  /**
   * Whether to save images attached to posts
   */
  saveAttachedImages: boolean;

  /**
   * Whether to save images scraped from post body content
   */
  saveScrapedImages: boolean;

  /**
   * Whether to include custom post types and pages
   */
  includeOtherTypes: boolean;

  /**
   * Whether to use wizard for configuration
   */
  wizard: boolean;

  /**
   * Custom frontmatter fields to include
   */
  frontmatterFields: string[];

  /**
   * Categories to exclude from frontmatter
   */
  filterCategories: string[];

  /**
   * Whether to include time with date
   */
  includeTimeWithDate: boolean;

  /**
   * Custom date formatting
   */
  customDateFormatting: string;

  /**
   * Timezone for dates
   */
  customDateTimezone: string;

  /**
   * Whether to enforce strict SSL when downloading images
   */
  strictSsl: boolean;

  /**
   * Delay between image requests in milliseconds
   */
  imageFileRequestDelay: number;

  /**
   * Delay between markdown file writes in milliseconds
   */
  markdownFileWriteDelay: number;

  /**
   * Astro-specific options
   */
  astro: {
    /**
     * Whether to generate content compatible with Astro content collections
     */
    useContentCollections: boolean;

    /**
     * The content collection to use
     */
    contentCollection: string;

    /**
     * Whether to optimize images for Astro
     */
    optimizeImages: boolean;

    /**
     * File extension to use for markdown files (.md or .mdx)
     */
    fileExtension: string;
  };
}

/**
 * Default configuration options
 */
export const DEFAULT_CONFIGURATION: Configuration = {
  input: "export.xml",
  output: "output",
  yearFolders: false,
  monthFolders: false,
  postFolders: true,
  prefixDate: false,
  saveAttachedImages: true,
  saveScrapedImages: true,
  includeOtherTypes: false,
  wizard: true,
  frontmatterFields: [
    "id",
    "title",
    "author",
    "date",
    "pubDatetime",
    "modDatetime",
    "slug",
    "excerpt:description",
    "categories",
    "taxonomy:group",
    "tags",
    "coverImage:heroImage",
  ],
  filterCategories: ["uncategorized"],
  includeTimeWithDate: true,
  customDateFormatting: "",
  customDateTimezone: "utc",
  strictSsl: true,
  imageFileRequestDelay: 500,
  markdownFileWriteDelay: 25,
  astro: {
    useContentCollections: true,
    contentCollection: "blog",
    optimizeImages: true,
    fileExtension: ".mdx",
  },
};
