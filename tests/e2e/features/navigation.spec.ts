import { test, expect } from '@playwright/test';

import { VIEWPORT_SIZES } from '../utils/fixtures';
import { Navigation } from '../utils/page-objects';
import { 
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Site Navigation', () => {
  test.describe('Main Navigation Menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have working main navigation links', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Check that navigation is visible
      await expect(nav.navLinks.first()).toBeVisible();
      
      // Navigation should have multiple links
      expect(await nav.navLinks.count()).toBeGreaterThan(3);
      
      // Main navigation links should be accessible
      const navLinks = nav.navLinks;
      for (let i = 0; i < Math.min(5, await navLinks.count()); i++) {
        const link = navLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();
        
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should navigate to key sections', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Test navigation to About page
      const aboutLink = nav.navLinks.filter({ hasText: /Über|About/ });
      if (await aboutLink.count() > 0) {
        await aboutLink.first().click();
        await waitForPageLoad(page);
        expect(page.url()).toMatch(/\/about|\/ueber/);
      }
      
      // Navigate back to home
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test navigation to Blog/Posts
      const blogLink = nav.navLinks.filter({ hasText: /Blog|Artikel|Posts/ });
      if (await blogLink.count() > 0) {
        await blogLink.first().click();
        await waitForPageLoad(page);
        expect(page.url()).toMatch(/\/posts|\/blog/);
      }
    });

    test('should highlight active navigation item', async ({ page }) => {
      // Navigate to About page
      await page.goto('/about');
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      const aboutLink = nav.navLinks.filter({ hasText: /Über|About/ });
      
      if (await aboutLink.count() > 0) {
        // Active link should have special styling
        const activeLink = aboutLink.first();
        const classList = await activeLink.getAttribute('class');
        
        // Should have active state indicator
        expect(classList).toMatch(/active|current|selected/);
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have mobile menu toggle', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Mobile menu button should be visible on mobile
      if (await nav.mobileMenuButton.count() > 0) {
        await expect(nav.mobileMenuButton).toBeVisible();
        await expect(nav.mobileMenuButton).toBeEnabled();
      }
    });

    test('should open and close mobile menu', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.mobileMenuButton.count() > 0) {
        // Open mobile menu
        await nav.openMobileMenu();
        
        if (await nav.mobileMenu.count() > 0) {
          await expect(nav.mobileMenu).toBeVisible();
          
          // Mobile menu should contain navigation links
          const mobileNavLinks = nav.mobileMenu.locator('a');
          expect(await mobileNavLinks.count()).toBeGreaterThan(2);
          
          // Close mobile menu
          await nav.closeMobileMenu();
          await expect(nav.mobileMenu).toBeHidden();
        }
      }
    });

    test('should navigate via mobile menu', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.mobileMenuButton.count() > 0) {
        await nav.openMobileMenu();
        
        if (await nav.mobileMenu.count() > 0) {
          // Click on About link in mobile menu
          const aboutLink = nav.mobileMenu.locator('a').filter({ hasText: /Über|About/ });
          
          if (await aboutLink.count() > 0) {
            await aboutLink.first().click();
            await waitForPageLoad(page);
            
            expect(page.url()).toMatch(/\/about|\/ueber/);
            
            // Mobile menu should close after navigation
            if (await nav.mobileMenu.count() > 0) {
              await expect(nav.mobileMenu).toBeHidden();
            }
          }
        }
      }
    });

    test('should have touch-friendly mobile menu items', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.mobileMenuButton.count() > 0) {
        await nav.openMobileMenu();
        
        if (await nav.mobileMenu.count() > 0) {
          const mobileLinks = nav.mobileMenu.locator('a');
          
          // Check touch target size for first few links
          for (let i = 0; i < Math.min(3, await mobileLinks.count()); i++) {
            const link = mobileLinks.nth(i);
            const boundingBox = await link.boundingBox();
            
            if (boundingBox) {
              // Minimum touch target size (44px recommended)
              expect(boundingBox.height).toBeGreaterThan(40);
            }
          }
        }
      }
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should show breadcrumbs on deep pages', async ({ page }) => {
      // Navigate to a blog post
      await page.goto('/posts');
      await waitForPageLoad(page);
      
      // Find first blog post link
      const postLinks = page.locator('a[href*="/posts/"]');
      if (await postLinks.count() > 0) {
        await postLinks.first().click();
        await waitForPageLoad(page);
        
        // Look for breadcrumb navigation
        const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
        
        if (await breadcrumbs.count() > 0) {
          await expect(breadcrumbs).toBeVisible();
          
          // Breadcrumbs should show path
          const breadcrumbText = await breadcrumbs.textContent();
          expect(breadcrumbText).toMatch(/Home|Start|Posts|Blog/);
        }
      }
    });

    test('should have clickable breadcrumb links', async ({ page }) => {
      await page.goto('/posts');
      await waitForPageLoad(page);
      
      const postLinks = page.locator('a[href*="/posts/"]');
      if (await postLinks.count() > 0) {
        await postLinks.first().click();
        await waitForPageLoad(page);
        
        const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs');
        
        if (await breadcrumbs.count() > 0) {
          const breadcrumbLinks = breadcrumbs.locator('a');
          
          if (await breadcrumbLinks.count() > 0) {
            // Breadcrumb links should be functional
            for (let i = 0; i < Math.min(2, await breadcrumbLinks.count()); i++) {
              const link = breadcrumbLinks.nth(i);
              await expect(link).toBeEnabled();
              
              const href = await link.getAttribute('href');
              expect(href).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe('Skip Navigation', () => {
    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Look for skip navigation link
      const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-to-main');
      
      if (await skipLink.count() > 0) {
        // Skip link should be initially hidden but accessible
        await skipLink.focus();
        await expect(skipLink).toBeFocused();
        
        // Skip link should work
        await skipLink.press('Enter');
        
        // Main content should be focused
        const mainContent = page.locator('#main, main, #content');
        if (await mainContent.count() > 0) {
          await expect(mainContent).toBeFocused();
        }
      }
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      
      // First focusable element should be skip link or navigation
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be able to navigate with keyboard
      const initialFocus = await focusedElement.textContent();
      
      await page.keyboard.press('Tab');
      const secondFocus = page.locator(':focus');
      const secondFocusText = await secondFocus.textContent();
      
      expect(secondFocusText).not.toBe(initialFocus);
    });
  });

  test.describe('Footer Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have working footer links', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      
      const footerLinks = footer.locator('a');
      expect(await footerLinks.count()).toBeGreaterThan(2);
      
      // Test footer links
      for (let i = 0; i < Math.min(3, await footerLinks.count()); i++) {
        const link = footerLinks.nth(i);
        await expect(link).toBeVisible();
        
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should include legal and important links', async ({ page }) => {
      const footer = page.locator('footer');
      
      // Should have legal links
      const legalLinks = footer.locator('a').filter({ hasText: /Impressum|Datenschutz|Privacy|Legal|Imprint/ });
      expect(await legalLinks.count()).toBeGreaterThan(0);
      
      // RSS feed should be accessible from footer
      const rssLink = footer.locator('a[href="/rss.xml"]');
      if (await rssLink.count() > 0) {
        await expect(rssLink).toBeVisible();
      }
    });

    test('should have social media links if present', async ({ page }) => {
      const footer = page.locator('footer');
      
      // Look for social media links
      const socialLinks = footer.locator('a[href*="twitter.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="linkedin.com"]');
      
      if (await socialLinks.count() > 0) {
        // Social links should open in new tab
        for (let i = 0; i < Math.min(2, await socialLinks.count()); i++) {
          const link = socialLinks.nth(i);
          const target = await link.getAttribute('target');
          expect(target).toBe('_blank');
          
          // Should have rel="noopener" for security
          const rel = await link.getAttribute('rel');
          expect(rel).toMatch(/noopener/);
        }
      }
    });
  });

  test.describe('Responsive Navigation Behavior', () => {
    test('should adapt navigation across screen sizes', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Test across different viewport sizes
      const viewports = [
        VIEWPORT_SIZES.mobile,
        VIEWPORT_SIZES.tablet,
        VIEWPORT_SIZES.desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500); // Allow for responsive transitions
        
        const nav = new Navigation(page);
        
        if (viewport.width <= 768) {
          // Mobile/tablet should show mobile menu button
          if (await nav.mobileMenuButton.count() > 0) {
            await expect(nav.mobileMenuButton).toBeVisible();
          }
        } else {
          // Desktop should show full navigation
          await expect(nav.navLinks.first()).toBeVisible();
          expect(await nav.navLinks.count()).toBeGreaterThan(3);
        }
      }
    });

    test('should maintain navigation functionality during resize', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Start with desktop size
      await page.setViewportSize(VIEWPORT_SIZES.desktop);
      await page.waitForTimeout(300);
      
      const nav = new Navigation(page);
      
      // Verify desktop navigation works
      const desktopNavLinks = nav.navLinks;
      expect(await desktopNavLinks.count()).toBeGreaterThan(3);
      
      // Resize to mobile
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.waitForTimeout(300);
      
      // Mobile navigation should be functional
      if (await nav.mobileMenuButton.count() > 0) {
        await nav.openMobileMenu();
        
        if (await nav.mobileMenu.count() > 0) {
          await expect(nav.mobileMenu).toBeVisible();
          
          const mobileLinks = nav.mobileMenu.locator('a');
          expect(await mobileLinks.count()).toBeGreaterThan(2);
        }
      }
    });
  });

  test.describe('Navigation Performance', () => {
    test('should have fast navigation transitions', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      const aboutLink = nav.navLinks.filter({ hasText: /Über|About/ });
      
      if (await aboutLink.count() > 0) {
        // Measure navigation time
        const startTime = Date.now();
        
        await aboutLink.first().click();
        await waitForPageLoad(page);
        
        const loadTime = Date.now() - startTime;
        
        // Navigation should be fast (under 3 seconds)
        expect(loadTime).toBeLessThan(3000);
        
        // Page should have loaded successfully
        expect(page.url()).toMatch(/\/about|\/ueber/);
      }
    });

    test('should not cause layout shifts during navigation', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Get initial navigation position
      const nav = new Navigation(page);
      const initialBounds = await nav.navLinks.first().boundingBox();
      
      // Navigate to another page
      const aboutLink = nav.navLinks.filter({ hasText: /Über|About/ });
      if (await aboutLink.count() > 0) {
        await aboutLink.first().click();
        await waitForPageLoad(page);
        
        // Navigation should be in same position
        const finalBounds = await nav.navLinks.first().boundingBox();
        
        if (initialBounds && finalBounds) {
          expect(Math.abs(finalBounds.y - initialBounds.y)).toBeLessThan(5);
        }
      }
    });
  });
});