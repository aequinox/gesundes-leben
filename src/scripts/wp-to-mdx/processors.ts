/**
 * Content processing plugin system for extensible content transformation
 */
import { CONVERSION_DEFAULTS } from "./config";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type {
  ContentProcessor,
  ProcessingContext,
  VisionatiConfig,
} from "./types";
import { VisionatiImageAnalyzer } from "./visionati-analyzer";

/**
 * Base abstract processor with common functionality
 */
export abstract class BaseProcessor implements ContentProcessor {
  abstract process(
    content: string,
    context: ProcessingContext
  ): Promise<string>;

  protected log(message: string, context?: ProcessingContext): void {
    const prefix = context?.postTitle ? `[${context.postTitle}]` : "";
    logger.debug(`${prefix} ${this.constructor.name}: ${message}`);
  }
}

/**
 * WordPress shortcode processor
 */
export class ShortcodeProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    this.log("Processing WordPress shortcodes", context);

    let processed = content;

    if (context.options.preserveWordPressShortcodes) {
      processed = this.handleWordPressShortcodes(processed);
    } else {
      processed = this.removeWordPressShortcodes(processed);
    }

    return processed;
  }

  private handleWordPressShortcodes(content: string): string {
    let processed = content;

    // Convert [embed] shortcode
    processed = processed.replace(/\[embed\](.*?)\[\/embed\]/g, "$1");

    // Convert [youtube] shortcode
    processed = processed.replace(
      /\[youtube\s+([^\]]+)\]/g,
      (match, params) => {
        const sanitizedParams =
          SecuritySanitizer.sanitizeShortcodeParams(params);
        const videoId = this.extractYouTubeId(sanitizedParams);
        return videoId
          ? `\n<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`
          : "";
      }
    );

    // Convert [gallery] shortcode to placeholder
    processed = processed.replace(
      /\[gallery[^\]]*\]/g,
      "\n<!-- Gallery images will be processed separately -->\n"
    );

    // Convert [caption] shortcode to figure
    processed = processed.replace(
      /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
      "<figure>$1</figure>"
    );

    return processed;
  }

  private removeWordPressShortcodes(content: string): string {
    // Remove all shortcodes but keep their inner content where applicable
    let processed = content;

    // Remove shortcodes with content but preserve inner text
    processed = processed.replace(
      /\[caption[^\]]*\](.*?)\[\/caption\]/gs,
      "$1"
    );
    processed = processed.replace(/\[embed\](.*?)\[\/embed\]/g, "$1");

    // Remove standalone shortcodes
    processed = processed.replace(/\[[^\]]+\]/g, "");

    return processed;
  }

  private extractYouTubeId(params: string): string | null {
    const match = params.match(
      /(?:v=|\/embed\/|\/watch\?v=|\/v\/|\.be\/|watch\?.*&v=)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }
}

/**
 * HTML sanitization and cleanup processor
 */
export class SanitizationProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    this.log("Sanitizing HTML content", context);

    let processed = content;

    // Sanitize potentially dangerous content
    processed = SecuritySanitizer.sanitizeWordPressContent(processed);

    // Clean up WordPress-specific HTML
    processed = this.cleanWordPressHTML(processed);

    return processed;
  }

  private cleanWordPressHTML(html: string): string {
    let cleaned = html;

    // Remove HTML comments
    cleaned = cleaned.replace(/<!--.*?-->/gs, "");

    // Remove empty paragraphs
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");

    // Fix self-closing img tags
    cleaned = cleaned.replace(/<img([^>]*?)>/g, "<img$1 />");

    // Fix WordPress auto-paragraphs around images
    cleaned = cleaned.replace(/<p>(\s*<img[^>]*>\s*)<\/p>/g, "$1");

    // Fix WordPress wpautop issues
    cleaned = cleaned.replace(
      /<p>(\s*<\/?(?:div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^>]*>)/gi,
      "$1"
    );

    return cleaned;
  }
}

/**
 * Import statement processor - ensures correct quote formatting
 */
export class ImportProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    this.log("Ensuring proper import statement formatting", context);

    // Fix any German quotes in import statements to use ASCII quotes
    let processed = content;

    // Find and fix import statements with German quotes
    processed = processed.replace(
      /^import\s+(.+?)\s+from\s+[„""]([^"„"]*?)[„""]\s*;$/gm,
      'import $1 from "$2";'
    );

    return processed;
  }
}

/**
 * German content improvement processor
 */
export class GermanContentProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    this.log("Processing German content improvements", context);

    let processed = content;

    // Fix German quotation marks, but preserve JSX components
    processed = this.fixGermanQuotes(processed);

    // Ensure proper spacing around German punctuation
    processed = processed.replace(/(\w)–(\w)/g, "$1 – $2");
    processed = processed.replace(/(\w)—(\w)/g, "$1 — $2");

    return processed;
  }

  private fixGermanQuotes(content: string): string {
    // Store items to preserve with placeholders
    const preservedItems: string[] = [];
    let preserveCounter = 0;

    let processed = content;

    // Preserve import statements (they need ASCII quotes)
    processed = processed.replace(/^import .+ from .+;$/gm, match => {
      const placeholder = `__PRESERVE_IMPORT_${preserveCounter}__`;
      preservedItems[preserveCounter] = match;
      preserveCounter++;
      return placeholder;
    });

    // Preserve JSX components
    processed = processed.replace(/<\s*[A-Z][a-zA-Z0-9]*\s[^>]*\/>/g, match => {
      const placeholder = `__PRESERVE_JSX_${preserveCounter}__`;
      preservedItems[preserveCounter] = match;
      preserveCounter++;
      return placeholder;
    });

    // Apply German quote improvements to the remaining text
    processed = processed.replace(/„([^"]*?)"/g, '„$1"');
    processed = processed.replace(/"([^"]*?)"/g, '„$1"');

    // Restore all preserved items
    for (let i = 0; i < preservedItems.length; i++) {
      processed = processed.replace(
        `__PRESERVE_IMPORT_${i}__`,
        preservedItems[i]
      );
      processed = processed.replace(`__PRESERVE_JSX_${i}__`, preservedItems[i]);
    }

    return processed;
  }
}

/**
 * Table of contents processor
 */
export class TableOfContentsProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    if (!context.options.generateTOC) {
      return content;
    }

    this.log("Adding table of contents", context);

    const tocHeader = "## Inhaltsverzeichnis\n\n";

    // If content already has a TOC, don't add another
    if (
      content.includes("Inhaltsverzeichnis") ||
      content.includes("## Inhalt")
    ) {
      return content;
    }

    // Find where imports end and content begins
    const lines = content.split("\n");
    let importEndIndex = -1;

    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) {
        importEndIndex = i;
      }
    }

    // If we found imports, insert TOC after them
    if (importEndIndex >= 0) {
      const beforeImports = lines.slice(0, importEndIndex + 1);
      const afterImports = lines.slice(importEndIndex + 1);

      // Remove any empty lines at the start of content
      while (afterImports.length > 0 && afterImports[0].trim() === "") {
        afterImports.shift();
      }

      return [...beforeImports, "", tocHeader, ...afterImports].join("\n");
    }

    // No imports found, add TOC at the beginning
    return tocHeader + content;
  }
}

/**
 * Image path rewriting processor
 */
export class ImagePathProcessor extends BaseProcessor {
  async process(content: string, context: ProcessingContext): Promise<string> {
    if (!context.options.rewriteImagePaths) {
      return content;
    }

    this.log("Rewriting image paths to local references", context);

    // Replace WordPress upload URLs with local image references
    return content.replace(
      /!\[([^\]]*)\]\(https?:\/\/[^\/]+\/wp-content\/uploads\/[^)]+\/([^)]+)\)/g,
      "![$1](./images/$2)"
    );
  }
}

/**
 * Visionati AI image analysis processor
 */
export class VisionatiImageProcessor extends BaseProcessor {
  private analyzer?: VisionatiImageAnalyzer;

  constructor(visionatiConfig?: VisionatiConfig) {
    super();
    if (visionatiConfig?.enableVisionati) {
      this.analyzer = new VisionatiImageAnalyzer(visionatiConfig);
    }
  }

  async process(content: string, context: ProcessingContext): Promise<string> {
    if (!this.analyzer) {
      return content;
    }

    this.log("Processing images with Visionati AI analysis", context);

    // Initialize analyzer if not already done
    await this.analyzer.initialize();

    let processed = content;

    // Find all image references in the content
    const imageRegex = /!\[([^\]]*)\]\(\.\/images\/([^)]+)\)/g;
    const matches = Array.from(content.matchAll(imageRegex));

    for (const match of matches) {
      const [fullMatch, currentAlt, filename] = match;

      // Skip if alt text already exists and is not generic
      if (
        currentAlt &&
        currentAlt.length > 10 &&
        !this.isGenericAlt(currentAlt)
      ) {
        continue;
      }

      // Try to find the original WordPress URL for this image
      const originalUrl = this.findOriginalImageUrl(content, filename);
      if (!originalUrl) {
        continue;
      }

      try {
        // Analyze the image
        const analysis = await this.analyzer.analyzeImage(
          originalUrl,
          filename
        );

        // Update the image reference with AI-generated content
        let newAlt = analysis.generatedAltText || currentAlt;
        let newFilename = analysis.generatedFilename || filename;

        // Ensure the new filename is safe and valid
        newFilename = SecuritySanitizer.sanitizeFilename(newFilename);

        // Create the updated image reference
        const updatedMatch = `![${newAlt}](./images/${newFilename})`;
        processed = processed.replace(fullMatch, updatedMatch);

        this.log(
          `Updated image: ${filename} -> ${newFilename}, alt: "${newAlt}"`,
          context
        );

        // Log analysis results
        if (analysis.fromCache) {
          this.log(`Used cached analysis for ${filename}`, context);
        } else {
          this.log(
            `API analysis completed for ${filename} (${analysis.creditsUsed} credits)`,
            context
          );
        }
      } catch (error) {
        this.log(`Failed to analyze image ${filename}: ${error}`, context);
        // Continue with other images even if one fails
      }
    }

    // Log overall statistics
    if (this.analyzer) {
      const stats = this.analyzer.getStats();
      this.log(
        `Visionati processing complete. Cache hits: ${stats.cacheHits}, API calls: ${stats.cacheMisses}, Credits saved: ${stats.costSavings}`,
        context
      );
    }

    return processed;
  }

  /**
   * Check if alt text is generic/placeholder
   */
  private isGenericAlt(alt: string): boolean {
    const genericPatterns = [
      /^image/i,
      /^photo/i,
      /^picture/i,
      /^img/i,
      /^screenshot/i,
      /^untitled/i,
      /^\d+$/,
      /^$/, // Empty
    ];

    return genericPatterns.some(pattern => pattern.test(alt.trim()));
  }

  /**
   * Try to find the original WordPress URL for an image filename
   * This is a heuristic approach since the original URL might not be in the content
   */
  private findOriginalImageUrl(
    content: string,
    filename: string
  ): string | null {
    // Look for WordPress upload URLs that contain this filename
    const wpUrlRegex = new RegExp(
      `(https?://[^/]+/wp-content/uploads/[^\\s)]+/${filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    const match = content.match(wpUrlRegex);
    return match ? match[0] : null;
  }

  /**
   * Get statistics from the analyzer
   */
  getStats() {
    return (
      this.analyzer?.getStats() || {
        totalEntries: 0,
        totalCreditsUsed: 0,
        cacheHits: 0,
        cacheMisses: 0,
        costSavings: 0,
      }
    );
  }
}

/**
 * Content processor pipeline manager
 */
export class ContentProcessorPipeline {
  private processors: ContentProcessor[] = [];

  /**
   * Add a processor to the pipeline
   */
  addProcessor(processor: ContentProcessor): this {
    this.processors.push(processor);
    return this;
  }

  /**
   * Add multiple processors to the pipeline
   */
  addProcessors(processors: ContentProcessor[]): this {
    this.processors.push(...processors);
    return this;
  }

  /**
   * Create default processing pipeline
   */
  static createDefault(
    visionatiConfig?: VisionatiConfig
  ): ContentProcessorPipeline {
    const pipeline = new ContentProcessorPipeline()
      .addProcessor(new SanitizationProcessor())
      .addProcessor(new ShortcodeProcessor())
      .addProcessor(new GermanContentProcessor())
      .addProcessor(new ImportProcessor()) // Run after German content processor to fix any quotes
      .addProcessor(new ImagePathProcessor());

    // Add Visionati processor if enabled
    if (visionatiConfig?.enableVisionati) {
      pipeline.addProcessor(new VisionatiImageProcessor(visionatiConfig));
    }

    return pipeline.addProcessor(new TableOfContentsProcessor());
  }

  /**
   * Process content through all processors in sequence
   */
  async process(content: string, context: ProcessingContext): Promise<string> {
    let processed = content;

    for (const processor of this.processors) {
      try {
        processed = await processor.process(processed, context);
      } catch (error) {
        logger.error(
          `Processor ${processor.constructor.name} failed: ${error}`
        );
        // Continue with other processors instead of failing completely
      }
    }

    return processed;
  }

  /**
   * Get the number of processors in the pipeline
   */
  getProcessorCount(): number {
    return this.processors.length;
  }

  /**
   * Clear all processors from the pipeline
   */
  clear(): void {
    this.processors = [];
  }
}
