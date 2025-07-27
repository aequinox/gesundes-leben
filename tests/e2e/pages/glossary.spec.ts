import { test, expect } from '@playwright/test';

import { SAMPLE_GLOSSARY_TERMS, EXPECTED_PAGES, GERMAN_HEALTH_TERMS } from '../utils/fixtures';
import { GlossaryPage } from '../utils/page-objects';
import { 
  validateBasicSEO, 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  validateSocialMeta,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Glossary Pages', () => {
  test.describe('Glossary Index Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
    });

    test('should load glossary index successfully', async ({ page }) => {
      await expect(page).toHaveURL('/glossary');
      await validateBasicSEO(page, EXPECTED_PAGES.glossary.title);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
    });

    test('should display glossary heading', async ({ page }) => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Glossar|Lexikon|Begriffe|Wörterbuch/);
    });

    test('should show alphabetical navigation', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      // May have alphabetical index
      if (await glossaryPage.alphabetIndex.count() > 0) {
        await expect(glossaryPage.alphabetIndex).toBeVisible();
        
        // Should have letter links
        const letterLinks = glossaryPage.alphabetIndex.locator('a');
        if (await letterLinks.count() > 0) {
          expect(await letterLinks.count()).toBeGreaterThan(5);
        }
      }
    });

    test('should display glossary terms list', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      // Should have terms list
      const hasTermsList = await glossaryPage.termsList.count() > 0;
      const hasTermCards = await glossaryPage.termCards.count() > 0;
      
      expect(hasTermsList || hasTermCards).toBeTruthy();
      
      if (hasTermCards) {
        expect(await glossaryPage.termCards.count()).toBeGreaterThan(0);
      }
    });

    test('should show health-related terms', async ({ page }) => {
      const content = page.locator('body');
      
      // Should contain health terminology
      const healthTerms = ['Vitamin', 'Immunsystem', 'Antioxidantien', 'Nährstoff', 'Protein'];
      
      let foundTerms = 0;
      for (const term of healthTerms) {
        const bodyText = await content.textContent();
        if (bodyText?.includes(term)) {
          foundTerms++;
        }
      }
      
      expect(foundTerms).toBeGreaterThan(0);
    });
  });

  // Test individual glossary term pages
  for (const termSlug of SAMPLE_GLOSSARY_TERMS.slice(0, 2)) {
    test.describe(`Glossary Term: ${termSlug}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/glossary/${termSlug}`);
        await waitForPageLoad(page);
      });

      test('should load glossary term page successfully', async ({ page }) => {
        await expect(page).toHaveURL(`/glossary/${termSlug}`);
        
        // Should have meaningful title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(10);
        expect(title).toContainText(/Glossar|Definition|Begriff/);
      });

      test('should display term definition', async ({ page }) => {
        const glossaryPage = new GlossaryPage(page);
        
        // Term name should be prominent
        await expect(glossaryPage.termName).toBeVisible();
        
        // Definition should be present
        await expect(glossaryPage.termDefinition).toBeVisible();
        const definitionText = await glossaryPage.termDefinition.textContent();
        expect(definitionText!.length).toBeGreaterThan(50);
      });

      test('should have proper page structure', async ({ page }) => {
        await validateLayoutStructure(page);
        await validateAccessibility(page);
        
        const glossaryPage = new GlossaryPage(page);
        await expect(glossaryPage.termName).toBeVisible();
      });

      test('should contain German health terminology', async ({ page }) => {
        await validateGermanContent(page);
        
        const content = page.locator('body');
        const bodyText = await content.textContent();
        
        // Should contain health-related content
        expect(bodyText).toMatch(/Gesundheit|medizinisch|Körper|Organismus|Funktion/);
      });
    });
  }

  test.describe('Glossary Term Content Quality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/glossary/${SAMPLE_GLOSSARY_TERMS[0]}`);
      await waitForPageLoad(page);
    });

    test('should provide comprehensive definitions', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      // Definition should be substantial
      const definitionText = await glossaryPage.termDefinition.textContent();
      expect(definitionText!.length).toBeGreaterThan(100);
      
      // Should be educational
      expect(definitionText).toMatch(/ist|sind|wird|werden|bedeutet|bezeichnet/);
    });

    test('should include medical accuracy', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Medical terminology should be accurate
      expect(bodyText).toMatch(/medizinisch|wissenschaftlich|Forschung|Studien/);
      
      // Should reference sources if complex
      if (bodyText?.includes('Studien') || bodyText?.includes('Forschung')) {
        expect(bodyText).toMatch(/Quelle|Referenz|Studie|belegt/);
      }
    });

    test('should explain complex terms in accessible German', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Should be accessible language
      expect(bodyText).toMatch(/einfach|verständlich|bedeutet|erklärt/);
      
      // Should avoid overly technical jargon without explanation
      if (bodyText?.match(/[A-Z]{3,}/)) { // Acronyms
        expect(bodyText).toMatch(/\(/); // Should have explanations in parentheses
      }
    });

    test('should have related terms or links', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      // May have related terms section
      if (await glossaryPage.relatedTerms.count() > 0) {
        await expect(glossaryPage.relatedTerms).toBeVisible();
        
        // Related terms should link to other glossary entries
        const relatedLinks = glossaryPage.relatedTerms.locator('a[href*="/glossary/"]');
        if (await relatedLinks.count() > 0) {
          expect(await relatedLinks.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Glossary Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
    });

    test('should have working site navigation', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      await expect(glossaryPage.header).toBeVisible();
      await expect(glossaryPage.footer).toBeVisible();
      await expect(glossaryPage.nav).toBeVisible();
      await expect(glossaryPage.rssLink).toBeVisible();
    });

    test('should provide easy term browsing', async ({ page }) => {
      const glossaryPage = new GlossaryPage(page);
      
      // Term links should be clickable
      if (await glossaryPage.termCards.count() > 0) {
        const firstTerm = glossaryPage.termCards.first();
        const termLink = firstTerm.locator('a');
        
        if (await termLink.count() > 0) {
          await expect(termLink).toBeVisible();
          const href = await termLink.getAttribute('href');
          expect(href).toMatch(/\/glossary\//);
        }
      }
    });

    test('should allow search within glossary', async ({ page }) => {
      // May have search functionality
      const searchInput = page.locator('input[type="search"], .search-input');
      
      if (await searchInput.count() > 0) {
        await expect(searchInput).toBeVisible();
        
        // Should be able to search terms
        await searchInput.fill('Vitamin');
        await page.waitForTimeout(1000);
        
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('Vitamin');
      }
    });

    test('should link back to blog content', async ({ page }) => {
      // Should have connection to blog posts
      const blogLink = page.locator('a[href="/posts/"], a[href="/posts"]');
      if (await blogLink.count() > 0) {
        await expect(blogLink.first()).toBeVisible();
      }
      
      // May reference where terms are used
      const content = page.locator('body');
      await expect(content).toContainText(/Artikel|Blog|Beitrag|verwendet|erklärt/);
    });
  });

  test.describe('Glossary SEO and Sharing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/glossary/${SAMPLE_GLOSSARY_TERMS[1]}`);
      await waitForPageLoad(page);
    });

    test('should have proper SEO meta tags', async ({ page }) => {
      await validateSocialMeta(page);
      
      // Should have definition-specific meta tags
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const description = await metaDescription.getAttribute('content');
        expect(description!.length).toBeGreaterThan(50);
        expect(description).toMatch(/Definition|Begriff|bedeutet/);
      }
      
      // Open Graph for educational content
      const ogType = page.locator('meta[property="og:type"]');
      if (await ogType.count() > 0) {
        const content = await ogType.getAttribute('content');
        expect(content).toMatch(/article|website/);
      }
    });

    test('should have structured data for definitions', async ({ page }) => {
      // May have DefinedTerm schema markup
      const structuredData = page.locator('script[type="application/ld+json"]');
      
      if (await structuredData.count() > 0) {
        const jsonContent = await structuredData.textContent();
        expect(jsonContent).toBeTruthy();
        
        // Should be valid JSON
        const data = JSON.parse(jsonContent!);
        if (data['@type'] === 'DefinedTerm') {
          expect(data.name).toBeTruthy();
          expect(data.definition).toBeTruthy();
        }
      }
    });

    test('should be indexable for educational content', async ({ page }) => {
      // Glossary terms should be indexed
      const robots = page.locator('meta[name="robots"]');
      if (await robots.count() > 0) {
        const content = await robots.getAttribute('content');
        expect(content).toMatch(/index|all/);
      }
      
      // Should have canonical URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toBeAttached();
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
    });

    test('should display properly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const glossaryPage = new GlossaryPage(page);
      
      // Glossary should be usable on mobile
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      
      // Terms should be accessible
      if (await glossaryPage.termCards.count() > 0) {
        await expect(glossaryPage.termCards.first()).toBeVisible();
      }
    });

    test('should adapt to different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
      
      // Glossary should remain functional
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });

    test('should have touch-friendly term links', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const termLinks = page.locator('a[href*="/glossary/"]');
      
      if (await termLinks.count() > 0) {
        const firstLink = termLinks.first();
        
        // Should be large enough for touch
        const boundingBox = await firstLink.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThan(30);
        }
      }
    });
  });

  test.describe('Health Blog Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
    });

    test('should focus on health and wellness terms', async ({ page }) => {
      const content = page.locator('body');
      
      // Should prioritize health terminology
      await expect(content).toContainText(/Gesundheit|Wellness|Ernährung|Vitamine|Nährstoffe/);
      
      // Health-specific categories
      await expect(content).toContainText(/medizinisch|therapeutisch|Immunsystem|Stoffwechsel/);
    });

    test('should support German health education', async ({ page }) => {
      const content = page.locator('body');
      
      // German health terms should be prominent
      let foundGermanHealthTerms = 0;
      for (const term of GERMAN_HEALTH_TERMS.slice(0, 5)) {
        const bodyText = await content.textContent();
        if (bodyText?.includes(term)) {
          foundGermanHealthTerms++;
        }
      }
      
      expect(foundGermanHealthTerms).toBeGreaterThan(0);
    });

    test('should maintain health blog consistency', async ({ page }) => {
      const content = page.locator('body');
      
      // Should feel like part of health blog
      await expect(content).toContainText(/Gesundes Leben|Healthy Life/);
      
      // Consistent branding
      const glossaryPage = new GlossaryPage(page);
      await expect(glossaryPage.rssLink).toBeVisible();
    });

    test('should reference blog articles', async ({ page }) => {
      const content = page.locator('body');
      
      // May reference where terms are explained in detail
      const bodyText = await content.textContent();
      if (bodyText?.includes('Artikel') || bodyText?.includes('Blog')) {
        await expect(content).toContainText(/Artikel|Blog|Beitrag|lesen|mehr/);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load glossary pages quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/glossary');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should optimize content delivery', async ({ page }) => {
      await page.goto(`/glossary/${SAMPLE_GLOSSARY_TERMS[0]}`);
      await waitForPageLoad(page);
      
      // Should have minimal images (focus on text content)
      const images = page.locator('img');
      expect(await images.count()).toBeLessThan(5);
      
      // Images should be optimized if present
      if (await images.count() > 0) {
        const firstImage = images.first();
        await expect(firstImage).toHaveAttribute('alt');
        
        const loading = await firstImage.getAttribute('loading');
        expect(['lazy', 'eager', null]).toContain(loading);
      }
    });

    test('should have efficient term navigation', async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
      
      // Alphabet navigation should be fast
      const glossaryPage = new GlossaryPage(page);
      
      if (await glossaryPage.alphabetIndex.count() > 0) {
        const letterLinks = glossaryPage.alphabetIndex.locator('a');
        
        if (await letterLinks.count() > 0) {
          // Links should be immediately interactive
          const firstLetter = letterLinks.first();
          await expect(firstLetter).toBeEnabled();
        }
      }
    });
  });
});