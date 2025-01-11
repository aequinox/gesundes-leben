/**
 * Blog Frontmatter Transformation Script
 * 
 * This script processes and transforms markdown blog posts by:
 * - Converting .md files to .mdx
 * - Standardizing and validating frontmatter metadata
 * - Generating missing fields (id, slug, description)
 * - Ensuring consistent data structure
 * 
 * @module transform-blog-frontmatter
 */

import { v4 as uuidv4 } from "uuid";
import { parse, stringify } from "yaml";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { GROUPS, type Category, CATEGORIES } from "@/data/taxonomies";
import { slugifyStr } from "@/utils/slugify";

/** Type representing valid group values from GROUPS constant */
type Group = (typeof GROUPS)[number];

/** Interface for managing favorite entries in blog posts */
interface Favorites {
  [key: string]: string;
}

/** 
 * Interface defining the structure of blog post frontmatter
 * Includes both required and optional fields for maximum flexibility
 */
interface BlogFrontmatter {
  id?: string;
  title: string;
  author?: string;
  slug?: string;
  description?: string;
  heroImage?: {
    src: string;
    alt: string;
  };
  coverImage?: string;
  pubDatetime?: string;
  modDatetime?: string;
  date?: string;
  draft?: boolean;
  featured?: boolean;
  group?: Group;
  categories?: Category[];
  tags?: string[];
  favorites?: Favorites;
}

/**
 * Generates a description for blog posts by extracting and processing content
 * 
 * @param content - The full content of the blog post including frontmatter
 * @returns A promise resolving to a generated description string
 * @todo Implement ChatGPT integration for more intelligent description generation
 */
export async function generateDescription(content: string): Promise<string> {
  // TODO: Implement ChatGPT integration
  // For now, return first 150 characters of content as description
  const plainText = content
    .replace(/---[\s\S]*?---/, "") // Remove frontmatter
    .replace(/[#*`]/g, "") // Remove markdown syntax
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();
  return plainText.slice(0, 150) + "...";
}

/**
 * Utility function to capitalize the first letter of a string
 * Used for normalizing category names
 * 
 * @param str - Input string to capitalize
 * @returns String with first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Validates and normalizes category names against predefined list
 * 
 * @param category - Category string to validate
 * @returns Valid Category type or undefined if invalid
 */
export function validateCategory(category: string): Category | undefined {
  const normalizedCategory = capitalizeFirstLetter(category);
  return CATEGORIES.find(c => c === normalizedCategory);
}

/**
 * Transforms blog post frontmatter to ensure consistent structure and required fields
 * 
 * Key transformations:
 * - Generates missing IDs using UUID
 * - Creates URL-friendly slugs from titles
 * - Validates and normalizes categories
 * - Converts date formats to ISO strings
 * - Sets default values for required fields
 * 
 * @param frontmatter - Original frontmatter object
 * @param content - Full blog post content
 * @returns Transformed frontmatter object
 */
export function transformFrontmatter(
  frontmatter: BlogFrontmatter,
  content: string
): BlogFrontmatter {
  // Process categories
  const rawCategories = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : frontmatter.categories
      ? [frontmatter.categories]
      : [];

  const validCategories = rawCategories
    .map(validateCategory)
    .filter((cat): cat is Category => cat !== undefined);

  const transformed: BlogFrontmatter = {
    id: frontmatter.id || uuidv4(),
    title: frontmatter.title,
    author: "sandra-pfeiffer",
    slug: slugifyStr(frontmatter.title),
    description: "", // Will be updated by ChatGPT
    heroImage: frontmatter.coverImage
      ? {
          src: `./images/${frontmatter.coverImage}`,
          alt: frontmatter.title,
        }
      : undefined,
    pubDatetime: frontmatter.date
      ? new Date(frontmatter.date).toISOString()
      : new Date().toISOString(),
    modDatetime: frontmatter.date
      ? new Date(frontmatter.date).toISOString()
      : new Date().toISOString(),
    draft: true,
    featured: false,
    group: "fragezeiten",
    categories: validCategories,
    tags: Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : frontmatter.tags
        ? [frontmatter.tags]
        : [],
    favorites: {},
  };

  // Remove old fields
  delete transformed.coverImage;
  delete transformed.date;

  return transformed;
}

/**
 * Processes a single markdown file by transforming its frontmatter
 * 
 * @param filePath - Path to the markdown file
 * @throws Will log error if frontmatter is missing or processing fails
 */
export async function processMarkdownFile(filePath: string): Promise<void> {
  try {
    const content = readFileSync(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      console.error(`No frontmatter found in ${filePath}`);
      return;
    }

    const frontmatter = parse(frontmatterMatch[1]) as BlogFrontmatter;
    const transformed = transformFrontmatter(frontmatter, content);

    // Generate description using content
    transformed.description = await generateDescription(content);

    // Replace old frontmatter with new
    const newContent = content.replace(
      /^---\n[\s\S]*?\n---/,
      `---\n${stringify(transformed)}---`
    );

    writeFileSync(filePath, newContent);
    console.log(`Successfully processed ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively finds all index.md files in the given directory
 * 
 * @param dir - Directory to search in
 * @returns Array of paths to markdown files
 */
export function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.name === "index.md") {
      files.push(fullPath);
    }
  }

  return files;
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
  const mdxPath = mdPath.replace(/\.md$/, ".mdx");

  await processMarkdownFile(mdPath);

  // Rename file from .md to .mdx
  try {
    writeFileSync(mdxPath, readFileSync(mdPath));
    unlinkSync(mdPath);
    console.log(`Successfully renamed ${mdPath} to ${mdxPath}`);
  } catch (error) {
    console.error(`Error renaming file:`, error);
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
async function main(): Promise<void> {
  const contentDir = join(process.cwd(), "src/content");
  const markdownFiles = findMarkdownFiles(contentDir);

  console.log(`Found ${markdownFiles.length} markdown files to process`);

  for (const file of markdownFiles) {
    await processAndRenameFile(file);
  }
}

main().catch(console.error);
