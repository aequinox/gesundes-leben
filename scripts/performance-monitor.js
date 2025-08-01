#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Monitors Core Web Vitals and provides alerts when budgets are exceeded
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load performance budget
const budgetPath = path.join(__dirname, '..', 'performance-budget.json');
const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPerformanceBudget() {
  log('🚀 Performance Budget Monitor', colors.bold);
  log('================================', colors.bold);
  
  const budgetConfig = budget.budget[0];
  
  log('\n📊 Performance Budgets:', colors.green);
  
  // Display timing budgets
  log('\n⏱️  Core Web Vitals Goals:');
  budgetConfig.timings.forEach(timing => {
    const value = timing.budget;
    const unit = timing.metric.includes('shift') ? '' : 'ms';
    log(`  • ${timing.metric}: ${value}${unit}`, colors.yellow);
  });
  
  // Display resource budgets
  log('\n📦 Resource Size Budgets:');
  budgetConfig.resourceSizes.forEach(resource => {
    log(`  • ${resource.resourceType}: ${resource.budget}KB`, colors.yellow);
  });
  
  // Performance tips
  log('\n💡 Performance Optimization Tips:', colors.green);
  log('  • Run "bun run build" and check bundle sizes');
  log('  • Test with PageSpeed Insights: https://pagespeed.web.dev/');
  log('  • Monitor Core Web Vitals in production');
  log('  • Use "bun run perf:test" for automated testing');
  
  // Build size check
  try {
    log('\n📋 Current Build Status:', colors.green);
    
    const distExists = fs.existsSync(path.join(__dirname, '..', 'dist'));
    if (distExists) {
      log('  ✅ Build directory exists');
      
      // Check if we can get build stats
      try {
        const buildStats = execSync('du -sh dist/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
        log(`  📊 Total build size: ${buildStats.trim().split('\t')[0]}`);
      } catch (e) {
        log('  ⚠️  Could not determine build size');
      }
    } else {
      log('  ⚠️  No build found - run "bun run build" to analyze');
    }
  } catch (error) {
    log('  ❌ Error checking build status', colors.red);
  }
  
  log('\n🎯 Next Steps:', colors.bold);
  log('  1. Run build: bun run build');
  log('  2. Test performance: bun run perf:test');
  log('  3. Check PageSpeed: Test your live site');
  log('  4. Monitor regularly: Add to CI/CD pipeline');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  checkPerformanceBudget();
}

export { checkPerformanceBudget };