#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { loggerService } from './src/services/logger/LoggerService';
import { errorService } from './src/services/error/ErrorService';
import { contentService } from './src/services/content/ContentService';

/**
 * Fixes image paths in MDX files to use the correct relative paths.
 * This script specifically addresses the error:
 * "Cannot find module 'images/Teabag-Plastic-Header.png' imported from '/home/renner/Projects/GIT-Astro/src/content/blog/2025-03-28-7-grundlegende-gefahren-von-mikroplastik-fuer-deinegesundheit/index.mdx'"
 */

interface PostFile {
  path: string;
  content: string;
}

/**
 * Recursively finds all MDX files in a directory.
 * @param dir - The directory to search.
 * @returns An array of file paths.
 */
function findMdxFiles(dir: string): string[] {
  let results: string[] = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        results = results.concat(findMdxFiles(filePath));
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        results.push(filePath);
      }
    }
  } catch (error) {
    loggerService.error(`Error finding MDX files in ${dir}`, error);
  }
  
  return results;
}

/**
 * Reads a file and returns its content.
 * @param filePath - The path to the file.
 * @returns The file content.
 */
function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    loggerService.error(`Error reading file: ${filePath}`, error);
    throw errorService.wrapError(error, `Failed to read file: ${filePath}`);
  }
}

/**
 * Writes content to a file.
 * @param filePath - The path to the file.
 * @param content - The content to write.
 */
function writeFile(filePath: string, content: string): void {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    loggerService.error(`Error writing file: ${filePath}`, error);
    throw errorService.wrapError(error, `Failed to write file: ${filePath}`);
  }
}

/**
 * Processes a single MDX file to fix image paths.
 * @param filePath - The path to the MDX file.
 * @returns True if the file was modified, false otherwise.
 */
function processFile(filePath: string): boolean {
  try {
    const content = readFile(filePath);
    const basePath = path.dirname(filePath);
    
    // Use the ContentService to fix image paths
    const fixedContent = contentService.fixImagePaths(content, basePath);
    
    // Only write the file if changes were made
    if (content !== fixedContent) {
      writeFile(filePath, fixedContent);
      return true;
    }
    
    return false;
  } catch (error) {
    loggerService.error(`Error processing file: ${filePath}`, error);
    return false;
  }
}

/**
 * Main function to process all MDX files in the blog directory.
 */
async function main(): Promise<void> {
  try {
    const blogDir = path.resolve('src/content/blog');
    loggerService.info(`Searching for MDX files in: ${blogDir}`);
    
    const mdxFiles = findMdxFiles(blogDir);
    loggerService.info(`Found ${mdxFiles.length} MDX files`);
    
    let modifiedCount = 0;
    
    for (const filePath of mdxFiles) {
      loggerService.info(`Processing: ${filePath}`);
      
      if (processFile(filePath)) {
        modifiedCount++;
        loggerService.success(`Fixed image paths in: ${filePath}`);
      } else {
        loggerService.info(`No changes needed for: ${filePath}`);
      }
    }
    
    loggerService.success(`Processed ${mdxFiles.length} files, modified ${modifiedCount} files`);
  } catch (error) {
    const wrappedError = errorService.wrapError(error);
    loggerService.error('An error occurred while processing files', wrappedError);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  const wrappedError = errorService.wrapError(error, 'Fatal error occurred');
  loggerService.error(wrappedError.message, wrappedError.details);
  process.exit(1);
});
