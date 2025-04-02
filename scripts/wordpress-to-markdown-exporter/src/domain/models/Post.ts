/**
 * Represents a WordPress post with its metadata
 */
export interface Post {
  /**
   * The post's raw data from WordPress
   */
  data: any;

  /**
   * Post metadata
   */
  meta: PostMeta;

  /**
   * Post content in markdown format
   */
  content: string;

  /**
   * Post frontmatter data
   */
  frontmatter: Record<string, any>;
}

/**
 * Post metadata
 */
export interface PostMeta {
  /**
   * Post ID
   */
  id: string;

  /**
   * Post slug
   */
  slug: string;

  /**
   * Cover image ID if exists
   */
  coverImageId?: string;

  /**
   * Cover image filename if exists
   */
  coverImage?: string;

  /**
   * Post type (post, page, etc.)
   */
  type: string;

  /**
   * Array of image URLs
   */
  imageUrls: string[];
}

/**
 * Represents an image associated with a post
 */
export interface Image {
  /**
   * Image ID
   */
  id: string;

  /**
   * Parent post ID
   */
  postId: string;

  /**
   * Image URL
   */
  url: string;

  /**
   * Local path where the image will be saved
   */
  localPath?: string;
}

/**
 * Represents frontmatter data for a post
 */
export interface FrontmatterData {
  /**
   * Post ID
   */
  id?: string;

  /**
   * Post title
   */
  title?: string;

  /**
   * Post author
   */
  author?: string;

  /**
   * Post date
   */
  date?: string;

  /**
   * Publication datetime
   */
  pubDatetime?: string;

  /**
   * Modification datetime
   */
  modDatetime?: string;

  /**
   * Post slug
   */
  slug?: string;

  /**
   * Post excerpt/description
   */
  description?: string;

  /**
   * Post categories
   */
  categories?: string[];

  /**
   * Post taxonomy/group
   */
  group?: string[];

  /**
   * Post tags
   */
  tags?: string[];

  /**
   * Post hero image
   */
  heroImage?: string;

  /**
   * Whether the post is a draft
   */
  draft?: boolean;

  /**
   * Whether the post is featured
   */
  featured?: boolean;

  /**
   * Additional custom frontmatter fields
   */
  [key: string]: any;
}
