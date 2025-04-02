/**
 * @module set-drafts
 * @description
 * Script to set all markdown files in the content directory to draft: true.
 * Uses the ContentFileService for file operations following SOLID principles.
 */

import path from "path";
import { contentFileService } from "@/services/content/ContentFileService";
import { handleAsync } from "@/core/errors/handleAsync";

/**
 * Update frontmatter to set draft: true
 */
export async function updateFrontmatter(filePath: string): Promise<void> {
  try {
    const contentDir = contentFileService.getContentDir();
    const relativePath = path.relative(contentDir, filePath);
    
    const updated = await contentFileService.updateFrontmatter(filePath, (data) => {
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
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
  }
}

/**
 * Main function to process all markdown files
 */
export async function main(): Promise<void> {
  return handleAsync(async () => {
    try {
      const contentDir = contentFileService.getContentDir();
      console.log("Finding markdown files...");
      const files = await contentFileService.findMarkdownFiles(contentDir);
      
      console.log(`Found ${files.length} markdown files. Processing...`);
      await Promise.all(files.map(updateFrontmatter));
      
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
