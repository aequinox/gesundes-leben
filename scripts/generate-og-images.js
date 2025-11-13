import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Resvg } from '@resvg/resvg-js';

// Import the OG templates (we'll need to adapt these)
const OUTPUT_DIR = 'public/og';
const CACHE_FILE = 'public/og/.cache.json';

/**
 * Recursively find all blog post files
 */
async function findBlogPosts(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findBlogPosts(fullPath)));
    } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate a content hash for a post to detect changes
 */
function generateContentHash(post) {
  const relevantContent = JSON.stringify({
    title: post.data.title,
    description: post.data.description,
    pubDatetime: post.data.pubDatetime,
    author: post.data.author,
    category: post.data.category,
  });
  return crypto.createHash('sha256').update(relevantContent).digest('hex');
}

/**
 * Load the cache manifest
 */
async function loadCache() {
  try {
    const content = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { images: {}, version: 1 };
  }
}

/**
 * Save the cache manifest
 */
async function saveCache(cache) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Check if OG image needs regeneration
 */
async function needsRegeneration(slug, contentHash) {
  const cache = await loadCache();
  const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

  // Check if file exists
  try {
    await fs.access(outputPath);
  } catch {
    return true; // File doesn't exist
  }

  // Check if content hash matches
  if (!cache.images[slug] || cache.images[slug] !== contentHash) {
    return true; // Content changed
  }

  return false;
}

/**
 * Generate OG image for a post
 */
async function generateOgImage(post, slug, config) {
  console.log(`  Generating: ${slug}`);

  // Import the template dynamically with Node.js compatible paths
  const templatePath = new URL('../src/utils/og-templates/post-node.js', import.meta.url);
  const { default: postOgImage } = await import(templatePath);

  // Generate SVG
  const svg = await postOgImage(post, config);

  // Convert to PNG
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Save to disk
  const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
  await fs.writeFile(outputPath, pngBuffer);

  return pngBuffer.length;
}

/**
 * Process all posts and generate OG images
 */
async function processOgImages() {
  console.log('🖼️  Processing OG Images with Smart Caching\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Load configuration
  const configPath = new URL('../src/config.ts', import.meta.url);
  const configModule = await import(configPath);
  const config = {
    SITE: configModule.SITE,
  };

  // Load cache
  const cache = await loadCache();

  // Find all blog post files
  const postFiles = await findBlogPosts('src/data/blog');
  console.log(`Found ${postFiles.length} blog posts\n`);

  let generated = 0;
  let cached = 0;
  let totalSize = 0;

  for (const postFile of postFiles) {
    // Extract slug from file path
    // Blog posts are in format: src/data/blog/YYYY-MM-DD-slug/index.mdx
    // We need to extract the directory name and strip the date prefix
    // to match Astro's getPostSlug() behavior
    const relativePath = postFile.replace('src/data/blog/', '').replace(/\.(md|mdx)$/, '');
    const pathParts = relativePath.split('/');
    const dirName = pathParts.length > 1 ? pathParts[0] : relativePath;

    // Strip date prefix (YYYY-MM-DD-) to match getPostSlug()
    const slug = dirName.replace(/^\d{4}-\d{2}-\d{2}-/, '');

    // Read post frontmatter (simplified - in real scenario use proper parser)
    const content = await fs.readFile(postFile, 'utf-8');

    // Parse frontmatter (basic implementation)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.log(`  ⚠️  Skipping ${slug}: No frontmatter found`);
      continue;
    }

    // Create a simple post object (in production, use proper YAML parser)
    const post = {
      data: {
        title: extractField(frontmatterMatch[1], 'title'),
        description: extractField(frontmatterMatch[1], 'description'),
        pubDatetime: extractField(frontmatterMatch[1], 'pubDatetime'),
        author: extractField(frontmatterMatch[1], 'author') || 'kai-renner',
        category: extractField(frontmatterMatch[1], 'category') || 'Gesundheit',
        group: extractField(frontmatterMatch[1], 'group') || '',
        categories: extractArrayField(frontmatterMatch[1], 'categories'),
      },
    };

    // Skip if has custom OG image
    const ogImage = extractField(frontmatterMatch[1], 'ogImage');
    if (ogImage) {
      console.log(`  ⏭️  Skipping ${slug}: Has custom OG image`);
      continue;
    }

    // Generate content hash
    const contentHash = generateContentHash(post);

    // Check if regeneration needed
    if (await needsRegeneration(slug, contentHash)) {
      const size = await generateOgImage(post, slug, config);
      cache.images[slug] = contentHash;
      generated++;
      totalSize += size;
    } else {
      console.log(`  ✓ Cached: ${slug}`);
      cached++;
    }
  }

  // Save cache
  await saveCache(cache);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Generated: ${generated} images`);
  console.log(`   Cached: ${cached} images`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Cache file: ${CACHE_FILE}`);
  console.log('\n✅ OG images processed successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Commit the generated images: git add public/og/');
  console.log('   2. Set dynamicOgImage: true in src/config.ts');
  console.log('   3. Images will be served from public/og/ instead of generated at runtime');
}

/**
 * Simple field extractor from YAML frontmatter
 */
function extractField(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`${field}:\\s*["']?([^"'\\n]+)["']?`));
  return match ? match[1].trim() : null;
}

/**
 * Extract array field from YAML frontmatter
 */
function extractArrayField(frontmatter, field) {
  const arrayRegex = new RegExp(`${field}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, 'm');
  const match = frontmatter.match(arrayRegex);

  if (!match) {
    return [];
  }

  // Extract array items (lines starting with "  - ")
  const items = match[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);

  return items;
}

// Run the script
processOgImages().catch(error => {
  console.error('❌ Error processing OG images:', error);
  process.exit(1);
});
