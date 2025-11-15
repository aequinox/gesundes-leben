#!/usr/bin/env node

/**
 * Astro to Hugo Content Migration Script
 *
 * This script migrates content from the Astro blog to Hugo format:
 * - Converts frontmatter from Astro to Hugo format
 * - Transforms Astro component syntax to Hugo shortcodes
 * - Preserves images and file structure
 * - Validates migration results
 *
 * Usage:
 *   node migrate-content.js [options]
 *
 * Options:
 *   --dry-run    Show what would be migrated without making changes
 *   --verbose    Show detailed output
 *   --single <path>  Migrate a single post
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const ASTRO_BLOG_DIR = path.join(__dirname, '../../src/data/blog');
const HUGO_BLOG_DIR = path.join(__dirname, '../content/blog');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SINGLE_POST = process.argv.includes('--single')
  ? process.argv[process.argv.indexOf('--single') + 1]
  : null;

// Statistics
let stats = {
  total: 0,
  migrated: 0,
  errors: 0,
  warnings: []
};

/**
 * Convert Astro frontmatter to Hugo format
 */
function convertFrontmatter(astroFrontmatter) {
  const hugoFrontmatter = {
    title: astroFrontmatter.title || '',
    date: astroFrontmatter.pubDatetime || new Date().toISOString(),
    lastmod: astroFrontmatter.modDatetime || astroFrontmatter.pubDatetime || new Date().toISOString(),
    draft: astroFrontmatter.draft || false,
    author: astroFrontmatter.author || 'kai-renner',
    description: astroFrontmatter.description || '',
    keywords: astroFrontmatter.keywords || [],
    categories: astroFrontmatter.categories || [],
    tags: astroFrontmatter.tags || [],
    featured: astroFrontmatter.featured || false,
  };

  // Add custom params
  hugoFrontmatter.params = {
    group: astroFrontmatter.group || 'basic',
    references: astroFrontmatter.references || []
  };

  // Convert hero image path
  if (astroFrontmatter.heroImage) {
    if (typeof astroFrontmatter.heroImage === 'string') {
      hugoFrontmatter.params.heroImage = astroFrontmatter.heroImage.replace('./images/', 'images/');
    } else if (astroFrontmatter.heroImage.src) {
      hugoFrontmatter.params.heroImage = astroFrontmatter.heroImage.src.replace('./images/', 'images/');
      hugoFrontmatter.params.heroImageAlt = astroFrontmatter.heroImage.alt || '';
    }
  }

  return hugoFrontmatter;
}

/**
 * Convert Astro component syntax to Hugo shortcodes
 */
function convertComponentsToShortcodes(content) {
  let converted = content;

  // Remove import statements
  converted = converted.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');

  // Convert Image component
  // <Image src={image} alt="..." /> -> {{< image src="..." alt="..." >}}
  converted = converted.replace(
    /<Image\s+([^>]*?)\/>/g,
    (match, attrs) => {
      const src = attrs.match(/src=\{([^}]+)\}|src="([^"]+)"/);
      const alt = attrs.match(/alt="([^"]+)"/);
      const position = attrs.match(/position="([^"]+)"/);
      const title = attrs.match(/title="([^"]+)"/);
      const invert = attrs.match(/invert=\{([^}]+)\}/);

      let shortcode = '{{< image';
      if (src) shortcode += ` src="${src[1] || src[2]}"`;
      if (alt) shortcode += ` alt="${alt[1]}"`;
      if (position) shortcode += ` position="${position[1]}"`;
      if (title) shortcode += ` title="${title[1]}"`;
      if (invert) shortcode += ` invert="${invert[1]}"`;
      shortcode += ' >}}';

      return shortcode;
    }
  );

  // Convert FeaturedList component
  // <FeaturedList>...</FeaturedList> -> {{< featured-list >}}...{{< /featured-list >}}
  converted = converted.replace(
    /<FeaturedList([^>]*)>([\s\S]*?)<\/FeaturedList>/g,
    (match, attrs, content) => {
      return `{{< featured-list >}}\n${content.trim()}\n{{< /featured-list >}}`;
    }
  );

  // Convert Blockquote component
  // <Blockquote author="...">...</Blockquote> -> {{< blockquote author="..." >}}...{{< /blockquote >}}
  converted = converted.replace(
    /<Blockquote\s+([^>]*?)>([\s\S]*?)<\/Blockquote>/g,
    (match, attrs, content) => {
      const author = attrs.match(/author="([^"]+)"/);
      const type = attrs.match(/type="([^"]+)"/);

      let shortcode = '{{< blockquote';
      if (author) shortcode += ` author="${author[1]}"`;
      if (type) shortcode += ` type="${type[1]}"`;
      else shortcode += ' type="tip"';  // Default for Therapeuten Tipp
      shortcode += ' >}}\n';
      shortcode += content.trim();
      shortcode += '\n{{< /blockquote >}}';

      return shortcode;
    }
  );

  // Convert Accordion component
  // <Accordion title="...">...</Accordion> -> {{< accordion title="..." >}}...{{< /accordion >}}
  converted = converted.replace(
    /<Accordion\s+([^>]*?)>([\s\S]*?)<\/Accordion>/g,
    (match, attrs, content) => {
      const title = attrs.match(/title="([^"]+)"/);
      const open = attrs.match(/open=\{([^}]+)\}/);

      let shortcode = '{{< accordion';
      if (title) shortcode += ` title="${title[1]}"`;
      if (open) shortcode += ` open="${open[1]}"`;
      shortcode += ' >}}\n';
      shortcode += content.trim();
      shortcode += '\n{{< /accordion >}}';

      return shortcode;
    }
  );

  // Convert List component
  // <List>...</List> -> {{< list >}}...{{< /list >}}
  converted = converted.replace(
    /<List([^>]*)>([\s\S]*?)<\/List>/g,
    (match, attrs, content) => {
      return `{{< list >}}\n${content.trim()}\n{{< /list >}}`;
    }
  );

  // Remove any remaining JSX-style attributes
  converted = converted.replace(/className=/g, 'class=');

  return converted;
}

/**
 * Parse MDX file to extract frontmatter and content
 */
function parseMDX(fileContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in file');
  }

  const frontmatter = yaml.load(match[1]);
  const content = match[2];

  return { frontmatter, content };
}

/**
 * Generate Hugo markdown file
 */
function generateHugoMarkdown(frontmatter, content) {
  const yamlFrontmatter = yaml.dump(frontmatter, {
    lineWidth: -1,  // Don't wrap lines
    quotingType: '"',  // Use double quotes
    noRefs: true  // Don't use YAML references
  });

  return `---\n${yamlFrontmatter}---\n\n${content}`;
}

/**
 * Migrate a single blog post
 */
function migratePost(astroPostDir) {
  try {
    stats.total++;

    const postName = path.basename(astroPostDir);
    const astroIndexPath = path.join(astroPostDir, 'index.mdx');

    if (!fs.existsSync(astroIndexPath)) {
      console.warn(`⚠️  Skipping ${postName}: index.mdx not found`);
      stats.warnings.push(`${postName}: index.mdx not found`);
      return;
    }

    if (VERBOSE) console.log(`Processing ${postName}...`);

    // Read Astro MDX file
    const astroContent = fs.readFileSync(astroIndexPath, 'utf-8');

    // Parse frontmatter and content
    const { frontmatter: astroFrontmatter, content: astroBody } = parseMDX(astroContent);

    // Convert frontmatter
    const hugoFrontmatter = convertFrontmatter(astroFrontmatter);

    // Convert components to shortcodes
    const hugoBody = convertComponentsToShortcodes(astroBody);

    // Generate Hugo markdown
    const hugoMarkdown = generateHugoMarkdown(hugoFrontmatter, hugoBody);

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would migrate: ${postName}`);
      if (VERBOSE) {
        console.log('---');
        console.log(hugoMarkdown.substring(0, 500));
        console.log('...\n');
      }
    } else {
      // Create Hugo post directory
      const hugoPostDir = path.join(HUGO_BLOG_DIR, postName);
      if (!fs.existsSync(hugoPostDir)) {
        fs.mkdirSync(hugoPostDir, { recursive: true });
      }

      // Write Hugo markdown file
      const hugoIndexPath = path.join(hugoPostDir, 'index.md');
      fs.writeFileSync(hugoIndexPath, hugoMarkdown);

      // Copy images directory if exists
      const astroImagesDir = path.join(astroPostDir, 'images');
      const hugoImagesDir = path.join(hugoPostDir, 'images');

      if (fs.existsSync(astroImagesDir)) {
        if (!fs.existsSync(hugoImagesDir)) {
          fs.mkdirSync(hugoImagesDir, { recursive: true });
        }

        // Copy all images
        const images = fs.readdirSync(astroImagesDir);
        images.forEach(image => {
          fs.copyFileSync(
            path.join(astroImagesDir, image),
            path.join(hugoImagesDir, image)
          );
        });
      }

      console.log(`✓ Migrated: ${postName}`);
    }

    stats.migrated++;
  } catch (error) {
    console.error(`✗ Error migrating ${path.basename(astroPostDir)}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Starting Astro to Hugo migration...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  // Create Hugo blog directory if it doesn't exist
  if (!DRY_RUN && !fs.existsSync(HUGO_BLOG_DIR)) {
    fs.mkdirSync(HUGO_BLOG_DIR, { recursive: true });
  }

  if (SINGLE_POST) {
    // Migrate single post
    const postPath = path.join(ASTRO_BLOG_DIR, SINGLE_POST);
    if (!fs.existsSync(postPath)) {
      console.error(`Error: Post not found: ${postPath}`);
      process.exit(1);
    }
    migratePost(postPath);
  } else {
    // Migrate all posts
    const posts = fs.readdirSync(ASTRO_BLOG_DIR);

    posts.forEach(post => {
      const postPath = path.join(ASTRO_BLOG_DIR, post);
      const stat = fs.statSync(postPath);

      if (stat.isDirectory()) {
        migratePost(postPath);
      }
    });
  }

  // Print statistics
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Statistics:');
  console.log('='.repeat(50));
  console.log(`Total posts found:     ${stats.total}`);
  console.log(`Successfully migrated: ${stats.migrated}`);
  console.log(`Errors:                ${stats.errors}`);
  console.log(`Warnings:              ${stats.warnings.length}`);

  if (stats.warnings.length > 0 && VERBOSE) {
    console.log('\nWarnings:');
    stats.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  console.log('='.repeat(50));

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to perform actual migration');
  } else {
    console.log('\n✅ Migration complete!');
  }
}

// Check if yaml module is available
try {
  require.resolve('js-yaml');
} catch (e) {
  console.error('Error: js-yaml module not found.');
  console.error('Please install it with: npm install js-yaml');
  process.exit(1);
}

// Run migration
main();
