#!/usr/bin/env node
import path from 'path';
import { argv } from 'process';
import { getConfig } from './src/wizard';
import { parseFilePromise, type Post as ParserPost } from './src/parser';
import { writeFiles } from './src/writer';
import logger from './src/logger';
import { ConversionError } from './src/errors';

/**
 * Main execution function that orchestrates the conversion process
 * @returns {Promise<void>}
 * @throws {ConversionError} When conversion process fails
 */
async function main(): Promise<void> {
  try {
    // Get configuration through CLI arguments or interactive wizard
    const config = await getConfig(argv);
    logger.info('Configuration loaded successfully');

    // Parse WordPress XML and convert to Markdown
    const posts = await parseFilePromise(config as any);
    logger.success(`Parsed ${posts.length} posts successfully`);

    // Write Markdown files and handle image downloads
    await writeFiles(posts as any, config as any);
    logger.success('Files written successfully');

    // Display completion message with output location
    const outputPath = path.resolve((config as any).output);
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
main().catch((error) => {
  logger.error('Fatal error occurred', error);
  process.exit(1);
});
