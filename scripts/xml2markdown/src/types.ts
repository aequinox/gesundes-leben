/**
 * TypeScript definitions for the XML to MDX converter
 * Provides type safety and better developer experience
 */

/**
 * Post metadata extracted from WordPress XML
 */
export interface PostMeta {
  id: string;
  slug: string;
  coverImageId?: string;
  coverImage?: string;
  type: string;
  imageUrls: string[];
}

/**
 * Image import information for MDX generation
 */
export interface ImageImport {
  variable: string;
  path: string;
  filename: string;
}

/**
 * Post object with all processed data
 */
export interface Post {
  data: WordPressPostData;
  meta: PostMeta;
  content: string;
  imageImports: ImageImport[];
  frontmatter: Record<string, unknown>;
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
  postmeta?: WordPressPostMeta[];
  category?: WordPressCategory[];
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
 * WordPress category data
 */
export interface WordPressCategory {
  '#text': string;
  '@_domain': string;
  '@_nicename': string;
}

/**
 * WordPress tag data
 */
export interface WordPressTag {
  '#text': string;
  '@_domain': string;
  '@_nicename': string;
}

/**
 * Image data for download and processing
 */
export interface Image {
  id: string;
  postId: string;
  url: string;
}

/**
 * Configuration options for the XML converter
 */
export interface XmlConverterConfig {
  input: string;
  output: string;
  yearFolders?: boolean;
  monthFolders?: boolean;
  postFolders?: boolean;
  prefixDate?: boolean;
  saveAttachedImages?: boolean;
  saveScrapedImages?: boolean;
  includeOtherTypes?: boolean;
}

/**
 * Result of the conversion process
 */
export interface ConversionResult {
  postsProcessed: number;
  imagesDownloaded: number;
  errors: Array<{
    message: string;
    context?: Record<string, unknown>;
  }>;
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
  | 'Ernährung'
  | 'Gesundheit'
  | 'Wellness'
  | 'Mentale Gesundheit'
  | 'Fitness'
  | 'Immunsystem'
  | 'Prävention'
  | 'Naturheilkunde'
  | 'Organsysteme'
  | 'Wissenschaftliches';

/**
 * Blog post group classification
 */
export type BlogGroup = 'pro' | 'kontra' | 'fragezeiten';

/**
 * Hero image configuration
 */
export interface HeroImage {
  src: string;
  alt: string;
}

/**
 * Complete frontmatter structure for blog posts
 */
export interface BlogFrontmatter {
  id: string;
  title: string;
  author: string;
  pubDatetime: string;
  modDatetime: string;
  description: string;
  keywords: string[];
  categories: BlogCategory[];
  group: BlogGroup;
  tags: string[];
  heroImage: HeroImage;
  draft: boolean;
  featured: boolean;
}