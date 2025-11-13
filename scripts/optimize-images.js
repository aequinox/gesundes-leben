import sharp from 'sharp';
import globPkg from 'glob';
import path from 'path';
import fs from 'fs/promises';

const { glob } = globPkg;

const MAX_WIDTH = 2400; // Max width for any image
const QUALITY = 85; // JPEG/WebP quality

async function optimizeImages() {
  const images = await glob('src/data/blog/**/images/*.{jpg,jpeg,png}');
  console.log(`Found ${images.length} images to optimize`);

  let totalSaved = 0;
  let optimizedCount = 0;
  let skippedCount = 0;

  for (const imgPath of images) {
    const stats = await fs.stat(imgPath);
    const originalSize = stats.size;

    // Skip if already small enough
    if (originalSize < 500000) { // 500KB
      skippedCount++;
      continue;
    }

    try {
      const image = sharp(imgPath);
      const metadata = await image.metadata();

      // Create backup
      await fs.copyFile(imgPath, `${imgPath}.backup`);

      // Optimize
      await image
        .resize(Math.min(metadata.width, MAX_WIDTH), null, {
          withoutEnlargement: true,
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(`${imgPath}.optimized`);

      // Replace original
      await fs.rename(`${imgPath}.optimized`, imgPath);

      const newStats = await fs.stat(imgPath);
      const saved = originalSize - newStats.size;
      totalSaved += saved;
      optimizedCount++;

      console.log(`✓ ${path.basename(imgPath)}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(newStats.size/1024/1024).toFixed(2)}MB (saved ${(saved/1024/1024).toFixed(2)}MB)`);
    } catch (error) {
      console.error(`✗ Failed to optimize ${path.basename(imgPath)}:`, error.message);
      // Restore backup if optimization failed
      try {
        await fs.copyFile(`${imgPath}.backup`, imgPath);
        await fs.unlink(`${imgPath}.backup`);
      } catch (restoreError) {
        console.error(`  Failed to restore backup:`, restoreError.message);
      }
    }
  }

  console.log(`\n📊 Optimization Summary:`);
  console.log(`   Optimized: ${optimizedCount} images`);
  console.log(`   Skipped: ${skippedCount} images (already <500KB)`);
  console.log(`   Total saved: ${(totalSaved/1024/1024).toFixed(2)}MB`);
  console.log(`\n✅ Backups created with .backup extension`);
  console.log(`   To remove backups: bun run images:backup`);
  console.log(`   To restore originals: bun run images:restore`);
}

optimizeImages().catch(console.error);
