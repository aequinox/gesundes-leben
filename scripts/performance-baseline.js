import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

async function measurePerformance() {
  console.log('📊 Measuring build performance...\n');

  // Measure dist size
  const files = await glob('dist/**/*');
  let totalSize = 0;
  let fileCount = 0;

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      if (stats.isFile()) {
        totalSize += stats.size;
        fileCount++;
      }
    } catch (err) {
      // Skip files that can't be accessed
    }
  }

  // Measure largest files by type
  const jsFiles = await glob('dist/**/*.js');
  const cssFiles = await glob('dist/**/*.css');
  const htmlFiles = await glob('dist/**/*.html');
  const imageFiles = await glob('dist/**/*.{jpg,jpeg,png,webp,avif}');

  const measureFiles = async (fileList) => {
    const sizes = await Promise.all(
      fileList.map(async (file) => {
        try {
          const stats = await fs.stat(file);
          return { file: path.basename(file), path: file, size: stats.size };
        } catch {
          return null;
        }
      })
    );
    return sizes.filter(Boolean).sort((a, b) => b.size - a.size);
  };

  const jsSizes = await measureFiles(jsFiles);
  const cssSizes = await measureFiles(cssFiles);
  const htmlSizes = await measureFiles(htmlFiles);
  const imageSizes = await measureFiles(imageFiles);

  // Calculate totals
  const jsTotal = jsSizes.reduce((sum, f) => sum + f.size, 0);
  const cssTotal = cssSizes.reduce((sum, f) => sum + f.size, 0);
  const htmlTotal = htmlSizes.reduce((sum, f) => sum + f.size, 0);
  const imageTotal = imageSizes.reduce((sum, f) => sum + f.size, 0);

  // Report
  console.log('📦 Build Size Summary:');
  console.log(`   Total: ${(totalSize / 1024 / 1024).toFixed(2)}MB (${fileCount} files)`);
  console.log(`   JavaScript: ${(jsTotal / 1024 / 1024).toFixed(2)}MB (${jsFiles.length} files)`);
  console.log(`   CSS: ${(cssTotal / 1024).toFixed(2)}KB (${cssFiles.length} files)`);
  console.log(`   HTML: ${(htmlTotal / 1024 / 1024).toFixed(2)}MB (${htmlFiles.length} files)`);
  console.log(`   Images: ${(imageTotal / 1024 / 1024).toFixed(2)}MB (${imageFiles.length} files)`);

  console.log('\n📈 Largest JS Files (Top 10):');
  jsSizes.slice(0, 10).forEach(({ file, size }) => {
    console.log(`   ${file}: ${(size / 1024).toFixed(2)}KB`);
  });

  console.log('\n📈 Largest CSS Files (Top 5):');
  cssSizes.slice(0, 5).forEach(({ file, size }) => {
    console.log(`   ${file}: ${(size / 1024).toFixed(2)}KB`);
  });

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize: totalSize,
      totalSizeMB: parseFloat((totalSize / 1024 / 1024).toFixed(2)),
      fileCount,
      jsCount: jsFiles.length,
      cssCount: cssFiles.length,
      htmlCount: htmlFiles.length,
      imageCount: imageFiles.length,
    },
    breakdown: {
      javascript: {
        total: jsTotal,
        totalMB: parseFloat((jsTotal / 1024 / 1024).toFixed(2)),
        files: jsFiles.length,
        largest: jsSizes.slice(0, 20),
      },
      css: {
        total: cssTotal,
        totalKB: parseFloat((cssTotal / 1024).toFixed(2)),
        files: cssFiles.length,
        largest: cssSizes.slice(0, 10),
      },
      html: {
        total: htmlTotal,
        totalMB: parseFloat((htmlTotal / 1024 / 1024).toFixed(2)),
        files: htmlFiles.length,
      },
      images: {
        total: imageTotal,
        totalMB: parseFloat((imageTotal / 1024 / 1024).toFixed(2)),
        files: imageFiles.length,
        largest: imageSizes.slice(0, 20),
      },
    },
  };

  await fs.writeFile(
    'performance-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n✅ Report saved to performance-report.json');

  // Performance budget checks
  console.log('\n⚠️  Performance Budget Checks:');
  const warnings = [];

  if (jsTotal > 500 * 1024) {
    warnings.push(`JS bundle exceeds 500KB: ${(jsTotal / 1024).toFixed(2)}KB`);
  }
  if (cssTotal > 100 * 1024) {
    warnings.push(`CSS bundle exceeds 100KB: ${(cssTotal / 1024).toFixed(2)}KB`);
  }

  jsSizes.forEach(({ file, size }) => {
    if (size > 200 * 1024) {
      warnings.push(`Large JS file: ${file} (${(size / 1024).toFixed(2)}KB)`);
    }
  });

  if (warnings.length > 0) {
    warnings.forEach(w => console.log(`   ⚠️  ${w}`));
  } else {
    console.log('   ✅ All performance budgets met!');
  }
}

measurePerformance().catch(console.error);
