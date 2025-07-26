import { test, expect } from '@playwright/test';

import { BasePage } from '../utils/page-objects';
import { 
  validateLayoutStructure,
  validateGermanContent,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('404 Error Page', () => {
  test.describe('Page Not Found Scenarios', () => {
    test('should display 404 page for non-existent URLs', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      
      // Should return 404 status
      expect(response?.status()).toBe(404);
      
      await waitForPageLoad(page);
      
      // Should show 404 content
      const content = page.locator('body');
      await expect(content).toContainText(/404|nicht gefunden|Not Found|Seite nicht gefunden/);
    });

    test('should handle non-existent blog posts', async ({ page }) => {
      const response = await page.goto('/posts/non-existent-post-slug');
      expect(response?.status()).toBe(404);
      
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      await expect(content).toContainText(/404|nicht gefunden|Artikel|Post/);
    });

    test('should handle non-existent author pages', async ({ page }) => {
      const response = await page.goto('/author/non-existent-author');
      expect(response?.status()).toBe(404);
      
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      await expect(content).toContainText(/404|nicht gefunden|Autor/);
    });
  });

  test.describe('404 Page Content', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/non-existent-page');
      await waitForPageLoad(page);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      
      // Should still have header and footer
      const basePage = new BasePage(page);
      await expect(basePage.header).toBeVisible();
      await expect(basePage.footer).toBeVisible();
    });

    test('should display helpful error message in German', async ({ page }) => {
      await validateGermanContent(page);
      
      const content = page.locator('body');
      
      // German 404 message
      await expect(content).toContainText(/Seite nicht gefunden|404|Fehler/);
      
      // Helpful message
      await expect(content).toContainText(/leider|entschuldigung|sorry|Ohh/);
    });

    test('should have navigation back to main site', async ({ page }) => {
      // Should have link to homepage
      const homeLink = page.locator('a[href="/"]');
      await expect(homeLink.first()).toBeVisible();
      
      // May have link to blog posts
      const blogLink = page.locator('a[href="/posts/"], a[href="/posts"]');
      if (await blogLink.count() > 0) {
        await expect(blogLink.first()).toBeVisible();
      }
    });

    test('should suggest alternative content', async ({ page }) => {
      const content = page.locator('body');
      
      // Should suggest what to do next
      await expect(content).toContainText(/suchen|Blog|Artikel|Startseite|zurück/);
      
      // May have search functionality
      const searchLink = page.locator('a[href="/search"]');
      if (await searchLink.count() > 0) {
        await expect(searchLink).toBeVisible();
      }
    });
  });

  test.describe('404 Page Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/another-non-existent-page');
      await waitForPageLoad(page);
    });

    test('should have working navigation menu', async ({ page }) => {
      const basePage = new BasePage(page);
      
      // Navigation should still work
      await expect(basePage.nav).toBeVisible();
      
      // Navigation links should be functional
      const navLinks = page.locator('nav a');
      expect(await navLinks.count()).toBeGreaterThan(0);
    });

    test('should allow navigation to main sections', async ({ page }) => {
      // Test navigation to main pages
      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink).toBeVisible();
      
      // Click should work (but don't actually navigate to keep test isolated)
      await expect(homeLink).toBeEnabled();
    });

    test('should maintain site branding', async ({ page }) => {
      // Should still show site title/logo
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
      
      // Site should still be recognizable
      const content = page.locator('body');
      await expect(content).toContainText(/Gesundes Leben|Healthy Life/);
    });
  });

  test.describe('SEO and Technical', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/yet-another-non-existent-page');
      await waitForPageLoad(page);
    });

    test('should have appropriate meta tags', async ({ page }) => {
      // Should have German language
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
      
      // May have specific 404 title
      const title = await page.title();
      expect(title).toMatch(/404|nicht gefunden|Fehler|Gesundes Leben/);
    });

    test('should not index 404 pages', async ({ page }) => {
      // Should have noindex meta tag
      const robots = page.locator('meta[name="robots"]');
      if (await robots.count() > 0) {
        const content = await robots.getAttribute('content');
        expect(content).toMatch(/noindex/);
      }
    });

    test('should have minimal social sharing metadata', async ({ page }) => {
      // 404 pages typically don't need extensive social metadata
      const ogTitle = page.locator('meta[property="og:title"]');
      
      if (await ogTitle.count() > 0) {
        const content = await ogTitle.getAttribute('content');
        expect(content).toBeTruthy();
      }
    });
  });

  test.describe('User Experience', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.goto('/mobile-test-404');
      await waitForPageLoad(page);
      
      await page.setViewportSize({ width: 375, height: 667 });
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Error message should be readable
      const content = page.locator('body');
      await expect(content).toContainText(/404|nicht gefunden/);
    });

    test('should have clear call-to-action', async ({ page }) => {
      await page.goto('/cta-test-404');
      await waitForPageLoad(page);
      
      // Should have prominent links to help user
      const links = page.locator('a').filter({ hasText: /Startseite|Home|Blog|Suche/ });
      expect(await links.count()).toBeGreaterThan(0);
    });

    test('should be visually consistent with site design', async ({ page }) => {
      await page.goto('/design-test-404');
      await waitForPageLoad(page);
      
      // Should maintain visual consistency
      const basePage = new BasePage(page);
      await expect(basePage.header).toBeVisible();
      await expect(basePage.footer).toBeVisible();
      
      // Should look like part of the same site
      await expect(basePage.rssLink).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly even for 404', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/performance-test-404');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 404 pages should be fast
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not have heavy resources', async ({ page }) => {
      await page.goto('/resources-test-404');
      await waitForPageLoad(page);
      
      // Should be lightweight
      const images = page.locator('img');
      
      // Limited images on 404 page
      expect(await images.count()).toBeLessThan(5);
    });
  });
});