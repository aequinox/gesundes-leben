import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

/**
 * Recursively get all markdown files from a directory
 */
export async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(fullPath));
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Update frontmatter to set draft: true
 */
export async function updateFrontmatter(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data, content: markdown } = matter(content);
    
    // Only modify if draft isn't already true
    if (data.draft !== true) {
      data.draft = true;
      const updatedContent = matter.stringify(markdown, data);
      await fs.writeFile(filePath, updatedContent);
      console.log(`✓ Updated ${path.relative(CONTENT_DIR, filePath)}`);
    } else {
      console.log(`⚡ Skipped ${path.relative(CONTENT_DIR, filePath)} (already draft: true)`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error);
  }
}

// Only run main() if this file is being executed directly
if (require.main === module) {
  (async () => {
    try {
      console.log("Finding markdown files...");
      const files = await getMarkdownFiles(CONTENT_DIR);
      
      console.log(`Found ${files.length} markdown files. Processing...`);
      await Promise.all(files.map(updateFrontmatter));
      
      console.log("\nDone! All files processed.");
    } catch (error) {
      console.error("Fatal error:", error);
      process.exit(1);
    }
  })();
}
