#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { loggerService } from './src/services/logger/LoggerService';
import { errorService } from './src/services/error/ErrorService';
import { frontmatterService } from './src/services/content/FrontmatterService';

/**
 * Fixes missing heroImage fields in blog posts.
 * This script specifically addresses the error:
 * "[InvalidContentEntryDataError] blog → superfrucht-avocado data does not match collection schema.
 * heroImage: Required"
 */

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
 * Main function to process all MDX files in the blog directory.
 */
async function main(): Promise<void> {
  try {
    const blogDir = path.resolve('src/content/blog');
    loggerService.info(`Searching for MDX files in: ${blogDir}`);
    
    const mdxFiles = findMdxFiles(blogDir);
    loggerService.info(`Found ${mdxFiles.length} MDX files`);
    
    let modifiedCount = 0;
    let errorCount = 0;
    
    for (const filePath of mdxFiles) {
      loggerService.info(`Processing: ${filePath}`);
      
      try {
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract frontmatter
        const frontmatter = frontmatterService.extractFrontmatter(content);
        
        // Validate frontmatter
        const errors = frontmatterService.validateFrontmatter(frontmatter, ['heroImage']);
        
        if (errors.length > 0) {
          loggerService.warn(`Validation errors in ${filePath}: ${errors.join(', ')}`);
          
          // Try to fix missing heroImage
          if (frontmatterService.ensureHeroImage(filePath)) {
            modifiedCount++;
          } else {
            // If no image is available, create a default heroImage
            if (!frontmatter.heroImage) {
              // Create images directory if it doesn't exist
              const imagesDir = path.join(path.dirname(filePath), 'images');
              if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
              }
              
              // Copy a default image if needed
              const defaultImagePath = path.resolve('public/images/default-hero.svg');
              const targetImagePath = path.join(imagesDir, 'default-hero.svg');
              
              if (fs.existsSync(defaultImagePath) && !fs.existsSync(targetImagePath)) {
                fs.copyFileSync(defaultImagePath, targetImagePath);
                loggerService.info(`Copied default hero image to ${targetImagePath}`);
              }
              
              // Add heroImage to frontmatter
              frontmatter.heroImage = {
                src: './images/default-hero.svg',
                alt: frontmatter.title || '',
              };
              
              // Update the file with new frontmatter
              const updatedContent = frontmatterService.updateFrontmatter(content, frontmatter);
              fs.writeFileSync(filePath, updatedContent, 'utf8');
              
              loggerService.success(`Added default heroImage to ${filePath}`);
              modifiedCount++;
            }
          }
        }
      } catch (error) {
        loggerService.error(`Error processing file: ${filePath}`, error);
        errorCount++;
      }
    }
    
    loggerService.success(`Processed ${mdxFiles.length} files, modified ${modifiedCount} files, encountered ${errorCount} errors`);
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
