import { logger } from "./logger";
import type {
  AstroBlogPost,
  WordPressAttachment,
  ConversionConfig,
  ConversionError,
} from "./types";
import axios from "axios";
import { promises as fs } from "fs";
import { join, dirname } from "path";

export class FileWriter {
  private config: ConversionConfig;
  private errors: ConversionError[] = [];

  constructor(config: ConversionConfig) {
    this.config = config;
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
      const conversionError: ConversionError = {
        type: "write",
        message: `Failed to write post: ${error}`,
        postId: post.id,
        postTitle: post.title,
      };
      this.errors.push(conversionError);
      logger.error(`Failed to write post ${post.title}: ${error}`);
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
    if (post.keywords.length > 0) {
      lines.push(`keywords:`);
      post.keywords.forEach(keyword => {
        lines.push(`  - ${this.yamlEscape(keyword)}`);
      });
    } else {
      lines.push(`keywords: [""]`);
    }

    // Categories array
    lines.push(`categories:`);
    post.categories.forEach(category => {
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
    if (post.references.length > 0) {
      lines.push(`references:`);
      post.references.forEach(ref => {
        lines.push(`  - ${this.yamlEscape(ref)}`);
      });
    } else {
      lines.push(`references: []`);
    }

    return lines.join("\n") + "\n";
  }

  /**
   * Escape string for YAML
   */
  private yamlEscape(str: string): string {
    if (!str) return '""';

    // Check if string contains special YAML characters
    if (str.match(/[:"'|\>@`{}[\]&*#?|-]/)) {
      // Escape quotes and wrap in quotes
      return `"${str.replace(/"/g, '\\"')}"`;
    }

    return str;
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

    // Download each image
    const downloadPromises = Array.from(imageUrls).map(url =>
      this.downloadSingleImage(url, imagesDir).catch(error => {
        const conversionError: ConversionError = {
          type: "download",
          message: `Failed to download image ${url}: ${error}`,
          postId: post.id,
          postTitle: post.title,
        };
        this.errors.push(conversionError);
        logger.warn(`Failed to download image ${url}: ${error}`);
      })
    );

    await Promise.all(downloadPromises);
    logger.info(`Finished downloading images for post: ${post.title}`);
  }

  /**
   * Download a single image
   */
  private async downloadSingleImage(
    url: string,
    imagesDir: string
  ): Promise<void> {
    try {
      const filename = this.extractFilenameFromUrl(url);
      const filePath = join(imagesDir, filename);

      // Check if file already exists
      try {
        await fs.access(filePath);
        logger.debug(`Image already exists: ${filename}`);
        return;
      } catch {
        // File doesn't exist, proceed with download
      }

      logger.debug(`Downloading image: ${url}`);

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; WordPress-to-Astro-Converter/1.0)",
        },
      });

      if (!this.config.dryRun) {
        await fs.writeFile(filePath, Buffer.from(response.data));
      }

      logger.debug(`Successfully downloaded: ${filename}`);

      // Small delay to avoid overwhelming the server
      await this.delay(100);
    } catch (error) {
      throw new Error(`Download failed for ${url}: ${error}`);
    }
  }

  /**
   * Extract filename from URL
   */
  private extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop() || "unknown";

      // Ensure filename has an extension
      if (!filename.includes(".")) {
        return filename + ".jpg";
      }

      return filename;
    } catch {
      return `image-${Date.now()}.jpg`;
    }
  }

  /**
   * Check if URL is an image
   */
  private isImageUrl(url: string): boolean {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const urlLower = url.toLowerCase();
    return imageExtensions.some(ext => urlLower.includes(ext));
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update content with local image references
   */
  updateContentImagePaths(content: string): string {
    // Replace WordPress image URLs with local references
    const imageRegex =
      /https?:\/\/[^\s"']+\/wp-content\/uploads\/[^\s"')]+\.(jpg|jpeg|png|gif|webp|svg)/gi;

    return content.replace(imageRegex, match => {
      const filename = this.extractFilenameFromUrl(match);
      return `./images/${filename}`;
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
    return this.errors;
  }

  /**
   * Clear conversion errors
   */
  clearErrors(): void {
    this.errors = [];
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
