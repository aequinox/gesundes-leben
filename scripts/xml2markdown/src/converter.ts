/**
 * Main XML to MDX converter module
 * Provides a high-level API for converting WordPress XML exports to MDX files
 */

import { handleAsync } from "../../../src/utils/errors.js";

import { validateConfig } from "./config.js";
import { XmlConversionError } from "./errors.js";
import { xmlLogger } from "./logger.js";
import { parseFilePromise } from "./parser.js";
import type { XmlConverterConfig, ConversionResult, Post } from "./types.js";
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
export async function convertXmlToMdx(
  config: Partial<XmlConverterConfig>
): Promise<ConversionResult> {
  return handleAsync(async () => {
    // Validate configuration
    const validatedConfig = await validateConfig(config);

    xmlLogger.info("🚀 Starting XML to MDX conversion...");
    xmlLogger.debug("Configuration:", validatedConfig);

    try {
      // Parse WordPress XML file
      xmlLogger.info("📖 Parsing WordPress XML export...");
      const posts: Post[] = await parseFilePromise(validatedConfig);

      xmlLogger.info(`✅ Parsed ${posts.length} posts successfully`);

      // Write MDX files and download images
      xmlLogger.info("💾 Writing MDX files and downloading images...");
      await writeFilesPromise(posts, validatedConfig);

      // Calculate statistics efficiently
      let imagesDownloaded = 0;
      for (const post of posts) {
        imagesDownloaded += post.imageImports?.length || 0;
      }

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

      if (error instanceof XmlConversionError) {
        throw error;
      }

      throw new XmlConversionError("Unexpected error during conversion", {
        originalError: error,
      });
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
  const errors: ConversionResult["errors"] = [];

  try {
    const result = await convertXmlToMdx(config);
    return {
      ...result,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const context =
      error instanceof XmlConversionError ? error.context : undefined;

    errors.push({
      message: errorMessage,
      context,
    });

    xmlLogger.error("💥 Conversion failed completely:", error);

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
    await fs.promises.access(filePath, fs.constants.R_OK);

    // Check if file has .xml extension
    if (!filePath.toLowerCase().endsWith(".xml")) {
      xmlLogger.warn("⚠️ File does not have .xml extension:", filePath);
      return false;
    }

    return true;
  } catch (error) {
    xmlLogger.error("❌ Cannot access XML file:", filePath, error);
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
    await fs.promises.mkdir(outputPath, { recursive: true });
    xmlLogger.debug("📁 Output directory ready:", outputPath);
  } catch (error) {
    throw new XmlConversionError("Failed to create output directory", {
      outputPath,
      originalError: error,
    });
  }
}
