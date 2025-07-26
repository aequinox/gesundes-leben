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

test.describe('Our Vision Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/our-vision');
    await waitForPageLoad(page);
  });

  test.describe('Basic Page Structure', () => {
    test('should load our vision page successfully', async ({ page }) => {
      await expect(page).toHaveURL('/our-vision');
      await validateBasicSEO(page, EXPECTED_PAGES.ourVision.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should display vision heading', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Vision|Unsere Vision|Mission/);
    });
  });

  test.describe('Vision Content', () => {
    test('should contain German vision statement', async ({ page }) => {
      await validateGermanContent(page);
      
      const content = page.locator('body');
      
      // Should contain vision/mission related content
      await expect(content).toContainText(/Vision|Mission|Ziel|Zukunft/);
      
      // Health empowerment theme
      await expect(content).toContainText(/Gesundheit|Empowerment/);
    });

    test('should describe health empowerment mission', async ({ page }) => {
      const content = page.locator('body');
      
      // Core mission themes
      await expect(content).toContainText(/Empowerment|ermächtigen|befähigen/);
      await expect(content).toContainText(/Gesundheit|Wohlbefinden/);
      
      // Educational focus
      await expect(content).toContainText(/Wissen|Bildung|Aufklärung|lernen/);
    });

    test('should mention target audience and values', async ({ page }) => {
      const content = page.locator('body');
      
      // Target audience
      await expect(content).toContainText(/Menschen|Patienten|Leser/);
      
      // Values and approach
      await expect(content).toContainText(/Vertrauen|ehrlich|transparent|wissenschaftlich/);
    });

    test('should explain approach to health education', async ({ page }) => {
      const content = page.locator('body');
      
      // Educational approach
      await expect(content).toContainText(/einfach|verständlich|zugänglich/);
      
      // Medical expertise
      await expect(content).toContainText(/Therapeut|Erfahrung|Fachwissen|Expertise/);
    });
  });

  test.describe('Company Values and Goals', () => {
    test('should present clear values', async ({ page }) => {
      const content = page.locator('body');
      
      // Core values
      await expect(content).toContainText(/Wert|Prinzip|Überzeugung/);
      
      // Health-focused values
      await expect(content).toContainText(/Qualität|Vertrauen|Wissenschaft/);
    });

    test('should describe future goals', async ({ page }) => {
      const content = page.locator('body');
      
      // Future orientation
      await expect(content).toContainText(/Zukunft|Ziel|Plan|entwickeln/);
      
      // Growth and impact
      await expect(content).toContainText(/erreichen|helfen|unterstützen|verbessern/);
    });

    test('should mention community aspect', async ({ page }) => {
      const content = page.locator('body');
      
      // Community building
      await expect(content).toContainText(/Gemeinschaft|zusammen|gemeinsam|Community/);
      
      // Inclusive approach
      await expect(content).toContainText(/alle|jede|jeden|zugänglich/);
    });
  });

  test.describe('Content Quality', () => {
    test('should have well-structured content', async ({ page }) => {
      // Should have multiple sections
      const headings = page.locator('h1, h2, h3, h4');
      expect(await headings.count()).toBeGreaterThan(1);
      
      // Should have substantial content
      const main = page.locator('main');
      const textContent = await main.textContent();
      expect(textContent!.length).toBeGreaterThan(200);
    });

    test('should be inspirational and motivating', async ({ page }) => {
      const content = page.locator('body');
      
      // Positive language
      await expect(content).toContainText(/positiv|stark|erfolgreich|gesund/);
      
      // Motivational elements
      await expect(content).toContainText(/möglich|schaffen|erreichen|Potential/);
    });

    test('should reference team expertise', async ({ page }) => {
      const content = page.locator('body');
      
      // Team references
      await expect(content).toContainText(/Sandra|Kai|wir|unser Team/);
      
      // Professional background
      await expect(content).toContainText(/Therapeut|Praxis|Erfahrung|Jahre/);
    });
  });

  test.describe('Navigation and User Experience', () => {
    test('should have working navigation', async ({ page }) => {
      const basePage = new BasePage(page);
      
      await expect(basePage.header).toBeVisible();
      await expect(basePage.footer).toBeVisible();
      await expect(basePage.nav).toBeVisible();
      await expect(basePage.rssLink).toBeVisible();
    });

    test('should have call-to-action elements', async ({ page }) => {
      // May have links to blog, about page, or contact
      const links = page.locator('a').filter({ hasText: /Blog|Artikel|Über uns|Kontakt|mehr/ });
      
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
      }
    });

    test('should encourage engagement', async ({ page }) => {
      const content = page.locator('body');
      
      // Engagement encouragement
      await expect(content).toContainText(/lesen|entdecken|lernen|mitmachen|folgen/);
    });
  });

  test.describe('Visual Design', () => {
    test('should have appealing visual presentation', async ({ page }) => {
      // Check for visual elements
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // May have images or visual elements
      const images = page.locator('img');
      if (await images.count() > 0) {
        await expect(images.first()).toHaveAttribute('alt');
      }
    });

    test('should be responsive across devices', async ({ page }) => {
      await validateResponsiveDesign(page);
    });

    test('should maintain readability', async ({ page }) => {
      // Text should be well-formatted
      const paragraphs = page.locator('p');
      expect(await paragraphs.count()).toBeGreaterThan(2);
      
      // Should have good typography
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('SEO and Sharing', () => {
    test('should have appropriate meta tags', async ({ page }) => {
      // Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toBeAttached();
      
      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toBeAttached();
      
      // Language
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
    });

    test('should be shareable content', async ({ page }) => {
      // Should have engaging title and description
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      
      // Meta description should exist
      const metaDesc = page.locator('meta[name="description"]');
      if (await metaDesc.count() > 0) {
        const content = await metaDesc.getAttribute('content');
        expect(content!.length).toBeGreaterThan(50);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/our-vision');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have optimized content', async ({ page }) => {
      // Images should be optimized
      const images = page.locator('img');
      
      for (let i = 0; i < Math.min(await images.count(), 3); i++) {
        const image = images.nth(i);
        await expect(image).toHaveAttribute('alt');
        
        const loading = await image.getAttribute('loading');
        expect(['lazy', 'eager', null]).toContain(loading);
      }
    });
  });
});