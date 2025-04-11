#!/usr/bin/env node
import path from 'path';
import { argv } from 'process';

// Import services
import configService from './src/services/config/ConfigService';
import { loggerService } from './src/services/logger/LoggerService';
import { errorService } from './src/services/error/ErrorService';
import { imageService } from './src/services/image/ImageService';

// Import existing modules (these would be refactored into services in a complete implementation)
import { parseFilePromise } from './src/parser';
import { writeFiles } from './src/writer';

/**
 * Main execution function that orchestrates the conversion process using the new service architecture
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  try {
    // Get configuration through CLI arguments or interactive wizard
    const config = await configService.getConfig(argv);
    loggerService.info('Configuration loaded successfully');
    
    // Log some configuration details
    loggerService.info(`Input file: ${config.input}`);
    loggerService.info(`Output directory: ${config.output}`);
    
    // Get application settings
    const settings = configService.getSettings();
    loggerService.info(`Image download timeout: ${settings.image_download_timeout}ms`);
    loggerService.info(`Frontmatter fields: ${settings.frontmatter_fields.join(', ')}`);

    // Parse WordPress XML and convert to Markdown
    const posts = await parseFilePromise(config as any);
    loggerService.success(`Parsed ${posts.length} posts successfully`);

    // Example of using the ImageService to process a sample image URL
    if (posts.length > 0 && posts[0].meta.imageUrls.length > 0) {
      const sampleImageUrl = posts[0].meta.imageUrls[0];
      loggerService.info(`Processing sample image: ${sampleImageUrl}`);
      
      try {
        // Extract filename from URL
        const filename = imageService.getFilenameFromUrl(sampleImageUrl);
        loggerService.info(`Extracted filename: ${filename}`);
        
        // Check if it's a resized version
        const baseFilename = imageService.getBaseFilenameIfResized(filename);
        if (baseFilename) {
          loggerService.info(`This is a resized version. Base filename: ${baseFilename}`);
        }
        
        // Determine image alignment based on filename
        const alignmentMarker = imageService.getAlignmentMarkerFromFilename(filename);
        loggerService.info(`Suggested alignment marker: ${alignmentMarker}`);
      } catch (imageError) {
        // Example of using the ErrorService to handle errors
        const wrappedError = errorService.wrapError(imageError, 'Error processing sample image');
        loggerService.error(wrappedError.message, wrappedError.details);
      }
    }

    // Write Markdown files and handle image downloads
    await writeFiles(posts as any, config as any);
    loggerService.success('Files written successfully');

    // Display completion message with output location
    const outputPath = path.resolve((config as any).output);
    loggerService.success(`Conversion complete! Output files located at: ${outputPath}`);
  } catch (error) {
    // Example of using the ErrorService for error handling
    const wrappedError = errorService.wrapError(error);
    
    if (wrappedError.name === 'ConversionError') {
      loggerService.error('Conversion failed', wrappedError);
    } else {
      loggerService.error('An unexpected error occurred', wrappedError);
    }
    
    process.exit(1);
  }
}

// Execute main function with proper error handling
main().catch((error) => {
  const wrappedError = errorService.wrapError(error, 'Fatal error occurred');
  loggerService.error(wrappedError.message, wrappedError.details);
  process.exit(1);
});
