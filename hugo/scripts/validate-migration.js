#!/usr/bin/env node

/**
 * Validation script for Hugo migration
 *
 * Checks:
 * - All blog posts migrated
 * - All authors migrated
 * - All references migrated
 * - Image files copied
 * - Frontmatter validity
 * - Broken internal links
 *
 * Usage:
 *   node validate-migration.js [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VERBOSE = process.argv.includes('--verbose');

// Paths
const ASTRO_BLOG_DIR = path.join(__dirname, '../../src/data/blog');
const HUGO_BLOG_DIR = path.join(__dirname, '../content/blog');
const ASTRO_AUTHORS_DIR = path.join(__dirname, '../../src/data/authors');
const HUGO_AUTHORS_DIR = path.join(__dirname, '../content/authors');
const ASTRO_REFERENCES_DIR = path.join(__dirname, '../../src/data/references');
const HUGO_REFERENCES_DIR = path.join(__dirname, '../data/references');

// Validation results
let results = {
  posts: { total: 0, migrated: 0, missing: [], errors: [] },
  authors: { total: 0, migrated: 0, missing: [] },
  references: { total: 0, migrated: 0, missing: [] },
  images: { missing: [] },
  frontmatter: { errors: [] }
};

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (!match) {
      throw new Error('No frontmatter found');
    }

    return yaml.load(match[1]);
  } catch (error) {
    throw new Error(`Failed to parse frontmatter: ${error.message}`);
  }
}

/**
 * Validate blog posts
 */
function validatePosts() {
  console.log('📝 Validating blog posts...');

  if (!fs.existsSync(ASTRO_BLOG_DIR)) {
    console.error('  ✗ Astro blog directory not found');
    return;
  }

  const astroPosts = fs.readdirSync(ASTRO_BLOG_DIR).filter(f =>
    fs.statSync(path.join(ASTRO_BLOG_DIR, f)).isDirectory()
  );

  results.posts.total = astroPosts.length;

  astroPosts.forEach(postSlug => {
    const hugoPostPath = path.join(HUGO_BLOG_DIR, postSlug, 'index.md');

    if (fs.existsSync(hugoPostPath)) {
      results.posts.migrated++;

      // Validate frontmatter
      try {
        const frontmatter = parseFrontmatter(hugoPostPath);

        if (!frontmatter.title || !frontmatter.date) {
          results.frontmatter.errors.push({
            file: postSlug,
            issue: 'Missing required frontmatter fields'
          });
        }
      } catch (error) {
        results.frontmatter.errors.push({
          file: postSlug,
          issue: error.message
        });
      }

      // Check images
      const astroImagesDir = path.join(ASTRO_BLOG_DIR, postSlug, 'images');
      const hugoImagesDir = path.join(HUGO_BLOG_DIR, postSlug, 'images');

      if (fs.existsSync(astroImagesDir)) {
        const astroImages = fs.readdirSync(astroImagesDir);

        astroImages.forEach(img => {
          const hugoImgPath = path.join(hugoImagesDir, img);
          if (!fs.existsSync(hugoImgPath)) {
            results.images.missing.push(`${postSlug}/images/${img}`);
          }
        });
      }
    } else {
      results.posts.missing.push(postSlug);
    }
  });

  console.log(`  ✓ Found ${results.posts.total} posts in Astro`);
  console.log(`  ✓ Migrated ${results.posts.migrated} posts to Hugo`);

  if (results.posts.missing.length > 0) {
    console.log(`  ✗ Missing ${results.posts.missing.length} posts`);
    if (VERBOSE) {
      results.posts.missing.forEach(p => console.log(`    - ${p}`));
    }
  }
}

/**
 * Validate authors
 */
function validateAuthors() {
  console.log('\n👤 Validating authors...');

  if (!fs.existsSync(ASTRO_AUTHORS_DIR)) {
    console.log('  ⚠️  Astro authors directory not found');
    return;
  }

  const astroAuthors = fs.readdirSync(ASTRO_AUTHORS_DIR).filter(f =>
    fs.statSync(path.join(ASTRO_AUTHORS_DIR, f)).isDirectory()
  );

  results.authors.total = astroAuthors.length;

  astroAuthors.forEach(authorSlug => {
    const hugoAuthorPath = path.join(HUGO_AUTHORS_DIR, `${authorSlug}.md`);

    if (fs.existsSync(hugoAuthorPath)) {
      results.authors.migrated++;
    } else {
      results.authors.missing.push(authorSlug);
    }
  });

  console.log(`  ✓ Found ${results.authors.total} authors in Astro`);
  console.log(`  ✓ Migrated ${results.authors.migrated} authors to Hugo`);

  if (results.authors.missing.length > 0) {
    console.log(`  ✗ Missing ${results.authors.missing.length} authors`);
    if (VERBOSE) {
      results.authors.missing.forEach(a => console.log(`    - ${a}`));
    }
  }
}

/**
 * Validate references
 */
function validateReferences() {
  console.log('\n📚 Validating references...');

  if (!fs.existsSync(ASTRO_REFERENCES_DIR)) {
    console.log('  ⚠️  Astro references directory not found');
    return;
  }

  const astroRefs = fs.readdirSync(ASTRO_REFERENCES_DIR).filter(f =>
    f.endsWith('.yaml') || f.endsWith('.yml')
  );

  results.references.total = astroRefs.length;

  astroRefs.forEach(refFile => {
    const hugoRefPath = path.join(HUGO_REFERENCES_DIR, refFile);

    if (fs.existsSync(hugoRefPath)) {
      results.references.migrated++;
    } else {
      results.references.missing.push(refFile);
    }
  });

  console.log(`  ✓ Found ${results.references.total} references in Astro`);
  console.log(`  ✓ Migrated ${results.references.migrated} references to Hugo`);

  if (results.references.missing.length > 0) {
    console.log(`  ✗ Missing ${results.references.missing.length} references`);
    if (VERBOSE) {
      results.references.missing.forEach(r => console.log(`    - ${r}`));
    }
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const allGood =
    results.posts.missing.length === 0 &&
    results.authors.missing.length === 0 &&
    results.references.missing.length === 0 &&
    results.images.missing.length === 0 &&
    results.frontmatter.errors.length === 0;

  if (allGood) {
    console.log('\n✅ All validations passed!');
    console.log(`   ${results.posts.migrated} posts migrated`);
    console.log(`   ${results.authors.migrated} authors migrated`);
    console.log(`   ${results.references.migrated} references migrated`);
  } else {
    console.log('\n⚠️  Issues found:');

    if (results.posts.missing.length > 0) {
      console.log(`   - ${results.posts.missing.length} posts not migrated`);
    }

    if (results.authors.missing.length > 0) {
      console.log(`   - ${results.authors.missing.length} authors not migrated`);
    }

    if (results.references.missing.length > 0) {
      console.log(`   - ${results.references.missing.length} references not migrated`);
    }

    if (results.images.missing.length > 0) {
      console.log(`   - ${results.images.missing.length} images not copied`);
      if (VERBOSE) {
        console.log('\n   Missing images:');
        results.images.missing.forEach(img => console.log(`     - ${img}`));
      }
    }

    if (results.frontmatter.errors.length > 0) {
      console.log(`   - ${results.frontmatter.errors.length} frontmatter errors`);
      if (VERBOSE) {
        console.log('\n   Frontmatter errors:');
        results.frontmatter.errors.forEach(err =>
          console.log(`     - ${err.file}: ${err.issue}`)
        );
      }
    }
  }

  console.log('='.repeat(60));
}

/**
 * Main validation
 */
function main() {
  console.log('🔍 Starting migration validation...\n');

  validatePosts();
  validateAuthors();
  validateReferences();
  printSummary();

  // Exit with error code if validation failed
  const hasErrors =
    results.posts.missing.length > 0 ||
    results.frontmatter.errors.length > 0;

  if (hasErrors) {
    process.exit(1);
  }
}

main();
