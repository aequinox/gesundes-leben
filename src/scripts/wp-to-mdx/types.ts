// Note: This file defines types independent of Astro's content system

// WordPress XML Data Structures

// WordPress XML parsing types
export interface WordPressXMLItem {
  title: string;
  pubDate: string;
  "dc:creator": string;
  "wp:post_id": string;
  "wp:post_type": string;
  "wp:status": string;
  "wp:post_name": string;
  "content:encoded": string;
  "excerpt:encoded": string;
  "wp:post_date": string;
  "wp:post_date_gmt"?: string;
  "wp:post_modified"?: string;
  "wp:post_modified_gmt"?: string;
  "wp:attachment_url"?: string;
  "wp:post_mime_type"?: string;
  category?: WordPressXMLCategory | WordPressXMLCategory[];
  "wp:postmeta"?: WordPressXMLPostMeta | WordPressXMLPostMeta[];
}

export interface WordPressXMLCategory {
  _: string;
  $: {
    domain: "category" | "post_tag" | string;
    nicename: string;
  };
}

export interface WordPressXMLPostMeta {
  "wp:meta_key": string;
  "wp:meta_value": string;
}

export interface WordPressXMLChannel {
  item: WordPressXMLItem | WordPressXMLItem[];
  "wp:author"?: WordPressXMLAuthor | WordPressXMLAuthor[];
  "wp:category"?: WordPressXMLCategoryDef | WordPressXMLCategoryDef[];
}

export interface WordPressXMLAuthor {
  "wp:author_id": string;
  "wp:author_login": string;
  "wp:author_email": string;
  "wp:author_display_name": string;
  "wp:author_first_name"?: string;
  "wp:author_last_name"?: string;
}

export interface WordPressXMLCategoryDef {
  "wp:term_id": string;
  "wp:cat_name": string;
  "wp:category_nicename": string;
  "wp:category_description"?: string;
}

export interface WordPressXMLRoot {
  rss: {
    channel: WordPressXMLChannel;
  };
}

// Image processing interfaces
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ImagePositioningConfig {
  enableSmartPositioning: boolean;
  squareThreshold: number;
  portraitThreshold: number;
  landscapeThreshold: number;
  smallImageThreshold: number;
}

export interface ProcessingOptions {
  generateTOC?: boolean;
  preserveWordPressShortcodes?: boolean;
  rewriteImagePaths?: boolean;
}

export interface ProcessingContext {
  options: ProcessingOptions;
  postId?: string;
  postTitle?: string;
}

// Dependency injection interfaces
export interface ImageDownloader {
  download(url: string, destination: string): Promise<void>;
}

export interface ContentProcessor {
  process(content: string, context: ProcessingContext): Promise<string>;
}
export interface WordPressPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  pubDate: Date;
  modifiedDate?: Date;
  author: string;
  categories: string[];
  tags: string[];
  status: "publish" | "draft" | "private";
  slug: string;
  featuredImageId?: string;
  featuredImageUrl?: string;
  customFields: Record<string, any>;
  attachments: WordPressAttachment[];
}

export interface WordPressAttachment {
  id: string;
  title: string;
  url: string;
  filename: string;
  alt?: string;
  caption?: string;
  description?: string;
  mimeType: string;
}

export interface WordPressAuthor {
  id: string;
  login: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface WordPressCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface WordPressExport {
  posts: WordPressPost[];
  authors: WordPressAuthor[];
  categories: WordPressCategory[];
  attachments: WordPressAttachment[];
}

// Conversion Configuration
export interface ConversionConfig {
  inputFile: string;
  outputDir: string;
  downloadImages: boolean;
  dryRun: boolean;
  filterDateFrom?: Date;
  filterDateTo?: Date;
  authorMapping?: Record<string, string>;
  categoryMapping?: Record<string, string[]>;
  skipDrafts: boolean;
  generateTOC: boolean;
  // Image positioning configuration
  smartImagePositioning?: {
    enableSmartPositioning: boolean;
    squareThreshold: number;
    portraitThreshold: number;
    landscapeThreshold: number;
    smallImageThreshold: number;
  };
}

// Astro Blog Post Schema (matching content.config.ts)
export interface AstroBlogPost {
  id: string;
  title: string;
  author: string;
  description: string;
  pubDatetime: Date;
  modDatetime?: Date;
  keywords: string[];
  featured?: boolean;
  draft: boolean;
  tags: string[];
  categories: string[];
  group: "pro" | "kontra" | "fragezeiten";
  heroImage: {
    src: string;
    alt: string;
  };
  ogImage?: string;
  canonicalURL?: string;
  timezone?: string;
  readingTime?: number;
  references: string[];
  content: string;
  slug: string;
  folderPath: string;
  images: string[];
}

// Conversion Result Types
export interface ConversionResult {
  success: boolean;
  postsConverted: number;
  postsSkipped: number;
  imagesDownloaded: number;
  errors: ConversionError[];
  warnings: string[];
}

export interface ConversionError {
  type: "parse" | "convert" | "validate" | "write" | "download";
  message: string;
  postId?: string;
  postTitle?: string;
}

// Mapping Configurations
export interface CategoryMapping {
  [wordpressCategory: string]: string[]; // Maps to CATEGORIES array
}

export interface AuthorMapping {
  [wordpressAuthor: string]: string; // Maps to author ID
}

// Processing Options
export interface ProcessingOptions {
  preserveWordPressIds: boolean;
  generateSlugs: boolean;
  optimizeImages: boolean;
  extractReferences: boolean;
  generateDescriptions: boolean;
  handleShortcodes: boolean;
}
