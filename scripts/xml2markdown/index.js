#!/usr/bin/env node

/**
 * WordPress Export to Markdown Converter
 *
 * This script converts WordPress export XML files to Markdown format while preserving
 * metadata, handling images, and maintaining content structure. It provides a CLI interface
 * with an interactive wizard for configuration.
 *
 * @module wordpress-export-to-markdown
 * @author Original: Renner
 * @license MIT
 */

import path from 'path';
import { argv } from 'process';
import { getConfig } from './src/wizard.js';
import { parseFilePromise } from './src/parser.js';
import { writeFilesPromise } from './src/writer.js';
import logger from './src/logger.js';
import { ConversionError } from './src/errors.js';

/**
 * Main execution function that orchestrates the conversion process
 * @returns {Promise<void>}
 * @throws {ConversionError} When conversion process fails
 */
async function main() {
  try {
    // Get configuration through CLI arguments or interactive wizard
    const config = await getConfig(argv);
    logger.info('Configuration loaded successfully');

    // Parse WordPress XML and convert to Markdown
    const posts = await parseFilePromise(config);
    logger.success(`Parsed ${posts.length} posts successfully`);

    // Write Markdown files and handle image downloads
    await writeFilesPromise(posts, config);
    logger.success('Files written successfully');

    // Display completion message with output location
    const outputPath = path.resolve(config.output);
    logger.success(`Conversion complete! Output files located at: ${outputPath}`);
  } catch (error) {
    if (error instanceof ConversionError) {
      logger.error('Conversion failed', error);
    } else {
      logger.error('An unexpected error occurred', error);
    }
    process.exit(1);
  }
}

// Execute main function with proper error handling
main().catch(error => {
  logger.error('Fatal error occurred', error);
  process.exit(1);
});
