import * as fs from "fs/promises";
import { inject, injectable } from "inversify";
import * as path from "path";
import { DateTime } from "luxon";
import { ILoggerService } from "../domain/interfaces/ILoggerService.js";
import { IMarkdownService } from "../domain/interfaces/IMarkdownService.js";
import { Configuration } from "../domain/models/Configuration.js";
import { Post } from "../domain/models/Post.js";
import { PathUtils } from "../utils/PathUtils.js";
import { Result } from "../utils/Result.js";

/**
 * Implementation of the Markdown service
 */
@injectable()
export class MarkdownService implements IMarkdownService {
  /**
   * Creates a new Markdown service
   * @param loggerService Logger service
   */
  constructor(
    @inject("ILoggerService") private readonly loggerService: ILoggerService
  ) {}

  /**
   * Write markdown files for posts
   * @param posts Array of posts to write
   * @param config Configuration options
   * @returns Result indicating success or failure
   */
  public async writeFiles(
    posts: Post[],
    config: Configuration
  ): Promise<Result<void>> {
    try {
      this.loggerService.info("Writing markdown files...");
      
      // Track skipped and written files
      let skipCount = 0;
      let writeCount = 0;
      
      // Process posts one by one with delay between writes
      for (const post of posts) {
        const destinationPath = this.getPostPath(post, config);
        
        if (this.fileExists(destinationPath)) {
          // Already exists, don't need to save again
          skipCount++;
          continue;
        }
        
        // Load markdown content
        const content = this.loadMarkdownContent(post, config);
        
        // Write file
        await this.writeFile(destinationPath, content);
        writeCount++;
        
        // Delay between writes
        if (config.markdownFileWriteDelay > 0 && posts.indexOf(post) < posts.length - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, config.markdownFileWriteDelay)
          );
        }
      }
      
      this.loggerService.success(
        `Wrote ${writeCount} markdown files (${skipCount} already existed)`
      );
      return Result.success(undefined);
    } catch (error) {
      return Result.failure("Failed to write markdown files", error as Error);
    }
  }

  /**
   * Get destination path for a post
   * @param post Post to get path for
   * @param config Configuration options
   * @returns Destination path
   */
  public getPostPath(post: Post, config: Configuration): string {
    // Parse date from post
    let dt: DateTime;
    if (config.customDateFormatting) {
      dt = DateTime.fromFormat(
        post.frontmatter.date,
        config.customDateFormatting,
        { zone: config.customDateTimezone }
      );
    } else {
      dt = DateTime.fromISO(post.frontmatter.date, {
        zone: config.customDateTimezone,
      });
    }
    
    // Start with base output dir
    const pathSegments = [config.output];
    
    // Add Astro content collection if enabled
    if (config.astro.useContentCollections) {
      pathSegments.push(config.astro.contentCollection);
    }
    
    // Create segment for post type if we're dealing with more than just "post"
    if (config.includeOtherTypes && post.meta.type !== "post") {
      pathSegments.push(post.meta.type);
    }
    
    // Add year folder if enabled
    if (config.yearFolders) {
      pathSegments.push(dt.toFormat("yyyy"));
    }
    
    // Add month folder if enabled
    if (config.monthFolders) {
      pathSegments.push(dt.toFormat("LL"));
    }
    
    // Create slug fragment, possibly date prefixed
    let slugFragment = post.meta.slug;
    if (config.prefixDate) {
      slugFragment = dt.toFormat("yyyy-LL-dd") + "-" + slugFragment;
    }
    
    // Use slug fragment as folder or filename as specified
    if (config.postFolders) {
      pathSegments.push(slugFragment, "index" + config.astro.fileExtension);
    } else {
      pathSegments.push(slugFragment + config.astro.fileExtension);
    }
    
    return path.join(...pathSegments);
  }

  /**
   * Load markdown content for a post
   * @param post Post to load content for
   * @param config Configuration options
   * @returns Markdown content
   */
  public loadMarkdownContent(post: Post, config: Configuration): string {
    // Format frontmatter
    const frontmatterString = this.formatFrontmatter(post.frontmatter);
    
    // Combine frontmatter and content
    return `---\n${frontmatterString}---\n\n${post.content}\n`;
  }

  /**
   * Initialize HTML to Markdown converter
   * @returns Configured TurndownService instance
   */
  public initMarkdownConverter(): any {
    // TODO: Implement Turndown service initialization
    // This is a placeholder for now
    return {
      turndown: (html: string) => html,
    };
  }

  /**
   * Convert HTML content to Markdown
   * @param html HTML content to convert
   * @returns Markdown content
   */
  public convertHtmlToMarkdown(html: string): string {
    const turndownService = this.initMarkdownConverter();
    return turndownService.turndown(html);
  }

  /**
   * Format frontmatter for a post
   * @param frontmatter Frontmatter data
   * @returns Formatted frontmatter string
   */
  public formatFrontmatter(frontmatter: Record<string, any>): string {
    let output = "";
    
    Object.entries(frontmatter).forEach(([key, value]) => {
      let outputValue;
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Array of one or more strings
          outputValue = value.reduce(
            (list, item) => `${list}\n  - "${this.escapeString(item)}"`,
            ""
          );
        }
      } else if (value !== undefined && value !== null) {
        // Single string value
        const stringValue = String(value);
        if (stringValue.length > 0) {
          outputValue = `"${this.escapeString(stringValue)}"`;
        }
      }
      
      if (outputValue !== undefined) {
        output += `${key}: ${outputValue}\n`;
      }
    });
    
    return output;
  }

  /**
   * Escape a string for frontmatter
   * @param value String to escape
   * @returns Escaped string
   */
  private escapeString(value: string): string {
    return value.replace(/"/g, '\\"');
  }

  /**
   * Check if a file exists
   * @param path Path to check
   * @returns Whether file exists
   */
  public fileExists(path: string): boolean {
    return PathUtils.fileExists(path);
  }

  /**
   * Write data to a file, creating directories as needed
   * @param destinationPath Path to write file to
   * @param data Data to write
   */
  private async writeFile(destinationPath: string, data: string): Promise<void> {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(destinationPath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file
    await fs.writeFile(destinationPath, data, "utf8");
  }
}
