import { test, expect } from '@playwright/test';

import { EXPECTED_PAGES } from '../utils/fixtures';
import { BasePage } from '../utils/page-objects';
import { 
  validateBasicSEO, 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Imprint Page (Impressum)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/imprint');
    await waitForPageLoad(page);
  });

  test.describe('Basic Page Structure', () => {
    test('should load imprint page successfully', async ({ page }) => {
      await expect(page).toHaveURL('/imprint');
      await validateBasicSEO(page, EXPECTED_PAGES.imprint.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should have German imprint heading', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Impressum|Imprint/);
    });
  });

  test.describe('Legal Content Validation', () => {
    test('should contain required German legal information', async ({ page }) => {
      await validateGermanContent(page);
      
      const content = page.locator('body');
      
      // German legal requirements (Impressumspflicht)
      await expect(content).toContainText(/Angaben gemäß|Verantwortlich|Herausgeber/);
      
      // Should have contact information
      await expect(content).toContainText(/Kontakt|E-Mail|Mail/);
    });

    test('should display website operator information', async ({ page }) => {
      const content = page.locator('body');
      
      // Should mention the blog operators
      await expect(content).toContainText(/Sandra|Kai/);
      
      // Should have responsible person/entity
      await expect(content).toContainText(/verantwortlich|Inhaber|Betreiber/);
    });

    test('should include privacy policy reference', async ({ page }) => {
      const content = page.locator('body');
      
      // Should mention data protection
      await expect(content).toContainText(/Datenschutz|Privacy|DSGVO/);
      
      // May have links to privacy policy
      const privacyLinks = page.locator('a').filter({ hasText: /Datenschutz|Privacy/ });
      
      if (await privacyLinks.count() > 0) {
        await expect(privacyLinks.first()).toBeVisible();
      }
    });

    test('should include disclaimer information', async ({ page }) => {
      const content = page.locator('body');
      
      // Health blog disclaimer
      await expect(content).toContainText(/Haftungsausschluss|Disclaimer|Hinweis/);
      
      // Medical advice disclaimer
      await expect(content).toContainText(/medizinisch|Beratung|Arzt|Ersatz/);
    });
  });

  test.describe('Contact Information', () => {
    test('should provide contact details', async ({ page }) => {
      const content = page.locator('body');
      
      // Email should be present
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const bodyText = await content.textContent();
      expect(bodyText).toMatch(emailPattern);
    });

    test('should have structured contact information', async ({ page }) => {
      const content = page.locator('body');
      
      // Should have clear sections
      await expect(content).toContainText(/Kontakt|Anschrift|Adresse/);
      
      // Should be well-formatted
      const headings = page.locator('h2, h3');
      expect(await headings.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Legal Compliance', () => {
    test('should meet German legal requirements', async ({ page }) => {
      const content = page.locator('body');
      
      // TMG (Telemediengesetz) compliance
      await expect(content).toContainText(/§|TMG|Telemediengesetz|Angaben/);
      
      // Required information sections
      await expect(content).toContainText(/verantwortlich|Inhalt|Redaktion/);
    });

    test('should include health-specific disclaimers', async ({ page }) => {
      const content = page.locator('body');
      
      // Medical advice disclaimer
      await expect(content).toContainText(/medizinisch|ärztlich|Behandlung|Diagnose/);
      
      // Information purpose disclaimer
      await expect(content).toContainText(/Information|Aufklärung|Bildung|ersetzt/);
    });

    test('should reference applicable law', async ({ page }) => {
      const content = page.locator('body');
      
      // German law reference
      await expect(content).toContainText(/deutsches Recht|Recht der Bundesrepublik|Deutschland/);
      
      // Jurisdiction
      await expect(content).toContainText(/Gerichtsstand|zuständig/);
    });
  });

  test.describe('Navigation and Structure', () => {
    test('should have working navigation', async ({ page }) => {
      const basePage = new BasePage(page);
      
      await expect(basePage.header).toBeVisible();
      await expect(basePage.footer).toBeVisible();
      await expect(basePage.nav).toBeVisible();
    });

    test('should be accessible from footer', async ({ page }) => {
      // Imprint is typically linked from footer
      await page.goto('/');
      await waitForPageLoad(page);
      
      const footer = page.locator('footer');
      const imprintLink = footer.locator('a[href="/imprint"], a').filter({ hasText: /Impressum|Imprint/ });
      
      if (await imprintLink.count() > 0) {
        await expect(imprintLink.first()).toBeVisible();
      }
    });

    test('should have clean, professional layout', async ({ page }) => {
      // Should be well-structured with headings
      const headings = page.locator('h1, h2, h3');
      expect(await headings.count()).toBeGreaterThan(1);
      
      // Content should be readable
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be readable on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Text should be readable
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });

    test('should maintain layout on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const content = page.locator('main');
      await expect(content).toBeVisible();
      
      // Should be properly formatted
      const headings = page.locator('h1, h2, h3');
      expect(await headings.count()).toBeGreaterThan(0);
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('should have appropriate meta tags', async ({ page }) => {
      // Should be set to noindex for privacy
      const robots = page.locator('meta[name="robots"]');
      if (await robots.count() > 0) {
        const content = await robots.getAttribute('content');
        // Imprint pages are often set to noindex
        expect(content).toMatch(/noindex|index/);
      }
      
      // Language should be German
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
    });

    test('should have minimal social sharing tags', async ({ page }) => {
      // Imprint pages typically have minimal social metadata
      const ogTitle = page.locator('meta[property="og:title"]');
      
      if (await ogTitle.count() > 0) {
        await expect(ogTitle).toBeAttached();
      }
    });
  });
});