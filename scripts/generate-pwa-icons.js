#!/usr/bin/env node
/**
 * Generate PWA icons from favicon.svg
 * Uses Sharp library for SVG to PNG conversion
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Icon sizes to generate
const iconSizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

async function generateIcons() {
  try {
    console.log('📦 Generating PWA icons from favicon.svg...\n');

    const svgPath = join(rootDir, 'public', 'favicon.svg');
    const svgBuffer = readFileSync(svgPath);

    for (const icon of iconSizes) {
      const outputPath = join(rootDir, 'public', icon.name);

      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate favicon.ico (multi-resolution)
    const faviconIcoPath = join(rootDir, 'public', 'favicon.ico');
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    // For ICO file, we'll just use the 32x32 PNG
    // (proper ICO generation requires additional library)
    await sharp(svgBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(faviconIcoPath);

    console.log(`✅ Generated favicon.ico (32x32)`);

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📝 Generated files:');
    iconSizes.forEach(icon => console.log(`   - public/${icon.name}`));
    console.log('   - public/favicon.ico');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
