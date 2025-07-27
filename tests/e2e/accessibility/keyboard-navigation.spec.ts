import { test, expect } from '@playwright/test';

import { SAMPLE_BLOG_POSTS, VIEWPORT_SIZES } from '../utils/fixtures';
import { Navigation } from '../utils/page-objects';
import { 
  waitForPageLoad,
  validateAccessibility
} from '../utils/test-helpers';

test.describe('Keyboard Navigation', () => {
  test.describe('Basic Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should allow navigation through all interactive elements', async ({ page }) => {
      await validateAccessibility(page);
      
      const interactiveElements = [];
      let currentElement;
      let tabCount = 0;
      const maxTabs = 25;
      
      // Start tabbing from the beginning
      await page.keyboard.press('Tab');
      
      while (tabCount < maxTabs) {
        currentElement = page.locator(':focus');
        
        if (await currentElement.count() > 0) {
          const tagName = await currentElement.evaluate(el => el.tagName.toLowerCase());
          const role = await currentElement.getAttribute('role');
          const type = await currentElement.getAttribute('type');
          const href = await currentElement.getAttribute('href');
          const id = await currentElement.getAttribute('id');
          const ariaLabel = await currentElement.getAttribute('aria-label');
          
          interactiveElements.push({
            tag: tagName,
            role,
            type,
            hasHref: Boolean(href),
            id,
            ariaLabel,
            isVisible: await currentElement.isVisible()
          });
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      // Should have found multiple interactive elements
      expect(interactiveElements.length).toBeGreaterThan(5);
      
      // All focused elements should be visible
      const visibleElements = interactiveElements.filter(el => el.isVisible);
      expect(visibleElements.length).toBeGreaterThan(3);
    });

    test('should support reverse tabbing with Shift+Tab', async ({ page }) => {
      // Tab forward several times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      
      const forwardElement = page.locator(':focus');
      const forwardElementId = await forwardElement.getAttribute('id');
      const forwardElementClass = await forwardElement.getAttribute('class');
      
      // Tab backward
      await page.keyboard.press('Shift+Tab');
      const backwardElement = page.locator(':focus');
      
      // Should be on a different element
      const backwardElementId = await backwardElement.getAttribute('id');
      const backwardElementClass = await backwardElement.getAttribute('class');
      
      expect(forwardElementId !== backwardElementId || forwardElementClass !== backwardElementClass).toBeTruthy();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.count() > 0) {
        // Check focus indicator styles
        const focusStyles = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineColor: styles.outlineColor,
            outlineStyle: styles.outlineStyle,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor,
            backgroundColor: styles.backgroundColor
          };
        });
        
        // Should have some visible focus indicator
        const hasFocusIndicator = 
          (focusStyles.outline !== 'none' && focusStyles.outlineWidth !== '0px') ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.outlineStyle !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
        
        // Focus indicator should be visible (not transparent)
        if (focusStyles.outlineColor && focusStyles.outlineColor !== 'transparent') {
          expect(focusStyles.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    });

    test('should trap focus in modal dialogs if present', async ({ page }) => {
      // Look for modal triggers
      const modalTriggers = page.locator('[data-modal], [aria-haspopup="dialog"], .modal-trigger');
      
      if (await modalTriggers.count() > 0) {
        // Open modal
        await modalTriggers.first().click();
        await page.waitForTimeout(500);
        
        // Look for modal
        const modal = page.locator('[role="dialog"], .modal, [aria-modal="true"]');
        
        if (await modal.count() > 0 && await modal.isVisible()) {
          // Tab through modal
          let tabCount = 0;
          const maxTabs = 10;
          let stayedInModal = true;
          
          while (tabCount < maxTabs) {
            await page.keyboard.press('Tab');
            
            const focusedElement = page.locator(':focus');
            if (await focusedElement.count() > 0) {
              // Check if focus is still within modal
              const isInModal = await modal.evaluate((modalEl, focusedEl) => {
                return modalEl.contains(focusedEl);
              }, await focusedElement.elementHandle());
              
              if (!isInModal) {
                stayedInModal = false;
                break;
              }
            }
            
            tabCount++;
          }
          
          expect(stayedInModal).toBeTruthy();
        }
      }
    });
  });

  test.describe('Navigation Menu Keyboard Support', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should support keyboard navigation in main menu', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Tab to navigation
      await page.keyboard.press('Tab');
      
      let foundNavigation = false;
      let tabCount = 0;
      
      while (tabCount < 10) {
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          // Check if we're in navigation
          const isInNav = await nav.navLinks.evaluate((navContainer, focusedEl) => {
            const navElements = navContainer.querySelectorAll('a');
            return Array.from(navElements).includes(focusedEl);
          }, await focusedElement.elementHandle());
          
          if (isInNav) {
            foundNavigation = true;
            break;
          }
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      expect(foundNavigation).toBeTruthy();
    });

    test('should allow activation of navigation items with Enter', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Find navigation link
      const aboutLink = nav.navLinks.filter({ hasText: /Über|About/ });
      
      if (await aboutLink.count() > 0) {
        // Focus the link
        await aboutLink.first().focus();
        await expect(aboutLink.first()).toBeFocused();
        
        // Activate with Enter
        await page.keyboard.press('Enter');
        await waitForPageLoad(page);
        
        // Should navigate to About page
        expect(page.url()).toMatch(/\/about|\/ueber/);
      }
    });

    test('should support mobile menu keyboard navigation', async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.mobile);
      await page.reload();
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      
      if (await nav.mobileMenuButton.count() > 0) {
        // Focus mobile menu button
        await nav.mobileMenuButton.focus();
        await expect(nav.mobileMenuButton).toBeFocused();
        
        // Open with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        if (await nav.mobileMenu.count() > 0 && await nav.mobileMenu.isVisible()) {
          // Should be able to tab through mobile menu items
          await page.keyboard.press('Tab');
          
          const focusedInMenu = page.locator(':focus');
          
          if (await focusedInMenu.count() > 0) {
            // Should be within mobile menu
            const isInMobileMenu = await nav.mobileMenu.evaluate((menuEl, focusedEl) => {
              return menuEl.contains(focusedEl);
            }, await focusedInMenu.elementHandle());
            
            expect(isInMobileMenu).toBeTruthy();
          }
          
          // Escape should close menu
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          if (await nav.mobileMenu.count() > 0) {
            const isMenuVisible = await nav.mobileMenu.isVisible();
            expect(isMenuVisible).toBeFalsy();
          }
        }
      }
    });
  });

  test.describe('Form Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
    });

    test('should support keyboard interaction with search form', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Tab to search input
        await searchInput.focus();
        await expect(searchInput).toBeFocused();
        
        // Type search term
        await page.keyboard.type('Gesundheit');
        await expect(searchInput).toHaveValue('Gesundheit');
        
        // Submit with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Should execute search
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('Gesundheit');
      }
    });

    test('should support form navigation with Tab and Shift+Tab', async ({ page }) => {
      const formElements = page.locator('input, button, select, textarea');
      const elementCount = await formElements.count();
      
      if (elementCount > 1) {
        // Focus first form element
        await formElements.first().focus();
        
        // Tab to next element
        await page.keyboard.press('Tab');
        
        const secondElement = page.locator(':focus');
        
        // Should be different element
        const firstElementId = await formElements.first().getAttribute('id');
        const secondElementId = await secondElement.getAttribute('id');
        
        expect(firstElementId !== secondElementId).toBeTruthy();
        
        // Shift+Tab back
        await page.keyboard.press('Shift+Tab');
        
        const backToFirst = page.locator(':focus');
        const backToFirstId = await backToFirst.getAttribute('id');
        
        expect(backToFirstId).toBe(firstElementId);
      }
    });
  });

  test.describe('Content Keyboard Navigation', () => {
    test('should support keyboard navigation in blog posts', async ({ page }) => {
      const postSlug = SAMPLE_BLOG_POSTS[0];
      await page.goto(`/posts/${postSlug}`);
      await waitForPageLoad(page);
      
      await validateAccessibility(page);
      
      // Should be able to tab through interactive elements in article
      const article = page.locator('article');
      
      if (await article.count() > 0) {
        const articleLinks = article.locator('a');
        const linkCount = await articleLinks.count();
        
        if (linkCount > 0) {
          // Tab to first link in article
          await articleLinks.first().focus();
          await expect(articleLinks.first()).toBeFocused();
          
          // Enter should activate link
          const href = await articleLinks.first().getAttribute('href');
          
          if (href && !href.startsWith('http')) {
            await page.keyboard.press('Enter');
            await waitForPageLoad(page);
            
            // Should navigate
            expect(page.url()).toContain(href);
          }
        }
      }
    });

    test('should support skip links', async ({ page }) => {
      // Look for skip links
      const skipLinks = page.locator('a[href="#main"], a[href="#content"], .skip-to-main, .skip-link');
      
      if (await skipLinks.count() > 0) {
        // Skip link should be first tabbable element or become visible on focus
        await page.keyboard.press('Tab');
        
        let focusedElement = page.locator(':focus');
        let isSkipLink = false;
        let tabCount = 0;
        
        // Find skip link within first few tab stops
        while (tabCount < 5) {
          if (await focusedElement.count() > 0) {
            isSkipLink = await focusedElement.evaluate((el, skipLinkEl) => {
              return el === skipLinkEl;
            }, await skipLinks.first().elementHandle());
            
            if (isSkipLink) {break;}
          }
          
          await page.keyboard.press('Tab');
          focusedElement = page.locator(':focus');
          tabCount++;
        }
        
        if (isSkipLink) {
          // Activate skip link
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          
          // Main content should be focused
          const mainContent = page.locator('#main, main, #content');
          
          if (await mainContent.count() > 0) {
            const mainIsFocused = await mainContent.evaluate(el => 
              el === document.activeElement || el.hasAttribute('tabindex')
            );
            
            expect(mainIsFocused).toBeTruthy();
          }
        }
      }
    });

    test('should support keyboard navigation of table of contents', async ({ page }) => {
      const postSlug = SAMPLE_BLOG_POSTS[0];
      await page.goto(`/posts/${postSlug}`);
      await waitForPageLoad(page);
      
      // Look for table of contents
      const toc = page.locator('#toc, #inhaltsverzeichnis, .table-of-contents, .toc');
      
      if (await toc.count() > 0) {
        const tocLinks = toc.locator('a');
        const tocLinkCount = await tocLinks.count();
        
        if (tocLinkCount > 0) {
          // Focus first TOC link
          await tocLinks.first().focus();
          await expect(tocLinks.first()).toBeFocused();
          
          // Enter should jump to section
          const href = await tocLinks.first().getAttribute('href');
          
          if (href && href.startsWith('#')) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Should scroll to target section
            const targetSection = page.locator(href);
            
            if (await targetSection.count() > 0) {
              await expect(targetSection).toBeInViewport();
            }
          }
        }
      }
    });
  });

  test.describe('Theme Toggle Keyboard Support', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should support keyboard activation of theme toggle', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Focus theme toggle
        await nav.themeToggle.focus();
        await expect(nav.themeToggle).toBeFocused();
        
        // Get initial theme
        const initialTheme = await page.locator('html').getAttribute('class');
        
        // Activate with Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        
        // Theme should change
        const newTheme = await page.locator('html').getAttribute('class');
        expect(newTheme).not.toBe(initialTheme);
        
        // Focus should remain on theme toggle
        await expect(nav.themeToggle).toBeFocused();
        
        // Space should also work
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);
        
        // Should toggle back
        const finalTheme = await page.locator('html').getAttribute('class');
        expect(finalTheme).toBe(initialTheme);
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle keyboard navigation on 404 pages', async ({ page }) => {
      await page.goto('/non-existent-page');
      await waitForPageLoad(page);
      
      // Navigation should still work
      const _nav = new Navigation(page);
      
      // Should be able to tab through navigation
      await page.keyboard.press('Tab');
      
      let foundInteractiveElement = false;
      let tabCount = 0;
      
      while (tabCount < 10) {
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
          const isInteractive = ['a', 'button', 'input'].includes(tagName);
          
          if (isInteractive) {
            foundInteractiveElement = true;
            break;
          }
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      expect(foundInteractiveElement).toBeTruthy();
    });

    test('should maintain keyboard navigation after AJAX content updates', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Perform search
        await searchInput.focus();
        await page.keyboard.type('Gesundheit');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Tab navigation should still work after search results load
        await page.keyboard.press('Tab');
        
        const focusedAfterSearch = page.locator(':focus');
        
        if (await focusedAfterSearch.count() > 0) {
          await expect(focusedAfterSearch).toBeVisible();
          
          // Should be able to continue tabbing
          await page.keyboard.press('Tab');
          
          const nextFocused = page.locator(':focus');
          
          if (await nextFocused.count() > 0) {
            await expect(nextFocused).toBeVisible();
          }
        }
      }
    });

    test('should handle keyboard navigation with JavaScript disabled', async ({ page }) => {
      // Disable JavaScript
      await page.setJavaScriptEnabled(false);
      
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Basic navigation should still work
      const nav = new Navigation(page);
      const navLinks = nav.navLinks;
      
      if (await navLinks.count() > 0) {
        // Tab to navigation
        await page.keyboard.press('Tab');
        
        let foundNavLink = false;
        let tabCount = 0;
        
        while (tabCount < 10) {
          const focusedElement = page.locator(':focus');
          
          if (await focusedElement.count() > 0) {
            const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
            const href = await focusedElement.getAttribute('href');
            
            if (tagName === 'a' && href) {
              foundNavLink = true;
              
              // Enter should navigate
              await page.keyboard.press('Enter');
              await waitForPageLoad(page);
              
              // Should have navigated
              expect(page.url()).toContain(href);
              break;
            }
          }
          
          await page.keyboard.press('Tab');
          tabCount++;
        }
        
        expect(foundNavLink).toBeTruthy();
      }
      
      // Re-enable JavaScript for other tests
      await page.setJavaScriptEnabled(true);
    });
  });
});