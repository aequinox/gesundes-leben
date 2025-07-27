/**
 * Main XML to MDX converter module
 * Provides a high-level API for converting WordPress XML exports to MDX files
 */

import { handleAsync } from "../../../src/utils/errors.js";

import { validateConfig } from "./config.js";
import { XmlConversionError, XmlConfigurationError } from "./errors.js";
import { xmlLogger } from "./logger.js";
import { parseFilePromise } from "./parser.js";
import type { XmlConverterConfig, ConversionResult, ConversionError, Post } from "./types.js";
import { writeFilesPromise } from "./writer.js";

/**
 * Converts WordPress XML export to MDX files for the Healthy Life blog
 *
 * @param config - Conversion configuration options
 * @returns Promise resolving to conversion results
 * @throws {XmlConversionError} When conversion fails
 * @throws {XmlValidationError} When configuration is invalid
 *
 * @example
 * ```typescript
 * const result = await convertXmlToMdx({
 *   input: 'export.xml',
 *   output: './src/data/blog',
 *   saveAttachedImages: true,
 *   postFolders: true
 * });
 *
 * console.log(`Processed ${result.postsProcessed} posts`);
 * ```
 */
export function convertXmlToMdx(
  config: Partial<XmlConverterConfig>
): Promise<ConversionResult> {
  return handleAsync(async () => {
    try {
      // Validate configuration
      const validatedConfig = await validateConfig(config);

      xmlLogger.info("🚀 Starting XML to MDX conversion...");
      xmlLogger.debug("Configuration:", validatedConfig);

      // Parse WordPress XML file
      xmlLogger.info("📖 Parsing WordPress XML export...");
      const posts: Post[] = await parseFilePromise(validatedConfig);

      xmlLogger.info(`✅ Parsed ${posts.length} posts successfully`);

      // Write MDX files and download images
      xmlLogger.info("💾 Writing MDX files and downloading images...");
      await writeFilesPromise(posts, validatedConfig);

      // Calculate statistics efficiently using reduce for better performance
      const imagesDownloaded = posts.reduce(
        (total, post) => total + (post.imageImports?.length ?? 0),
        0
      );

      const result: ConversionResult = {
        postsProcessed: posts.length,
        imagesDownloaded,
        errors: [],
      };

      xmlLogger.info("🎉 Conversion completed successfully!");
      xmlLogger.info(`📊 Statistics:`, {
        posts: result.postsProcessed,
        images: result.imagesDownloaded,
      });

      return result;
    } catch (error) {
      xmlLogger.error("❌ Conversion failed:", error);

      // Re-throw known error types
      if (error instanceof XmlConversionError || error instanceof XmlConfigurationError) {
        throw error;
      }

      // Wrap unknown errors with context
      const contextualError = error instanceof Error
        ? XmlConversionError.forParsingFailure(error, config.input)
        : new XmlConversionError("Unexpected error during conversion", {
            originalError: error,
            phase: "unknown",
          });
      
      throw contextualError;
    }
  });
}

/**
 * Converts WordPress XML with enhanced error handling and reporting
 * Includes detailed error collection and partial success handling
 *
 * @param config - Conversion configuration options
 * @returns Promise resolving to conversion results with error details
 */
export async function convertXmlToMdxWithErrorHandling(
  config: Partial<XmlConverterConfig>
): Promise<ConversionResult> {
  const errors: ConversionError[] = [];

  try {
    const result = await convertXmlToMdx(config);
    return {
      ...result,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Extract context from known error types
    let context: Record<string, unknown> | undefined;
    if (error instanceof XmlConversionError) {
      context = error.xmlContext;
    } else if (error instanceof XmlConfigurationError) {
      context = {
        field: error.field,
        expected: error.expected,
        actual: error.actual,
      };
    }

    errors.push({
      message: errorMessage,
      context,
    } as ConversionError);

    xmlLogger.error("💥 Conversion failed completely:", {
      error: errorMessage,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      postsProcessed: 0,
      imagesDownloaded: 0,
      errors,
    };
  }
}

/**
 * Utility function to check if XML file exists and is readable
 * @param filePath - Path to XML file
 * @returns Promise resolving to boolean indicating file accessibility
 */
export async function validateXmlFile(filePath: string): Promise<boolean> {
  try {
    const fs = await import("fs");
    
    // Check file accessibility
    await fs.promises.access(filePath, fs.constants.R_OK);

    // Check file extension
    if (!filePath.toLowerCase().endsWith(".xml")) {
      xmlLogger.warn("⚠️ File does not have .xml extension:", filePath);
      return false;
    }

    // Check file size (basic sanity check)
    const stats = await fs.promises.stat(filePath);
    if (stats.size === 0) {
      xmlLogger.warn("⚠️ XML file is empty:", filePath);
      return false;
    }

    // Large files might indicate issues
    if (stats.size > 500 * 1024 * 1024) { // 500MB
      xmlLogger.warn("⚠️ XML file is very large (>500MB):", filePath, `Size: ${Math.round(stats.size / 1024 / 1024)}MB`);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    xmlLogger.error("❌ Cannot access XML file:", {
      filePath,
      error: errorMessage,
    });
    return false;
  }
}

/**
 * Utility function to create output directory if it doesn't exist
 * @param outputPath - Path to output directory
 * @returns Promise resolving when directory is ready
 */
export async function ensureOutputDirectory(outputPath: string): Promise<void> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    
    // Resolve absolute path for consistency
    const absolutePath = path.resolve(outputPath);
    
    // Create directory recursively
    await fs.promises.mkdir(absolutePath, { recursive: true });
    
    // Verify directory is writable
    await fs.promises.access(absolutePath, fs.constants.W_OK);
    
    xmlLogger.debug("📁 Output directory ready:", absolutePath);
  } catch (error) {
    const originalError = error instanceof Error ? error : new Error(String(error));
    throw XmlConversionError.forFileWriting(outputPath, originalError);
  }
}
