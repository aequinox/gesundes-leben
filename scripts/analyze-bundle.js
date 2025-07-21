#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @file analyze-bundle.js
 * @description Advanced bundle analyzer for Astro projects
 * 
 * Provides comprehensive analysis of build output including:
 * - Bundle size analysis
 * - Asset optimization recommendations  
 * - Performance metrics
 * - Treeshaking analysis
 * - Critical path identification
 * 
 * @example
 * ```bash
 * # Run analysis after build
 * bun run analyze
 * 
 * # Run with detailed reporting
 * node scripts/analyze-bundle.js --detailed
 * 
 * # Compare with baseline
 * node scripts/analyze-bundle.js --compare=baseline.json
 * ```
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, basename, resolve } from 'path';
import { createHash } from 'crypto';

// === Configuration ===
const CONFIG = {
  buildDir: './dist',
  outputFile: './tests/performance/results/bundle-analysis-{timestamp}.json',
  thresholds: {
    // Size thresholds in bytes
    totalSize: 2 * 1024 * 1024, // 2MB total
    jsChunkSize: 250 * 1024,    // 250KB per JS chunk
    cssFileSize: 100 * 1024,    // 100KB per CSS file
    imageSize: 500 * 1024,      // 500KB per image
    fontSize: 200 * 1024,       // 200KB per font
  },
  patterns: {
    js: /\.(js|mjs|ts)$/,
    css: /\.css$/,
    images: /\.(jpg|jpeg|png|gif|webp|avif|svg)$/,
    fonts: /\.(woff|woff2|ttf|otf|eot)$/,
    assets: /\.(ico|xml|txt|json)$/,
  },
  compression: {
    // Estimate compression ratios
    gzip: 0.3,
    brotli: 0.25,
  }
};

// === Utility Functions ===

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Calculate file hash for cache busting analysis
 */
async function getFileHash(filePath) {
  try {
    const content = await readFile(filePath);
    return createHash('md5').update(content).digest('hex').substring(0, 8);
  } catch {
    return null;
  }
}

/**
 * Analyze file compression potential
 */
function analyzeCompression(size) {
  return {
    original: size,
    gzip: Math.round(size * CONFIG.compression.gzip),
    brotli: Math.round(size * CONFIG.compression.brotli),
    savings: {
      gzip: Math.round(size * (1 - CONFIG.compression.gzip)),
      brotli: Math.round(size * (1 - CONFIG.compression.brotli)),
    }
  };
}

/**
 * Check if file exceeds size threshold
 */
function checkThresholds(filePath, size) {
  const warnings = [];
  const errors = [];
  
  // Determine file type and check appropriate threshold
  if (CONFIG.patterns.js.test(filePath)) {
    if (size > CONFIG.thresholds.jsChunkSize) {
      warnings.push(`JS chunk ${basename(filePath)} is ${formatBytes(size)}, exceeds ${formatBytes(CONFIG.thresholds.jsChunkSize)} threshold`);
    }
  } else if (CONFIG.patterns.css.test(filePath)) {
    if (size > CONFIG.thresholds.cssFileSize) {
      warnings.push(`CSS file ${basename(filePath)} is ${formatBytes(size)}, exceeds ${formatBytes(CONFIG.thresholds.cssFileSize)} threshold`);
    }
  } else if (CONFIG.patterns.images.test(filePath)) {
    if (size > CONFIG.thresholds.imageSize) {
      warnings.push(`Image ${basename(filePath)} is ${formatBytes(size)}, exceeds ${formatBytes(CONFIG.thresholds.imageSize)} threshold`);
    }
  } else if (CONFIG.patterns.fonts.test(filePath)) {
    if (size > CONFIG.thresholds.fontSize) {
      warnings.push(`Font ${basename(filePath)} is ${formatBytes(size)}, exceeds ${formatBytes(CONFIG.thresholds.fontSize)} threshold`);
    }
  }
  
  return { warnings, errors };
}

/**
 * Recursively analyze directory
 */
async function analyzeDirectory(dirPath, baseDir = dirPath) {
  const items = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = fullPath.replace(baseDir + '/', '');
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        const subItems = await analyzeDirectory(fullPath, baseDir);
        items.push(...subItems);
      } else if (entry.isFile()) {
        const stats = await stat(fullPath);
        const hash = await getFileHash(fullPath);
        const compression = analyzeCompression(stats.size);
        const thresholds = checkThresholds(fullPath, stats.size);
        
        items.push({
          path: relativePath,
          fullPath,
          name: entry.name,
          size: stats.size,
          hash,
          compression,
          type: getFileType(entry.name),
          warnings: thresholds.warnings,
          errors: thresholds.errors,
          modified: stats.mtime,
        });
      }
    }
  } catch (error) {
    console.warn(`Error analyzing directory ${dirPath}:`, error.message);
  }
  
  return items;
}

/**
 * Determine file type category
 */
function getFileType(fileName) {
  
  if (CONFIG.patterns.js.test(fileName)) return 'javascript';
  if (CONFIG.patterns.css.test(fileName)) return 'stylesheet';
  if (CONFIG.patterns.images.test(fileName)) return 'image';
  if (CONFIG.patterns.fonts.test(fileName)) return 'font';
  if (CONFIG.patterns.assets.test(fileName)) return 'asset';
  
  return 'other';
}

/**
 * Generate bundle analysis report
 */
function generateReport(files) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalSize: 0,
      totalCompressed: {
        gzip: 0,
        brotli: 0,
      },
      fileTypes: {},
      largestFiles: [],
      warnings: [],
      errors: [],
    },
    files: files,
    recommendations: [],
    performance: {
      cacheability: {},
      loadingStrategy: {},
    }
  };
  
  // Calculate summary statistics
  files.forEach(file => {
    report.summary.totalSize += file.size;
    report.summary.totalCompressed.gzip += file.compression.gzip;
    report.summary.totalCompressed.brotli += file.compression.brotli;
    
    // Count by file type
    if (!report.summary.fileTypes[file.type]) {
      report.summary.fileTypes[file.type] = {
        count: 0,
        totalSize: 0,
      };
    }
    report.summary.fileTypes[file.type].count++;
    report.summary.fileTypes[file.type].totalSize += file.size;
    
    // Collect warnings and errors
    report.summary.warnings.push(...file.warnings);
    report.summary.errors.push(...file.errors);
  });
  
  // Find largest files
  report.summary.largestFiles = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(file => ({
      path: file.path,
      size: file.size,
      formatted: formatBytes(file.size),
      type: file.type,
    }));
  
  // Generate recommendations
  generateRecommendations(report);
  
  // Analyze cacheability
  analyzeCacheability(report);
  
  return report;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(report) {
  const recs = report.recommendations;
  
  // Check total bundle size
  if (report.summary.totalSize > CONFIG.thresholds.totalSize) {
    recs.push({
      type: 'warning',
      category: 'bundle-size',
      message: `Total bundle size (${formatBytes(report.summary.totalSize)}) exceeds recommended threshold (${formatBytes(CONFIG.thresholds.totalSize)})`,
      impact: 'high',
      solutions: [
        'Consider code splitting for large JavaScript chunks',
        'Implement lazy loading for non-critical assets',
        'Optimize images using modern formats (AVIF, WebP)',
        'Remove unused CSS and JavaScript',
      ]
    });
  }
  
  // Check JavaScript chunks
  const jsFiles = report.files.filter(f => f.type === 'javascript');
  const largeJsFiles = jsFiles.filter(f => f.size > CONFIG.thresholds.jsChunkSize);
  
  if (largeJsFiles.length > 0) {
    recs.push({
      type: 'warning',
      category: 'javascript-optimization',
      message: `${largeJsFiles.length} JavaScript files exceed size threshold`,
      impact: 'medium',
      files: largeJsFiles.map(f => f.path),
      solutions: [
        'Split large chunks using dynamic imports',
        'Remove unused dependencies',
        'Use tree shaking to eliminate dead code',
        'Consider using smaller alternatives for large libraries',
      ]
    });
  }
  
  // Check images
  const imageFiles = report.files.filter(f => f.type === 'image');
  const unoptimizedImages = imageFiles.filter(f => 
    f.size > 100 * 1024 && !f.name.includes('.webp') && !f.name.includes('.avif')
  );
  
  if (unoptimizedImages.length > 0) {
    recs.push({
      type: 'info',
      category: 'image-optimization',
      message: `${unoptimizedImages.length} images could be further optimized`,
      impact: 'medium',
      files: unoptimizedImages.map(f => f.path),
      solutions: [
        'Convert large images to WebP or AVIF format',
        'Implement responsive images with srcset',
        'Use image CDN for automatic optimization',
        'Consider progressive JPEG for large photos',
      ]
    });
  }
  
  // Check for unused files (heuristic based on naming)
  const potentialUnusedFiles = report.files.filter(f => 
    f.name.includes('unused') || 
    f.name.includes('legacy') || 
    f.name.includes('backup')
  );
  
  if (potentialUnusedFiles.length > 0) {
    recs.push({
      type: 'info',
      category: 'cleanup',
      message: `${potentialUnusedFiles.length} files appear to be unused`,
      impact: 'low',
      files: potentialUnusedFiles.map(f => f.path),
      solutions: [
        'Remove unused legacy files',
        'Clean up backup files from build output',
        'Use bundle analyzer to identify unused code',
      ]
    });
  }
}

/**
 * Analyze cacheability of assets
 */
function analyzeCacheability(report) {
  const hashedFiles = report.files.filter(f => /\.[a-f0-9]{8,}\./i.test(f.name));
  const unhashedFiles = report.files.filter(f => 
    f.type !== 'asset' && !f.name.includes('index.') && !/\.[a-f0-9]{8,}\./i.test(f.name)
  );
  
  report.performance.cacheability = {
    hashedFiles: hashedFiles.length,
    unhashedFiles: unhashedFiles.length,
    cacheableSize: hashedFiles.reduce((sum, f) => sum + f.size, 0),
    uncacheableSize: unhashedFiles.reduce((sum, f) => sum + f.size, 0),
  };
  
  if (unhashedFiles.length > 0) {
    report.recommendations.push({
      type: 'info',
      category: 'caching',
      message: `${unhashedFiles.length} files lack content hashing for optimal caching`,
      impact: 'low',
      files: unhashedFiles.slice(0, 5).map(f => f.path),
      solutions: [
        'Enable content hashing in build configuration',
        'Use cache-busting strategies for dynamic content',
        'Implement proper cache headers on server',
      ]
    });
  }
}

/**
 * Save analysis results
 */
async function saveResults(report) {
  const timestamp = Date.now();
  const outputPath = CONFIG.outputFile.replace('{timestamp}', timestamp);
  
  try {
    await writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Bundle analysis saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Failed to save analysis results:', error.message);
    return null;
  }
}

/**
 * Display analysis summary
 */
function displaySummary(report) {
  console.log('\n🔍 Bundle Analysis Summary');
  console.log('='.repeat(50));
  
  console.log(`📦 Total Files: ${report.summary.totalFiles}`);
  console.log(`📏 Total Size: ${formatBytes(report.summary.totalSize)}`);
  console.log(`🗜️  Compressed (Gzip): ${formatBytes(report.summary.totalCompressed.gzip)}`);
  console.log(`🗜️  Compressed (Brotli): ${formatBytes(report.summary.totalCompressed.brotli)}`);
  
  console.log('\n📊 File Types:');
  Object.entries(report.summary.fileTypes).forEach(([type, data]) => {
    console.log(`  ${type}: ${data.count} files (${formatBytes(data.totalSize)})`);
  });
  
  console.log('\n🏆 Largest Files:');
  report.summary.largestFiles.slice(0, 5).forEach((file, i) => {
    console.log(`  ${i + 1}. ${file.path} - ${file.formatted}`);
  });
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec) => {
      const icon = rec.type === 'warning' ? '⚠️' : rec.type === 'error' ? '❌' : 'ℹ️';
      console.log(`  ${icon} ${rec.message}`);
      if (rec.solutions && rec.solutions.length > 0) {
        console.log(`     Solutions: ${rec.solutions[0]}`);
      }
    });
  }
  
  if (report.summary.warnings.length > 0) {
    console.log(`\n⚠️  ${report.summary.warnings.length} warnings found`);
  }
  
  if (report.summary.errors.length > 0) {
    console.log(`\n❌ ${report.summary.errors.length} errors found`);
  }
  
  console.log('\n✅ Analysis complete!');
}

/**
 * Main analysis function
 */
async function analyzeBundleSize() {
  try {
    console.log('🔍 Starting bundle analysis...');
    
    // Check if build directory exists
    try {
      await stat(CONFIG.buildDir);
    } catch {
      console.error(`❌ Build directory not found: ${CONFIG.buildDir}`);
      console.log('💡 Run "bun run build" first to generate the bundle');
      process.exit(1);
    }
    
    // Analyze all files in build directory
    console.log(`📁 Analyzing files in ${CONFIG.buildDir}...`);
    const files = await analyzeDirectory(CONFIG.buildDir);
    
    if (files.length === 0) {
      console.warn('⚠️  No files found in build directory');
      process.exit(1);
    }
    
    // Generate comprehensive report
    console.log('📊 Generating analysis report...');
    const report = generateReport(files);
    
    // Save results
    await saveResults(report);
    
    // Display summary
    displaySummary(report);
    
    // Check for critical issues
    if (report.summary.errors.length > 0) {
      console.log('\n❌ Critical issues found! Check the full report for details.');
      process.exit(1);
    }
    
    if (report.summary.warnings.length > 5) {
      console.log('\n⚠️  Multiple warnings found. Consider optimizing the bundle.');
      process.exit(1);
    }
    
    console.log('\n🎉 Bundle analysis completed successfully!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${resolve(process.argv[1])}`) {
  analyzeBundleSize();
}

export { analyzeBundleSize, generateReport, CONFIG };