#!/usr/bin/env node

/**
 * Fix Markdown Script (TypeScript Version)
 *
 * This script processes existing markdown files to fix frontmatter issues
 * for compatibility with Astro content collections using the post-processor module.
 *
 * Usage:
 *   bun scripts/fix-markdown.ts <directory> [--extension=.mdx] [--no-recursive]
 *   or after compilation:
 *   node dist/fix-markdown.js <directory> [--extension=.mdx] [--no-recursive]
 *
 * Example:
 *   bun scripts/fix-markdown.ts ./src/content/blog --extension=.mdx
 */

import { processDirectory } from './src/post-processor'; // Import from the TS file
import logger from './src/logger'; // Assuming logger has types or default export

interface CliOptions {
  extension: string;
  recursive: boolean;
}

/**
 * Parses command line arguments to extract the target directory and options.
 * @param args - Command line arguments (process.argv.slice(2)).
 * @returns An object containing the directory and parsed options, or null if args are invalid.
 */
function parseArguments(args: string[]): { directory: string; options: CliOptions } | null {
  if (args.length === 0 || args[0].startsWith('--')) {
    console.error('Error: Directory argument is required and must be the first argument.');
    console.error('Usage: bun scripts/fix-markdown.ts <directory> [--extension=.mdx] [--no-recursive]');
    return null;
  }

  const directory = args[0];
  const options: CliOptions = {
    extension: '.mdx', // Default extension
    recursive: true    // Default recursive behavior
  };

  // Process optional arguments
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--extension=')) {
      const value = arg.split('=')[1];
      if (value) {
        options.extension = value.startsWith('.') ? value : `.${value}`; // Ensure leading dot
      } else {
        logger.warn(`Ignoring invalid --extension argument: ${arg}`);
      }
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    } else {
      logger.warn(`Ignoring unknown argument: ${arg}`);
    }
  });

  return { directory, options };
}

/**
 * Main execution function.
 */
async function main(): Promise<void> {
  const argData = parseArguments(process.argv.slice(2));

  if (!argData) {
    process.exit(1); // Exit if arguments are invalid
  }

  const { directory, options } = argData;

  try {
    logger.info(`Processing markdown files in directory: ${directory}`);
    logger.info(`Options: extension=${options.extension}, recursive=${options.recursive}`);

    const startTime = Date.now();
    // Pass the correctly typed options object
    const processedCount = await processDirectory(directory, options);
    const endTime = Date.now();
    const durationSeconds = (endTime - startTime) / 1000;

    logger.success(`Successfully processed ${processedCount} files in ${durationSeconds.toFixed(2)} seconds.`);

  } catch (error: any) {
    // Log the specific error message
    logger.error('Error during processing:', error.message);
    // Optionally log the full error stack for debugging
    // console.error(error);
    process.exit(1); // Exit with error code
  }
}

// Execute the main function
main();