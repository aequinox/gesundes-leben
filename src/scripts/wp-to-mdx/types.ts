// Note: This file defines types independent of Astro's content system

// WordPress XML Data Structures
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
