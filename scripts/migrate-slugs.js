#!/usr/bin/env node
/**
 * Slug Migration Script
 * 
 * This script helps migrate from explicit slugs in frontmatter to title-based slugs.
 * It scans all blog posts, generates new slugs based on titles, and creates a mapping
 * of old slugs to new slugs for redirect purposes.
 * 
 * Usage:
 * node scripts/migrate-slugs.js
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const REDIRECTS_FILE = join(__dirname, '..', 'public', '_redirects');

// Slugify function (matching the one in SlugService)
function slugifyStr(str) {
  return slugify(str.trim(), {
    replacement: '-',
    lower: true,
    strict: false,
    locale: 'de',
    trim: true,
  });
}

// Function to recursively get all files in a directory
async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = join(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
}

// Function to extract frontmatter from a markdown file
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Handle quoted values
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

// Main function
async function main() {
  console.log('Starting slug migration...');
  
  // Get all markdown files
  const files = await getFiles(BLOG_DIR);
  const mdxFiles = files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
  
  console.log(`Found ${mdxFiles.length} markdown files`);
  
  // Process each file
  const slugMap = {};
  let hasChanges = false;
  
  for (const file of mdxFiles) {
    const content = await readFile(file, 'utf-8');
    const frontmatter = extractFrontmatter(content);
    
    if (!frontmatter || !frontmatter.title) {
      console.warn(`Warning: Could not extract title from ${file}`);
      continue;
    }
    
    const oldSlug = frontmatter.slug;
    const newSlug = slugifyStr(frontmatter.title);
    
    if (oldSlug && oldSlug !== newSlug) {
      slugMap[oldSlug] = newSlug;
      hasChanges = true;
      console.log(`Mapping: ${oldSlug} -> ${newSlug}`);
    }
  }
  
  // Generate redirects file
  if (hasChanges) {
    let redirectsContent = '# Redirects for migrated slugs\n';
    
    for (const [oldSlug, newSlug] of Object.entries(slugMap)) {
      redirectsContent += `/posts/${oldSlug} /posts/${newSlug} 301\n`;
    }
    
    await writeFile(REDIRECTS_FILE, redirectsContent);
    console.log(`Created redirects file at ${REDIRECTS_FILE}`);
  } else {
    console.log('No slug changes detected');
  }
  
  console.log('Slug migration completed');
}

main().catch(error => {
  console.error('Error during slug migration:', error);
  process.exit(1);
});
