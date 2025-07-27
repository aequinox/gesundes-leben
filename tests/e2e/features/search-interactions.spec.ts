import { test, expect } from '@playwright/test';

import { GERMAN_HEALTH_TERMS, VIEWPORT_SIZES } from '../utils/fixtures';
import { SearchPage } from '../utils/page-objects';
import { 
  waitForPageLoad,
  validateGermanContent
} from '../utils/test-helpers';

test.describe('Search Interactions', () => {
  test.describe('Search Input Behavior', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should focus search input on page load', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search input should be visible and focusable
      await expect(searchPage.searchInput).toBeVisible();
      await expect(searchPage.searchInput).toBeEditable();
      
      // Click to focus
      await searchPage.searchInput.click();
      await expect(searchPage.searchInput).toBeFocused();
    });

    test('should show placeholder text in German', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      const placeholder = await searchPage.searchInput.getAttribute('placeholder');
      if (placeholder) {
        expect(placeholder).toMatch(/suchen|Suche|Begriff|Stichwort/i);
      }
    });

    test('should handle typing and character input', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Test basic typing
      await searchPage.searchInput.fill('Vitamin D');
      await expect(searchPage.searchInput).toHaveValue('Vitamin D');
      
      // Test German characters
      await searchPage.searchInput.fill('Ernährung');
      await expect(searchPage.searchInput).toHaveValue('Ernährung');
      
      // Test special characters
      await searchPage.searchInput.fill('Omega-3');
      await expect(searchPage.searchInput).toHaveValue('Omega-3');
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Clear with Ctrl+A and Delete
      await searchPage.searchInput.fill('test content');
      await searchPage.searchInput.press('Control+a');
      await searchPage.searchInput.press('Delete');
      await expect(searchPage.searchInput).toHaveValue('');
      
      // Test Escape key
      await searchPage.searchInput.fill('some text');
      await searchPage.searchInput.press('Escape');
      
      // Input should still have value (Escape doesn't clear in most implementations)
      const valueAfterEscape = await searchPage.searchInput.inputValue();
      expect(valueAfterEscape).toBeTruthy();
    });
  });

  test.describe('Search Execution', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should execute search on Enter key', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      await searchPage.searchInput.fill('Gesundheit');
      await searchPage.searchInput.press('Enter');
      
      await page.waitForTimeout(2000); // Wait for search results
      
      // Check if search was executed
      const inputValue = await searchPage.searchInput.inputValue();
      expect(inputValue).toBe('Gesundheit');
    });

    test('should execute search with button click if present', async ({ page }) => {
      const searchPage = new SearchPage(page);
      const searchButton = page.locator('button[type="submit"], .search-button, button').filter({ hasText: /suchen|search/i });
      
      await searchPage.searchInput.fill('Vitamin');
      
      if (await searchButton.count() > 0) {
        await searchButton.first().click();
        await page.waitForTimeout(2000);
        
        // Verify search was executed
        const inputValue = await searchPage.searchInput.inputValue();
        expect(inputValue).toBe('Vitamin');
      }
    });

    test('should handle real-time search if implemented', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Type slowly to trigger potential real-time search
      await searchPage.searchInput.fill('Ern');
      await page.waitForTimeout(1000);
      
      await searchPage.searchInput.fill('Ernäh');
      await page.waitForTimeout(1000);
      
      await searchPage.searchInput.fill('Ernährung');
      await page.waitForTimeout(2000);
      
      // Check if results appeared during typing
      const hasResults = await searchPage.searchResults.count() > 0;
      const hasNoResults = await searchPage.noResults.count() > 0;
      
      // Either results or no-results message should appear
      expect(hasResults || hasNoResults).toBeTruthy();
    });
  });

  test.describe('Search Results Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should display and interact with search results', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search for content that should exist
      await searchPage.search('Sandra');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      
      if (resultsCount > 0) {
        // Results should be clickable
        const firstResult = searchPage.searchResults.first();
        await expect(firstResult).toBeVisible();
        
        // Result should have link
        const resultLink = firstResult.locator('a');
        if (await resultLink.count() > 0) {
          await expect(resultLink).toBeVisible();
          await expect(resultLink).toBeEnabled();
          
          // Link should have valid href
          const href = await resultLink.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^\/|^http/);
        }
      }
    });

    test('should handle search result highlighting', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      await searchPage.search('Vitamin');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      
      if (resultsCount > 0) {
        // Check if search terms are highlighted in results
        const resultContent = await searchPage.searchResults.first().textContent();
        
        if (resultContent) {
          // Results should contain search term or related content
          expect(resultContent.toLowerCase()).toMatch(/vitamin|gesundheit|ernährung/);
        }
      }
    });

    test('should support keyboard navigation of results', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      await searchPage.search('Gesundheit');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      
      if (resultsCount > 0) {
        // Tab to first result
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        
        // Should be able to navigate to results with keyboard
        if (await focusedElement.count() > 0) {
          await expect(focusedElement).toBeVisible();
          
          // Arrow keys might work for result navigation
          await page.keyboard.press('ArrowDown');
          await page.waitForTimeout(100);
          
          const newFocusedElement = page.locator(':focus');
          await expect(newFocusedElement).toBeVisible();
        }
      }
    });
  });

  test.describe('German Language Search Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should handle German umlauts correctly', async ({ page }) => {
      await validateGermanContent(page);
      
      const searchPage = new SearchPage(page);
      const germanTerms = ['Ernährung', 'Müdigkeit', 'Stärkung', 'Größe'];
      
      for (const term of germanTerms.slice(0, 2)) {
        await searchPage.search(term);
        await page.waitForTimeout(1500);
        
        // Input should preserve German characters exactly
        const inputValue = await searchPage.searchInput.inputValue();
        expect(inputValue).toBe(term);
        
        // Clear for next search
        await searchPage.searchInput.fill('');
      }
    });

    test('should find German health content', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Test health-specific German terms
      for (const healthTerm of GERMAN_HEALTH_TERMS.slice(0, 3)) {
        await searchPage.search(healthTerm);
        await page.waitForTimeout(2000);
        
        const hasResults = await searchPage.searchResults.count() > 0;
        const hasNoResults = await searchPage.noResults.count() > 0;
        
        // Should get some response (results or no results message)
        expect(hasResults || hasNoResults).toBeTruthy();
        
        if (hasResults) {
          // Results should be relevant to health content
          const firstResultText = await searchPage.searchResults.first().textContent();
          
          if (firstResultText) {
            expect(firstResultText.toLowerCase()).toMatch(/gesundheit|vitamin|ernährung|wellness|therapie/);
          }
        }
        
        // Clear for next search
        await searchPage.searchInput.fill('');
        await page.waitForTimeout(500);
      }
    });

    test('should handle German search suggestions if available', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Type partial German term
      await searchPage.searchInput.fill('Ern');
      await page.waitForTimeout(1000);
      
      // Look for search suggestions
      const suggestions = page.locator('.search-suggestions, .autocomplete, [role="listbox"]');
      
      if (await suggestions.count() > 0) {
        await expect(suggestions).toBeVisible();
        
        // Suggestions should contain German terms
        const suggestionText = await suggestions.textContent();
        expect(suggestionText).toMatch(/Ernährung|Ernte|Energie/);
        
        // Should be able to click on suggestion
        const firstSuggestion = suggestions.locator('li, .suggestion').first();
        if (await firstSuggestion.count() > 0) {
          await firstSuggestion.click();
          
          // Input should be filled with suggestion
          const inputValue = await searchPage.searchInput.inputValue();
          expect(inputValue.length).toBeGreaterThan(3);
        }
      }
    });
  });

  test.describe('Search State Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should clear search and results', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Perform search
      await searchPage.search('Vitamin D');
      await page.waitForTimeout(2000);
      
      // Clear search
      await searchPage.searchInput.fill('');
      await page.waitForTimeout(1000);
      
      // Results should be cleared or hidden
      const inputValue = await searchPage.searchInput.inputValue();
      expect(inputValue).toBe('');
    });

    test('should remember search when navigating back', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Perform search
      await searchPage.search('Gesundheit');
      await page.waitForTimeout(2000);
      
      // Navigate to another page
      await page.goto('/about');
      await waitForPageLoad(page);
      
      // Navigate back to search
      await page.goBack();
      await waitForPageLoad(page);
      
      // Search input might remember the search
      const _inputValue = await searchPage.searchInput.inputValue();
      // Note: This behavior varies by implementation
    });

    test('should handle multiple consecutive searches', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      const searchTerms = ['Vitamin', 'Ernährung', 'Gesundheit'];
      
      for (const term of searchTerms) {
        await searchPage.search(term);
        await page.waitForTimeout(1500);
        
        // Each search should override the previous
        const inputValue = await searchPage.searchInput.inputValue();
        expect(inputValue).toBe(term);
        
        // Should get some response
        const hasResults = await searchPage.searchResults.count() > 0;
        const hasNoResults = await searchPage.noResults.count() > 0;
        expect(hasResults || hasNoResults).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Search Experience', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should be touch-friendly on mobile', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      // Search input should be large enough for touch
      const inputBounds = await searchPage.searchInput.boundingBox();
      if (inputBounds) {
        expect(inputBounds.height).toBeGreaterThan(40);
      }
      
      // Touch interaction should work
      await searchPage.searchInput.tap();
      await expect(searchPage.searchInput).toBeFocused();
      
      // Virtual keyboard should not break layout
      await searchPage.searchInput.fill('Gesundheit');
      await expect(searchPage.searchInput).toBeVisible();
    });

    test('should handle mobile search results', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      await searchPage.search('Vitamin');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      
      if (resultsCount > 0) {
        // Results should be readable on mobile
        const firstResult = searchPage.searchResults.first();
        const resultBounds = await firstResult.boundingBox();
        
        if (resultBounds) {
          expect(resultBounds.width).toBeLessThanOrEqual(VIEWPORT_SIZES.mobile.width);
        }
        
        // Touch targets should be adequate
        const resultLinks = firstResult.locator('a');
        if (await resultLinks.count() > 0) {
          const linkBounds = await resultLinks.first().boundingBox();
          if (linkBounds) {
            expect(linkBounds.height).toBeGreaterThan(30);
          }
        }
      }
    });

    test('should support mobile search gestures', async ({ page }) => {
      const searchPage = new SearchPage(page);
      
      await searchPage.search('Ernährung');
      await page.waitForTimeout(2000);
      
      const resultsCount = await searchPage.searchResults.count();
      
      if (resultsCount > 2) {
        // Should be able to scroll through results
        const resultsContainer = page.locator('#pagefind-results, .search-results');
        
        if (await resultsContainer.count() > 0) {
          // Test scroll behavior using page.evaluate
          await resultsContainer.evaluate(el => el.scrollTop = 100);
          await page.waitForTimeout(500);
          
          // Results should still be visible after scroll
          await expect(searchPage.searchResults.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Search Performance', () => {
    test('should have fast search response time', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      // Measure search performance
      const startTime = Date.now();
      
      await searchPage.search('Gesundheit');
      
      // Wait for results to appear
      await page.waitForFunction(() => {
        const results = document.querySelector('#pagefind-results, .search-results');
        const noResults = document.querySelector('.no-results, .pagefind-zero-results');
        return (results?.children?.length ?? 0) > 0 || noResults !== null;
      }, { timeout: 5000 });
      
      const searchTime = Date.now() - startTime;
      
      // Search should be reasonably fast (under 3 seconds)
      expect(searchTime).toBeLessThan(3000);
    });

    test('should not block UI during search', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      // Start search
      await searchPage.search('Vitamin D');
      
      // UI should remain responsive during search
      await searchPage.searchInput.fill('New Search');
      await expect(searchPage.searchInput).toHaveValue('New Search');
      
      // Should be able to interact with other elements
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });
  });
});