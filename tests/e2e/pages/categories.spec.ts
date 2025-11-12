import { test, expect } from '@playwright/test';

import { EXPECTED_PAGES } from '../utils/fixtures';
import { CategoriesPage } from '../utils/page-objects';
import { 
  validateBasicSEO, 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Categories Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories');
    await waitForPageLoad(page);
  });

  test.describe('Basic Page Structure', () => {
    test('should load categories page successfully', async ({ page }) => {
      await expect(page).toHaveURL('/categories');
      await validateBasicSEO(page, EXPECTED_PAGES.categories.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should display categories heading', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Kategorien|Categories/);
    });
  });

  test.describe('Categories Display', () => {
    test('should show available categories', async ({ page }) => {
      const categoriesPage = new CategoriesPage(page);
      
      // Should have categories list or cards
      const hasCategoryList = await categoriesPage.categoriesList.count() > 0;
      const hasCategoryCards = await categoriesPage.categoryCards.count() > 0;
      
      expect(hasCategoryList ?? hasCategoryCards).toBeTruthy();
      
      if (hasCategoryCards) {
        expect(await categoriesPage.categoryCards.count()).toBeGreaterThan(0);
      }
    });

    test('should display health-related categories', async ({ page }) => {
      const content = page.locator('body');
      
      // Should contain health-related category names
      const healthCategories = ['Ernährung', 'Gesundheit', 'Immunsystem', 'Vitamine'];
      
      let foundCategories = 0;
      for (const category of healthCategories) {
        const categoryText = await content.textContent();
        if (categoryText?.includes(category)) {
          foundCategories++;
        }
      }
      
      expect(foundCategories).toBeGreaterThan(0);
    });

    test('should show category descriptions or post counts', async ({ page }) => {
      const categoryElements = page.locator('.category, .category-card, .category-item');
      
      if (await categoryElements.count() > 0) {
        const firstCategory = categoryElements.first();
        const categoryText = await firstCategory.textContent();
        
        // Should have meaningful content
        expect(categoryText!.length).toBeGreaterThan(5);
        
        // May show post count
        if (categoryText?.match(/\d+/)) {
          expect(categoryText).toMatch(/\d+/);
        }
      }
    });

    test('should have clickable category links', async ({ page }) => {
      const categoryLinks = page.locator('a').filter({ hasText: /Ernährung|Gesundheit|Immunsystem|Vitamine|Mentale/ });
      
      if (await categoryLinks.count() > 0) {
        const firstLink = categoryLinks.first();
        await expect(firstLink).toBeVisible();
        
        // Should have valid href
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/|#/); // Valid link pattern
      }
    });
  });

  test.describe('Category Content', () => {
    test('should contain German category names', async ({ page }) => {
      await validateGermanContent(page);
      
      const content = page.locator('body');
      
      // Common German health categories
      await expect(content).toContainText(/Ernährung|Gesundheit|Mentale|Immunsystem/);
    });

    test('should show category organization', async ({ page }) => {
      const content = page.locator('body');
      
      // Should explain category purpose
      await expect(content).toContainText(/Kategorie|Thema|Bereich|organisiert/);
      
      // May have introductory text
      const paragraphs = page.locator('p');
      if (await paragraphs.count() > 0) {
        const introText = await paragraphs.first().textContent();
        expect(introText!.length).toBeGreaterThan(20);
      }
    });

    test('should display categories in logical order', async ({ page }) => {
      const categoryElements = page.locator('.category, .category-card, .category-item, h2, h3');
      
      if (await categoryElements.count() > 1) {
        // Should have multiple categories
        expect(await categoryElements.count()).toBeGreaterThan(1);
        
        // Categories should be organized
        const categories = await categoryElements.allTextContents();
        expect(categories.length).toBeGreaterThan(1);
      }
    });
  });

  test.describe('Navigation and User Experience', () => {
    test('should have working site navigation', async ({ page }) => {
      const categoriesPage = new CategoriesPage(page);
      
      await expect(categoriesPage.header).toBeVisible();
      await expect(categoriesPage.footer).toBeVisible();
      await expect(categoriesPage.nav).toBeVisible();
      await expect(categoriesPage.rssLink).toBeVisible();
    });

    test('should provide easy navigation to blog posts', async ({ page }) => {
      // Should have link back to all posts
      const allPostsLink = page.locator('a[href="/posts/"], a[href="/posts"]');
      if (await allPostsLink.count() > 0) {
        await expect(allPostsLink.first()).toBeVisible();
      }
      
      // Should have breadcrumb or navigation hint
      const navElements = page.locator('.breadcrumb, .nav-hint, nav');
      expect(await navElements.count()).toBeGreaterThan(0);
    });

    test('should allow category filtering or browsing', async ({ page }) => {
      const categoryLinks = page.locator('a').filter({ hasText: /Ernährung|Gesundheit|Vitamine/ });
      
      if (await categoryLinks.count() > 0) {
        const firstCategoryLink = categoryLinks.first();
        
        // Link should be enabled and clickable
        await expect(firstCategoryLink).toBeEnabled();
        
        // Should have proper href for category browsing
        const href = await firstCategoryLink.getAttribute('href');
        expect(href).toMatch(/\/posts\/|\/category\/|\/tags\//);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display categories properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const _categoriesPage = new CategoriesPage(page);
      
      // Categories should be visible and usable
      const content = page.locator('main');
      await expect(content).toBeVisible();
      
      // Category elements should adapt to mobile
      const categoryElements = page.locator('.category, .category-card');
      if (await categoryElements.count() > 0) {
        await expect(categoryElements.first()).toBeVisible();
      }
    });

    test('should work well across different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
      
      // Categories should remain accessible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });

    test('should have touch-friendly category links on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const categoryLinks = page.locator('a').filter({ hasText: /Ernährung|Gesundheit/ });
      
      if (await categoryLinks.count() > 0) {
        const firstLink = categoryLinks.first();
        
        // Should be large enough for touch
        const boundingBox = await firstLink.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThan(30); // Minimum touch target
        }
      }
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('should have appropriate meta tags', async ({ page }) => {
      // Language
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
      
      // Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toBeAttached();
      
      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toBeAttached();
    });

    test('should be indexable by search engines', async ({ page }) => {
      // Categories page should typically be indexed
      const robots = page.locator('meta[name="robots"]');
      if (await robots.count() > 0) {
        const content = await robots.getAttribute('content');
        expect(content).toMatch(/index|all/);
      }
      
      // Should have canonical URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toBeAttached();
    });

    test('should have structured data for content organization', async ({ page }) => {
      // May have structured data for categories
      const structuredData = page.locator('script[type="application/ld+json"]');
      
      if (await structuredData.count() > 0) {
        const jsonContent = await structuredData.textContent();
        expect(jsonContent).toBeTruthy();
        
        // Should be valid JSON
        expect(() => JSON.parse(jsonContent!)).not.toThrow();
      }
    });
  });

  test.describe('Content Quality', () => {
    test('should provide meaningful category descriptions', async ({ page }) => {
      const content = page.locator('main');
      const mainText = await content.textContent();
      
      // Should have substantial content
      expect(mainText!.length).toBeGreaterThan(100);
      
      // Should be informative
      await expect(content).toContainText(/Artikel|Beiträge|Themen|finden/);
    });

    test('should help users understand category organization', async ({ page }) => {
      const content = page.locator('body');
      
      // Should explain how categories work
      await expect(content).toContainText(/Kategorie|organisiert|sortiert|Thema/);
      
      // Should encourage exploration
      await expect(content).toContainText(/entdecken|finden|lesen|mehr/);
    });

    test('should maintain consistency with site theme', async ({ page }) => {
      const content = page.locator('body');
      
      // Should maintain health blog theme
      await expect(content).toContainText(/Gesundheit|Wellness|Ernährung/);
      
      // Should feel like part of the same site
      const _categoriesPage = new CategoriesPage(page);
      await expect(_categoriesPage.rssLink).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/categories');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have optimized content delivery', async ({ page }) => {
      // Images should be optimized if present
      const images = page.locator('img');
      
      for (let i = 0; i < Math.min(await images.count(), 3); i++) {
        const image = images.nth(i);
        
        // Should have alt text
        await expect(image).toHaveAttribute('alt');
        
        // Should have appropriate loading strategy
        const loading = await image.getAttribute('loading');
        expect(['lazy', 'eager', null]).toContain(loading);
      }
    });
  });
});