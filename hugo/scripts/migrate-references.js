#!/usr/bin/env node

/**
 * Migrate scientific references from Astro to Hugo
 *
 * Copies YAML reference files from Astro to Hugo data directory
 *
 * Usage:
 *   node migrate-references.js [--dry-run] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ASTRO_REFERENCES_DIR = path.join(__dirname, '../../src/data/references');
const HUGO_REFERENCES_DIR = path.join(__dirname, '../data/references');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

let stats = { total: 0, migrated: 0, errors: 0 };

/**
 * Validate reference YAML structure
 */
function validateReference(refData, filename) {
  const required = ['type', 'title', 'authors', 'year'];
  const missing = required.filter(field => !refData[field]);

  if (missing.length > 0) {
    console.warn(`⚠️  ${filename} missing required fields: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Migrate a single reference file
 */
function migrateReference(refFile) {
  try {
    stats.total++;

    const refName = path.basename(refFile);

    if (VERBOSE) console.log(`Processing reference: ${refName}...`);

    // Read and validate YAML
    const refContent = fs.readFileSync(refFile, 'utf-8');
    const refData = yaml.load(refContent);

    // Validate reference structure
    if (!validateReference(refData, refName)) {
      stats.errors++;
      return;
    }

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would migrate reference: ${refName}`);
    } else {
      // Copy reference file to Hugo data directory
      const hugoRefPath = path.join(HUGO_REFERENCES_DIR, refName);
      fs.copyFileSync(refFile, hugoRefPath);

      console.log(`✓ Migrated reference: ${refName}`);
    }

    stats.migrated++;
  } catch (error) {
    console.error(`✗ Error migrating ${path.basename(refFile)}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Migrating scientific references...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE\n');
  }

  // Create Hugo references directory
  if (!DRY_RUN && !fs.existsSync(HUGO_REFERENCES_DIR)) {
    fs.mkdirSync(HUGO_REFERENCES_DIR, { recursive: true });
  }

  // Check if Astro references directory exists
  if (!fs.existsSync(ASTRO_REFERENCES_DIR)) {
    console.error(`Error: Astro references directory not found: ${ASTRO_REFERENCES_DIR}`);
    process.exit(1);
  }

  // Migrate all reference files
  const files = fs.readdirSync(ASTRO_REFERENCES_DIR);

  files.forEach(file => {
    const filePath = path.join(ASTRO_REFERENCES_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && (file.endsWith('.yaml') || file.endsWith('.yml'))) {
      migrateReference(filePath);
    }
  });

  // Print statistics
  console.log('\n' + '='.repeat(50));
  console.log('📊 Reference Migration Statistics:');
  console.log('='.repeat(50));
  console.log(`Total references:      ${stats.total}`);
  console.log(`Successfully migrated: ${stats.migrated}`);
  console.log(`Errors:                ${stats.errors}`);
  console.log('='.repeat(50));

  if (!DRY_RUN) {
    console.log('\n✅ Reference migration complete!');
  }
}

main();
