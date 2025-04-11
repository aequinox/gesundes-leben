/**
 * @module transform-blog-frontmatter
 * @description
 * Script to transform blog post frontmatter and convert .md files to .mdx.
 * Uses the ContentFileService and FrontmatterService for file operations
 * following SOLID principles.
 */

import { contentFileService } from "@/services/content/ContentFileService";
import { frontmatterService, type BlogFrontmatter } from "@/services/content/FrontmatterService";
import { handleAsync } from "@/core/errors/handleAsync";

/**
 * Processes a single markdown file by transforming its frontmatter
 * 
 * @param filePath - Path to the markdown file
 * @throws Will log error if frontmatter is missing or processing fails
 */
export async function processMarkdownFile(filePath: string): Promise<void> {
  try {
    const content = await contentFileService.readMarkdownFile<BlogFrontmatter>(filePath);
    
    if (!content.data.title) {
      console.error(`No title found in frontmatter for ${filePath}`);
      return;
    }

    // Transform frontmatter using the service
    const transformed = await frontmatterService.transformBlogFrontmatter(
      content.data,
      content.content
    );

    // Write the transformed content back to the file
    await contentFileService.writeMarkdownFile(
      filePath,
      transformed,
      content.content
    );
    
    console.log(`Successfully processed ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Processes a markdown file and converts it to MDX format
 * 
 * Steps:
 * 1. Transforms frontmatter
 * 2. Converts file extension from .md to .mdx
 * 3. Preserves file content while updating metadata
 * 
 * @param mdPath - Path to the markdown file
 */
export async function processAndRenameFile(mdPath: string): Promise<void> {
  try {
    await processMarkdownFile(mdPath);
    await contentFileService.convertToMdx(mdPath);
    console.log(`Successfully converted ${mdPath} to MDX`);
  } catch (error) {
    console.error(`Error processing and converting file:`, error);
  }
}

/**
 * Main execution function that:
 * 1. Locates all markdown files in the content directory
 * 2. Processes each file to transform frontmatter
 * 3. Converts files to MDX format
 * 
 * @throws Logs any errors encountered during processing
 */
export async function main(): Promise<void> {
  return handleAsync(async () => {
    try {
      const contentDir = contentFileService.getContentDir();
      console.log("Finding index.md files...");
      const markdownFiles = await contentFileService.findIndexMarkdownFiles(contentDir);

      console.log(`Found ${markdownFiles.length} markdown files to process`);

      for (const file of markdownFiles) {
        await processAndRenameFile(file);
      }
      
      console.log("\nDone! All files processed.");
    } catch (error) {
      console.error("Fatal error:", error);
      process.exit(1);
    }
  });
}

// Only run main() if this file is being executed directly
if (require.main === module) {
  main().catch(console.error);
}
