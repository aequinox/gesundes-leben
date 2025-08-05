#!/usr/bin/env bun

/**
 * Link validation script for references
 * Validates URLs, DOIs, and PMIDs in reference files
 */

import {
  validateReferenceLinks,
  // generateValidationReport, // Unused in current implementation
  type ValidationResult,
  type ReferenceLinks,
} from "../src/utils/linkValidator";
import { getAllReferences } from "../src/utils/references";

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

interface LinkValidationResult {
  referenceId: string;
  referenceTitle: string;
  results: Record<keyof ReferenceLinks, ValidationResult | null>;
  hasIssues: boolean;
}

async function validateAllLinks(options: {
  concurrent?: number;
  timeout?: number;
  verbose?: boolean;
  errorsOnly?: boolean;
}): Promise<LinkValidationResult[]> {
  const { concurrent = 3, timeout = 10000, verbose = false, errorsOnly = false } = options;
  
  console.log(colorize("🔗 Validating Reference Links", "bright"));
  console.log("");

  const references = await getAllReferences();
  const referencesWithLinks = references.filter(ref => ref.url !== undefined || ref.doi !== undefined || ref.pmid !== undefined);

  console.log(`📊 Found ${references.length} references total`);
  console.log(`🔗 ${referencesWithLinks.length} references have links to validate`);
  console.log("");

  const results: LinkValidationResult[] = [];
  let completed = 0;

  // Process references in batches to control concurrency
  for (let i = 0; i < referencesWithLinks.length; i += concurrent) {
    const batch = referencesWithLinks.slice(i, i + concurrent);
    
    const batchPromises = batch.map(async (ref) => {
      const links: ReferenceLinks = {
        url: ref.url,
        doi: ref.doi,
        pmid: ref.pmid,
      };

      const linkResults = await validateReferenceLinks(links, { timeout });
      
      const hasIssues = Object.values(linkResults).some(result => 
        result !== undefined && !result.valid
      );

      completed++;
      
      if (verbose || (!errorsOnly || hasIssues)) {
        const progress = `[${completed}/${referencesWithLinks.length}]`;
        const status = hasIssues ? colorize("❌", "red") : colorize("✅", "green");
        console.log(`${progress} ${status} ${ref.id}`);
        
        if (verbose) {
          console.log(`   ${colorize(ref.title, "cyan")}`);
          
          if (linkResults.url) {
            const icon = linkResults.url.valid ? "🌐✅" : "🌐❌";
            console.log(`   ${icon} URL: ${linkResults.url.valid ? "OK" : linkResults.url.error}`);
          }
          
          if (linkResults.doi) {
            const icon = linkResults.doi.valid ? "📄✅" : "📄❌";
            console.log(`   ${icon} DOI: ${linkResults.doi.valid ? "OK" : linkResults.doi.error}`);
          }
          
          if (linkResults.pmid) {
            const icon = linkResults.pmid.valid ? "🧬✅" : "🧬❌";
            console.log(`   ${icon} PMID: ${linkResults.pmid.valid ? "OK" : linkResults.pmid.error}`);
          }
          
          console.log("");
        }
      }

      return {
        referenceId: ref.id,
        referenceTitle: ref.title,
        results: linkResults,
        hasIssues,
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

function displaySummary(results: LinkValidationResult[]) {
  console.log(colorize("\n📋 VALIDATION SUMMARY", "bright"));
  console.log("");

  const totalReferences = results.length;
  const referencesWithIssues = results.filter(r => r.hasIssues).length;
  const referencesOk = totalReferences - referencesWithIssues;

  // Count individual link types
  let totalUrls = 0, validUrls = 0;
  let totalDois = 0, validDois = 0;
  let totalPmids = 0, validPmids = 0;

  const errorCounts: Record<string, number> = {};

  results.forEach(result => {
    if (result.results.url !== undefined) {
      totalUrls++;
      if (result.results.url.valid) {validUrls++;}
      else if (result.results.url.error !== undefined) {
        errorCounts[result.results.url.error] = (errorCounts[result.results.url.error] ?? 0) + 1;
      }
    }
    
    if (result.results.doi !== undefined) {
      totalDois++;
      if (result.results.doi.valid) {validDois++;}
      else if (result.results.doi.error !== undefined) {
        errorCounts[result.results.doi.error] = (errorCounts[result.results.doi.error] ?? 0) + 1;
      }
    }
    
    if (result.results.pmid !== undefined) {
      totalPmids++;
      if (result.results.pmid.valid) {validPmids++;}
      else if (result.results.pmid.error !== undefined) {
        errorCounts[result.results.pmid.error] = (errorCounts[result.results.pmid.error] ?? 0) + 1;
      }
    }
  });

  console.log(colorize("📊 Overview:", "blue"));
  console.log(`   Total references: ${totalReferences}`);
  console.log(`   ${colorize("✅ References OK:", "green")} ${referencesOk}`);
  console.log(`   ${colorize("❌ References with issues:", "red")} ${referencesWithIssues}`);
  console.log("");

  console.log(colorize("🔗 By Link Type:", "blue"));
  if (totalUrls > 0) {
    const urlSuccessRate = ((validUrls / totalUrls) * 100).toFixed(1);
    console.log(`   🌐 URLs: ${validUrls}/${totalUrls} valid (${urlSuccessRate}%)`);
  }
  
  if (totalDois > 0) {
    const doiSuccessRate = ((validDois / totalDois) * 100).toFixed(1);
    console.log(`   📄 DOIs: ${validDois}/${totalDois} valid (${doiSuccessRate}%)`);
  }
  
  if (totalPmids > 0) {
    const pmidSuccessRate = ((validPmids / totalPmids) * 100).toFixed(1);
    console.log(`   🧬 PMIDs: ${validPmids}/${totalPmids} valid (${pmidSuccessRate}%)`);
  }

  // Show common errors
  if (Object.keys(errorCounts).length > 0) {
    console.log(colorize("\n🚨 Common Errors:", "blue"));
    Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([error, count]) => {
        console.log(`   ${error}: ${count} occurrences`);
      });
  }

  // List problematic references
  const problemRefs = results.filter(r => r.hasIssues);
  if (problemRefs.length > 0) {
    console.log(colorize("\n❌ REFERENCES WITH ISSUES:", "red"));
    problemRefs.forEach(ref => {
      console.log(`\n📄 ${colorize(ref.referenceId, "cyan")}`);
      console.log(`   ${ref.referenceTitle}`);
      
      if (ref.results.url !== undefined && !ref.results.url.valid) {
        console.log(`   🌐 URL Error: ${colorize(ref.results.url.error ?? "Unknown", "red")}`);
      }
      
      if (ref.results.doi !== undefined && !ref.results.doi.valid) {
        console.log(`   📄 DOI Error: ${colorize(ref.results.doi.error ?? "Unknown", "red")}`);
      }
      
      if (ref.results.pmid !== undefined && !ref.results.pmid.valid) {
        console.log(`   🧬 PMID Error: ${colorize(ref.results.pmid.error ?? "Unknown", "red")}`);
      }
    });
  }

  const overallSuccess = totalReferences > 0 
    ? ((referencesOk / totalReferences) * 100).toFixed(1)
    : "0";

  console.log(colorize(`\n🎯 Overall Success Rate: ${overallSuccess}%`, "bright"));
  
  return referencesWithIssues === 0;
}

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    concurrent: 3,
    timeout: 10000,
    verbose: args.includes("--verbose") || args.includes("-v"),
    errorsOnly: args.includes("--errors-only") || args.includes("-e"),
  };

  // Parse concurrent option
  const concurrentIndex = args.findIndex(arg => arg === "--concurrent" || arg === "-c");
  if (concurrentIndex !== -1 && args[concurrentIndex + 1]) {
    const concurrent = parseInt(args[concurrentIndex + 1], 10);
    if (!isNaN(concurrent) && concurrent > 0) {
      options.concurrent = concurrent;
    }
  }

  // Parse timeout option
  const timeoutIndex = args.findIndex(arg => arg === "--timeout" || arg === "-t");
  if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
    const timeout = parseInt(args[timeoutIndex + 1], 10);
    if (!isNaN(timeout) && timeout > 0) {
      options.timeout = timeout * 1000; // Convert to milliseconds
    }
  }

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🔗 Reference Link Validation Tool

Usage: bun run scripts/validate-links.ts [options]

Options:
  -h, --help           Show this help message
  -v, --verbose        Show detailed validation results for all references
  -e, --errors-only    Show only references with link validation errors
  -c, --concurrent N   Number of concurrent validations (default: 3)
  -t, --timeout N      Timeout per request in seconds (default: 10)

Examples:
  bun run scripts/validate-links.ts
  bun run scripts/validate-links.ts --verbose
  bun run scripts/validate-links.ts --errors-only --concurrent 5
  bun run scripts/validate-links.ts --timeout 15
    `);
    process.exit(0);
  }

  try {
    console.log(colorize("⚙️  Configuration:", "blue"));
    console.log(`   Concurrent requests: ${options.concurrent}`);
    console.log(`   Timeout: ${options.timeout / 1000}s`);
    console.log(`   Verbose: ${options.verbose ? "Yes" : "No"}`);
    console.log(`   Errors only: ${options.errorsOnly ? "Yes" : "No"}`);
    console.log("");

    const results = await validateAllLinks(options);
    const success = displaySummary(results);

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(colorize("❌ Validation failed:", "red"), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  void main();
}