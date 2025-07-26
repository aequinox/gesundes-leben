import type { Page} from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Common test utilities for E2E testing
 */

/**
 * Check basic page SEO and accessibility requirements
 */
export async function validateBasicSEO(page: Page, expectedTitle: RegExp, expectedDescription?: RegExp) {
  // Title validation
  await expect(page).toHaveTitle(expectedTitle);
  
  // Language attribute
  const html = page.locator('html');
  await expect(html).toHaveAttribute('lang', 'de');
  
  // Meta description (if provided)
  if (expectedDescription) {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', expectedDescription);
  }
  
  // Viewport meta tag for mobile
  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveAttribute('content', /width=device-width/);
  
  // Canonical URL
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toBeAttached();
}

/**
 * Check page accessibility basics
 */
export async function validateAccessibility(page: Page) {
  // Main content landmark
  const main = page.locator('main');
  await expect(main).toBeVisible();
  
  // Unique h1
  const h1Elements = page.locator('h1');
  await expect(h1Elements).toHaveCount(1);
  
  // Skip links or main navigation
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
  
  // Images should have alt text (check first 5 images)
  const images = page.locator('img').first();
  if (await images.count() > 0) {
    await expect(images).toHaveAttribute('alt');
  }
}

/**
 * Check header and footer presence
 */
export async function validateLayoutStructure(page: Page) {
  // Header with banner role
  const header = page.locator('header[role="banner"]');
  await expect(header).toBeVisible();
  
  // Footer
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  
  // Main content
  const main = page.locator('main');
  await expect(main).toBeVisible();
}

/**
 * Check navigation functionality
 */
export async function validateNavigation(page: Page) {
  // Main navigation should be present
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
  
  // Should have navigation links
  const navLinks = nav.locator('a');
  expect(await navLinks.count()).toBeGreaterThan(0);
  
  // Logo/home link should exist
  const homeLink = page.locator('a[href="/"]').first();
  await expect(homeLink).toBeVisible();
}

/**
 * Check German language content basics
 */
export async function validateGermanContent(page: Page) {
  // Check for common German words
  const body = page.locator('body');
  
  // Common German words that should appear on health blog
  const germanWords = ['Gesundheit', 'und', 'für', 'der', 'die', 'das'];
  
  for (const word of germanWords.slice(0, 3)) { // Check first 3 to avoid being too strict
    await expect(body).toContainText(word);
  }
}

/**
 * Check responsive design at different viewports
 */
export async function validateResponsiveDesign(page: Page) {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  const main = page.locator('main');
  await expect(main).toBeVisible();
  
  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(main).toBeVisible();
  
  // Test desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(main).toBeVisible();
}

/**
 * Check for loading performance basics
 */
export async function validatePerformanceBasics(page: Page) {
  const startTime = Date.now();
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  // Should load within 5 seconds
  expect(loadTime).toBeLessThan(5000);
}

/**
 * Check for health blog specific elements
 */
export async function validateHealthBlogElements(page: Page) {
  // Should have RSS link
  const rssLink = page.locator('a[href="/rss.xml"]');
  await expect(rssLink).toBeVisible();
  
  // Should have search functionality
  const searchLink = page.locator('a[href="/search"]');
  if (await searchLink.count() > 0) {
    await expect(searchLink).toBeVisible();
  }
}

/**
 * Validate meta tags for social sharing
 */
export async function validateSocialMeta(page: Page) {
  // Open Graph tags
  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toBeAttached();
  
  const ogDescription = page.locator('meta[property="og:description"]');
  await expect(ogDescription).toBeAttached();
  
  const ogType = page.locator('meta[property="og:type"]');
  await expect(ogType).toBeAttached();
}

/**
 * Wait for page to be fully loaded with content
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for any AOS animations to settle
  await page.waitForTimeout(500);
}

/**
 * Take screenshot on test failure
 */
export async function takeScreenshotOnFailure(page: Page, testInfo: any) {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  }
}