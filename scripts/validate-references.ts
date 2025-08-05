#!/usr/bin/env bun

/**
 * Reference validation script
 * Validates reference files and detects duplicates
 */

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { parse } from "yaml";

import {
  validateReferenceData,
  findDuplicateReferences,
  type ReferenceData,
  type ValidationError,
} from "../src/utils/references";

interface FileValidationResult {
  fileName: string;
  id: string;
  valid: boolean;
  errors: ValidationError[];
  data?: ReferenceData;
}

interface ValidationSummary {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  duplicateGroups: number;
  totalDuplicates: number;
}

const REFERENCES_DIR = join(process.cwd(), "src/data/references");

async function validateAllReferences(): Promise<{
  fileResults: FileValidationResult[];
  duplicates: Array<{ references: unknown[]; reason: string }>;
  summary: ValidationSummary;
}> {
  console.log("🔍 Validating reference files...\n");

  if (!existsSync(REFERENCES_DIR)) {
    console.error(`❌ References directory not found: ${REFERENCES_DIR}`);
    process.exit(1);
  }

  // Get all YAML files
  const files = (await readdir(REFERENCES_DIR)).filter(
    file => file.endsWith(".yaml") || file.endsWith(".yml")
  );

  console.log(`📁 Found ${files.length} reference files\n`);

  const fileResults: FileValidationResult[] = [];

  // Validate each file
  for (const fileName of files) {
    const filePath = join(REFERENCES_DIR, fileName);
    const id = fileName.replace(/\.(yaml|yml)$/, "");

    try {
      const content = await readFile(filePath, "utf8");
      const data = parse(content) as ReferenceData;

      const errors = validateReferenceData(data);
      const valid = errors.length === 0;

      fileResults.push({
        fileName,
        id,
        valid,
        errors,
        data: valid ? data : undefined,
      });

    } catch (error) {
      fileResults.push({
        fileName,
        id,
        valid: false,
        errors: [{
          field: "file",
          message: `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`
        }],
      });
    }
  }

  // Find duplicates
  console.log("🔍 Checking for duplicates...\n");
  const duplicates = await findDuplicateReferences();

  // Generate summary
  const validFiles = fileResults.filter(r => r.valid).length;
  const invalidFiles = fileResults.length - validFiles;
  const totalDuplicates = duplicates.reduce((sum, group) => sum + group.references.length, 0);

  const summary: ValidationSummary = {
    totalFiles: fileResults.length,
    validFiles,
    invalidFiles,
    duplicateGroups: duplicates.length,
    totalDuplicates,
  };

  return { fileResults, duplicates, summary };
}

function displayResults(results: {
  fileResults: FileValidationResult[];
  duplicates: Array<{ references: unknown[]; reason: string }>;
  summary: ValidationSummary;
}) {
  const { fileResults, duplicates, summary } = results;

  // Display invalid files
  const invalidFiles = fileResults.filter(r => !r.valid);
  if (invalidFiles.length > 0) {
    console.log("❌ VALIDATION ERRORS:\n");
    invalidFiles.forEach(file => {
      console.log(`📄 ${file.fileName} (${file.id}):`);
      file.errors.forEach(error => {
        console.log(`   • ${error.field}: ${error.message}`);
      });
      console.log("");
    });
  }

  // Display duplicates
  if (duplicates.length > 0) {
    console.log("🔁 POTENTIAL DUPLICATES:\n");
    duplicates.forEach((group, index) => {
      console.log(`Group ${index + 1}: ${group.reason}`);
      group.references.forEach(ref => {
        console.log(`   • ${ref.id}: "${ref.title}" (${ref.year})`);
      });
      console.log("");
    });
  }

  // Display summary
  console.log("📊 VALIDATION SUMMARY:");
  console.log(`   📁 Total files: ${summary.totalFiles}`);
  console.log(`   ✅ Valid files: ${summary.validFiles}`);
  console.log(`   ❌ Invalid files: ${summary.invalidFiles}`);
  console.log(`   🔁 Duplicate groups: ${summary.duplicateGroups}`);
  console.log(`   📑 Total duplicates: ${summary.totalDuplicates}`);

  if (summary.invalidFiles === 0 && summary.duplicateGroups === 0) {
    console.log("\n🎉 All references are valid and no duplicates found!");
    return true;
  } else {
    console.log("\n⚠️  Issues found. Please review and fix the problems above.");
    return false;
  }
}

async function analyzeReferenceTypes(): Promise<void> {
  console.log("\n📈 REFERENCE ANALYSIS:\n");

  try {
    const files = (await readdir(REFERENCES_DIR)).filter(
      file => file.endsWith(".yaml") || file.endsWith(".yml")
    );

    const typeStats = new Map<string, number>();
    const yearStats = new Map<number, number>();
    const keywordStats = new Map<string, number>();
    let totalKeywords = 0;

    for (const fileName of files) {
      try {
        const content = await readFile(join(REFERENCES_DIR, fileName), "utf8");
        const data = parse(content) as ReferenceData;

        // Count types
        typeStats.set(data.type, (typeStats.get(data.type) || 0) + 1);

        // Count years
        if (data.year) {
          yearStats.set(data.year, (yearStats.get(data.year) || 0) + 1);
        }

        // Count keywords
        if (data.keywords) {
          totalKeywords += data.keywords.length;
          data.keywords.forEach(keyword => {
            keywordStats.set(keyword, (keywordStats.get(keyword) || 0) + 1);
          });
        }
      } catch {
        // Skip invalid files for analysis
      }
    }

    // Display type distribution
    console.log("📚 By Type:");
    Array.from(typeStats.entries())
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / files.length) * 100).toFixed(1);
        console.log(`   ${type}: ${count} (${percentage}%)`);
      });

    // Display year range
    if (yearStats.size > 0) {
      const years = Array.from(yearStats.keys()).sort((a, b) => a - b);
      const oldestYear = years[0];
      const newestYear = years[years.length - 1];
      console.log(`\n📅 Year Range: ${oldestYear} - ${newestYear}`);
      
      const averageYear = Math.round(
        Array.from(yearStats.entries()).reduce((sum, [year, count]) => sum + (year * count), 0) / files.length
      );
      console.log(`📊 Average Year: ${averageYear}`);
    }

    // Display top keywords
    if (keywordStats.size > 0) {
      console.log(`\n🏷️  Keywords: ${totalKeywords} total, ${keywordStats.size} unique`);
      console.log("   Top 10 keywords:");
      Array.from(keywordStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([keyword, count]) => {
          console.log(`      ${keyword}: ${count}`);
        });
    }

  } catch (error) {
    console.error("Failed to analyze references:", error);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const showAnalysis = args.includes("--analysis") || args.includes("-a");
  const onlyErrors = args.includes("--errors-only") || args.includes("-e");
  const helpRequested = args.includes("--help") || args.includes("-h");

  if (helpRequested) {
    console.log(`
📚 Reference Validation Tool

Usage: bun run scripts/validate-references.ts [options]

Options:
  -h, --help       Show this help message
  -a, --analysis   Show detailed analysis of references
  -e, --errors-only Show only validation errors (no analysis)

Examples:
  bun run scripts/validate-references.ts
  bun run scripts/validate-references.ts --analysis
  bun run scripts/validate-references.ts --errors-only
    `);
    process.exit(0);
  }

  try {
    const results = await validateAllReferences();
    const success = displayResults(results);

    if (showAnalysis || (!onlyErrors && success)) {
      await analyzeReferenceTypes();
    }

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  void main();
}