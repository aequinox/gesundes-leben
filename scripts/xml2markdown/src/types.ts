/**
 * TypeScript definitions for the XML to MDX converter
 * Provides type safety and better developer experience
 */

/**
 * Post metadata extracted from WordPress XML
 * Contains essential metadata for post processing and conversion
 */
export interface PostMeta {
  /** Unique post identifier from WordPress */
  readonly id: string;
  /** URL-friendly post slug */
  readonly slug: string;
  /** WordPress featured image attachment ID */
  readonly coverImageId?: string;
  /** Processed cover image filename */
  coverImage?: string;
  /** WordPress post type (post, page, custom) */
  readonly type: string;
  /** Array of image URLs found in post content */
  imageUrls: string[];
  /** AI-enhanced image metadata map (URL -> metadata) */
  aiImageMetadata?: Map<
    string,
    {
      altText: string;
      filename: string;
      aiEnhanced: boolean;
      creditsUsed: number;
    }
  >;
}

/**
 * Image import information for MDX generation
 * Defines how images should be imported in the generated MDX files
 */
export interface ImageImport {
  /** JavaScript variable name for the image import */
  variable: string;
  /** Relative file path to the image */
  path: string;
  /** Image filename with extension */
  filename: string;
}

/**
 * Complete post object with all processed data
 * Represents a fully processed WordPress post ready for MDX generation
 */
export interface Post {
  /** Raw WordPress post data from XML */
  readonly data: WordPressPostData;
  /** Processed post metadata */
  readonly meta: PostMeta;
  /** Converted markdown content */
  content: string;
  /** Image imports for MDX file */
  imageImports: ImageImport[];
  /** Generated frontmatter for the post */
  frontmatter: Record<string, FrontmatterValue>;
}

/**
 * Raw XML item data structure from WordPress export
 * Improved with readonly arrays for immutability
 */
export interface RawXmlItem {
  readonly [key: string]: unknown;
  readonly post_id?: readonly string[];
  readonly post_name?: readonly string[];
  readonly post_type?: readonly string[];
  readonly status?: readonly string[];
  readonly pubDate?: readonly string[];
  readonly encoded?: readonly string[];
  readonly link?: readonly string[];
  readonly title?: readonly string[];
  readonly excerpt?: readonly string[];
  readonly creator?: readonly string[];
  readonly is_sticky?: readonly string[];
  readonly postmeta?: readonly unknown[];
  readonly category?: readonly unknown[];
  readonly tag?: readonly unknown[];
}

/**
 * Raw WordPress post data from XML
 */
export interface WordPressPostData {
  post_id: string[];
  post_name: string[];
  post_type: string[];
  status: string[];
  pubDate: string[];
  encoded: string[];
  link: string[];
  title: string[];
  excerpt: string[];
  creator?: string[];
  is_sticky?: string[];
  postmeta?: WordPressPostMeta[];
  category?: WordPressCategoryData[];
  tag?: WordPressTag[];
}

/**
 * WordPress post metadata
 */
export interface WordPressPostMeta {
  meta_key: string[];
  meta_value: string[];
}

/**
 * WordPress category data (format varies by context)
 */
export interface WordPressCategory {
  "#text": string;
  "@_domain": string;
  "@_nicename": string;
}

/**
 * Alternative WordPress category format used in some contexts
 */
export interface WordPressCategoryAlt {
  _: string;
  $: {
    domain: string;
    nicename?: string;
  };
}

/**
 * Union type for WordPress category data that can handle different XML formats
 */
export type WordPressCategoryData = WordPressCategory | WordPressCategoryAlt;

/**
 * WordPress tag data
 */
export interface WordPressTag {
  "#text": string;
  "@_domain": string;
  "@_nicename": string;
}

/**
 * Image data for download and processing
 * Represents an image attachment or embedded image from WordPress
 */
export interface Image {
  /** WordPress attachment ID (or -1 for scraped images) */
  readonly id: string;
  /** ID of the post this image belongs to */
  readonly postId: string;
  /** Source URL of the image */
  readonly url: string;
  /** AI-generated alt text for accessibility */
  readonly altText?: string;
  /** AI-generated SEO-optimized filename */
  readonly aiFilename?: string;
  /** Original filename from WordPress */
  readonly originalFilename?: string;
  /** Number of AI credits used for processing */
  readonly creditsUsed?: number;
}

/**
 * Supported AI backends for image processing
 */
export type VisionatiBackend = "claude" | "gpt4" | "gemini";

/**
 * Configuration options for the XML converter
 * Defines all conversion settings and AI processing options
 */
export interface XmlConverterConfig {
  /** Path to WordPress XML export file */
  readonly input: string;
  /** Output directory for generated MDX files */
  readonly output: string;
  
  // File organization options
  /** Create year-based folder structure (YYYY/) */
  readonly yearFolders?: boolean;
  /** Create month-based folder structure (YYYY/MM/) */
  readonly monthFolders?: boolean;
  /** Create individual post folders */
  readonly postFolders?: boolean;
  /** Prefix filenames with publication date */
  readonly prefixDate?: boolean;
  
  // Image processing options
  /** Download WordPress attachment images */
  readonly saveAttachedImages?: boolean;
  /** Extract and download images from post content */
  readonly saveScrapedImages?: boolean;
  
  // Content filtering
  /** Include custom post types beyond 'post' */
  readonly includeOtherTypes?: boolean;
  
  // AI-powered features (Visionati)
  /** Enable AI-generated alt texts and filenames */
  readonly generateAltTexts?: boolean;
  /** Visionati API key for AI processing */
  readonly visionatiApiKey?: string;
  /** AI backend to use for image processing */
  readonly visionatiBackend?: VisionatiBackend;
  /** Target language for generated text (ISO 639-1 code) */
  readonly visionatiLanguage?: string;
  /** Custom prompt for AI image processing */
  readonly visionatiPrompt?: string;
  /** Request timeout in milliseconds (default: 30000) */
  readonly visionatiTimeout?: number;
  /** Maximum concurrent AI requests (default: 3) */
  readonly visionatiMaxConcurrent?: number;
  
  // Cache configuration
  /** Enable persistent caching of AI results */
  readonly visionatiCacheEnabled?: boolean;
  /** Cache file path (default: .visionati-cache.json) */
  readonly visionatiCacheFile?: string;
  /** Cache TTL in days (default: 30) */
  readonly visionatiCacheTTL?: number;
}

/**
 * Error information from the conversion process
 */
export interface ConversionError {
  /** Human-readable error message */
  readonly message: string;
  /** Additional error context for debugging */
  readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Result of the conversion process
 * Contains statistics and error information from the conversion
 */
export interface ConversionResult {
  /** Number of posts successfully processed */
  readonly postsProcessed: number;
  /** Number of images successfully downloaded */
  readonly imagesDownloaded: number;
  /** Array of errors encountered during conversion */
  readonly errors: readonly ConversionError[];
}

/**
 * Frontmatter field value types
 */
export type FrontmatterValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string | number | boolean>
  | null
  | undefined;

/**
 * Frontmatter generator function type
 */
export type FrontmatterGetter = (post: Post) => FrontmatterValue;

/**
 * Available blog categories (German)
 */
export type BlogCategory =
  | "Ernährung"
  | "Gesundheit"
  | "Wellness"
  | "Mentale Gesundheit"
  | "Fitness"
  | "Immunsystem"
  | "Prävention"
  | "Naturheilkunde"
  | "Organsysteme"
  | "Wissenschaftliches";

/**
 * Blog post group classification
 */
export type BlogGroup = "pro" | "kontra" | "fragezeiten";

/**
 * Hero image configuration
 */
export interface HeroImage {
  src: string;
  alt: string;
}

/**
 * Complete frontmatter structure for blog posts
 * Defines the metadata structure for generated MDX files
 */
export interface BlogFrontmatter {
  /** Unique post identifier */
  readonly id: string;
  /** Post title */
  readonly title: string;
  /** Author identifier */
  readonly author: string;
  /** Publication date (ISO 8601) */
  readonly pubDatetime: string;
  /** Last modification date (ISO 8601) */
  readonly modDatetime: string;
  /** Post description/excerpt */
  readonly description: string;
  /** SEO keywords */
  readonly keywords: readonly string[];
  /** Content categories */
  readonly categories: readonly BlogCategory[];
  /** Post group classification */
  readonly group: BlogGroup;
  /** Content tags */
  readonly tags: readonly string[];
  /** Hero image configuration */
  readonly heroImage: HeroImage;
  /** Draft status */
  readonly draft: boolean;
  /** Featured status */
  readonly featured: boolean;
}

/**
 * Supported wizard option types
 */
export type WizardOptionType = "boolean" | "file" | "folder";

/**
 * CLI wizard option configuration
 * Defines interactive configuration options for the CLI wizard
 */
export interface WizardOption {
  /** Option name (used as key) */
  readonly name: string;
  /** Option data type */
  readonly type: WizardOptionType;
  /** Human-readable description */
  readonly description: string;
  /** Default value */
  readonly default: boolean | string;
  /** Alternative option names */
  readonly aliases?: readonly string[];
  /** Interactive prompt text */
  readonly prompt?: string;
  /** Value transformation function */
  readonly coerce?: (value: string) => boolean | string;
  /** Value validation function */
  readonly validate?: (value: string) => boolean | string;
  /** Whether option was provided by user */
  isProvided?: boolean;
}
