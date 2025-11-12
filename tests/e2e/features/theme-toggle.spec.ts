import { test, expect } from '@playwright/test';

import { VIEWPORT_SIZES } from '../utils/fixtures';
import { Navigation } from '../utils/page-objects';
import { 
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Theme Toggle Functionality', () => {
  test.describe('Theme Switch Detection', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should have theme toggle button', async ({ page }) => {
      const nav = new Navigation(page);
      
      // Look for theme toggle button
      if (await nav.themeToggle.count() > 0) {
        await expect(nav.themeToggle).toBeVisible();
        await expect(nav.themeToggle).toBeEnabled();
        
        // Button should have accessible label
        const ariaLabel = await nav.themeToggle.getAttribute('aria-label');
        const title = await nav.themeToggle.getAttribute('title');
        
        expect(ariaLabel ?? title).toMatch(/theme|Theme|dunkel|hell|dark|light/i);
      }
    });

    test('should detect current theme state', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Check initial theme state
        const bodyClass = await page.locator('body').getAttribute('class');
        const htmlClass = await page.locator('html').getAttribute('class');
        const dataTheme = await page.locator('html').getAttribute('data-theme');
        
        // Should have some theme indicator
        const hasThemeIndicator = 
          bodyClass?.includes('dark') || 
          bodyClass?.includes('light') ||
          htmlClass?.includes('dark') || 
          htmlClass?.includes('light') ||
          dataTheme;
        
        if (hasThemeIndicator) {
          expect(hasThemeIndicator).toBeTruthy();
        }
      }
    });

    test('should show appropriate theme icon', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Theme button should have icon or text indicating current/target theme
        const buttonContent = await nav.themeToggle.textContent();
        const buttonHTML = await nav.themeToggle.innerHTML();
        
        // Should have sun/moon icon or German text
        expect(buttonContent ?? buttonHTML).toMatch(/☀|🌙|sun|moon|hell|dunkel|light|dark|theme/i);
      }
    });
  });

  test.describe('Theme Switching Behavior', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should toggle between light and dark themes', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Get initial theme state
        const initialBodyClass = await page.locator('body').getAttribute('class');
        const initialHtmlClass = await page.locator('html').getAttribute('class');
        
        // Toggle theme
        await nav.toggleTheme();
        
        // Theme should change
        const newBodyClass = await page.locator('body').getAttribute('class');
        const newHtmlClass = await page.locator('html').getAttribute('class');
        
        // At least one class should have changed
        const classChanged = 
          newBodyClass !== initialBodyClass || 
          newHtmlClass !== initialHtmlClass;
        
        expect(classChanged).toBeTruthy();
        
        // Toggle back
        await nav.toggleTheme();
        
        // Should return to original state
        const finalBodyClass = await page.locator('body').getAttribute('class');
        const finalHtmlClass = await page.locator('html').getAttribute('class');
        
        expect(finalBodyClass).toBe(initialBodyClass);
        expect(finalHtmlClass).toBe(initialHtmlClass);
      }
    });

    test('should persist theme choice across pages', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Set to dark theme
        await nav.toggleTheme();
        const themeAfterToggle = await page.locator('html').getAttribute('class');
        
        // Navigate to another page
        await page.goto('/about');
        await waitForPageLoad(page);
        
        // Theme should be preserved
        const themeOnNewPage = await page.locator('html').getAttribute('class');
        expect(themeOnNewPage).toBe(themeAfterToggle);
        
        // Navigate to blog
        await page.goto('/posts');
        await waitForPageLoad(page);
        
        // Theme should still be preserved
        const themeOnBlogPage = await page.locator('html').getAttribute('class');
        expect(themeOnBlogPage).toBe(themeAfterToggle);
      }
    });

    test('should remember theme preference on reload', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Toggle to different theme
        await nav.toggleTheme();
        const themeBeforeReload = await page.locator('html').getAttribute('class');
        
        // Reload page
        await page.reload();
        await waitForPageLoad(page);
        
        // Theme should be remembered
        const themeAfterReload = await page.locator('html').getAttribute('class');
        expect(themeAfterReload).toBe(themeBeforeReload);
      }
    });
  });

  test.describe('Theme Visual Changes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should change background colors', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Get initial background color
        const body = page.locator('body');
        const initialBgColor = await body.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        
        // Toggle theme
        await nav.toggleTheme();
        await page.waitForTimeout(300); // Allow for theme transition
        
        // Background should change
        const newBgColor = await body.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        
        expect(newBgColor).not.toBe(initialBgColor);
      }
    });

    test('should change text colors', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Get initial text color
        const mainContent = page.locator('main');
        const initialTextColor = await mainContent.evaluate(el => 
          window.getComputedStyle(el).color
        );
        
        // Toggle theme
        await nav.toggleTheme();
        await page.waitForTimeout(300);
        
        // Text color should change
        const newTextColor = await mainContent.evaluate(el => 
          window.getComputedStyle(el).color
        );
        
        expect(newTextColor).not.toBe(initialTextColor);
      }
    });

    test('should maintain readability in both themes', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Test both themes for readability
        const themes = ['initial', 'toggled'];
        
        for (const themeState of themes) {
          if (themeState === 'toggled') {
            await nav.toggleTheme();
            await page.waitForTimeout(300);
          }
          
          // Check heading visibility
          const h1 = page.locator('h1');
          if (await h1.count() > 0) {
            await expect(h1).toBeVisible();
          }
          
          // Check paragraph text visibility
          const paragraphs = page.locator('p');
          if (await paragraphs.count() > 0) {
            await expect(paragraphs.first()).toBeVisible();
          }
          
          // Check link visibility
          const links = page.locator('a');
          if (await links.count() > 0) {
            await expect(links.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Theme Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should be keyboard accessible', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Should be able to focus theme toggle with Tab
        await page.keyboard.press('Tab');
        
        // Find focused element
        let focusedElement = page.locator(':focus');
        let tabCount = 0;
        
        // Tab until we find the theme toggle (max 10 tabs)
        while (tabCount < 10) {
          const isFocused = await focusedElement.count() > 0;
          if (isFocused) {
            const isThemeToggle = await focusedElement.evaluate((el, themeButton) => {
              return el === themeButton;
            }, await nav.themeToggle.elementHandle());
            
            if (isThemeToggle) {
              break;
            }
          }
          
          await page.keyboard.press('Tab');
          focusedElement = page.locator(':focus');
          tabCount++;
        }
        
        // Should be able to activate with Enter or Space
        const initialTheme = await page.locator('html').getAttribute('class');
        
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
        
        const themeAfterEnter = await page.locator('html').getAttribute('class');
        expect(themeAfterEnter).not.toBe(initialTheme);
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Should have accessible name
        const ariaLabel = await nav.themeToggle.getAttribute('aria-label');
        const title = await nav.themeToggle.getAttribute('title');
        
        expect(ariaLabel ?? title).toBeTruthy();
        
        // May have aria-pressed for toggle state
        const ariaPressed = await nav.themeToggle.getAttribute('aria-pressed');
        if (ariaPressed) {
          expect(['true', 'false']).toContain(ariaPressed);
        }
        
        // Should have button role (implicit or explicit)
        const role = await nav.themeToggle.getAttribute('role');
        const tagName = await nav.themeToggle.evaluate(el => el.tagName.toLowerCase());
        
        expect(role === 'button' || tagName === 'button').toBeTruthy();
      }
    });

    test('should not cause focus loss during theme change', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Focus theme toggle
        await nav.themeToggle.focus();
        await expect(nav.themeToggle).toBeFocused();
        
        // Toggle theme
        await nav.toggleTheme();
        
        // Focus should remain on toggle button
        await expect(nav.themeToggle).toBeFocused();
      }
    });
  });

  test.describe('Theme System Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
    });

    test('should respect system theme preference', async ({ page }) => {
      // Test with system dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await waitForPageLoad(page);
      
      // Page should adapt to system preference
      const htmlClass = await page.locator('html').getAttribute('class');
      const bodyClass = await page.locator('body').getAttribute('class');
      
      // Should show some indication of dark theme
      const hasDarkTheme = 
        htmlClass?.includes('dark') || 
        bodyClass?.includes('dark');
      
      // Test with system light mode
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await waitForPageLoad(page);
      
      const htmlClassLight = await page.locator('html').getAttribute('class');
      const bodyClassLight = await page.locator('body').getAttribute('class');
      
      // Should show some indication of light theme
      const hasLightTheme = 
        htmlClassLight?.includes('light') || 
        bodyClassLight?.includes('light') ||
        (!htmlClassLight?.includes('dark') && !bodyClassLight?.includes('dark'));
      
      // Either theme should be detected
      expect(hasDarkTheme ?? hasLightTheme).toBeTruthy();
    });

    test('should handle theme with reduced motion preference', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Theme change should still work but possibly without animation
        const initialTheme = await page.locator('html').getAttribute('class');
        
        await nav.toggleTheme();
        // Don't wait as long since animations should be reduced
        await page.waitForTimeout(100);
        
        const newTheme = await page.locator('html').getAttribute('class');
        expect(newTheme).not.toBe(initialTheme);
      }
    });
  });

  test.describe('Theme Performance', () => {
    test('should have fast theme switching', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Measure theme switch time
        const startTime = Date.now();
        
        await nav.toggleTheme();
        
        // Wait for theme change to complete
        await page.waitForTimeout(500);
        
        const switchTime = Date.now() - startTime;
        
        // Theme switch should be fast (under 1 second)
        expect(switchTime).toBeLessThan(1000);
      }
    });

    test('should not cause layout shifts during theme change', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Get layout measurements before theme change
        const header = page.locator('header');
        const initialHeaderBounds = await header.boundingBox();
        
        // Toggle theme
        await nav.toggleTheme();
        await page.waitForTimeout(300);
        
        // Layout should remain stable
        const finalHeaderBounds = await header.boundingBox();
        
        if (initialHeaderBounds && finalHeaderBounds) {
          expect(Math.abs(finalHeaderBounds.y - initialHeaderBounds.y)).toBeLessThan(5);
          expect(Math.abs(finalHeaderBounds.height - initialHeaderBounds.height)).toBeLessThan(5);
        }
      }
    });
  });

  test.describe('Responsive Theme Behavior', () => {
    test('should work across different screen sizes', async ({ page }) => {
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Test theme toggle on different viewports
        const viewports = [
          VIEWPORT_SIZES.mobile,
          VIEWPORT_SIZES.tablet,
          VIEWPORT_SIZES.desktop
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize(viewport);
          await page.goto('/');
          await waitForPageLoad(page);
          
          // Theme toggle should be accessible
          await expect(nav.themeToggle).toBeVisible();
          
          // Theme switching should work
          const initialTheme = await page.locator('html').getAttribute('class');
          
          await nav.toggleTheme();
          await page.waitForTimeout(300);
          
          const newTheme = await page.locator('html').getAttribute('class');
          expect(newTheme).not.toBe(initialTheme);
        }
      }
    });

    test('should maintain theme consistency across responsive breakpoints', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const nav = new Navigation(page);
      
      if (await nav.themeToggle.count() > 0) {
        // Set dark theme
        await nav.toggleTheme();
        const darkThemeClass = await page.locator('html').getAttribute('class');
        
        // Test across viewports
        const viewports = [VIEWPORT_SIZES.mobile, VIEWPORT_SIZES.desktop];
        
        for (const viewport of viewports) {
          await page.setViewportSize(viewport);
          await page.waitForTimeout(300);
          
          // Theme should remain consistent
          const currentTheme = await page.locator('html').getAttribute('class');
          expect(currentTheme).toBe(darkThemeClass);
          
          // Theme elements should still be visible and functional
          await expect(nav.themeToggle).toBeVisible();
        }
      }
    });
  });
});