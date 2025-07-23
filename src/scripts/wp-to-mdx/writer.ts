import { promises as fs } from "fs";
import { join } from "path";

import { CONVERSION_DEFAULTS } from "./config";
import { ConversionErrorCollector, ErrorFactory } from "./errors";
import { HttpImageDownloader } from "./image-downloader";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type {
  AstroBlogPost,
  ConversionConfig,
  ConversionError,
  ImageDownloader,
  WordPressAttachment,
} from "./types";

export class FileWriter {
  private config: ConversionConfig;
  private errorCollector = new ConversionErrorCollector();
  private imageDownloader: ImageDownloader;

  constructor(config: ConversionConfig, imageDownloader?: ImageDownloader) {
    this.config = config;
    this.imageDownloader = imageDownloader || new HttpImageDownloader();
  }

  /**
   * Write Astro blog post to file system
   */
  async writePost(
    post: AstroBlogPost,
    attachments: WordPressAttachment[] = []
  ): Promise<void> {
    try {
      logger.info(`Writing post: ${post.title}`);

      const postDir = join(this.config.outputDir, post.folderPath);

      // Create post directory
      if (!this.config.dryRun) {
        await fs.mkdir(postDir, { recursive: true });

        // Create images directory
        const imagesDir = join(postDir, "images");
        await fs.mkdir(imagesDir, { recursive: true });
      }

      // Download images if enabled
      if (this.config.downloadImages) {
        await this.downloadImages(post, attachments, join(postDir, "images"));
      }

      // Write MDX file
      const mdxContent = this.generateMDXContent(post);
      const mdxPath = join(postDir, "index.mdx");

      if (!this.config.dryRun) {
        await fs.writeFile(mdxPath, mdxContent, "utf8");
      }

      logger.info(`Successfully wrote post: ${post.title} to ${postDir}`);
    } catch (error) {
      const conversionError = ErrorFactory.createWriteError(
        `Failed to write post: ${error}`,
        post.id,
        post.title
      );
      this.errorCollector.addError(conversionError);
      throw error;
    }
  }

  /**
   * Generate MDX file content with frontmatter
   */
  private generateMDXContent(post: AstroBlogPost): string {
    const frontmatter = this.generateFrontmatter(post);
    return `---\n${frontmatter}---\n\n${post.content}`;
  }

  /**
   * Generate YAML frontmatter
   */
  private generateFrontmatter(post: AstroBlogPost): string {
    const lines: string[] = [];

    // Required fields
    lines.push(`id: ${post.id}`);
    lines.push(`title: ${this.yamlEscape(post.title)}`);
    lines.push(`author: ${post.author}`);
    lines.push(`pubDatetime: ${post.pubDatetime.toISOString()}`);

    // Optional modDatetime
    if (post.modDatetime) {
      lines.push(`modDatetime: ${post.modDatetime.toISOString()}`);
    }

    lines.push(`description: ${this.yamlEscape(post.description)}`);

    // Keywords array
    const keywords = post.keywords || [];
    if (keywords.length > 0) {
      lines.push(`keywords:`);
      keywords.forEach(keyword => {
        lines.push(`  - ${this.yamlEscape(keyword)}`);
      });
    } else {
      lines.push(`keywords: [""]`);
    }

    // Categories array
    lines.push(`categories:`);
    const categories = post.categories || [];
    categories.forEach(category => {
      lines.push(`  - ${category}`);
    });

    // Group
    lines.push(`group: ${post.group}`);

    // Tags array
    lines.push(`tags:`);
    if (post.tags.length > 0) {
      post.tags.forEach(tag => {
        lines.push(`  - ${this.yamlEscape(tag)}`);
      });
    } else {
      lines.push(`  - others`);
    }

    // Hero image
    lines.push(`heroImage:`);
    lines.push(`  src: ${post.heroImage.src}`);
    lines.push(`  alt: ${this.yamlEscape(post.heroImage.alt)}`);

    // Optional fields
    if (post.featured !== undefined) {
      lines.push(`featured: ${post.featured}`);
    }

    lines.push(`draft: ${post.draft}`);

    if (post.ogImage) {
      lines.push(`ogImage: ${post.ogImage}`);
    }

    if (post.canonicalURL) {
      lines.push(`canonicalURL: ${post.canonicalURL}`);
    }

    if (post.timezone) {
      lines.push(`timezone: ${post.timezone}`);
    }

    if (post.readingTime) {
      lines.push(`readingTime: ${post.readingTime}`);
    }

    // References array
    const references = post.references || [];
    if (references.length > 0) {
      lines.push(`references:`);
      references.forEach(ref => {
        lines.push(`  - ${this.yamlEscape(ref)}`);
      });
    } else {
      lines.push(`references: []`);
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Escape string for YAML using security sanitizer
   */
  private yamlEscape(str: string): string {
    if (!str) {
      return '""';
    }

    const sanitized = SecuritySanitizer.sanitizeYAMLValue(str);

    // Check if string contains special YAML characters
    if (sanitized.match(/[:"'|\>@`{}[\]&*#?|-]/)) {
      return `"${sanitized}"`;
    }

    return sanitized;
  }

  /**
   * Download images from WordPress to local directory
   */
  private async downloadImages(
    post: AstroBlogPost,
    attachments: WordPressAttachment[],
    imagesDir: string
  ): Promise<void> {
    logger.info(`Downloading images for post: ${post.title}`);

    const imageUrls = new Set<string>();

    // Extract image URLs from content
    const imageRegex =
      /https?:\/\/[^\s"']+\/wp-content\/uploads\/[^\s"')]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
    const contentImages = post.content.match(imageRegex) || [];
    contentImages.forEach(url => imageUrls.add(url));

    // Add featured image if it's a WordPress URL
    if (post.heroImage.src.startsWith("http")) {
      imageUrls.add(post.heroImage.src);
    }

    // Add attachment URLs
    attachments.forEach(att => {
      if (att.url && this.isImageUrl(att.url)) {
        imageUrls.add(att.url);
      }
    });

    // Download each image using the image downloader service
    const downloadPromises = Array.from(imageUrls).map(url =>
      this.imageDownloader.download(url, imagesDir).catch(error => {
        const conversionError = ErrorFactory.createDownloadError(
          `Failed to download image ${url}: ${error}`,
          post.id,
          post.title
        );
        this.errorCollector.addError(conversionError);
      })
    );

    await Promise.all(downloadPromises);
    logger.info(`Finished downloading images for post: ${post.title}`);
  }

  /**
   * Check if URL is an image
   */
  private isImageUrl(url: string): boolean {
    return SecuritySanitizer.validateImageExtension(url);
  }

  /**
   * Update content with local image references
   */
  updateContentImagePaths(content: string): string {
    // Replace WordPress image URLs with local references
    const imageRegex =
      /https?:\/\/[^\s"']+\/wp-content\/uploads\/[^\s"')]+\.(jpg|jpeg|png|gif|webp|svg)/gi;

    return content.replace(imageRegex, match => {
      try {
        const urlObj = new URL(match);
        const filename = urlObj.pathname.split("/").pop() || "unknown.jpg";
        const sanitizedFilename = SecuritySanitizer.sanitizeFilename(filename);
        return `./images/${sanitizedFilename}`;
      } catch {
        return match; // Return original if URL parsing fails
      }
    });
  }

  /**
   * Check if directory already exists and has content
   */
  async checkExistingPost(folderPath: string): Promise<boolean> {
    try {
      const fullPath = join(this.config.outputDir, folderPath);
      const indexPath = join(fullPath, "index.mdx");

      await fs.access(indexPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get conversion errors
   */
  getErrors(): ConversionError[] {
    return this.errorCollector.getErrors();
  }

  /**
   * Get error collector
   */
  getErrorCollector(): ConversionErrorCollector {
    return this.errorCollector;
  }

  /**
   * Clear conversion errors
   */
  clearErrors(): void {
    this.errorCollector.clear();
  }

  /**
   * Create backup of existing post
   */
  async backupExistingPost(folderPath: string): Promise<void> {
    try {
      const fullPath = join(this.config.outputDir, folderPath);
      const backupPath = `${fullPath}-backup-${Date.now()}`;

      await fs.rename(fullPath, backupPath);
      logger.info(`Backed up existing post to: ${backupPath}`);
    } catch (error) {
      logger.warn(`Failed to backup existing post: ${error}`);
    }
  }

  /**
   * Validate output directory
   */
  async validateOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.config.outputDir);
    } catch {
      throw new Error(
        `Output directory does not exist: ${this.config.outputDir}`
      );
    }

    // Check if it looks like a blog directory
    const expectedStructure = join(this.config.outputDir, "..");
    try {
      await fs.access(join(expectedStructure, "src", "content.config.ts"));
    } catch {
      logger.warn(
        "Warning: Output directory might not be a valid Astro blog directory"
      );
    }
  }
}
