import { test, expect } from '@playwright/test';

import { EXPECTED_PAGES } from '../utils/fixtures';
import { BasePage } from '../utils/page-objects';
import { 
  validateBasicSEO, 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
    await waitForPageLoad(page);
  });

  test.describe('Basic Page Structure', () => {
    test('should load about page successfully', async ({ page }) => {
      await expect(page).toHaveURL('/about');
      await validateBasicSEO(page, EXPECTED_PAGES.about.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should display team information', async ({ page }) => {
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Should mention team members Sandra & Kai
      const content = page.locator('body');
      await expect(content).toContainText(/Sandra|Kai/);
      
      // Should have information about therapists
      await expect(content).toContainText(/Therapeut/);
    });
  });

  test.describe('Content Validation', () => {
    test('should contain German content about the team', async ({ page }) => {
      await validateGermanContent(page);
      
      // Health blog specific content
      const content = page.locator('body');
      await expect(content).toContainText(/Gesundheit/);
      
      // Should mention their expertise
      await expect(content).toContainText(/Erfahrung|Wissen|Expertise/);
    });

    test('should have team member information', async ({ page }) => {
      const content = page.locator('body');
      
      // Should mention both team members
      await expect(content).toContainText('Sandra');
      await expect(content).toContainText('Kai');
      
      // Should have professional context
      await expect(content).toContainText(/Therapeut|Praxis|Erfahrung/);
    });

    test('should display mission or vision statement', async ({ page }) => {
      const content = page.locator('body');
      
      // Should contain mission-related content
      await expect(content).toContainText(/Ziel|Mission|Vision|Empowerment/);
      
      // Health empowerment theme
      await expect(content).toContainText(/Gesundheit|Wohlbefinden/);
    });
  });

  test.describe('Navigation and Links', () => {
    test('should have working navigation', async ({ page }) => {
      const basePage = new BasePage(page);
      
      // Header and footer should be present
      await expect(basePage.header).toBeVisible();
      await expect(basePage.footer).toBeVisible();
      
      // Navigation should work
      await expect(basePage.nav).toBeVisible();
      
      // RSS link should be present
      await expect(basePage.rssLink).toBeVisible();
    });

    test('should have link to home page', async ({ page }) => {
      const homeLink = page.locator('a[href="/"]');
      await expect(homeLink.first()).toBeVisible();
    });

    test('should have links to other important pages', async ({ page }) => {
      // May have links to contact, vision, or other relevant pages
      const _body = page.locator('body');
      
      // Check for common navigation elements
      const navLinks = page.locator('nav a');
      expect(await navLinks.count()).toBeGreaterThan(2);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive across different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
    });

    test('should maintain readability on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Text should not overflow
      const content = page.locator('body');
      await expect(content).toBeVisible();
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('should have proper meta tags', async ({ page }) => {
      // Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toBeAttached();
      
      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toBeAttached();
      
      // Should have German language set
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
    });

    test('should have structured data for team information', async ({ page }) => {
      // May have JSON-LD structured data for team/organization
      const structuredData = page.locator('script[type="application/ld+json"]');
      
      // Not required, but if present should be valid
      if (await structuredData.count() > 0) {
        const jsonContent = await structuredData.textContent();
        expect(jsonContent).toBeTruthy();
        
        // Should be valid JSON
        expect(() => JSON.parse(jsonContent!)).not.toThrow();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have optimized images', async ({ page }) => {
      const images = page.locator('img');
      
      if (await images.count() > 0) {
        const firstImage = images.first();
        
        // Should have alt text
        await expect(firstImage).toHaveAttribute('alt');
        
        // Should have proper loading attribute
        const loading = await firstImage.getAttribute('loading');
        expect(['lazy', 'eager', null]).toContain(loading);
      }
    });
  });
});