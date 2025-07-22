#!/usr/bin/env node
import { CONVERSION_DEFAULTS } from "./config";
import { ConversionErrorCollector, ErrorHandler } from "./errors";
import { HttpImageDownloader, MockImageDownloader } from "./image-downloader";
import { logger } from "./logger";
import { SchemaMapper } from "./mapper";
import { WordPressParser } from "./parser";
import { ContentTranslator } from "./translator";
import type { ConversionConfig, ConversionResult } from "./types";
import { ContentValidator } from "./validator";
import { FileWriter } from "./writer";
import { Command } from "commander";
import { resolve } from "path";

class WordPressToAstroConverter {
  private parser = new WordPressParser();
  private translator!: ContentTranslator;
  private mapper!: SchemaMapper;
  private writer!: FileWriter;
  private validator = new ContentValidator();
  private config!: ConversionConfig;
  private errorCollector = new ConversionErrorCollector();

  async convert(config: ConversionConfig): Promise<ConversionResult> {
    this.config = config;
    this.translator = new ContentTranslator(config.smartImagePositioning);
    this.mapper = new SchemaMapper(config);

    // Create image downloader based on dry run setting
    const imageDownloader = config.dryRun
      ? new MockImageDownloader()
      : new HttpImageDownloader();
    this.writer = new FileWriter(config, imageDownloader);

    const result: ConversionResult = {
      success: false,
      postsConverted: 0,
      postsSkipped: 0,
      imagesDownloaded: 0,
      errors: [],
      warnings: [],
    };

    try {
      logger.info("Starting WordPress to Astro conversion...");
      logger.info(`Input file: ${config.inputFile}`);
      logger.info(`Output directory: ${config.outputDir}`);
      logger.info(`Dry run: ${config.dryRun}`);

      // Validate output directory
      await this.writer.validateOutputDirectory();

      // Parse WordPress XML
      logger.info("Parsing WordPress XML...");
      const wpExport = await this.parser.parseFromFile(config.inputFile);
      logger.info(`Found ${wpExport.posts.length} posts to process`);

      // Resolve featured images
      this.parser.resolveFeaturedImages(wpExport.posts, wpExport.attachments);

      // Filter posts based on config
      const filteredPosts = this.filterPosts(wpExport.posts);
      logger.info(`Processing ${filteredPosts.length} posts after filtering`);

      // Process posts concurrently in batches
      await this.processPostsConcurrently(
        filteredPosts,
        wpExport.attachments,
        result
      );

      // Collect all errors from different components
      result.errors.push(...this.errorCollector.getErrors());
      result.errors.push(...this.parser.getErrors().getErrors());
      result.errors.push(...this.mapper.getErrors().getErrors());
      result.errors.push(...this.writer.getErrors());
      result.errors.push(...this.validator.getErrors());

      // Collect warnings
      result.warnings.push(...this.errorCollector.getWarnings());

      result.success = result.errors.length === 0;

      // Log summary
      this.logSummary(result);

      return result;
    } catch (error) {
      logger.error(`Conversion failed: ${error}`);
      result.errors.push({
        type: "convert",
        message: `Conversion failed: ${error}`,
      });
      return result;
    }
  }

  /**
   * Process posts concurrently in batches for better performance
   */
  private async processPostsConcurrently(
    posts: any[],
    attachments: any[],
    result: ConversionResult
  ): Promise<void> {
    const batchSize = CONVERSION_DEFAULTS.CONCURRENT_BATCH_SIZE;

    logger.info(`Processing ${posts.length} posts in batches of ${batchSize}`);

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);

      logger.info(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}`
      );

      const batchPromises = batch.map(post =>
        this.processPostSafe(post, attachments, result)
      );

      await Promise.all(batchPromises);

      // Small delay between batches to avoid overwhelming the system
      if (i + batchSize < posts.length) {
        await this.delay(500);
      }
    }
  }

  /**
   * Process a single post with error handling
   */
  private async processPostSafe(
    wpPost: any,
    attachments: any[],
    result: ConversionResult
  ): Promise<void> {
    return ErrorHandler.withErrorHandling(
      () => this.processPost(wpPost, attachments, result),
      this.errorCollector,
      () => ({
        type: "convert" as const,
        message: `Failed to process post: ${wpPost.title}`,
        postId: wpPost.id,
        postTitle: wpPost.title,
      })
    ).then(success => {
      if (success) {
        result.postsConverted++;
      } else {
        result.postsSkipped++;
      }
    });
  }

  private async processPost(
    wpPost: any,
    attachments: any[],
    result: ConversionResult
  ): Promise<void> {
    logger.info(`Processing post: ${wpPost.title}`);

    // Check if post already exists
    const folderPath = this.generateFolderPath(wpPost);
    const exists = await this.writer.checkExistingPost(folderPath);

    if (exists && !this.config.dryRun) {
      const action = await this.handleExistingPost(wpPost.title, folderPath);
      if (action === "skip") {
        logger.info(`Skipping existing post: ${wpPost.title}`);
        result.postsSkipped++;
        return;
      } else if (action === "backup") {
        await this.writer.backupExistingPost(folderPath);
      }
    }

    // Convert content to MDX
    const mdxContent = await this.translator.convertToMDX(wpPost.content, {
      generateTOC: this.config.generateTOC,
      rewriteImagePaths: this.config.downloadImages,
    });

    // Extract image files from attachments and content
    const imageFiles = this.extractImageFiles(wpPost, attachments);

    // Map to Astro schema
    const astroBlogPost = this.mapper.mapWordPressToAstro(
      wpPost,
      mdxContent,
      imageFiles
    );

    // Update content with local image paths
    astroBlogPost.content = this.writer.updateContentImagePaths(
      astroBlogPost.content
    );

    // Validate the mapped post
    const isValid =
      this.validator.validatePost(astroBlogPost) &&
      this.validator.validateMDXContent(
        astroBlogPost.content,
        astroBlogPost.title
      ) &&
      this.validator.validateFileStructure(astroBlogPost);

    if (!isValid) {
      logger.warn(`Validation failed for post: ${wpPost.title}`);
      result.warnings.push(`Validation issues found in post: ${wpPost.title}`);
    }

    // Write the post
    await this.writer.writePost(astroBlogPost, attachments);

    result.imagesDownloaded += imageFiles.length;
  }

  private filterPosts(posts: any[]): any[] {
    return posts.filter(post => {
      // Skip drafts if configured
      if (this.config.skipDrafts && post.status !== "publish") {
        return false;
      }

      // Filter by date range
      if (
        this.config.filterDateFrom &&
        post.pubDate < this.config.filterDateFrom
      ) {
        return false;
      }
      if (this.config.filterDateTo && post.pubDate > this.config.filterDateTo) {
        return false;
      }

      return true;
    });
  }

  private generateFolderPath(wpPost: any): string {
    const date = wpPost.pubDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const slug = wpPost.slug || this.slugify(wpPost.title);

    return `${year}-${month}-${day}-${slug}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async handleExistingPost(
    postTitle: string,
    folderPath: string
  ): Promise<"skip" | "backup" | "overwrite"> {
    // For now, default to backup - you could make this configurable
    logger.warn(`Post already exists: ${postTitle}`);
    return "backup";
  }

  private extractImageFiles(wpPost: any, attachments: any[]): string[] {
    const imageFiles: string[] = [];

    // Extract from content
    const imageRegex =
      /https?:\/\/[^\s"']+\/wp-content\/uploads\/[^\s"')]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
    const contentImages = wpPost.content.match(imageRegex) || [];

    contentImages.forEach((url: string) => {
      let filename = url.split("/").pop();
      if (filename) {
        // Strip WordPress dimension suffixes to match what the smart positioning system will generate
        filename = this.stripWordPressDimensionSuffix(filename);
        if (!imageFiles.includes(filename)) {
          imageFiles.push(filename);
        }
      }
    });

    // Add featured image
    if (wpPost.featuredImageUrl) {
      let filename = wpPost.featuredImageUrl.split("/").pop();
      if (filename) {
        filename = this.stripWordPressDimensionSuffix(filename);
        if (!imageFiles.includes(filename)) {
          imageFiles.push(filename);
        }
      }
    }

    return imageFiles;
  }

  /**
   * Strip WordPress dimension suffixes from filenames
   */
  private stripWordPressDimensionSuffix(filename: string): string {
    // Remove WordPress dimension suffixes like -300x200, -1024x768, etc.
    // but keep the file extension
    return filename.replace(/-\d+x\d+(\.[^.]+)$/, "$1");
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logSummary(result: ConversionResult): void {
    logger.info("=".repeat(50));
    logger.info("CONVERSION SUMMARY");
    logger.info("=".repeat(50));
    logger.info(`Posts converted: ${result.postsConverted}`);
    logger.info(`Posts skipped: ${result.postsSkipped}`);
    logger.info(`Images downloaded: ${result.imagesDownloaded}`);
    logger.info(`Errors: ${result.errors.length}`);
    logger.info(`Warnings: ${result.warnings.length}`);
    logger.info(`Success: ${result.success ? "Yes" : "No"}`);

    if (result.errors.length > 0) {
      logger.info("\nERRORS:");
      result.errors.forEach(error => {
        logger.error(`[${error.type}] ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      logger.info("\nWARNINGS:");
      result.warnings.forEach(warning => {
        logger.warn(warning);
      });
    }
  }
}

// CLI setup
const program = new Command();

program
  .name("wp-to-mdx")
  .description("Convert WordPress XML export to Astro MDX blog posts")
  .version("1.0.0");

program
  .command("convert")
  .description("Convert WordPress XML to Astro MDX format")
  .requiredOption("-i, --input <file>", "WordPress XML export file")
  .option("-o, --output <dir>", "Output directory", "src/data/blog")
  .option("--dry-run", "Preview conversion without writing files", false)
  .option("--skip-drafts", "Skip draft posts", true)
  .option("--no-download-images", "Skip downloading images")
  .option("--no-generate-toc", "Skip generating table of contents")
  .option(
    "--filter-date-from <date>",
    "Only convert posts from this date (YYYY-MM-DD)"
  )
  .option(
    "--filter-date-to <date>",
    "Only convert posts until this date (YYYY-MM-DD)"
  )
  .option("--author-mapping <file>", "JSON file with author mapping")
  .option("--category-mapping <file>", "JSON file with category mapping")
  .option(
    "--smart-positioning",
    "Enable smart image positioning based on dimensions",
    true
  )
  .option("--no-smart-positioning", "Disable smart image positioning")
  .option(
    "--small-image-threshold <pixels>",
    "Pixel width threshold for small images",
    "400"
  )
  .option(
    "--portrait-threshold <ratio>",
    "Aspect ratio threshold for portrait images",
    "0.75"
  )
  .option(
    "--landscape-threshold <ratio>",
    "Aspect ratio threshold for landscape images",
    "1.5"
  )
  .option(
    "--square-threshold <ratio>",
    "Aspect ratio difference to consider square",
    "0.1"
  )
  .action(async options => {
    try {
      const config: ConversionConfig = {
        inputFile: resolve(options.input),
        outputDir: resolve(options.output),
        downloadImages: options.downloadImages !== false,
        dryRun: options.dryRun,
        skipDrafts: options.skipDrafts,
        generateTOC: options.generateToc !== false,
        filterDateFrom: options.filterDateFrom
          ? new Date(options.filterDateFrom)
          : undefined,
        filterDateTo: options.filterDateTo
          ? new Date(options.filterDateTo)
          : undefined,
        authorMapping: options.authorMapping
          ? await import(resolve(options.authorMapping)).then(m => m.default)
          : undefined,
        categoryMapping: options.categoryMapping
          ? await import(resolve(options.categoryMapping)).then(m => m.default)
          : undefined,
        smartImagePositioning: {
          enableSmartPositioning: options.smartPositioning !== false,
          smallImageThreshold: parseInt(options.smallImageThreshold),
          portraitThreshold: parseFloat(options.portraitThreshold),
          landscapeThreshold: parseFloat(options.landscapeThreshold),
          squareThreshold: parseFloat(options.squareThreshold),
        },
      };

      const converter = new WordPressToAstroConverter();
      const result = await converter.convert(config);

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      logger.error(`CLI error: ${error}`);
      process.exit(1);
    }
  });

// Handle direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse(process.argv);
}

export { WordPressToAstroConverter };
export type { ConversionConfig, ConversionResult };
