#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * @file merge-coverage.js
 * @description Merges coverage reports from multiple Vitest environments
 * 
 * This script combines coverage data from unit, integration, component,
 * and health test environments into a single comprehensive report.
 * Useful for getting overall project coverage metrics across all test types.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Coverage report directories
const coverageDirectories = [
  'coverage/unit',
  'coverage/integration', 
  'coverage/component',
  'coverage/health'
];

/**
 * Merge JSON coverage reports from different environments
 */
function mergeCoverageReports() {
  console.log('🔄 Merging coverage reports from multiple environments...');
  
  const mergedCoverage = {};
  let totalFiles = 0;
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;
  
  // Process each environment's coverage report
  coverageDirectories.forEach((dir) => {
    const coverageFile = join(projectRoot, dir, 'coverage-final.json');
    
    if (!existsSync(coverageFile)) {
      console.log(`⚠️  Coverage file not found: ${coverageFile}`);
      return;
    }
    
    console.log(`📊 Processing ${dir} coverage...`);
    
    try {
      const coverageData = JSON.parse(readFileSync(coverageFile, 'utf8'));
      
      // Merge file-level coverage data
      Object.keys(coverageData).forEach(filePath => {
        const fileData = coverageData[filePath];
        
        if (!mergedCoverage[filePath]) {
          mergedCoverage[filePath] = { ...fileData };
          totalFiles++;
        } else {
          // Merge statement, branch, function, and line coverage
          const existing = mergedCoverage[filePath];
          
          // Merge statement coverage
          Object.keys(fileData.s || {}).forEach(key => {
            existing.s = existing.s || {};
            existing.s[key] = (existing.s[key] || 0) + (fileData.s[key] || 0);
          });
          
          // Merge branch coverage
          Object.keys(fileData.b || {}).forEach(key => {
            existing.b = existing.b || {};
            if (!existing.b[key]) {
              existing.b[key] = [...(fileData.b[key] || [])];
            } else {
              fileData.b[key].forEach((count, i) => {
                existing.b[key][i] = (existing.b[key][i] || 0) + (count || 0);
              });
            }
          });
          
          // Merge function coverage
          Object.keys(fileData.f || {}).forEach(key => {
            existing.f = existing.f || {};
            existing.f[key] = (existing.f[key] || 0) + (fileData.f[key] || 0);
          });
        }
        
        // Calculate totals
        const fileStats = fileData;
        totalStatements += Object.keys(fileStats.s || {}).length;
        coveredStatements += Object.values(fileStats.s || {}).filter(count => count > 0).length;
        
        totalBranches += Object.keys(fileStats.b || {}).reduce((acc, key) => {
          return acc + (fileStats.b[key] || []).length;
        }, 0);
        coveredBranches += Object.keys(fileStats.b || {}).reduce((acc, key) => {
          return acc + (fileStats.b[key] || []).filter(count => count > 0).length;
        }, 0);
        
        totalFunctions += Object.keys(fileStats.f || {}).length;
        coveredFunctions += Object.values(fileStats.f || {}).filter(count => count > 0).length;
        
        totalLines += Object.keys(fileStats.s || {}).length; // Approximation
        coveredLines += Object.values(fileStats.s || {}).filter(count => count > 0).length;
      });
      
    } catch (error) {
      console.error(`❌ Error processing ${dir} coverage:`, error.message);
    }
  });
  
  // Calculate overall percentages
  const statementPct = totalStatements > 0 ? ((coveredStatements / totalStatements) * 100).toFixed(2) : 0;
  const branchPct = totalBranches > 0 ? ((coveredBranches / totalBranches) * 100).toFixed(2) : 0;
  const functionPct = totalFunctions > 0 ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) : 0;
  const linePct = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(2) : 0;
  
  // Create merged output directory
  const mergedDir = join(projectRoot, 'coverage/merged');
  if (!existsSync(mergedDir)) {
    mkdirSync(mergedDir, { recursive: true });
  }
  
  // Write merged coverage data
  const mergedFile = join(mergedDir, 'coverage-final.json');
  writeFileSync(mergedFile, JSON.stringify(mergedCoverage, null, 2));
  
  // Create summary report
  const summaryReport = {
    timestamp: new Date().toISOString(),
    environments: coverageDirectories.map(dir => dir.split('/')[1]),
    totals: {
      files: totalFiles,
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percentage: parseFloat(statementPct)
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percentage: parseFloat(branchPct)
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percentage: parseFloat(functionPct)
      },
      lines: {
        total: totalLines,
        covered: coveredLines,
        percentage: parseFloat(linePct)
      }
    },
    thresholds: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85
    }
  };
  
  const summaryFile = join(mergedDir, 'coverage-summary.json');
  writeFileSync(summaryFile, JSON.stringify(summaryReport, null, 2));
  
  // Console output
  console.log('\\n✅ Coverage merge complete!');
  console.log('📈 Overall Coverage Summary:');
  console.log(`   📄 Files: ${totalFiles}`);
  console.log(`   📊 Statements: ${statementPct}% (${coveredStatements}/${totalStatements})`);
  console.log(`   🌳 Branches: ${branchPct}% (${coveredBranches}/${totalBranches})`);
  console.log(`   🔧 Functions: ${functionPct}% (${coveredFunctions}/${totalFunctions})`);
  console.log(`   📝 Lines: ${linePct}% (${coveredLines}/${totalLines})`);
  console.log(`\\n💾 Merged reports saved to: ${mergedDir}`);
  
  // Check if thresholds are met
  const thresholdsMet = [
    parseFloat(statementPct) >= 85,
    parseFloat(branchPct) >= 85,
    parseFloat(functionPct) >= 85,
    parseFloat(linePct) >= 85
  ].every(Boolean);
  
  if (!thresholdsMet) {
    console.log('⚠️  Coverage thresholds not met!');
    process.exit(1);
  } else {
    console.log('🎉 All coverage thresholds met!');
  }
}

/**
 * Generate HTML report for merged coverage
 */
function generateMergedHtmlReport() {
  const mergedDir = join(projectRoot, 'coverage/merged');
  const summaryFile = join(mergedDir, 'coverage-summary.json');
  
  if (!existsSync(summaryFile)) {
    console.log('❌ No merged coverage summary found. Run merge first.');
    return;
  }
  
  const summary = JSON.parse(readFileSync(summaryFile, 'utf8'));
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthy Life Blog - Merged Coverage Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .percentage { font-size: 2em; font-weight: bold; }
        .label { color: #666; font-size: 0.9em; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .bad { color: #dc3545; }
        .environments { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .timestamp { color: #666; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Healthy Life Blog - Multi-Environment Coverage Report</h1>
        <p class="timestamp">Generated: ${new Date(summary.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="environments">
        <h3>📊 Test Environments Included:</h3>
        <p>${summary.environments.map(env => `<strong>${env}</strong>`).join(' • ')}</p>
    </div>
    
    <h2>📈 Coverage Metrics</h2>
    
    <div class="metric">
        <div class="percentage ${summary.totals.statements.percentage >= 85 ? 'good' : summary.totals.statements.percentage >= 70 ? 'warning' : 'bad'}">
            ${summary.totals.statements.percentage.toFixed(1)}%
        </div>
        <div class="label">Statements<br>${summary.totals.statements.covered}/${summary.totals.statements.total}</div>
    </div>
    
    <div class="metric">
        <div class="percentage ${summary.totals.branches.percentage >= 85 ? 'good' : summary.totals.branches.percentage >= 70 ? 'warning' : 'bad'}">
            ${summary.totals.branches.percentage.toFixed(1)}%
        </div>
        <div class="label">Branches<br>${summary.totals.branches.covered}/${summary.totals.branches.total}</div>
    </div>
    
    <div class="metric">
        <div class="percentage ${summary.totals.functions.percentage >= 85 ? 'good' : summary.totals.functions.percentage >= 70 ? 'warning' : 'bad'}">
            ${summary.totals.functions.percentage.toFixed(1)}%
        </div>
        <div class="label">Functions<br>${summary.totals.functions.covered}/${summary.totals.functions.total}</div>
    </div>
    
    <div class="metric">
        <div class="percentage ${summary.totals.lines.percentage >= 85 ? 'good' : summary.totals.lines.percentage >= 70 ? 'warning' : 'bad'}">
            ${summary.totals.lines.percentage.toFixed(1)}%
        </div>
        <div class="label">Lines<br>${summary.totals.lines.covered}/${summary.totals.lines.total}</div>
    </div>
    
    <h2>🎯 Thresholds</h2>
    <p>Required: 85% for all metrics</p>
    
    <h2>🔗 Individual Environment Reports</h2>
    <ul>
        ${summary.environments.map(env => `<li><a href="../${env}/index.html">${env.charAt(0).toUpperCase() + env.slice(1)} Tests</a></li>`).join('')}
    </ul>
    
    <p><small>🏥 Generated for Healthy Life German Health Blog Testing Suite</small></p>
</body>
</html>
`;
  
  const htmlFile = join(mergedDir, 'index.html');
  writeFileSync(htmlFile, htmlTemplate);
  
  console.log(`📄 HTML report generated: ${htmlFile}`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  mergeCoverageReports();
  generateMergedHtmlReport();
}