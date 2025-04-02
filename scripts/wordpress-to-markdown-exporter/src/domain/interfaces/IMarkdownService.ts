import { Result } from "../../utils/Result.js";
import { Configuration } from "../models/Configuration.js";
import { Post } from "../models/Post.js";

/**
 * Interface for Markdown service
 */
export interface IMarkdownService {
  /**
   * Write markdown files for posts
   * @param posts Array of posts to write
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  writeFiles(posts: Post[], config: Configuration): Promise<Result<void>>;

  /**
   * Get destination path for a post
   * @param post Post to get path for
   * @param config Configuration options
   * @returns Destination path
   */
  getPostPath(post: Post, config: Configuration): string;

  /**
   * Load markdown content for a post
   * @param post Post to load content for
   * @param config Configuration options
   * @returns Markdown content
   */
  loadMarkdownContent(post: Post, config: Configuration): string;

  /**
   * Initialize HTML to Markdown converter
   * @returns Configured TurndownService instance
   */
  initMarkdownConverter(): any;

  /**
   * Convert HTML content to Markdown
   * @param html HTML content to convert
   * @returns Markdown content
   */
  convertHtmlToMarkdown(html: string): string;

  /**
   * Format frontmatter for a post
   * @param frontmatter Frontmatter data
   * @returns Formatted frontmatter string
   */
  formatFrontmatter(frontmatter: Record<string, any>): string;

  /**
   * Check if a file exists
   * @param path Path to check
   * @returns Whether file exists
   */
  fileExists(path: string): boolean;
}
