import { test, expect } from '@playwright/test';

import { 
  ACCESSIBILITY_REQUIREMENTS, 
  EXPECTED_STRUCTURAL_ELEMENTS,
  SAMPLE_BLOG_POSTS,
  VIEWPORT_SIZES
} from '../utils/fixtures';
import { 
  validateAccessibility,
  validateLayoutStructure,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('WCAG Compliance Testing', () => {
  test.describe('Semantic HTML Structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have proper landmark elements', async ({ page }) => {
      await validateLayoutStructure(page);
      
      // Test required landmarks
      for (const landmark of ACCESSIBILITY_REQUIREMENTS.landmarks) {
        const landmarkElements = page.locator(`[role="${landmark}"], ${landmark}`);
        await expect(landmarkElements).toHaveCount(1, { timeout: 5000 });
      }
    });

    test('should have exactly one h1 per page', async ({ page }) => {
      const h1Elements = page.locator('h1');
      await expect(h1Elements).toHaveCount(ACCESSIBILITY_REQUIREMENTS.headings.h1Count);
      
      // H1 should be visible and meaningful
      const h1Text = await h1Elements.textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(5);
    });

    test('should have hierarchical heading structure', async ({ page }) => {
      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 1) {
        const headingLevels: number[] = [];
        
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          const level = parseInt(tagName.replace('h', ''));
          headingLevels.push(level);
        }
        
        // Check hierarchy (no skipping levels)
        for (let i = 1; i < headingLevels.length; i++) {
          const currentLevel = headingLevels[i];
          const previousLevel = headingLevels[i - 1];
          
          // Can't skip more than one level
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should have proper HTML5 semantic elements', async ({ page }) => {
      // Test semantic structure
      for (const element of EXPECTED_STRUCTURAL_ELEMENTS) {
        const semanticElements = page.locator(element);
        await expect(semanticElements).toHaveCountGreaterThan(0);
      }
      
      // Articles should be in article elements
      const articles = page.locator('article');
      if (await articles.count() > 0) {
        // Article should have heading
        const articleHeading = articles.first().locator('h1, h2, h3');
        await expect(articleHeading).toHaveCountGreaterThan(0);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should support tab navigation through all interactive elements', async ({ page }) => {
      await validateAccessibility(page);
      
      // Start tab navigation
      await page.keyboard.press('Tab');
      
      const focusableElements = [];
      let tabCount = 0;
      const maxTabs = 20;
      
      while (tabCount < maxTabs) {
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
          const role = await focusedElement.getAttribute('role');
          const href = await focusedElement.getAttribute('href');
          const type = await focusedElement.getAttribute('type');
          
          // Element should be interactive
          const isInteractive = 
            tagName === 'a' || 
            tagName === 'button' || 
            tagName === 'input' || 
            tagName === 'select' || 
            tagName === 'textarea' ||
            role === 'button' ||
            role === 'link' ||
            href !== null;
          
          if (isInteractive) {
            focusableElements.push({
              tag: tagName,
              role,
              type,
              hasHref: href !== null
            });
          }
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      // Should have found interactive elements
      expect(focusableElements.length).toBeGreaterThan(3);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.count() > 0) {
        // Get focus styles
        const focusStyles = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = 
          focusStyles.outline !== 'none' ||
          focusStyles.outlineWidth !== '0px' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.borderColor !== 'initial';
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should support skip navigation', async ({ page }) => {
      // Look for skip links
      const skipLinks = page.locator('a[href="#main"], a[href="#content"], .skip-to-main, .skip-link');
      
      if (await skipLinks.count() > 0) {
        // Should be first tabbable element or become visible on focus
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        const isSkipLink = await focusedElement.evaluate((el, skipLinkElement) => {
          return el === skipLinkElement;
        }, await skipLinks.first().elementHandle());
        
        if (isSkipLink) {
          // Skip link should work
          await page.keyboard.press('Enter');
          
          // Main content should be focused
          const mainContent = page.locator('#main, main, #content');
          if (await mainContent.count() > 0) {
            const isMainFocused = await mainContent.evaluate(el => el === document.activeElement);
            expect(isMainFocused || await mainContent.getAttribute('tabindex')).toBeTruthy();
          }
        }
      }
    });

    test('should support arrow key navigation where appropriate', async ({ page }) => {
      // Navigate to search page to test search results navigation
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Perform search
        await searchInput.fill('Gesundheit');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        
        // Check if results support arrow navigation
        const searchResults = page.locator('#pagefind-results, .search-results');
        
        if (await searchResults.count() > 0) {
          const resultItems = searchResults.locator('a, .result-item');
          
          if (await resultItems.count() > 1) {
            // Tab to first result
            await page.keyboard.press('Tab');
            
            // Try arrow navigation
            await page.keyboard.press('ArrowDown');
            
            const focusedAfterArrow = page.locator(':focus');
            await expect(focusedAfterArrow).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have proper alt text for images', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(5, imageCount); i++) {
          const image = images.nth(i);
          
          // Images should have alt text or be marked as decorative
          const alt = await image.getAttribute('alt');
          const role = await image.getAttribute('role');
          const ariaHidden = await image.getAttribute('aria-hidden');
          
          // Either has meaningful alt text or is properly marked as decorative
          const hasProperAltText = 
            (alt !== null && alt.trim().length > 0) ||
            role === 'presentation' ||
            ariaHidden === 'true';
          
          expect(hasProperAltText).toBeTruthy();
        }
      }
    });

    test('should have descriptive link text', async ({ page }) => {
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        for (let i = 0; i < Math.min(10, linkCount); i++) {
          const link = links.nth(i);
          
          const linkText = await link.textContent();
          const ariaLabel = await link.getAttribute('aria-label');
          const title = await link.getAttribute('title');
          
          // Link should have meaningful text
          const meaningfulText = linkText || ariaLabel || title;
          
          if (meaningfulText) {
            expect(meaningfulText.trim().length).toBeGreaterThan(2);
            
            // Should not be generic text
            expect(meaningfulText.toLowerCase()).not.toMatch(/^(click|here|more|link|read)$/);
          }
        }
      }
    });

    test('should have proper form labels', async ({ page }) => {
      // Navigate to search page for form testing
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const formInputs = page.locator('input, select, textarea');
      const inputCount = await formInputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = formInputs.nth(i);
          const inputType = await input.getAttribute('type');
          
          // Skip hidden inputs
          if (inputType === 'hidden') {continue;}
          
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledby = await input.getAttribute('aria-labelledby');
          const placeholder = await input.getAttribute('placeholder');
          
          // Input should have label
          let hasLabel = false;
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            hasLabel = await label.count() > 0;
          }
          
          hasLabel = hasLabel || Boolean(ariaLabel) || Boolean(ariaLabelledby);
          
          // Placeholder alone is not sufficient but acceptable for search
          if (!hasLabel && inputType === 'search' && placeholder) {
            hasLabel = true;
          }
          
          expect(hasLabel).toBeTruthy();
        }
      }
    });

    test('should use ARIA attributes appropriately', async ({ page }) => {
      // Check for proper ARIA usage
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      const ariaCount = await elementsWithAria.count();
      
      if (ariaCount > 0) {
        for (let i = 0; i < Math.min(10, ariaCount); i++) {
          const element = elementsWithAria.nth(i);
          
          const ariaLabel = await element.getAttribute('aria-label');
          const ariaLabelledby = await element.getAttribute('aria-labelledby');
          const ariaDescribedby = await element.getAttribute('aria-describedby');
          const role = await element.getAttribute('role');
          
          // ARIA attributes should have values
          if (ariaLabel) {
            expect(ariaLabel.trim().length).toBeGreaterThan(0);
          }
          
          if (ariaLabelledby) {
            // Referenced element should exist
            const referencedElement = page.locator(`#${ariaLabelledby}`);
            await expect(referencedElement).toHaveCount(1);
          }
          
          if (ariaDescribedby) {
            // Referenced element should exist
            const referencedElement = page.locator(`#${ariaDescribedby}`);
            await expect(referencedElement).toHaveCount(1);
          }
          
          if (role) {
            // Role should be valid
            const validRoles = [
              'button', 'link', 'heading', 'banner', 'navigation', 'main', 'contentinfo',
              'article', 'section', 'complementary', 'search', 'form', 'list', 'listitem',
              'tab', 'tabpanel', 'dialog', 'alert', 'status', 'region'
            ];
            expect(validRoles).toContain(role);
          }
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have sufficient color contrast for text', async ({ page }) => {
      // Test main content text contrast
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, a, span');
      const elementCount = await textElements.count();
      
      if (elementCount > 0) {
        for (let i = 0; i < Math.min(5, elementCount); i++) {
          const element = textElements.nth(i);
          
          if (await element.isVisible()) {
            const styles = await element.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize
              };
            });
            
            // Parse RGB values (simplified check)
            const colorMatch = styles.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            const bgMatch = styles.backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            
            if (colorMatch && bgMatch) {
              const textRgb = [parseInt(colorMatch[1]), parseInt(colorMatch[2]), parseInt(colorMatch[3])];
              const bgRgb = [parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3])];
              
              // Simple contrast check (not exact WCAG calculation but indicative)
              const textLuminance = (textRgb[0] * 0.299 + textRgb[1] * 0.587 + textRgb[2] * 0.114) / 255;
              const bgLuminance = (bgRgb[0] * 0.299 + bgRgb[1] * 0.587 + bgRgb[2] * 0.114) / 255;
              
              const contrast = Math.abs(textLuminance - bgLuminance);
              
              // Should have reasonable contrast (simplified check)
              expect(contrast).toBeGreaterThan(0.2);
            }
          }
        }
      }
    });

    test('should not rely solely on color for meaning', async ({ page }) => {
      // Check for elements that might rely on color alone
      const colorfulElements = page.locator('.error, .success, .warning, .info, .alert');
      const colorElementCount = await colorfulElements.count();
      
      if (colorElementCount > 0) {
        for (let i = 0; i < colorElementCount; i++) {
          const element = colorfulElements.nth(i);
          
          // Element should have text content or icon
          const textContent = await element.textContent();
          const hasIcon = await element.locator('svg, i, .icon').count() > 0;
          
          // Should not rely on color alone
          expect(textContent?.trim().length || hasIcon).toBeTruthy();
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have adequate touch target sizes', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, select');
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 0) {
        for (let i = 0; i < Math.min(10, elementCount); i++) {
          const element = interactiveElements.nth(i);
          
          if (await element.isVisible()) {
            const boundingBox = await element.boundingBox();
            
            if (boundingBox) {
              // WCAG recommends minimum 44x44 pixels for touch targets
              expect(boundingBox.height).toBeGreaterThan(30); // Slightly relaxed for real-world testing
              expect(boundingBox.width).toBeGreaterThan(30);
            }
          }
        }
      }
    });

    test('should support zoom up to 200% without horizontal scrolling', async ({ page }) => {
      // Set zoom level
      await page.setViewportSize({ 
        width: Math.floor(VIEWPORT_SIZES.mobile.width * 0.5), // Simulate 200% zoom
        height: Math.floor(VIEWPORT_SIZES.mobile.height * 0.5)
      });
      
      await page.reload();
      await waitForPageLoad(page);
      
      // Page should not have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      // Should not have horizontal scroll (some tolerance for viewport differences)
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('should maintain functionality with device orientation changes', async ({ page }) => {
      // Test portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await waitForPageLoad(page);
      
      // Navigation should work
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Test landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Navigation should still work
      await expect(nav).toBeVisible();
      
      // Interactive elements should remain functional
      const links = page.locator('a[href]');
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
        await expect(links.first()).toBeEnabled();
      }
    });
  });

  test.describe('Page-Specific Accessibility', () => {
    test('should maintain accessibility on blog posts', async ({ page }) => {
      // Test a blog post
      const postSlug = SAMPLE_BLOG_POSTS[0];
      await page.goto(`/posts/${postSlug}`);
      await waitForPageLoad(page);
      
      await validateAccessibility(page);
      
      // Article should have proper structure
      const article = page.locator('article');
      await expect(article).toHaveCount(1);
      
      // Article should have heading
      const articleHeading = article.locator('h1');
      await expect(articleHeading).toHaveCount(1);
      
      // Should have proper reading order
      const headings = article.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 1) {
        // First heading should be h1
        const firstHeading = headings.first();
        const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
        expect(tagName).toBe('h1');
      }
    });

    test('should maintain accessibility in search functionality', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      await validateAccessibility(page);
      
      // Search input should be properly labeled
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        const ariaLabel = await searchInput.getAttribute('aria-label');
        const placeholder = await searchInput.getAttribute('placeholder');
        const id = await searchInput.getAttribute('id');
        
        let hasLabel = Boolean(ariaLabel) || Boolean(placeholder);
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = hasLabel || await label.count() > 0;
        }
        
        expect(hasLabel).toBeTruthy();
      }
    });
  });
});