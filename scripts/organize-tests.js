#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * @file organize-tests.js
 * @description Test organization utility for health blog testing suite
 * 
 * This script analyzes existing tests and provides recommendations for
 * organizing them into the new multi-environment testing architecture.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Test file analyzer to categorize tests into appropriate environments
 */
class TestAnalyzer {
  constructor() {
    this.testPatterns = {
      unit: [
        /utils.*test/i,
        /helper.*test/i,
        /pure.*function/i,
        /calculation/i,
        /validation/i,
        /slug/i,
        /date/i,
        /format/i
      ],
      integration: [
        /integration/i,
        /api.*test/i,
        /content.*collection/i,
        /file.*system/i,
        /astro.*content/i
      ],
      component: [
        /component/i,
        /ui.*test/i,
        /render/i,
        /dom/i,
        /accessibility/i,
        /a11y/i
      ],
      health: [
        /health/i,
        /nutrition/i,
        /medical/i,
        /german/i,
        /dge/i,
        /reference/i,
        /terminology/i
      ]
    };

    this.contentPatterns = {
      unit: [
        'expect(',
        'describe(',
        'it(',
        'test(',
        'pure function',
        'utility',
        'helper'
      ],
      integration: [
        'getCollection',
        'astro:content',
        'file system',
        'api call',
        'integration'
      ],
      component: [
        'render',
        'component',
        'dom',
        'element',
        'accessibility',
        'aria'
      ],
      health: [
        'health',
        'nutrition',
        'medical',
        'german',
        'dge',
        'vitamin',
        'mineral',
        'disclaimer'
      ]
    };
  }

  /**
   * Analyze a test file and suggest the best environment
   */
  analyzeTestFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const filename = basename(filePath).toLowerCase();
      
      const scores = {
        unit: 0,
        integration: 0,
        component: 0,
        health: 0
      };

      // Analyze filename patterns
      Object.entries(this.testPatterns).forEach(([environment, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.test(filename)) {
            scores[environment] += 3; // High weight for filename patterns
          }
        });
      });

      // Analyze content patterns
      Object.entries(this.contentPatterns).forEach(([environment, patterns]) => {
        patterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            scores[environment] += matches.length;
          }
        });
      });

      // Determine best environment
      const bestEnvironment = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0][0];

      // Calculate confidence score
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const confidence = totalScore > 0 ? scores[bestEnvironment] / totalScore : 0;

      return {
        environment: bestEnvironment,
        confidence: confidence,
        scores: scores,
        suggestions: this.generateSuggestions(content, bestEnvironment),
        imports: this.analyzeImports(content),
        testCount: this.countTests(content)
      };

    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Generate suggestions for test improvement
   */
  generateSuggestions(content, environment) {
    const suggestions = [];

    // Check for health-specific content that should use custom matchers
    if (environment === 'health' || content.match(/health|nutrition|medical|german/gi)) {
      if (!content.includes('toContainValidGermanHealthTerms')) {
        suggestions.push('Consider using custom health matchers for German terminology validation');
      }
      if (!content.includes('toComplyWithDGEStandards')) {
        suggestions.push('Consider using DGE nutrition standards validation');
      }
      if (!content.includes('toBeCredibleReference')) {
        suggestions.push('Consider validating scientific references');
      }
    }

    // Check for component tests that should test accessibility
    if (environment === 'component') {
      if (!content.includes('accessibility') && !content.includes('aria')) {
        suggestions.push('Consider adding accessibility tests');
      }
      if (!content.includes('render')) {
        suggestions.push('Ensure component rendering is tested');
      }
    }

    // Check for missing German context
    if (content.includes('nutrition') && !content.match(/deutsch|german|dge/gi)) {
      suggestions.push('Consider adding German health context (DGE standards, German terminology)');
    }

    return suggestions;
  }

  /**
   * Analyze imports to suggest helper usage
   */
  analyzeImports(content) {
    const imports = {
      hasVitest: content.includes("from 'vitest'"),
      hasCustomHelpers: content.includes('health-test-helpers'),
      hasCustomMatchers: content.includes('health-matchers'),
      hasAstroMocks: content.includes('astro-mocks'),
      hasBrowserMocks: content.includes('browser-apis'),
      hasTestingLibrary: content.includes('@testing-library')
    };

    return imports;
  }

  /**
   * Count number of tests in file
   */
  countTests(content) {
    const testMatches = content.match(/(?:it|test)\s*\(/g);
    const describeMatches = content.match(/describe\s*\(/g);
    
    return {
      tests: testMatches ? testMatches.length : 0,
      suites: describeMatches ? describeMatches.length : 0
    };
  }
}

/**
 * Scan for test files in the project
 */
function findTestFiles(dir, testFiles = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'coverage'].includes(item)) {
      findTestFiles(fullPath, testFiles);
    } else if (stat.isFile() && /\.(test|spec)\.(js|ts)$/.test(item)) {
      testFiles.push(fullPath);
    }
  }
  
  return testFiles;
}

/**
 * Generate test organization report
 */
function generateReport(analyses) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: analyses.length,
      byEnvironment: {},
      avgConfidence: 0,
      totalTests: 0,
      totalSuites: 0
    },
    recommendations: {
      environmentMigration: [],
      helperUsage: [],
      healthSpecific: [],
      accessibility: []
    },
    files: []
  };

  let totalConfidence = 0;
  let totalTests = 0;
  let totalSuites = 0;

  analyses.forEach(analysis => {
    const { filePath, result } = analysis;
    
    if (!result) return;

    // Update summary
    const env = result.environment;
    report.summary.byEnvironment[env] = (report.summary.byEnvironment[env] || 0) + 1;
    totalConfidence += result.confidence;
    totalTests += result.testCount.tests;
    totalSuites += result.testCount.suites;

    // Add file details
    report.files.push({
      path: filePath.replace(projectRoot, ''),
      environment: result.environment,
      confidence: result.confidence,
      scores: result.scores,
      suggestions: result.suggestions,
      imports: result.imports,
      testCount: result.testCount
    });

    // Generate recommendations
    if (result.confidence < 0.7) {
      report.recommendations.environmentMigration.push({
        file: filePath.replace(projectRoot, ''),
        currentGuess: result.environment,
        confidence: result.confidence,
        suggestion: 'Manual review needed - low confidence in environment classification'
      });
    }

    if (!result.imports.hasCustomHelpers && result.environment === 'health') {
      report.recommendations.helperUsage.push({
        file: filePath.replace(projectRoot, ''),
        suggestion: 'Import health-test-helpers for better health domain testing'
      });
    }

    if (result.environment === 'component' && !result.imports.hasTestingLibrary) {
      report.recommendations.accessibility.push({
        file: filePath.replace(projectRoot, ''),
        suggestion: 'Consider using @testing-library for component testing'
      });
    }

    result.suggestions.forEach(suggestion => {
      if (suggestion.includes('German')) {
        report.recommendations.healthSpecific.push({
          file: filePath.replace(projectRoot, ''),
          suggestion
        });
      }
    });
  });

  report.summary.avgConfidence = totalConfidence / analyses.filter(a => a.result).length;
  report.summary.totalTests = totalTests;
  report.summary.totalSuites = totalSuites;

  return report;
}

/**
 * Generate migration guide
 */
function generateMigrationGuide(report) {
  let guide = `# Test Migration Guide

Generated on: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Total test files**: ${report.summary.totalFiles}
- **Total tests**: ${report.summary.totalTests}
- **Total test suites**: ${report.summary.totalSuites}
- **Average classification confidence**: ${(report.summary.avgConfidence * 100).toFixed(1)}%

## Environment Distribution

`;

  Object.entries(report.summary.byEnvironment).forEach(([env, count]) => {
    const percentage = ((count / report.summary.totalFiles) * 100).toFixed(1);
    guide += `- **${env}**: ${count} files (${percentage}%)\n`;
  });

  guide += `\n## Migration Recommendations\n\n`;

  // Environment migration recommendations
  if (report.recommendations.environmentMigration.length > 0) {
    guide += `### Files Needing Manual Review\n\n`;
    report.recommendations.environmentMigration.forEach(rec => {
      guide += `- \`${rec.file}\` - ${rec.suggestion} (confidence: ${(rec.confidence * 100).toFixed(1)}%)\n`;
    });
    guide += `\n`;
  }

  // Helper usage recommendations
  if (report.recommendations.helperUsage.length > 0) {
    guide += `### Helper Integration Opportunities\n\n`;
    report.recommendations.helperUsage.forEach(rec => {
      guide += `- \`${rec.file}\` - ${rec.suggestion}\n`;
    });
    guide += `\n`;
  }

  // Health-specific recommendations
  if (report.recommendations.healthSpecific.length > 0) {
    guide += `### Health Domain Enhancements\n\n`;
    report.recommendations.healthSpecific.forEach(rec => {
      guide += `- \`${rec.file}\` - ${rec.suggestion}\n`;
    });
    guide += `\n`;
  }

  // Accessibility recommendations
  if (report.recommendations.accessibility.length > 0) {
    guide += `### Accessibility Testing Opportunities\n\n`;
    report.recommendations.accessibility.forEach(rec => {
      guide += `- \`${rec.file}\` - ${rec.suggestion}\n`;
    });
    guide += `\n`;
  }

  guide += `## Environment-Specific File Lists\n\n`;

  Object.keys(report.summary.byEnvironment).forEach(env => {
    const files = report.files.filter(f => f.environment === env);
    guide += `### ${env.charAt(0).toUpperCase() + env.slice(1)} Environment (${files.length} files)\n\n`;
    
    files.forEach(file => {
      const confidence = `${(file.confidence * 100).toFixed(1)}%`;
      guide += `- \`${file.path}\` (confidence: ${confidence}, tests: ${file.testCount.tests})\n`;
      
      if (file.suggestions.length > 0) {
        file.suggestions.forEach(suggestion => {
          guide += `  - ${suggestion}\n`;
        });
      }
    });
    guide += `\n`;
  });

  return guide;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Analyzing test files for organization...\n');
  
  const analyzer = new TestAnalyzer();
  const testFiles = findTestFiles(projectRoot);
  
  console.log(`Found ${testFiles.length} test files\n`);
  
  const analyses = testFiles.map(filePath => ({
    filePath,
    result: analyzer.analyzeTestFile(filePath)
  }));

  const report = generateReport(analyses);
  const migrationGuide = generateMigrationGuide(report);
  
  // Save reports
  const reportsDir = join(projectRoot, 'tests/reports');
  if (!existsSync(reportsDir)) {
    // Create directory logic would go here in a real implementation
  }

  const reportFile = join(projectRoot, 'tests/test-organization-report.json');
  const guideFile = join(projectRoot, 'tests/MIGRATION_GUIDE.md');
  
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  writeFileSync(guideFile, migrationGuide);
  
  // Console output
  console.log('📊 Test Organization Analysis Complete!\n');
  console.log(`📄 Detailed report: ${reportFile}`);
  console.log(`📋 Migration guide: ${guideFile}\n`);
  
  console.log('📈 Summary:');
  console.log(`   Total Files: ${report.summary.totalFiles}`);
  console.log(`   Total Tests: ${report.summary.totalTests}`);
  console.log(`   Average Confidence: ${(report.summary.avgConfidence * 100).toFixed(1)}%\n`);
  
  console.log('🏷️  Environment Distribution:');
  Object.entries(report.summary.byEnvironment).forEach(([env, count]) => {
    const percentage = ((count / report.summary.totalFiles) * 100).toFixed(1);
    console.log(`   ${env}: ${count} files (${percentage}%)`);
  });
  
  console.log('\n✅ Next steps:');
  console.log('   1. Review the migration guide');
  console.log('   2. Move test files to appropriate directories');
  console.log('   3. Add health domain testing where applicable');
  console.log('   4. Run tests to validate migration');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}