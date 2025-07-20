#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Performance Test Runner
 * 
 * Orchestrates comprehensive performance testing including:
 * - Bundle analysis
 * - Lighthouse performance tests
 * - Comparison with previous results
 * - Performance regression detection
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const resultsDir = path.join(__dirname, 'results');

class PerformanceTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSuite: 'complete',
      bundle: null,
      lighthouse: null,
      comparison: null
    };
  }

  async run() {
    console.log(chalk.blue.bold('\n🚀 Running Complete Performance Test Suite\n'));

    try {
      // Ensure results directory exists
      await fs.mkdir(resultsDir, { recursive: true });

      // Step 1: Build the project
      await this.buildProject();

      // Step 2: Run bundle analysis
      await this.runBundleAnalysis();

      // Step 3: Start dev server for Lighthouse tests
      const server = await this.startDevServer();

      // Step 4: Run Lighthouse tests
      await this.runLighthouseTests();

      // Step 5: Stop dev server
      await this.stopDevServer(server);

      // Step 6: Compare with previous results
      await this.compareResults();

      // Step 7: Generate summary report
      await this.generateSummaryReport();

      console.log(chalk.green.bold('\n✅ Performance test suite completed successfully!\n'));

    } catch (error) {
      console.error(chalk.red.bold(`\n❌ Performance test suite failed: ${error.message}\n`));
      process.exit(1);
    }
  }

  async buildProject() {
    console.log(chalk.yellow('📦 Building project...'));
    
    return new Promise((resolve, reject) => {
      const build = spawn('bun', ['run', 'build'], {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      build.stdout.on('data', (data) => {
        output += data.toString();
      });

      build.stderr.on('data', (data) => {
        output += data.toString();
      });

      build.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Build completed'));
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}:\n${output}`));
        }
      });
    });
  }

  async runBundleAnalysis() {
    console.log(chalk.yellow('📊 Running bundle analysis...'));

    return new Promise((resolve, reject) => {
      const analyzer = spawn('node', [path.join(projectRoot, 'scripts/analyze-bundle.js')], {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      analyzer.stdout.on('data', (data) => {
        output += data.toString();
      });

      analyzer.stderr.on('data', (data) => {
        output += data.toString();
      });

      analyzer.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Bundle analysis completed'));
          // Extract the latest bundle analysis file
          this.extractLatestBundleReport();
          resolve();
        } else {
          reject(new Error(`Bundle analysis failed with code ${code}:\n${output}`));
        }
      });
    });
  }

  async extractLatestBundleReport() {
    try {
      const files = await fs.readdir(resultsDir);
      const bundleFiles = files.filter(f => f.startsWith('bundle-analysis-')).sort().reverse();
      
      if (bundleFiles.length > 0) {
        const latestFile = path.join(resultsDir, bundleFiles[0]);
        const bundleData = JSON.parse(await fs.readFile(latestFile, 'utf8'));
        this.results.bundle = bundleData;
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not extract bundle report'));
    }
  }

  async startDevServer() {
    console.log(chalk.yellow('🖥️  Starting development server...'));

    return new Promise((resolve, reject) => {
      const server = spawn('bun', ['run', 'preview'], {
        cwd: projectRoot,
        stdio: 'pipe',
        detached: false
      });

      let output = '';
      let serverReady = false;

      const checkServer = () => {
        if (output.includes('localhost:4321') || output.includes('http://') || serverReady) {
          serverReady = true;
          setTimeout(() => resolve(server), 2000); // Wait a bit more for server to be fully ready
        }
      };

      server.stdout.on('data', (data) => {
        output += data.toString();
        checkServer();
      });

      server.stderr.on('data', (data) => {
        output += data.toString();
        checkServer();
      });

      server.on('close', (code) => {
        if (!serverReady) {
          reject(new Error(`Server failed to start with code ${code}:\n${output}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverReady) {
          server.kill();
          reject(new Error('Server failed to start within 30 seconds'));
        }
      }, 30000);
    });
  }

  async runLighthouseTests() {
    console.log(chalk.yellow('🔍 Running Lighthouse performance tests...'));

    return new Promise((resolve, reject) => {
      const lighthouse = spawn('node', [path.join(__dirname, 'lighthouse-test.js'), 'run'], {
        cwd: projectRoot,
        stdio: 'pipe'
      });

      let output = '';
      lighthouse.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text); // Show real-time output
      });

      lighthouse.stderr.on('data', (data) => {
        output += data.toString();
      });

      lighthouse.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('✅ Lighthouse tests completed'));
          this.extractLatestLighthouseReport();
          resolve();
        } else {
          reject(new Error(`Lighthouse tests failed with code ${code}:\n${output}`));
        }
      });
    });
  }

  async extractLatestLighthouseReport() {
    try {
      const files = await fs.readdir(resultsDir);
      const lighthouseFiles = files.filter(f => f.startsWith('performance-')).sort().reverse();
      
      if (lighthouseFiles.length > 0) {
        const latestFile = path.join(resultsDir, lighthouseFiles[0]);
        const lighthouseData = JSON.parse(await fs.readFile(latestFile, 'utf8'));
        this.results.lighthouse = lighthouseData;
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not extract lighthouse report'));
    }
  }

  async stopDevServer(server) {
    console.log(chalk.yellow('🛑 Stopping development server...'));
    
    return new Promise((resolve) => {
      if (server && !server.killed) {
        server.kill('SIGTERM');
        
        server.on('close', () => {
          console.log(chalk.green('✅ Development server stopped'));
          resolve();
        });

        // Force kill after 5 seconds
        setTimeout(() => {
          if (!server.killed) {
            server.kill('SIGKILL');
            resolve();
          }
        }, 5000);
      } else {
        resolve();
      }
    });
  }

  async compareResults() {
    console.log(chalk.yellow('📈 Comparing with previous results...'));

    try {
      const files = await fs.readdir(resultsDir);
      const summaryFiles = files.filter(f => f.startsWith('performance-summary-')).sort().reverse();
      
      if (summaryFiles.length > 1) {
        // Compare with the second most recent (since the most recent is the current one)
        const previousFile = path.join(resultsDir, summaryFiles[1]);
        const previousData = JSON.parse(await fs.readFile(previousFile, 'utf8'));
        
        this.results.comparison = this.generateComparison(previousData, this.results);
        console.log(chalk.green('✅ Comparison completed'));
      } else {
        console.log(chalk.blue('ℹ️  No previous results to compare with'));
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not compare with previous results'));
    }
  }

  generateComparison(previous, current) {
    const comparison = {
      timestamp: new Date().toISOString(),
      improvements: [],
      regressions: [],
      summary: {}
    };

    // Compare bundle sizes
    if (previous.bundle && current.bundle) {
      const prevBundle = previous.bundle.summary;
      const currBundle = current.bundle.summary;

      ['javascript', 'css', 'images'].forEach(category => {
        const prevSize = prevBundle[category]?.totalSizeKB || 0;
        const currSize = currBundle[category]?.totalSizeKB || 0;
        const diff = currSize - prevSize;
        const percentChange = prevSize > 0 ? ((diff / prevSize) * 100) : 0;

        if (Math.abs(diff) > 1) { // Only report changes > 1KB
          const change = {
            category: `Bundle ${category}`,
            metric: 'Size (KB)',
            previous: prevSize,
            current: currSize,
            change: diff,
            percentChange: percentChange.toFixed(1)
          };

          if (diff < 0) {
            comparison.improvements.push(change);
          } else {
            comparison.regressions.push(change);
          }
        }
      });
    }

    // Compare Lighthouse scores
    if (previous.lighthouse && current.lighthouse) {
      const prevTests = previous.lighthouse.tests || [];
      const currTests = current.lighthouse.tests || [];

      currTests.forEach(currTest => {
        const prevTest = prevTests.find(t => t.name === currTest.name);
        if (!prevTest) return;

        const metrics = ['performanceScore', 'fcp', 'lcp', 'cls', 'tti'];
        metrics.forEach(metric => {
          const prevValue = prevTest.metrics[metric];
          const currValue = currTest.metrics[metric];
          const diff = currValue - prevValue;
          const percentChange = prevValue > 0 ? ((diff / prevValue) * 100) : 0;

          if (Math.abs(percentChange) > 5) { // Only report changes > 5%
            const change = {
              category: `${currTest.name} ${metric.toUpperCase()}`,
              metric: metric === 'performanceScore' ? 'Score' : 'Time (ms)',
              previous: prevValue,
              current: currValue,
              change: diff,
              percentChange: percentChange.toFixed(1)
            };

            // For performance score, higher is better; for timing metrics, lower is better
            const isImprovement = metric === 'performanceScore' ? diff > 0 : diff < 0;
            
            if (isImprovement) {
              comparison.improvements.push(change);
            } else {
              comparison.regressions.push(change);
            }
          }
        });
      });
    }

    comparison.summary = {
      totalImprovements: comparison.improvements.length,
      totalRegressions: comparison.regressions.length,
      netChange: comparison.improvements.length - comparison.regressions.length
    };

    return comparison;
  }

  async generateSummaryReport() {
    console.log(chalk.yellow('📋 Generating summary report...'));

    const summaryFile = path.join(resultsDir, `performance-summary-${Date.now()}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(this.results, null, 2));

    // Also generate a human-readable report
    const humanReport = this.generateHumanReport();
    const reportFile = path.join(resultsDir, `performance-report-${Date.now()}.md`);
    await fs.writeFile(reportFile, humanReport);

    console.log(chalk.green(`✅ Summary saved to: ${summaryFile}`));
    console.log(chalk.green(`✅ Human report saved to: ${reportFile}`));

    // Print summary to console
    this.printSummary();
  }

  generateHumanReport() {
    let report = `# Performance Test Report\n\n`;
    report += `**Date:** ${new Date(this.results.timestamp).toLocaleString()}\n\n`;

    // Bundle Analysis Summary
    if (this.results.bundle) {
      const bundle = this.results.bundle.summary;
      report += `## Bundle Analysis\n\n`;
      report += `- **Total Size:** ${bundle.totalSizeKB}KB\n`;
      report += `- **JavaScript:** ${bundle.javascript.totalSizeKB}KB (${bundle.javascript.files} files)\n`;
      report += `- **CSS:** ${bundle.css.totalSizeKB}KB (${bundle.css.files} files)\n`;
      report += `- **Images:** ${bundle.images.totalSizeKB}KB (${bundle.images.files} files)\n`;
      report += `- **Fonts:** ${bundle.fonts.totalSizeKB}KB (${bundle.fonts.files} files)\n\n`;
    }

    // Lighthouse Summary
    if (this.results.lighthouse && this.results.lighthouse.tests) {
      report += `## Lighthouse Performance\n\n`;
      this.results.lighthouse.tests.forEach(test => {
        report += `### ${test.name}\n`;
        report += `- **Performance Score:** ${test.metrics.performanceScore}/100\n`;
        report += `- **First Contentful Paint:** ${Math.round(test.metrics.fcp)}ms\n`;
        report += `- **Largest Contentful Paint:** ${Math.round(test.metrics.lcp)}ms\n`;
        report += `- **Cumulative Layout Shift:** ${test.metrics.cls.toFixed(3)}\n`;
        report += `- **Time to Interactive:** ${Math.round(test.metrics.tti)}ms\n\n`;
      });
    }

    // Comparison Summary
    if (this.results.comparison) {
      const comp = this.results.comparison;
      report += `## Performance Changes\n\n`;
      
      if (comp.improvements.length > 0) {
        report += `### Improvements ✅\n`;
        comp.improvements.forEach(imp => {
          report += `- **${imp.category}:** ${imp.change > 0 ? '+' : ''}${imp.change.toFixed(1)} ${imp.metric} (${imp.percentChange}%)\n`;
        });
        report += '\n';
      }

      if (comp.regressions.length > 0) {
        report += `### Regressions ⚠️\n`;
        comp.regressions.forEach(reg => {
          report += `- **${reg.category}:** ${reg.change > 0 ? '+' : ''}${reg.change.toFixed(1)} ${reg.metric} (${reg.percentChange}%)\n`;
        });
        report += '\n';
      }

      if (comp.improvements.length === 0 && comp.regressions.length === 0) {
        report += `No significant changes detected.\n\n`;
      }
    }

    return report;
  }

  printSummary() {
    console.log(chalk.blue.bold('\n📊 Performance Test Summary\n'));

    if (this.results.bundle) {
      const bundle = this.results.bundle.summary;
      console.log(chalk.white.bold('Bundle Analysis:'));
      console.log(`  Total: ${bundle.totalSizeKB}KB | JS: ${bundle.javascript.totalSizeKB}KB | CSS: ${bundle.css.totalSizeKB}KB`);
    }

    if (this.results.lighthouse && this.results.lighthouse.tests) {
      console.log(chalk.white.bold('\nLighthouse Scores:'));
      this.results.lighthouse.tests.forEach(test => {
        const score = test.metrics.performanceScore;
        const color = score >= 90 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
        console.log(`  ${test.name}: ${color(`${score}/100`)}`);
      });
    }

    if (this.results.comparison) {
      const comp = this.results.comparison;
      console.log(chalk.white.bold('\nChanges vs Previous:'));
      console.log(`  ${chalk.green(`✅ ${comp.improvements.length} improvements`)} | ${chalk.red(`⚠️  ${comp.regressions.length} regressions`)}`);
    }

    console.log('');
  }
}

// CLI execution
async function main() {
  const runner = new PerformanceTestRunner();
  await runner.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PerformanceTestRunner;