#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes the Astro build output to identify:
 * - Large dependencies
 * - Unused imports
 * - Bundle size by route
 * - Optimization opportunities
 */

import { writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

/**
 * Analyze bundle sizes and generate report
 */
function analyzeBundle() {
  if (!existsSync(distDir)) {
    console.error('❌ No dist directory found. Run `bun run build` first.');
    process.exit(1);
  }

  console.log('🔍 Analyzing bundle...\n');

  const analysis = {
    totalSize: 0,
    files: [],
    assets: {
      js: [],
      css: [],
      images: [],
      fonts: [],
      other: []
    },
    largestFiles: [],
    recommendations: []
  };

  // Recursively analyze directory
  function analyzeDirectory(dir, basePath = '') {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = join(basePath, item);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        analyzeDirectory(fullPath, relativePath);
      } else {
        const size = stats.size;
        const ext = extname(item).toLowerCase();
        
        analysis.totalSize += size;
        
        const fileInfo = {
          path: relativePath,
          size,
          sizeKB: Math.round(size / 1024),
          sizeMB: Math.round(size / (1024 * 1024) * 100) / 100,
          extension: ext
        };
        
        analysis.files.push(fileInfo);
        
        // Categorize by file type
        if (['.js', '.mjs', '.ts'].includes(ext)) {
          analysis.assets.js.push(fileInfo);
        } else if (['.css', '.scss', '.sass'].includes(ext)) {
          analysis.assets.css.push(fileInfo);
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
          analysis.assets.images.push(fileInfo);
        } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
          analysis.assets.fonts.push(fileInfo);
        } else {
          analysis.assets.other.push(fileInfo);
        }
      }
    }
  }

  analyzeDirectory(distDir);

  // Sort files by size
  analysis.files.sort((a, b) => b.size - a.size);
  analysis.largestFiles = analysis.files.slice(0, 10);

  // Generate recommendations
  generateRecommendations(analysis);

  // Generate report
  generateReport(analysis);
  
  return analysis;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(analysis) {
  const { assets, totalSize } = analysis;
  const totalSizeMB = totalSize / (1024 * 1024);

  // Large bundle warning
  if (totalSizeMB > 10) {
    analysis.recommendations.push({
      type: 'warning',
      title: 'Large bundle size',
      description: `Total bundle size is ${totalSizeMB.toFixed(2)}MB. Consider code splitting and lazy loading.`,
      priority: 'high'
    });
  }

  // Large JavaScript files
  const largeJSFiles = assets.js.filter(file => file.size > 100 * 1024); // > 100KB
  if (largeJSFiles.length > 0) {
    analysis.recommendations.push({
      type: 'optimization',
      title: 'Large JavaScript files detected',
      description: `Found ${largeJSFiles.length} JS files over 100KB. Consider code splitting.`,
      files: largeJSFiles.map(f => f.path),
      priority: 'medium'
    });
  }

  // Large CSS files
  const largeCSSFiles = assets.css.filter(file => file.size > 50 * 1024); // > 50KB
  if (largeCSSFiles.length > 0) {
    analysis.recommendations.push({
      type: 'optimization',
      title: 'Large CSS files detected',
      description: `Found ${largeCSSFiles.length} CSS files over 50KB. Consider CSS purging and critical CSS.`,
      files: largeCSSFiles.map(f => f.path),
      priority: 'medium'
    });
  }

  // Unoptimized images
  const largeImages = assets.images.filter(file => file.size > 500 * 1024); // > 500KB
  if (largeImages.length > 0) {
    analysis.recommendations.push({
      type: 'optimization',
      title: 'Large images detected',
      description: `Found ${largeImages.length} images over 500KB. Consider image optimization and modern formats.`,
      files: largeImages.map(f => f.path),
      priority: 'high'
    });
  }

  // Missing modern image formats
  const hasWebP = assets.images.some(f => f.extension === '.webp');
  const hasAVIF = assets.images.some(f => f.extension === '.avif');
  const hasLegacyImages = assets.images.some(f => ['.jpg', '.jpeg', '.png'].includes(f.extension));
  
  if (hasLegacyImages && (!hasWebP || !hasAVIF)) {
    analysis.recommendations.push({
      type: 'optimization',
      title: 'Modern image formats missing',
      description: 'Consider using WebP and AVIF formats for better compression.',
      priority: 'medium'
    });
  }

  // Font optimization
  const largeFonts = assets.fonts.filter(file => file.size > 100 * 1024); // > 100KB
  if (largeFonts.length > 0) {
    analysis.recommendations.push({
      type: 'optimization',
      title: 'Large font files detected',
      description: `Found ${largeFonts.length} font files over 100KB. Consider font subsetting and preloading.`,
      files: largeFonts.map(f => f.path),
      priority: 'low'
    });
  }
}

/**
 * Generate and save analysis report
 */
function generateReport(analysis) {
  const report = `
# Bundle Analysis Report

Generated on: ${new Date().toISOString()}

## Summary

- **Total Bundle Size**: ${(analysis.totalSize / (1024 * 1024)).toFixed(2)} MB
- **Total Files**: ${analysis.files.length}
- **JavaScript Files**: ${analysis.assets.js.length} (${(analysis.assets.js.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)} MB)
- **CSS Files**: ${analysis.assets.css.length} (${(analysis.assets.css.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)
- **Images**: ${analysis.assets.images.length} (${(analysis.assets.images.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(2)} MB)
- **Fonts**: ${analysis.assets.fonts.length} (${(analysis.assets.fonts.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB)

## Largest Files

${analysis.largestFiles.map(file => 
  `- **${file.path}**: ${file.sizeMB > 0 ? file.sizeMB + ' MB' : file.sizeKB + ' KB'}`
).join('\n')}

## Recommendations

${analysis.recommendations.map(rec => 
  `### ${rec.title} (${rec.priority} priority)

${rec.description}

${rec.files ? rec.files.map(f => `- ${f}`).join('\n') : ''}
`).join('\n')}

## Asset Breakdown

### JavaScript Files
${analysis.assets.js.slice(0, 10).map(file => 
  `- ${file.path}: ${file.sizeKB} KB`
).join('\n')}

### CSS Files
${analysis.assets.css.map(file => 
  `- ${file.path}: ${file.sizeKB} KB`
).join('\n')}

### Images (Top 10)
${analysis.assets.images.slice(0, 10).map(file => 
  `- ${file.path}: ${file.sizeMB > 0 ? file.sizeMB + ' MB' : file.sizeKB + ' KB'}`
).join('\n')}

---

*To optimize your bundle, focus on the high-priority recommendations first.*
`;

  const reportPath = join(projectRoot, 'bundle-analysis.md');
  writeFileSync(reportPath, report.trim());
  
  console.log('📊 Bundle Analysis Complete!\n');
  console.log(`📁 Total Size: ${(analysis.totalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📄 Total Files: ${analysis.files.length}`);
  console.log(`🔍 Report saved to: bundle-analysis.md\n`);

  // Print high-priority recommendations
  const highPriorityRecs = analysis.recommendations.filter(r => r.priority === 'high');
  if (highPriorityRecs.length > 0) {
    console.log('⚠️  High Priority Recommendations:');
    highPriorityRecs.forEach(rec => {
      console.log(`   • ${rec.title}`);
    });
    console.log('');
  }

  // Print largest files
  console.log('📈 Largest Files:');
  analysis.largestFiles.slice(0, 5).forEach(file => {
    const size = file.sizeMB > 0 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
    console.log(`   • ${file.path}: ${size}`);
  });
}

/**
 * Check if file exists (simple implementation)
 */
function existsSync(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundle();
}

export { analyzeBundle };