import { v4 as uuidv4 } from "uuid";
import { parse, stringify } from "yaml";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { slugifyStr } from "../utils/slugify";
import { CATEGORIES, GROUPS } from "../data/taxonomies";
import type { Category } from "../data/taxonomies";

type Group = (typeof GROUPS)[number];

interface Favorites {
  [key: string]: string;
}

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

async function generateDescription(content: string): Promise<string> {
  // TODO: Implement ChatGPT integration
  // For now, return first 150 characters of content as description
  const plainText = content
    .replace(/---[\s\S]*?---/, "") // Remove frontmatter
    .replace(/[#*`]/g, "") // Remove markdown syntax
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();
  return plainText.slice(0, 150) + "...";
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function validateCategory(category: string): Category | undefined {
  const normalizedCategory = capitalizeFirstLetter(category);
  return CATEGORIES.find(c => c === normalizedCategory);
}

function transformFrontmatter(
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

async function processMarkdownFile(filePath: string) {
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

function findMarkdownFiles(dir: string): string[] {
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

async function processAndRenameFile(mdPath: string) {
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

async function main() {
  const contentDir = join(process.cwd(), "src/content");
  const markdownFiles = findMarkdownFiles(contentDir);

  console.log(`Found ${markdownFiles.length} markdown files to process`);

  for (const file of markdownFiles) {
    await processAndRenameFile(file);
  }
}

main().catch(console.error);
