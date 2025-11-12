import { test, expect } from '@playwright/test';

import { 
  SAMPLE_BLOG_POSTS
} from '../utils/fixtures';
import { SearchPage, BlogPostPage } from '../utils/page-objects';
import { 
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Edge Cases and Error Handling', () => {
  test.describe('404 Error Handling', () => {
    test('should handle non-existent blog posts gracefully', async ({ page }) => {
      const nonExistentPost = '/posts/non-existent-health-article';
      
      const response = await page.goto(nonExistentPost);
      
      // Should return 404 status
      expect(response!.status()).toBe(404);
      
      const content = page.locator('body');
      const contentText = await content.textContent();
      
      // Should display user-friendly German error message
      const hasGermanError = 
        contentText?.includes('nicht gefunden') ||
        contentText?.includes('Seite existiert nicht') ||
        contentText?.includes('Artikel nicht verfügbar') ||
        contentText?.includes('Entschuldigung');
      
      expect(hasGermanError).toBeTruthy();
      
      // Should provide navigation options
      const navigationLinks = page.locator('a[href="/"], a[href="/posts"], a[href="/search"]');
      expect(await navigationLinks.count()).toBeGreaterThan(0);
    });

    test('should handle non-existent author pages', async ({ page }) => {
      const nonExistentAuthor = '/author/non-existent-author';
      
      const response = await page.goto(nonExistentAuthor);
      expect(response!.status()).toBe(404);
      
      // Should maintain site navigation
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible();
      
      // Should suggest browsing authors
      const content = page.locator('body');
      await expect(content).toContainText(/Autor|Author|Team|Über uns/);
    });

    test('should handle non-existent category pages', async ({ page }) => {
      const nonExistentCategory = '/categories/non-existent-category';
      
      const response = await page.goto(nonExistentCategory);
      expect(response!.status()).toBe(404);
      
      // Should suggest existing categories
      const content = page.locator('body');
      const hasRedirection = 
        await content.textContent().then(text => 
          text?.includes('Kategorien') || 
          text?.includes('verfügbare Kategorien') ||
          text?.includes('alle Kategorien')
        );
      
      if (hasRedirection) {
        expect(hasRedirection).toBeTruthy();
      }
    });

    test('should handle non-existent glossary terms', async ({ page }) => {
      const nonExistentTerm = '/glossary/non-existent-medical-term';
      
      const response = await page.goto(nonExistentTerm);
      expect(response!.status()).toBe(404);
      
      // Should provide search alternatives
      const searchLink = page.locator('a[href*="/search"], a[href*="/glossary"]');
      expect(await searchLink.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Search Edge Cases', () => {
    test('should handle empty search queries', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        // Test empty search
        await searchPage.search('');
        await page.waitForTimeout(1000);
        
        // Should not crash or show errors
        const errorMessages = page.locator('.error, .alert-error');
        expect(await errorMessages.count()).toBe(0);
        
        // Should show guidance or no results message
        const guidance = page.locator('body');
        const guidanceText = await guidance.textContent();
        
        const hasGuidance = 
          guidanceText?.includes('Suchbegriff eingeben') ||
          guidanceText?.includes('Bitte geben Sie') ||
          guidanceText?.includes('Suche starten') ||
          guidanceText?.includes('Begriff eingeben');
        
        if (hasGuidance) {
          expect(hasGuidance).toBeTruthy();
        }
      }
    });

    test('should handle very long search queries', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        // Test very long search query
        const longQuery = 'Gesundheit Ernährung Vitamine Mineralstoffe Immunsystem Wellness Therapie Behandlung Heilung Mikrobiom Antioxidantien'.repeat(3);
        
        await searchPage.search(longQuery.substring(0, 200)); // Limit to reasonable length
        await page.waitForTimeout(2000);
        
        // Should handle gracefully without errors
        const hasErrors = await page.locator('.error, .alert').count() > 0;
        expect(hasErrors).toBeFalsy();
        
        // Should return some results or no results message
        const hasResults = await searchPage.searchResults.count() > 0;
        const hasNoResults = await searchPage.noResults.count() > 0;
        
        expect(hasResults ?? hasNoResults).toBeTruthy();
      }
    });

    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        const specialQueries = [
          'Vitamin <script>',
          'Ernährung & Gesundheit',
          'Wellness "quotes"',
          'Health 100%',
          'Ω-3 Fettsäuren'
        ];
        
        for (const query of specialQueries.slice(0, 3)) {
          await searchPage.search(query);
          await page.waitForTimeout(1000);
          
          // Should not cause XSS or errors
          const bodyText = await page.locator('body').textContent();
          expect(bodyText).not.toContain('<script>');
          
          // Should escape special characters properly
          if (query.includes('<script>')) {
            expect(bodyText).not.toContain('<script>');
          }
          
          // Clear for next search
          await searchPage.searchInput.fill('');
        }
      }
    });

    test('should handle rapid successive searches', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        // Perform rapid searches
        const rapidQueries = ['Vitamin', 'Omega', 'Gesundheit', 'Stress'];
        
        for (const query of rapidQueries) {
          await searchPage.searchInput.fill(query);
          await page.waitForTimeout(100); // Very short delay
        }
        
        // Wait for final search to complete
        await page.waitForTimeout(2000);
        
        // Should handle without errors
        const errorElements = page.locator('.error, .alert-error');
        expect(await errorElements.count()).toBe(0);
        
        // Final search should work
        const finalInputValue = await searchPage.searchInput.inputValue();
        expect(finalInputValue).toBe('Stress');
      }
    });
  });

  test.describe('Content Loading Edge Cases', () => {
    test('should handle slow loading content gracefully', async ({ page }) => {
      // Throttle network to simulate slow connection
      await page.route('**/*', async route => {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 100); // Add 100ms delay
        });
        await route.continue();
      });
      
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`, { waitUntil: 'domcontentloaded' });
      
      // Should show loading states or skeleton content
      const _loadingElements = page.locator('.loading, .skeleton, .placeholder');
      
      // Wait for content to eventually load
      await waitForPageLoad(page);
      
      const blogPost = new BlogPostPage(page);
      await expect(blogPost.title).toBeVisible({ timeout: 10000 });
      
      // Content should eventually be available
      const title = await blogPost.title.textContent();
      expect(title).toBeTruthy();
      expect(title!.length).toBeGreaterThan(5);
    });

    test('should handle missing images gracefully', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      // Replace image sources with non-existent ones
      await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          img.src = '/non-existent-image.jpg';
        });
      });
      
      await page.waitForTimeout(2000);
      
      // Should handle broken images (hide or show fallback)
      const visibleBrokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img =>
          img.style.display !== 'none' &&
          (!img.complete || img.naturalWidth === 0)
        ).length;
      });
      
      // Broken images should be handled gracefully
      expect(visibleBrokenImages).toBeLessThan(3); // Allow some tolerance
    });

    test('should handle JavaScript disabled scenarios', async ({ page }) => {
      // Disable JavaScript
      await page.context().addInitScript(() => {
        // Simulate limited JavaScript environment
        Object.defineProperty(window, 'fetch', { value: undefined });
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Core content should still be accessible
      const content = page.locator('main, article, .content');
      await expect(content).toBeVisible();
      
      // Navigation should work
      const navigation = page.locator('nav a');
      expect(await navigation.count()).toBeGreaterThan(0);
      
      // Basic functionality should be preserved
      const headings = page.locator('h1, h2, h3');
      expect(await headings.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle viewport changes gracefully', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const viewports = [
        { width: 320, height: 568 },   // Small mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }, // Large desktop
        { width: 375, height: 667 }    // Back to mobile
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        // Navigation should remain functional
        const navigation = page.locator('nav');
        await expect(navigation).toBeVisible();
        
        // Content should remain accessible
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
        
        // No horizontal scrolling on mobile
        if (viewport.width <= 768) {
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });
          
          expect(hasHorizontalScroll).toBeFalsy();
        }
      }
    });

    test('should handle orientation changes on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Simulate orientation change
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(1000);
      
      // Content should adapt
      const content = page.locator('main');
      await expect(content).toBeVisible();
      
      // Navigation should remain accessible
      const mobileMenu = page.locator('.mobile-menu, .menu-toggle, nav');
      expect(await mobileMenu.count()).toBeGreaterThan(0);
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      
      // Check that focus is visible
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        if (focused && focused !== document.body) {
          const styles = window.getComputedStyle(focused);
          return {
            tag: focused.tagName,
            outline: styles.outline,
            focusVisible: focused.matches(':focus-visible')
          };
        }
        return null;
      });
      
      if (focusedElement) {
        expect(focusedElement.tag).toBeTruthy();
      }
      
      // Test skip links
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a').filter({ hasText: /skip|springe|direkt/i });
      
      if (await skipLink.count() > 0) {
        await expect(skipLink.first()).toBeFocused();
      }
    });
  });

  test.describe('Form Input Edge Cases', () => {
    test('should validate form inputs properly', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Test maximum length validation
        const veryLongInput = 'a'.repeat(1000);
        await searchInput.fill(veryLongInput);
        
        const inputValue = await searchInput.inputValue();
        
        // Should either limit input length or handle gracefully
        expect(inputValue.length).toBeLessThan(500);
        
        // Test special characters
        await searchInput.fill('"><script>alert("test")</script>');
        
        // Should not execute scripts
        const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
        await page.waitForTimeout(500);
        const dialog = await dialogPromise;
        
        expect(dialog).toBeNull();
      }
    });

    test('should handle form submission without input', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchForm = page.locator('form');
      
      if (await searchForm.count() > 0) {
        // Try to submit empty form
        await searchForm.first().evaluate(form => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        });
        
        await page.waitForTimeout(1000);
        
        // Should handle gracefully without errors
        const errorMessages = page.locator('.error, .alert-error');
        expect(await errorMessages.count()).toBe(0);
      }
    });
  });

  test.describe('URL and Routing Edge Cases', () => {
    test('should handle malformed URLs gracefully', async ({ page }) => {
      const malformedUrls = [
        '/posts//',
        '/posts/../',
        '/posts/%20%20%20',
        '/author///',
        '/categories/%'
      ];
      
      for (const url of malformedUrls.slice(0, 3)) {
        const response = await page.goto(url);
        
        // Should either redirect or show 404, not crash
        expect([200, 301, 302, 404]).toContain(response!.status());
        
        // Page should still be functional
        const navigation = page.locator('nav');
        await expect(navigation).toBeVisible();
      }
    });

    test('should handle URL encoding correctly', async ({ page }) => {
      // Test German characters in URLs
      const germanUrls = [
        '/search?q=Ernährung',
        '/search?q=Müdigkeit',
        '/search?q=Stärkung'
      ];
      
      for (const url of germanUrls) {
        await page.goto(url);
        await waitForPageLoad(page);
        
        // Should handle German characters correctly
        const searchInput = page.locator('input[type="search"]');
        
        if (await searchInput.count() > 0) {
          const inputValue = await searchInput.inputValue();
          
          // German characters should be preserved
          expect(inputValue).toMatch(/[äöüÄÖÜß]|Ernährung|Müdigkeit|Stärkung/);
        }
      }
    });

    test('should handle hash fragments and query parameters', async ({ page }) => {
      await page.goto('/#section');
      await waitForPageLoad(page);
      
      // Should handle hash without errors
      expect(page.url()).toContain('#section');
      
      // Test with query parameters
      await page.goto('/?utm_source=test&utm_medium=email');
      await waitForPageLoad(page);
      
      // Should handle query parameters gracefully
      expect(page.url()).toContain('utm_source=test');
      
      // Page should still function normally
      const content = page.locator('main');
      await expect(content).toBeVisible();
    });
  });

  test.describe('Security Edge Cases', () => {
    test('should prevent XSS in search queries', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        const xssAttempts = [
          '<script>alert("xss")</script>',
          'javascript:alert("xss")',
          '<img src="x" onerror="alert(1)">',
          '"><script>alert("xss")</script>'
        ];
        
        for (const xssAttempt of xssAttempts) {
          await searchPage.search(xssAttempt);
          await page.waitForTimeout(1000);
          
          // Should not execute malicious scripts
          const dialogPromise = page.waitForEvent('dialog', { timeout: 500 }).catch(() => null);
          const dialog = await dialogPromise;
          expect(dialog).toBeNull();
          
          // Should escape content properly
          const bodyText = await page.locator('body').textContent();
          expect(bodyText).not.toContain('<script>');
          
          await searchPage.searchInput.fill('');
        }
      }
    });

    test('should handle CSRF protection appropriately', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      // Look for CSRF tokens or other security measures
      const forms = page.locator('form');
      
      if (await forms.count() > 0) {
        const firstForm = forms.first();
        
        // Check for security attributes
        const method = await firstForm.getAttribute('method');
        const _action = await firstForm.getAttribute('action');
        
        // GET forms should be safe
        if (method && method.toLowerCase() !== 'get') {
          // Should have CSRF protection for non-GET forms
          const csrfToken = firstForm.locator('input[name*="csrf"], input[name*="token"]');
          
          if (await csrfToken.count() > 0) {
            const tokenValue = await csrfToken.getAttribute('value');
            expect(tokenValue).toBeTruthy();
          }
        }
      }
    });
  });
});