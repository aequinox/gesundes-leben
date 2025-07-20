#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Lighthouse Performance Testing Suite
 * 
 * Automated performance testing using Lighthouse to measure:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Performance Score
 * - Bundle Size Impact
 * - Image Loading Performance
 * 
 * Usage:
 * - npm run perf:test - Run performance tests
 * - npm run perf:compare - Compare before/after improvements
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // Test URLs to benchmark
    this.testUrls = [
      { name: 'Homepage', url: 'http://localhost:4321/' },
      { name: 'Blog Post', url: 'http://localhost:4321/posts/die-koerperlichkeit-der-depression/' },
      { name: 'Posts Listing', url: 'http://localhost:4321/posts' },
      { name: 'About Page', url: 'http://localhost:4321/about' },
      { name: 'Glossary', url: 'http://localhost:4321/glossary' }
    ];

    // Performance thresholds
    this.thresholds = {
      performance: 90,
      fcp: 1800, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      cls: 0.1,  // Cumulative Layout Shift
      tti: 3800, // Time to Interactive (ms)
      tbt: 300,  // Total Blocking Time (ms)
      si: 3000   // Speed Index (ms)
    };
  }

  async runLighthouse(url, options = {}) {
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu', 
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    const lighthouseOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      ...options
    };

    const config = {
      extends: 'lighthouse:default',
      settings: {
        // Simulate mobile device for realistic testing
        formFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 1024,
          uploadThroughputKbps: 1024
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false
        },
        auditMode: false,
        gatherMode: false,
        disableStorageReset: false
      }
    };

    try {
      // Wait a moment to ensure the page is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const runnerResult = await lighthouse(url, lighthouseOptions, config);
      await chrome.kill();
      return runnerResult;
    } catch (error) {
      await chrome.kill();
      console.error(`Lighthouse error for ${url}:`, error.message);
      throw error;
    }
  }

  extractMetrics(lhResult) {
    const audits = lhResult.lhr.audits;
    const metrics = {
      performanceScore: Math.round(lhResult.lhr.categories.performance.score * 100),
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      tti: audits['interactive']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,
      // Image specific metrics
      efficientImages: audits['uses-optimized-images']?.score || 0,
      webpImages: audits['uses-webp-images']?.score || 0,
      lazyImages: audits['offscreen-images']?.score || 0,
      // Bundle metrics
      unusedJs: audits['unused-javascript']?.details?.overallSavingsBytes || 0,
      unusedCss: audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
      renderBlocking: audits['render-blocking-resources']?.score || 0
    };

    return metrics;
  }

  analyzeResults(metrics) {
    const analysis = {
      passed: 0,
      failed: 0,
      issues: []
    };

    // Check performance thresholds
    const checks = [
      { name: 'Performance Score', value: metrics.performanceScore, threshold: this.thresholds.performance, unit: '', higherBetter: true },
      { name: 'First Contentful Paint', value: metrics.fcp, threshold: this.thresholds.fcp, unit: 'ms', higherBetter: false },
      { name: 'Largest Contentful Paint', value: metrics.lcp, threshold: this.thresholds.lcp, unit: 'ms', higherBetter: false },
      { name: 'Cumulative Layout Shift', value: metrics.cls, threshold: this.thresholds.cls, unit: '', higherBetter: false },
      { name: 'Time to Interactive', value: metrics.tti, threshold: this.thresholds.tti, unit: 'ms', higherBetter: false },
      { name: 'Total Blocking Time', value: metrics.tbt, threshold: this.thresholds.tbt, unit: 'ms', higherBetter: false },
      { name: 'Speed Index', value: metrics.si, threshold: this.thresholds.si, unit: 'ms', higherBetter: false }
    ];

    checks.forEach(check => {
      const passed = check.higherBetter 
        ? check.value >= check.threshold
        : check.value <= check.threshold;

      if (passed) {
        analysis.passed++;
      } else {
        analysis.failed++;
        analysis.issues.push({
          metric: check.name,
          actual: check.value,
          threshold: check.threshold,
          unit: check.unit,
          impact: Math.abs(check.value - check.threshold)
        });
      }
    });

    return analysis;
  }

  async runTestSuite() {
    console.log(chalk.blue.bold('\n🚀 Running Performance Test Suite\n'));

    for (const testCase of this.testUrls) {
      console.log(chalk.yellow(`Testing: ${testCase.name} (${testCase.url})`));
      
      let retries = 2;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          const lhResult = await this.runLighthouse(testCase.url);
          const metrics = this.extractMetrics(lhResult);
          const analysis = this.analyzeResults(metrics);

          const testResult = {
            name: testCase.name,
            url: testCase.url,
            metrics,
            analysis,
            timestamp: new Date().toISOString()
          };

          this.results.tests.push(testResult);
          this.printTestResult(testResult);
          success = true;

        } catch (error) {
          retries--;
          if (retries > 0) {
            console.log(chalk.yellow(`⚠️ Retrying ${testCase.name} (${retries} attempts left)`));
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.error(chalk.red(`❌ Failed to test ${testCase.name} after retries: ${error.message}`));
          }
        }
      }
    }

    await this.saveResults();
    this.printSummary();
  }

  printTestResult(result) {
    const { metrics, analysis } = result;
    
    console.log(chalk.green(`✓ ${result.name} completed`));
    console.log(`  Performance Score: ${this.formatScore(metrics.performanceScore)}`);
    console.log(`  FCP: ${Math.round(metrics.fcp)}ms | LCP: ${Math.round(metrics.lcp)}ms | CLS: ${metrics.cls.toFixed(3)}`);
    console.log(`  TTI: ${Math.round(metrics.tti)}ms | TBT: ${Math.round(metrics.tbt)}ms | SI: ${Math.round(metrics.si)}ms`);
    
    if (analysis.failed > 0) {
      console.log(chalk.red(`  ⚠️  ${analysis.failed} metrics failed thresholds`));
    }
    console.log('');
  }

  formatScore(score) {
    if (score >= 90) return chalk.green(`${score}/100`);
    if (score >= 50) return chalk.yellow(`${score}/100`);
    return chalk.red(`${score}/100`);
  }

  async saveResults() {
    const resultsDir = 'tests/performance/results';
    await fs.mkdir(resultsDir, { recursive: true });
    
    const filename = `performance-${Date.now()}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    console.log(chalk.blue(`📊 Results saved to: ${filepath}`));
  }

  printSummary() {
    console.log(chalk.blue.bold('\n📈 Performance Test Summary\n'));
    
    const totalTests = this.results.tests.length;
    const avgPerformance = this.results.tests.reduce((sum, test) => 
      sum + test.metrics.performanceScore, 0) / totalTests;
    
    console.log(`Total Pages Tested: ${totalTests}`);
    console.log(`Average Performance Score: ${this.formatScore(Math.round(avgPerformance))}`);
    
    // Show worst performing pages
    const sortedByPerformance = [...this.results.tests]
      .sort((a, b) => a.metrics.performanceScore - b.metrics.performanceScore);
    
    console.log(chalk.yellow('\nPages needing attention:'));
    sortedByPerformance.slice(0, 3).forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.name}: ${this.formatScore(test.metrics.performanceScore)}`);
    });
  }

  async compareResults(beforeFile, afterFile) {
    console.log(chalk.blue.bold('\n📊 Comparing Performance Results\n'));
    
    try {
      const before = JSON.parse(await fs.readFile(beforeFile, 'utf8'));
      const after = JSON.parse(await fs.readFile(afterFile, 'utf8'));
      
      console.log('Comparison Report:');
      
      before.tests.forEach(beforeTest => {
        const afterTest = after.tests.find(t => t.name === beforeTest.name);
        if (!afterTest) return;
        
        console.log(chalk.yellow(`\n${beforeTest.name}:`));
        this.compareMetrics(beforeTest.metrics, afterTest.metrics);
      });
      
    } catch (error) {
      console.error(chalk.red(`Failed to compare results: ${error.message}`));
    }
  }

  compareMetrics(before, after) {
    const metrics = [
      { name: 'Performance Score', key: 'performanceScore', unit: '', higherBetter: true },
      { name: 'FCP', key: 'fcp', unit: 'ms', higherBetter: false },
      { name: 'LCP', key: 'lcp', unit: 'ms', higherBetter: false },
      { name: 'CLS', key: 'cls', unit: '', higherBetter: false },
      { name: 'TTI', key: 'tti', unit: 'ms', higherBetter: false },
      { name: 'TBT', key: 'tbt', unit: 'ms', higherBetter: false }
    ];

    metrics.forEach(metric => {
      const beforeVal = before[metric.key];
      const afterVal = after[metric.key];
      const diff = afterVal - beforeVal;
      const percentChange = ((diff / beforeVal) * 100).toFixed(1);
      
      let symbol, color;
      if (metric.higherBetter) {
        symbol = diff > 0 ? '↗️' : '↘️';
        color = diff > 0 ? chalk.green : chalk.red;
      } else {
        symbol = diff < 0 ? '↗️' : '↘️';
        color = diff < 0 ? chalk.green : chalk.red;
      }
      
      const formattedDiff = metric.unit === 'ms' ? `${Math.round(diff)}${metric.unit}` : diff.toFixed(3);
      console.log(`  ${metric.name}: ${color(`${symbol} ${formattedDiff} (${percentChange}%)`)}`);
    });
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const tester = new PerformanceTester();
  
  switch (command) {
    case 'run':
      await tester.runTestSuite();
      break;
    case 'compare':
      if (args.length < 3) {
        console.error('Usage: node lighthouse-test.js compare <before.json> <after.json>');
        process.exit(1);
      }
      await tester.compareResults(args[1], args[2]);
      break;
    default:
      console.log('Usage:');
      console.log('  node lighthouse-test.js run - Run performance tests');
      console.log('  node lighthouse-test.js compare <before.json> <after.json> - Compare results');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PerformanceTester;