import { test, expect } from '@playwright/test';

import { 
  PERFORMANCE_THRESHOLDS, 
  SAMPLE_BLOG_POSTS,
  VIEWPORT_SIZES
} from '../utils/fixtures';
import { 
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Core Web Vitals Performance', () => {
  test.describe('Largest Contentful Paint (LCP)', () => {
    test('should have LCP under 2.5 seconds on homepage', async ({ page }) => {
      // Enable performance monitoring
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Measure LCP
      const lcpValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      if (lcpValue > 0) {
        expect(lcpValue).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.lcp);
      }
    });

    test('should have acceptable LCP on blog posts', async ({ page }) => {
      const postSlug = SAMPLE_BLOG_POSTS[0];
      
      await page.goto(`/posts/${postSlug}`, { waitUntil: 'networkidle' });
      
      const lcpValue = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcpTime = 0;
          
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcpTime = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Wait for LCP to stabilize
          setTimeout(() => resolve(lcpTime), 3000);
        });
      });
      
      if (lcpValue > 0) {
        // Blog posts may have slightly higher LCP due to content
        expect(lcpValue).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.lcp + 1000);
      }
    });

    test('should identify LCP element correctly', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const lcpElement = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry.element) {
              resolve({
                tagName: lastEntry.element.tagName,
                id: lastEntry.element.id,
                className: lastEntry.element.className,
                src: lastEntry.element.src || null
              });
            } else {
              resolve(null);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          setTimeout(() => resolve(null), 3000);
        });
      });
      
      if (lcpElement) {
        // LCP element should be meaningful content
        expect(['IMG', 'H1', 'H2', 'P', 'DIV']).toContain(lcpElement.tagName);
      }
    });
  });

  test.describe('First Input Delay (FID)', () => {
    test('should have FID under 100ms', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await waitForPageLoad(page);
      
      // Set up FID measurement
      await page.evaluate(() => {
        window.fidValue = null;
        
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const firstEntry = entries[0];
          window.fidValue = firstEntry.processingStart - firstEntry.startTime;
        }).observe({ entryTypes: ['first-input'] });
      });
      
      // Simulate user interaction
      const interactiveElement = page.locator('button, a, input').first();
      
      if (await interactiveElement.count() > 0) {
        await interactiveElement.click();
        await page.waitForTimeout(100);
        
        const fidValue = await page.evaluate(() => window.fidValue);
        
        if (fidValue !== null && fidValue > 0) {
          expect(fidValue).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.fid);
        }
      }
    });

    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/search', { waitUntil: 'networkidle' });
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Set up FID measurement
        await page.evaluate(() => {
          window.fidValues = [];
          
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
              window.fidValues.push(entry.processingStart - entry.startTime);
            });
          }).observe({ entryTypes: ['first-input'] });
        });
        
        // Rapid typing simulation
        await searchInput.click();
        await page.keyboard.type('Gesundheit', { delay: 50 });
        
        await page.waitForTimeout(500);
        
        const fidValues = await page.evaluate(() => window.fidValues);
        
        if (fidValues && fidValues.length > 0) {
          const maxFid = Math.max(...fidValues);
          expect(maxFid).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.fid * 2); // Allow some tolerance for rapid inputs
        }
      }
    });
  });

  test.describe('Cumulative Layout Shift (CLS)', () => {
    test('should have minimal layout shift on page load', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Set up CLS measurement
      await page.evaluate(() => {
        window.clsValue = 0;
        
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              window.clsValue += entry.value;
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const clsValue = await page.evaluate(() => window.clsValue);
      
      expect(clsValue).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.cls);
    });

    test('should not cause layout shifts when loading images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Set up CLS measurement before images load
      await page.evaluate(() => {
        window.clsValue = 0;
        
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              window.clsValue += entry.value;
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      // Wait for all images to load
      await page.waitForFunction(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.every(img => img.complete);
      }, { timeout: 10000 });
      
      const clsValue = await page.evaluate(() => window.clsValue);
      
      // Images should not cause significant layout shifts
      expect(clsValue).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.cls);
    });

    test('should have stable layout during theme changes', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await waitForPageLoad(page);
      
      // Set up CLS measurement
      await page.evaluate(() => {
        window.clsValue = 0;
        
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              window.clsValue += entry.value;
            }
          });
        }).observe({ entryTypes: ['layout-shift'] });
      });
      
      // Toggle theme
      const themeToggle = page.locator('.theme-toggle, #theme-btn');
      
      if (await themeToggle.count() > 0) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
        
        const clsValue = await page.evaluate(() => window.clsValue);
        
        // Theme changes should not cause layout shifts
        expect(clsValue).toBeLessThan(0.05);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
    });

    test('should meet Core Web Vitals on mobile', async ({ page }) => {
      // Simulate slower mobile connection
      await page.route('**/*', async route => {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 100); // Add delay
        });
        await route.continue();
      });
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Measure all Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = { lcp: 0, fid: 0, cls: 0 };
          let measurements = 0;
          
          // LCP
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
            measurements++;
            if (measurements >= 2) {resolve(vitals);}
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // CLS
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                vitals.cls += entry.value;
              }
            });
            measurements++;
            if (measurements >= 2) {resolve(vitals);}
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Timeout
          setTimeout(() => resolve(vitals), 5000);
        });
      });
      
      // Mobile thresholds may be slightly more lenient
      if (webVitals.lcp > 0) {
        expect(webVitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.lcp + 500);
      }
      expect(webVitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.coreWebVitals.cls + 0.05);
    });

    test('should handle touch interactions efficiently', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Set up interaction timing measurement
      await page.evaluate(() => {
        window.interactionTimes = [];
        
        document.addEventListener('touchstart', () => {
          window.touchStartTime = performance.now();
        });
        
        document.addEventListener('touchend', () => {
          if (window.touchStartTime) {
            window.interactionTimes.push(performance.now() - window.touchStartTime);
          }
        });
      });
      
      // Simulate touch interactions
      const touchElements = page.locator('button, a').filter({ hasText: /.*/ });
      
      if (await touchElements.count() > 0) {
        for (let i = 0; i < Math.min(3, await touchElements.count()); i++) {
          const element = touchElements.nth(i);
          await element.tap();
          await page.waitForTimeout(100);
        }
        
        const interactionTimes = await page.evaluate(() => window.interactionTimes);
        
        if (interactionTimes && interactionTimes.length > 0) {
          const avgInteractionTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
          
          // Touch interactions should be responsive
          expect(avgInteractionTime).toBeLessThan(200);
        }
      }
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load critical resources quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const domContentLoadedTime = Date.now() - startTime;
      
      // DOM should load quickly
      expect(domContentLoadedTime).toBeLessThan(2000);
      
      // Wait for critical resources
      await page.waitForLoadState('networkidle');
      
      const fullLoadTime = Date.now() - startTime;
      
      // Full load should be reasonable
      expect(fullLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime);
    });

    test('should prioritize above-the-fold content', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Check that above-the-fold content is visible quickly
      const header = page.locator('header');
      const main = page.locator('main');
      const h1 = page.locator('h1');
      
      await expect(header).toBeVisible();
      await expect(main).toBeVisible();
      await expect(h1).toBeVisible();
      
      // Critical content should render without waiting for all resources
      const isContentVisible = await page.evaluate(() => {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const h1 = document.querySelector('h1');
        
        return header && main && h1 && 
               header.offsetHeight > 0 && 
               main.offsetHeight > 0 && 
               h1.offsetHeight > 0;
      });
      
      expect(isContentVisible).toBeTruthy();
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', async route => {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 200);
        });
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Even on slow connection, basic content should load
      const loadTime = Date.now() - startTime;
      
      // Should still load within reasonable time on slow connection
      expect(loadTime).toBeLessThan(8000);
      
      // Critical content should be visible
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      const isContentReadable = await h1.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.visibility === 'visible' && 
               styles.display !== 'none' && 
               el.offsetHeight > 0;
      });
      
      expect(isContentReadable).toBeTruthy();
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should track performance metrics', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize
        };
      });
      
      // Validate performance metrics
      expect(performanceMetrics.domContentLoaded).toBeGreaterThan(0);
      expect(performanceMetrics.firstPaint).toBeGreaterThan(0);
      expect(performanceMetrics.firstContentfulPaint).toBeGreaterThan(0);
      
      // FCP should be reasonably fast
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000);
      
      // Transfer size should be reasonable
      expect(performanceMetrics.transferSize).toBeLessThan(PERFORMANCE_THRESHOLDS.bundleSize.initial);
    });

    test('should not have performance regressions', async ({ page }) => {
      const pages = ['/', '/about', '/posts'];
      const metrics = [];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        
        await page.goto(pagePath, { waitUntil: 'networkidle' });
        
        const loadTime = Date.now() - startTime;
        
        const pageMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            transferSize: navigation.transferSize
          };
        });
        
        metrics.push({
          page: pagePath,
          actualLoadTime: loadTime,
          ...pageMetrics
        });
      }
      
      // All pages should load within reasonable time
      for (const metric of metrics) {
        expect(metric.actualLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime);
        expect(metric.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime);
        expect(metric.domInteractive).toBeLessThan(3000);
      }
      
      // No page should be significantly slower than others
      const loadTimes = metrics.map(m => m.actualLoadTime);
      const maxLoadTime = Math.max(...loadTimes);
      const minLoadTime = Math.min(...loadTimes);
      
      // Variation should not be extreme
      expect(maxLoadTime / minLoadTime).toBeLessThan(3);
    });
  });
});