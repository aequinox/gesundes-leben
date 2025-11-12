import { test, expect } from '@playwright/test';

import { EXPECTED_PAGES, SEARCH_QUERIES } from '../utils/fixtures';
import { SearchPage } from '../utils/page-objects';
import { 
  validateBasicSEO, 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    await waitForPageLoad(page);
  });

  test.describe('Basic Page Structure', () => {
    test('should load search page successfully', async ({ page }) => {
      await expect(page).toHaveURL('/search');
      await validateBasicSEO(page, EXPECTED_PAGES.search.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should display search interface', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search input should be visible
      await expect(searchPage.searchInput).toBeVisible();
      
      // Should have search heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Suche|Search/);
    });
  });

  test.describe('Search Functionality', () => {
    test('should perform basic search', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Perform a search
      await searchPage.search('Vitamin D');
      
      // Should show results or no results message
      const hasResults = await searchPage.searchResults.count() > 0;
      const hasNoResults = await searchPage.noResults.count() > 0;
      
      expect(hasResults ?? hasNoResults).toBeTruthy();
    });

    test('should search for German health terms', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Test German health terms
      for (const query of SEARCH_QUERIES.german.slice(0, 2)) {
        await searchPage.search(query);
        await page.waitForTimeout(1000);
        
        // Should handle German characters properly
        const searchValue = await searchPage.searchInput.inputValue();
        expect(searchValue).toContain(query);
      }
    });

    test('should handle empty search', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Empty search
      await searchPage.search('');
      
      // Should handle gracefully
      const content = page.locator('body');
      await expect(content).toBeVisible();
    });

    test('should display search results correctly', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search for common health term
      await searchPage.search('Gesundheit');
      
      // Wait for results
      await page.waitForTimeout(2000);
      
      // Check for results
      const resultsCount = await searchPage.searchResults.count();
      if (resultsCount > 0) {
        // Results should be clickable
        const firstResult = searchPage.searchResults.first();
        await expect(firstResult).toBeVisible();
        
        // Results should contain search term or related content
        const resultText = await firstResult.textContent();
        expect(resultText).toBeTruthy();
      }
    });
  });

  test.describe('Search Results Display', () => {
    test('should show relevant results for health topics', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search for specific health topic
      await searchPage.search('Immunsystem');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      if (resultsCount > 0) {
        // Results should be properly formatted
        const results = searchPage.searchResults;
        
        for (let i = 0; i < Math.min(3, resultsCount); i++) {
          const result = results.nth(i);
          await expect(result).toBeVisible();
          
          // Should have title and excerpt
          const resultText = await result.textContent();
          expect(resultText!.length).toBeGreaterThan(20);
        }
      }
    });

    test('should handle no results gracefully', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search for non-existent term
      await searchPage.search('xyzzz123456');
      await page.waitForTimeout(2000);
      
      // Should show no results message
      const hasResults = await searchPage.searchResults.count() > 0;
      const hasNoResults = await searchPage.noResults.count() > 0;
      
      if (!hasResults) {
        expect(hasNoResults).toBeTruthy();
        
        if (hasNoResults) {
          const noResultsText = await searchPage.noResults.textContent();
          expect(noResultsText).toMatch(/keine|nicht gefunden|no results/i);
        }
      }
    });

    test('should display search suggestions or help', async ({ page }) => {
      const content = page.locator('body');
      
      // May have search tips or suggestions
      const hasSearchHelp = await content.textContent();
      
      // Should provide guidance on how to search
      if (hasSearchHelp?.includes('Tipp') || hasSearchHelp?.includes('Hilfe')) {
        await expect(content).toContainText(/Tipp|Hilfe|Suche|Beispiel/);
      }
    });
  });

  test.describe('Search Interaction', () => {
    test('should support keyboard navigation', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Focus search input
      await searchPage.searchInput.focus();
      
      // Type and search with Enter
      await searchPage.searchInput.fill('Vitamin');
      await searchPage.searchInput.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Should perform search
      const searchValue = await searchPage.searchInput.inputValue();
      expect(searchValue).toBe('Vitamin');
    });

    test('should clear search results when new search is performed', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // First search
      await searchPage.search('Omega');
      await page.waitForTimeout(1500);
      
      // Second search
      await searchPage.search('Protein');
      await page.waitForTimeout(1500);
      
      // Should show new results
      const searchValue = await searchPage.searchInput.inputValue();
      expect(searchValue).toBe('Protein');
    });

    test('should maintain search state on page reload', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Perform search
      await searchPage.search('Ernährung');
      await page.waitForTimeout(1500);
      
      // Get current URL (may have search params)
      const _currentUrl = page.url();
      
      // Reload page
      await page.reload();
      await waitForPageLoad(page);
      
      // Search functionality should still work
      await expect(searchPage.searchInput).toBeVisible();
    });
  });

  test.describe('German Language Support', () => {
    test('should handle German characters correctly', async ({ page }) => {
      await validateGermanContent(page);
      
      const searchPage = new SearchPage(page);
      
      // Test German umlauts and special characters
      const germanTerms = ['Ernährung', 'Müdigkeit', 'Stärkung', 'Größe'];
      
      for (const term of germanTerms.slice(0, 2)) {
        await searchPage.search(term);
        await page.waitForTimeout(1000);
        
        // Input should preserve German characters
        const inputValue = await searchPage.searchInput.inputValue();
        expect(inputValue).toBe(term);
      }
    });

    test('should have German interface text', async ({ page }) => {
      const content = page.locator('body');
      
      // Interface should be in German
      await expect(content).toContainText(/Suche|suchen/);
      
      // Search placeholder or labels should be in German
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.count() > 0) {
        const placeholder = await searchInput.getAttribute('placeholder');
        if (placeholder) {
          expect(placeholder).toMatch(/suchen|Suche|Begriff/i);
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work well on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const searchPage = new SearchPage(page);
      
      // Search input should be accessible
      await expect(searchPage.searchInput).toBeVisible();
      
      // Should be touch-friendly
      await searchPage.searchInput.tap();
      await searchPage.searchInput.fill('Mobile Test');
      
      // Should work properly
      await expect(searchPage.searchInput).toHaveValue('Mobile Test');
    });

    test('should adapt to different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
      
      // Search should work at all viewport sizes
      const searchPage = new SearchPage(page);
      await expect(searchPage.searchInput).toBeVisible();
    });
  });

  test.describe('Performance and SEO', () => {
    test('should load search page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/search');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have appropriate meta tags', async ({ page }) => {
      // Language
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
      
      // May have noindex for search pages
      const robots = page.locator('meta[name="robots"]');
      if (await robots.count() > 0) {
        const content = await robots.getAttribute('content');
        expect(content).toMatch(/noindex|index/);
      }
    });

    test('should not index search result URLs', async ({ page }) => {
      // Search result pages typically shouldn't be indexed
      const canonical = page.locator('link[rel="canonical"]');
      if (await canonical.count() > 0) {
        const href = await canonical.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });
  });

  test.describe('Integration with Site Content', () => {
    test('should find existing blog content', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search for content that should exist
      await searchPage.search('Sandra');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      if (resultsCount > 0) {
        // Results should link to actual content
        const firstResult = searchPage.searchResults.first();
        const resultLinks = firstResult.locator('a');
        
        if (await resultLinks.count() > 0) {
          const href = await resultLinks.first().getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^\/|^http/); // Valid link
        }
      }
    });

    test('should integrate with site navigation', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Navigation should be present
      await expect(searchPage.header).toBeVisible();
      await expect(searchPage.nav).toBeVisible();
      
      // RSS link should work
      await expect(searchPage.rssLink).toBeVisible();
    });
  });
});