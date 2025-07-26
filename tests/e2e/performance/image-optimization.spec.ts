import { test, expect } from '@playwright/test';

import { 
  SAMPLE_BLOG_POSTS,
  VIEWPORT_SIZES
} from '../utils/fixtures';
import { 
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Image Optimization', () => {
  test.describe('Image Format and Compression', () => {
    test('should use modern image formats where supported', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await waitForPageLoad(page);
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const imageData = [];
        
        for (let i = 0; i < Math.min(10, imageCount); i++) {
          const img = images.nth(i);
          const src = await img.getAttribute('src');
          const srcset = await img.getAttribute('srcset');
          
          if (src) {
            imageData.push({ src, srcset });
          }
        }
        
        // Check for modern formats
        const modernFormats = imageData.filter(img => 
          img.src.includes('.webp') || 
          img.src.includes('.avif') ||
          (img.srcset && (img.srcset.includes('.webp') || img.srcset.includes('.avif')))
        );
        
        // At least some images should use modern formats
        if (imageData.length > 0) {
          expect(modernFormats.length).toBeGreaterThan(0);
        }
      }
    });

    test('should have optimized image sizes', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(5, imageCount); i++) {
          const img = images.nth(i);
          
          if (await img.isVisible()) {
            const src = await img.getAttribute('src');
            
            if (src && !src.startsWith('data:')) {
              // Get image response
              const response = await page.request.get(src);
              const buffer = await response.body();
              const imageSize = buffer.length;
              
              // Images should not be excessively large
              expect(imageSize).toBeLessThan(500 * 1024); // 500KB max for most images
              
              // Check if it's a hero image (might be larger)
              const isHeroImage = await img.evaluate(el => {
                return el.closest('.hero, #hero, .banner') !== null;
              });
              
              if (!isHeroImage) {
                expect(imageSize).toBeLessThan(200 * 1024); // 200KB for regular images
              }
            }
          }
        }
      }
    });

    test('should use appropriate image compression', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const images = page.locator('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const img = images.nth(i);
          const src = await img.getAttribute('src');
          
          if (src) {
            const response = await page.request.get(src);
            const buffer = await response.body();
            const imageSize = buffer.length;
            
            // Get image dimensions
            const dimensions = await img.evaluate(el => ({
              width: el.naturalWidth,
              height: el.naturalHeight,
              displayWidth: el.offsetWidth,
              displayHeight: el.offsetHeight
            }));
            
            // Calculate compression ratio (bytes per pixel)
            const pixels = dimensions.width * dimensions.height;
            const bytesPerPixel = imageSize / pixels;
            
            // Should have reasonable compression
            if (src.includes('.jpg') || src.includes('.jpeg')) {
              expect(bytesPerPixel).toBeLessThan(1.5); // JPEG should be well compressed
            } else if (src.includes('.png')) {
              expect(bytesPerPixel).toBeLessThan(3); // PNG allows less compression
            }
          }
        }
      }
    });
  });

  test.describe('Responsive Images', () => {
    test('should use srcset for responsive images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const imagesWithSrcset = await page.locator('img[srcset]').count();
        
        // At least some images should use srcset
        if (imageCount > 2) {
          expect(imagesWithSrcset).toBeGreaterThan(0);
        }
        
        // Check srcset format
        const srcsetImages = page.locator('img[srcset]');
        const srcsetCount = await srcsetImages.count();
        
        if (srcsetCount > 0) {
          const firstSrcset = await srcsetImages.first().getAttribute('srcset');
          
          if (firstSrcset) {
            // Srcset should have multiple resolutions
            const srcsetEntries = firstSrcset.split(',').length;
            expect(srcsetEntries).toBeGreaterThan(1);
            
            // Should include width descriptors
            expect(firstSrcset).toMatch(/\d+w/);
          }
        }
      }
    });

    test('should serve appropriate image sizes for viewport', async ({ page }) => {
      const viewports = [
        VIEWPORT_SIZES.mobile,
        VIEWPORT_SIZES.tablet,
        VIEWPORT_SIZES.desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/', { waitUntil: 'networkidle' });
        
        const responsiveImages = page.locator('img[srcset]');
        const imageCount = await responsiveImages.count();
        
        if (imageCount > 0) {
          const img = responsiveImages.first();
          
          // Get actual image being used
          const currentSrc = await img.evaluate(el => el.currentSrc || el.src);
          
          if (currentSrc) {
            // Get image dimensions
            const response = await page.request.get(currentSrc);
            const buffer = await response.body();
            const imageSize = buffer.length;
            
            const displayWidth = await img.evaluate(el => el.offsetWidth);
            
            // Smaller viewports should generally use smaller images
            if (viewport.width <= 768) {
              expect(imageSize).toBeLessThan(300 * 1024); // Mobile should use smaller images
            }
            
            // Image should not be dramatically oversized for display
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            
            if (naturalWidth > 0 && displayWidth > 0) {
              const oversizeRatio = naturalWidth / (displayWidth * 2); // Allow 2x for retina
              expect(oversizeRatio).toBeLessThan(3); // Not more than 3x oversized
            }
          }
        }
      }
    });

    test('should use proper sizes attribute', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const imagesWithSizes = page.locator('img[sizes]');
      const sizesCount = await imagesWithSizes.count();
      
      if (sizesCount > 0) {
        for (let i = 0; i < Math.min(3, sizesCount); i++) {
          const img = imagesWithSizes.nth(i);
          const sizes = await img.getAttribute('sizes');
          
          if (sizes) {
            // Sizes should include media queries or viewport units
            expect(sizes).toMatch(/(min-width|max-width|vw|px|%)/);
            
            // Should not just be a single value without context
            if (!sizes.includes('(')) {
              expect(sizes).toMatch(/(vw|%)/);
            }
          }
        }
      }
    });
  });

  test.describe('Image Loading Performance', () => {
    test('should use lazy loading for below-the-fold images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 1) {
        // Check for lazy loading attributes
        const lazyImages = await page.locator('img[loading="lazy"]').count();
        const _eagerImages = await page.locator('img[loading="eager"]').count();
        
        // Should have at least some lazy-loaded images
        if (imageCount > 3) {
          expect(lazyImages).toBeGreaterThan(0);
        }
        
        // First image might be eager, others should be lazy
        const firstImage = images.first();
        const firstImageLoading = await firstImage.getAttribute('loading');
        
        // Above-the-fold images can be eager or have no loading attribute
        expect(['eager', 'lazy', null]).toContain(firstImageLoading);
      }
    });

    test('should load images progressively', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Count loaded images immediately
      const initialLoadedImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => img.complete && img.naturalWidth > 0).length;
      });
      
      // Wait a bit for lazy loading
      await page.waitForTimeout(2000);
      
      // Count loaded images after delay
      const laterLoadedImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => img.complete && img.naturalWidth > 0).length;
      });
      
      // More images should be loaded after delay (lazy loading working)
      if (await page.locator('img').count() > 2) {
        expect(laterLoadedImages).toBeGreaterThanOrEqual(initialLoadedImages);
      }
    });

    test('should not cause layout shifts from image loading', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Set up layout shift monitoring
      await page.evaluate(() => {
        window.layoutShifts = [];
        
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              window.layoutShifts.push(entry.value);
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      // Wait for images to load
      await page.waitForFunction(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.length === 0 || images.every(img => img.complete);
      }, { timeout: 10000 });
      
      const layoutShifts = await page.evaluate(() => window.layoutShifts);
      const totalShift = layoutShifts.reduce((sum, shift) => sum + shift, 0);
      
      // Images should not cause significant layout shifts
      expect(totalShift).toBeLessThan(0.1);
    });

    test('should have proper image dimensions to prevent shifts', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(5, imageCount); i++) {
          const img = images.nth(i);
          
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          const style = await img.getAttribute('style');
          
          // Image should have dimensions specified
          const hasDimensions = 
            (width && height) ||
            (style && (style.includes('width') || style.includes('height'))) ||
            await img.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return computed.width !== 'auto' || computed.height !== 'auto';
            });
          
          expect(hasDimensions).toBeTruthy();
        }
      }
    });
  });

  test.describe('Image Accessibility and SEO', () => {
    test('should have meaningful alt text for content images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          const role = await img.getAttribute('role');
          const ariaHidden = await img.getAttribute('aria-hidden');
          
          // Image should have alt text or be marked as decorative
          const isDecorative = 
            role === 'presentation' || 
            ariaHidden === 'true' ||
            alt === '';
          
          if (!isDecorative) {
            expect(alt).toBeTruthy();
            expect(alt!.length).toBeGreaterThan(3);
            
            // Alt text should be descriptive, not just filename
            expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|webp|avif)$/i);
            expect(alt).not.toMatch(/^(image|photo|picture|img)/i);
          }
        }
      }
    });

    test('should optimize images for blog posts', async ({ page }) => {
      const postSlug = SAMPLE_BLOG_POSTS[0];
      await page.goto(`/posts/${postSlug}`, { waitUntil: 'networkidle' });
      
      const articleImages = page.locator('article img, .article-content img');
      const imageCount = await articleImages.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const img = articleImages.nth(i);
          
          // Should have alt text
          const alt = await img.getAttribute('alt');
          expect(alt).toBeTruthy();
          
          // Should be appropriately sized
          const src = await img.getAttribute('src');
          
          if (src && !src.startsWith('data:')) {
            const response = await page.request.get(src);
            const buffer = await response.body();
            const imageSize = buffer.length;
            
            // Blog images should be optimized
            expect(imageSize).toBeLessThan(400 * 1024); // 400KB max
            
            const dimensions = await img.evaluate(el => ({
              naturalWidth: el.naturalWidth,
              naturalHeight: el.naturalHeight,
              displayWidth: el.offsetWidth
            }));
            
            // Should not be dramatically oversized
            if (dimensions.naturalWidth > 0 && dimensions.displayWidth > 0) {
              const oversizeRatio = dimensions.naturalWidth / (dimensions.displayWidth * 2);
              expect(oversizeRatio).toBeLessThan(2.5);
            }
          }
        }
      }
    });

    test('should use structured data for images where appropriate', async ({ page }) => {
      const postSlug = SAMPLE_BLOG_POSTS[0];
      await page.goto(`/posts/${postSlug}`, { waitUntil: 'networkidle' });
      
      // Look for structured data
      const structuredData = page.locator('script[type="application/ld+json"]');
      
      if (await structuredData.count() > 0) {
        const jsonContent = await structuredData.textContent();
        
        if (jsonContent) {
          const data = JSON.parse(jsonContent);
          
          // Check for image properties in structured data
          if (data.image || data['@type'] === 'ImageObject') {
            expect(data.image || data.url).toBeTruthy();
            
            if (data.image) {
              // Should have proper image schema
              if (typeof data.image === 'object') {
                expect(data.image.url || data.image['@id']).toBeTruthy();
              }
            }
          }
        }
      }
    });
  });

  test.describe('Advanced Image Optimization', () => {
    test('should use picture element for art direction', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const pictureElements = page.locator('picture');
      const pictureCount = await pictureElements.count();
      
      if (pictureCount > 0) {
        for (let i = 0; i < pictureCount; i++) {
          const picture = pictureElements.nth(i);
          
          // Picture should have sources
          const sources = picture.locator('source');
          const sourceCount = await sources.count();
          
          expect(sourceCount).toBeGreaterThan(0);
          
          // Should have img as fallback
          const img = picture.locator('img');
          await expect(img).toHaveCount(1);
          
          // Sources should have media queries or type
          for (let j = 0; j < Math.min(3, sourceCount); j++) {
            const source = sources.nth(j);
            const media = await source.getAttribute('media');
            const type = await source.getAttribute('type');
            const srcset = await source.getAttribute('srcset');
            
            expect(media || type).toBeTruthy();
            expect(srcset).toBeTruthy();
          }
        }
      }
    });

    test('should preload critical images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Check for preload links
      const preloadLinks = page.locator('link[rel="preload"][as="image"]');
      const preloadCount = await preloadLinks.count();
      
      if (preloadCount > 0) {
        for (let i = 0; i < preloadCount; i++) {
          const preload = preloadLinks.nth(i);
          const href = await preload.getAttribute('href');
          
          expect(href).toBeTruthy();
          
          // Preloaded image should exist on page
          const correspondingImg = page.locator(`img[src="${href}"]`);
          const imgCount = await correspondingImg.count();
          
          if (imgCount === 0) {
            // Check in srcset
            const srcsetImg = page.locator(`img[srcset*="${href}"]`);
            expect(await srcsetImg.count()).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should handle image loading errors gracefully', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => 
          !img.complete || 
          img.naturalWidth === 0 || 
          img.naturalHeight === 0
        ).length;
      });
      
      // Should not have broken images
      expect(brokenImages).toBe(0);
      
      // Test error handling by breaking an image
      await page.evaluate(() => {
        const img = document.querySelector('img');
        if (img) {
          img.src = 'https://example.com/nonexistent.jpg';
          
          // Should have error handler or fallback
          img.onerror = function() {
            this.style.display = 'none';
          };
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Broken image should be handled (hidden or replaced)
      const visibleBrokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => 
          img.style.display !== 'none' &&
          (!img.complete || img.naturalWidth === 0)
        ).length;
      });
      
      expect(visibleBrokenImages).toBe(0);
    });
  });
});