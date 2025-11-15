#!/usr/bin/env node

/**
 * Migrate author profiles from Astro to Hugo
 *
 * Usage:
 *   node migrate-authors.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ASTRO_AUTHORS_DIR = path.join(__dirname, '../../src/data/authors');
const HUGO_AUTHORS_DIR = path.join(__dirname, '../content/authors');
const STATIC_IMAGES_DIR = path.join(__dirname, '../static/images/authors');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

let stats = { total: 0, migrated: 0, errors: 0 };

/**
 * Parse markdown file to extract frontmatter
 */
function parseMarkdown(fileContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: '' };
  }

  const frontmatter = yaml.load(match[1]);
  const content = match[2];

  return { frontmatter, content };
}

/**
 * Convert Astro author frontmatter to Hugo format
 */
function convertAuthorFrontmatter(astroFrontmatter, authorSlug) {
  return {
    title: astroFrontmatter.name || '',
    type: 'author',
    date: new Date().toISOString(),
    draft: false,
    bio: astroFrontmatter.bio || '',
    avatar: `/images/authors/${authorSlug}.jpg`,
    email: astroFrontmatter.email || '',
    website: astroFrontmatter.website || '',
    social: astroFrontmatter.social || {},
    expertise: astroFrontmatter.expertise || [],
    credentials: astroFrontmatter.credentials || []
  };
}

/**
 * Migrate a single author
 */
function migrateAuthor(authorDir) {
  try {
    stats.total++;

    const authorSlug = path.basename(authorDir);
    const astroIndexPath = path.join(authorDir, 'index.md');

    if (!fs.existsSync(astroIndexPath)) {
      console.warn(`⚠️  Skipping ${authorSlug}: index.md not found`);
      return;
    }

    if (VERBOSE) console.log(`Processing author: ${authorSlug}...`);

    // Read Astro author file
    const astroContent = fs.readFileSync(astroIndexPath, 'utf-8');
    const { frontmatter, content } = parseMarkdown(astroContent);

    // Convert frontmatter
    const hugoFrontmatter = convertAuthorFrontmatter(frontmatter, authorSlug);

    // Generate Hugo markdown
    const yamlFrontmatter = yaml.dump(hugoFrontmatter, {
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: true
    });

    const hugoMarkdown = `---\n${yamlFrontmatter}---\n\n${content.trim()}\n`;

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would migrate author: ${authorSlug}`);
    } else {
      // Create Hugo author file
      const hugoAuthorPath = path.join(HUGO_AUTHORS_DIR, `${authorSlug}.md`);
      fs.writeFileSync(hugoAuthorPath, hugoMarkdown);

      // Copy avatar image if exists
      const astroAvatarPath = path.join(authorDir, 'avatar.jpg');
      const hugoAvatarPath = path.join(STATIC_IMAGES_DIR, `${authorSlug}.jpg`);

      if (fs.existsSync(astroAvatarPath)) {
        if (!fs.existsSync(STATIC_IMAGES_DIR)) {
          fs.mkdirSync(STATIC_IMAGES_DIR, { recursive: true });
        }
        fs.copyFileSync(astroAvatarPath, hugoAvatarPath);
      }

      console.log(`✓ Migrated author: ${authorSlug}`);
    }

    stats.migrated++;
  } catch (error) {
    console.error(`✗ Error migrating ${path.basename(authorDir)}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Migrating author profiles...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE\n');
  }

  // Create directories
  if (!DRY_RUN) {
    if (!fs.existsSync(HUGO_AUTHORS_DIR)) {
      fs.mkdirSync(HUGO_AUTHORS_DIR, { recursive: true });
    }
    if (!fs.existsSync(STATIC_IMAGES_DIR)) {
      fs.mkdirSync(STATIC_IMAGES_DIR, { recursive: true });
    }
  }

  // Migrate all authors
  if (fs.existsSync(ASTRO_AUTHORS_DIR)) {
    const authors = fs.readdirSync(ASTRO_AUTHORS_DIR);

    authors.forEach(author => {
      const authorPath = path.join(ASTRO_AUTHORS_DIR, author);
      const stat = fs.statSync(authorPath);

      if (stat.isDirectory()) {
        migrateAuthor(authorPath);
      }
    });
  } else {
    console.error(`Error: Astro authors directory not found: ${ASTRO_AUTHORS_DIR}`);
    process.exit(1);
  }

  // Print statistics
  console.log('\n' + '='.repeat(50));
  console.log('📊 Author Migration Statistics:');
  console.log('='.repeat(50));
  console.log(`Total authors:         ${stats.total}`);
  console.log(`Successfully migrated: ${stats.migrated}`);
  console.log(`Errors:                ${stats.errors}`);
  console.log('='.repeat(50));

  if (!DRY_RUN) {
    console.log('\n✅ Author migration complete!');
  }
}

main();
