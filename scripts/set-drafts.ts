/**
 * @module set-drafts
 * @description
 * Script to set all markdown files in the content directory to draft: true.
 * Uses the ContentFileService for file operations following SOLID principles.
 */

import path from "path";
import { contentFileService } from "@/services/content/ContentFileService";
import type { IContentFileService } from "@/services/content/ContentFileService";
import { handleAsync } from "@/core/errors/handleAsync";

/**
 * Update frontmatter to set draft: true
 * @param filePath Path to the markdown file
 * @param contentFileServiceInstance Optional ContentFileService instance for testing
 * @returns Promise<boolean> indicating if the file was updated
 */
export async function updateFrontmatter(
  filePath: string,
  contentFileServiceInstance: IContentFileService = contentFileService
): Promise<boolean> {
  try {
    const contentDir = contentFileServiceInstance.getContentDir();
    const relativePath = path.relative(contentDir, filePath);
    
    // Use the ContentFileService to update the frontmatter
    const updated = await contentFileServiceInstance.updateFrontmatter(filePath, (data) => {
      // Only modify if draft isn't already true
      if (data.draft !== true) {
        return { ...data, draft: true };
      }
      return data;
    });
    
    if (updated) {
      console.log(`✓ Updated ${relativePath}`);
    } else {
      console.log(`⚡ Skipped ${relativePath} (already draft: true)`);
    }
    
    return updated;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to process all markdown files
 * @param contentFileServiceInstance Optional ContentFileService instance for testing
 */
export async function main(
  contentFileServiceInstance: IContentFileService = contentFileService
): Promise<void> {
  return handleAsync(async () => {
    try {
      const contentDir = contentFileServiceInstance.getContentDir();
      console.log("Finding markdown files...");
      const files = await contentFileServiceInstance.findMarkdownFiles(contentDir);
      
      console.log(`Found ${files.length} markdown files. Processing...`);
      await Promise.all(files.map(file => updateFrontmatter(file, contentFileServiceInstance)));
      
      console.log("\nDone! All files processed.");
    } catch (error) {
      console.error("Fatal error:", error);
      process.exit(1);
    }
  });
}

// Only run main() if this file is being executed directly
if (require.main === module) {
  main();
}
