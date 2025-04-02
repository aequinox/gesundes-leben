#!/usr/bin/env node

/**
 * Fix Markdown Script
 * 
 * This script processes existing markdown files to fix frontmatter issues
 * for compatibility with Astro content collections.
 * 
 * Usage:
 *   node fix-markdown.js <directory> [--extension=.mdx]
 * 
 * Example:
 *   node fix-markdown.js ./src/content/blog --extension=.mdx
 */

const path = require('path');
const { processDirectory } = require('./src/post-processor');
const logger = require('./src/logger');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Directory argument is required');
  console.error('Usage: node fix-markdown.js <directory> [--extension=.mdx]');
  process.exit(1);
}

// Get directory argument
const directory = args[0];

// Parse options
const options = {
  extension: '.mdx',
  recursive: true
};

args.slice(1).forEach(arg => {
  if (arg.startsWith('--extension=')) {
    options.extension = arg.split('=')[1];
  } else if (arg === '--no-recursive') {
    options.recursive = false;
  }
});

// Main function
async function main() {
  try {
    logger.info(`Processing markdown files in ${directory}`);
    logger.info(`Options: extension=${options.extension}, recursive=${options.recursive}`);
    
    const startTime = Date.now();
    const processedCount = await processDirectory(directory, options);
    const endTime = Date.now();
    
    logger.success(`Processed ${processedCount} files in ${(endTime - startTime) / 1000} seconds`);
  } catch (error) {
    logger.error('Error processing files:', error);
    process.exit(1);
  }
}

main();
