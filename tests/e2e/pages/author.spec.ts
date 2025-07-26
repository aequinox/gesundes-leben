import { test, expect } from '@playwright/test';

import { SAMPLE_AUTHORS } from '../utils/fixtures';
import { AuthorPage } from '../utils/page-objects';
import { 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  validateSocialMeta,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Author Pages', () => {
  // Test with sample authors
  for (const authorSlug of SAMPLE_AUTHORS.slice(0, 2)) {
    test.describe(`Author Page: ${authorSlug}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/author/${authorSlug}`);
        await waitForPageLoad(page);
      });

      test('should load author page successfully', async ({ page }) => {
        await expect(page).toHaveURL(`/author/${authorSlug}`);
        
        // Should have meaningful title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(10);
        expect(title).toContainText(/Sandra|Kai|Autor|Author/);
      });

      test('should display author information', async ({ page }) => {
        const authorPage = new AuthorPage(page);
        
        // Author name should be prominent
        await expect(authorPage.authorName).toBeVisible();
        const authorNameText = await authorPage.authorName.textContent();
        expect(authorNameText).toMatch(/Sandra|Kai/);
        
        // Author bio/description
        if (await authorPage.authorBio.count() > 0) {
          await expect(authorPage.authorBio).toBeVisible();
          const bioText = await authorPage.authorBio.textContent();
          expect(bioText!.length).toBeGreaterThan(50);
        }
      });

      test('should show professional credentials', async ({ page }) => {
        const content = page.locator('body');
        const bodyText = await content.textContent();
        
        // Should mention therapeutic background
        expect(bodyText).toMatch(/Therapeut|Heilpraktiker|Experte|Fachkraft|Jahre|Erfahrung/);
        
        // Professional qualifications
        expect(bodyText).toMatch(/Ausbildung|Qualifikation|spezialisiert|Praxis/);
      });
    });
  }

  test.describe('Author Profile Content', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await waitForPageLoad(page);
    });

    test('should have proper page structure', async ({ page }) => {
      await validateLayoutStructure(page);
      await validateAccessibility(page);
      
      const authorPage = new AuthorPage(page);
      await expect(authorPage.authorName).toBeVisible();
    });

    test('should contain German content', async ({ page }) => {
      await validateGermanContent(page);
      
      const content = page.locator('body');
      
      // German professional terms
      await expect(content).toContainText(/Therapeut|Heilpraktiker|Gesundheit|Beratung/);
    });

    test('should display author expertise areas', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Health expertise areas
      expect(bodyText).toMatch(/Ernährung|Gesundheit|Wellness|Immunsystem|Vitamine/);
      
      // Specialization areas
      expect(bodyText).toMatch(/spezialisiert|Schwerpunkt|Fokus|Expertise/);
    });

    test('should show author articles or posts', async ({ page }) => {
      const authorPage = new AuthorPage(page);
      
      // May have articles list
      if (await authorPage.authorArticles.count() > 0) {
        await expect(authorPage.authorArticles).toBeVisible();
        
        // Articles should have titles and links
        const articleLinks = authorPage.authorArticles.locator('a');
        if (await articleLinks.count() > 0) {
          expect(await articleLinks.count()).toBeGreaterThan(0);
          
          const firstLink = articleLinks.first();
          const href = await firstLink.getAttribute('href');
          expect(href).toMatch(/\/posts\//);
        }
      }
    });

    test('should have contact or social information', async ({ page }) => {
      const authorPage = new AuthorPage(page);
      
      // Contact information if available
      if (await authorPage.contactInfo.count() > 0) {
        await expect(authorPage.contactInfo).toBeVisible();
      }
      
      // Social links if available
      if (await authorPage.socialLinks.count() > 0) {
        await expect(authorPage.socialLinks).toBeVisible();
        
        const socialButtons = authorPage.socialLinks.locator('a');
        if (await socialButtons.count() > 0) {
          expect(await socialButtons.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Author Page SEO', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[1]}`);
      await waitForPageLoad(page);
    });

    test('should have proper SEO meta tags', async ({ page }) => {
      await validateSocialMeta(page);
      
      // Should have person-specific meta tags
      const ogType = page.locator('meta[property="og:type"]');
      if (await ogType.count() > 0) {
        const content = await ogType.getAttribute('content');
        expect(content).toMatch(/profile|person|website/);
      }
      
      // Author description
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const description = await metaDescription.getAttribute('content');
        expect(description!.length).toBeGreaterThan(50);
        expect(description).toMatch(/Sandra|Kai|Therapeut|Gesundheit/);
      }
    });

    test('should have structured data for person', async ({ page }) => {
      // May have Person schema markup
      const structuredData = page.locator('script[type="application/ld+json"]');
      
      if (await structuredData.count() > 0) {
        const jsonContent = await structuredData.textContent();
        expect(jsonContent).toBeTruthy();
        
        // Should be valid JSON
        const data = JSON.parse(jsonContent!);
        if (data['@type'] === 'Person') {
          expect(data.name).toBeTruthy();
        }
      }
    });

    test('should be indexable by search engines', async ({ page }) => {
      // Author pages should typically be indexed
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

  test.describe('Navigation and User Experience', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await waitForPageLoad(page);
    });

    test('should have working site navigation', async ({ page }) => {
      const authorPage = new AuthorPage(page);
      
      await expect(authorPage.header).toBeVisible();
      await expect(authorPage.footer).toBeVisible();
      await expect(authorPage.nav).toBeVisible();
      await expect(authorPage.rssLink).toBeVisible();
    });

    test('should provide navigation to related content', async ({ page }) => {
      // Should have link back to all authors
      const authorsLink = page.locator('a[href="/authors/"], a[href="/authors"], a[href="/team/"]');
      if (await authorsLink.count() > 0) {
        await expect(authorsLink.first()).toBeVisible();
      }
      
      // Should have link to blog posts
      const blogLink = page.locator('a[href="/posts/"], a[href="/posts"]');
      if (await blogLink.count() > 0) {
        await expect(blogLink.first()).toBeVisible();
      }
    });

    test('should show recent or featured articles', async ({ page }) => {
      const authorPage = new AuthorPage(page);
      
      // Recent articles section
      if (await authorPage.authorArticles.count() > 0) {
        const articles = authorPage.authorArticles.locator('.article, .post, .card');
        
        if (await articles.count() > 0) {
          // Articles should have proper structure
          const firstArticle = articles.first();
          await expect(firstArticle).toBeVisible();
          
          // Should have title
          const title = firstArticle.locator('h2, h3, .title');
          if (await title.count() > 0) {
            await expect(title).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[1]}`);
      await waitForPageLoad(page);
    });

    test('should display properly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const authorPage = new AuthorPage(page);
      
      // Author information should be readable
      await expect(authorPage.authorName).toBeVisible();
      
      if (await authorPage.authorBio.count() > 0) {
        await expect(authorPage.authorBio).toBeVisible();
      }
      
      // Content should not overflow
      const main = page.locator('main');
      const content = await main.boundingBox();
      expect(content?.width).toBeLessThanOrEqual(375);
    });

    test('should adapt to different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
      
      // Author content should remain accessible
      const authorPage = new AuthorPage(page);
      await expect(authorPage.authorName).toBeVisible();
    });

    test('should have touch-friendly elements on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const links = page.locator('a');
      
      if (await links.count() > 0) {
        const firstLink = links.first();
        
        // Should be large enough for touch
        const boundingBox = await firstLink.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThan(30);
        }
      }
    });
  });

  test.describe('Content Quality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await waitForPageLoad(page);
    });

    test('should have substantial biographical content', async ({ page }) => {
      const main = page.locator('main');
      const content = await main.textContent();
      
      // Should be substantial
      expect(content!.length).toBeGreaterThan(200);
      
      // Should have multiple sections
      const sections = page.locator('section, .section, p');
      expect(await sections.count()).toBeGreaterThan(1);
    });

    test('should establish credibility and expertise', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Professional credentials
      expect(bodyText).toMatch(/Jahre|Erfahrung|Praxis|Ausbildung/);
      
      // Health expertise
      expect(bodyText).toMatch(/Gesundheit|Therapie|Beratung|Behandlung/);
    });

    test('should be engaging and personal', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Personal connection
      expect(bodyText).toMatch(/ich|mein|meine|persönlich|Leidenschaft/);
      
      // Mission or motivation
      expect(bodyText).toMatch(/helfen|unterstützen|Mission|Ziel/);
    });

    test('should have professional photo if available', async ({ page }) => {
      const images = page.locator('img');
      
      if (await images.count() > 0) {
        const authorImage = images.first();
        
        // Should have alt text
        await expect(authorImage).toHaveAttribute('alt');
        
        const alt = await authorImage.getAttribute('alt');
        expect(alt).toMatch(/Sandra|Kai|Autor|Therapeut/);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load author pages efficiently', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000);
    });

    test('should optimize images', async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[1]}`);
      await waitForPageLoad(page);
      
      const images = page.locator('img');
      
      if (await images.count() > 0) {
        const authorImage = images.first();
        
        // Should have loading optimization
        const loading = await authorImage.getAttribute('loading');
        expect(['lazy', 'eager', null]).toContain(loading);
        
        // Should have proper dimensions
        const width = await authorImage.getAttribute('width');
        const height = await authorImage.getAttribute('height');
        expect(width || height).toBeTruthy();
      }
    });
  });

  test.describe('Health Blog Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await waitForPageLoad(page);
    });

    test('should emphasize health expertise', async ({ page }) => {
      const content = page.locator('body');
      
      // Health specialization
      await expect(content).toContainText(/Gesundheit|Wellness|Ernährung|Therapie/);
      
      // Professional background in health
      await expect(content).toContainText(/Therapeut|Heilpraktiker|medizinisch|Gesundheitsberater/);
    });

    test('should connect to health content', async ({ page }) => {
      const authorPage = new AuthorPage(page);
      
      // Should link to health-related articles
      if (await authorPage.authorArticles.count() > 0) {
        const articleTitles = await authorPage.authorArticles.allTextContents();
        
        let healthContent = false;
        for (const title of articleTitles) {
          if (title.match(/Gesundheit|Vitamin|Ernährung|Immunsystem|Wellness/)) {
            healthContent = true;
            break;
          }
        }
        
        if (articleTitles.length > 0) {
          expect(healthContent).toBeTruthy();
        }
      }
    });

    test('should maintain consistent health blog branding', async ({ page }) => {
      const content = page.locator('body');
      
      // Should feel like part of health blog
      await expect(content).toContainText(/Gesundes Leben|Healthy Life/);
      
      // Consistent navigation
      const authorPage = new AuthorPage(page);
      await expect(authorPage.rssLink).toBeVisible();
    });
  });
});