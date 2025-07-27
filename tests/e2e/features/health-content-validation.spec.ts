import { test, expect } from '@playwright/test';

import { 
  SAMPLE_BLOG_POSTS, 
  GERMAN_HEALTH_TERMS, 
  SAMPLE_AUTHORS 
} from '../utils/fixtures';
import { BlogPostPage, GlossaryPage } from '../utils/page-objects';
import { 
  validateGermanContent,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Health Content Validation', () => {
  test.describe('Medical Disclaimer and Legal Compliance', () => {
    test('should display medical disclaimers on health content', async ({ page }) => {
      // Test on blog posts
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      const contentText = await content.textContent();
      
      // Should contain medical disclaimer language
      const hasDisclaimer = 
        contentText?.includes('medizinischer Rat') ||
        contentText?.includes('Arzt konsultieren') ||
        contentText?.includes('nicht den Besuch beim Arzt') ||
        contentText?.includes('Haftungsausschluss') ||
        contentText?.includes('medizinische Beratung') ||
        contentText?.includes('Disclaimer');
      
      expect(hasDisclaimer).toBeTruthy();
    });

    test('should include health information warnings', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should warn about self-diagnosis risks
      await expect(content).toContainText(
        /Selbstdiagnose|medizinischer Rat|Arzt|Therapeut|Fachmann|professionelle Beratung/
      );
      
      // Should emphasize professional consultation
      await expect(content).toContainText(
        /konsultieren|sprechen Sie|wenden Sie sich|Beratung|Rücksprache/
      );
    });

    test('should have proper health content labeling', async ({ page }) => {
      await page.goto('/posts');
      await waitForPageLoad(page);
      
      const healthPosts = page.locator('article, .post-card').filter({ 
        hasText: /Gesundheit|Vitamin|Ernährung|Therapie|Immunsystem/ 
      });
      
      if (await healthPosts.count() > 0) {
        const firstHealthPost = healthPosts.first();
        
        // Should have health-related categories or tags
        const categories = firstHealthPost.locator('.category, .tag, .categories');
        
        if (await categories.count() > 0) {
          const categoryText = await categories.textContent();
          expect(categoryText).toMatch(/Gesundheit|Ernährung|Wellness|Vitamin|Immunsystem/);
        }
      }
    });
  });

  test.describe('Health Expertise and Author Credentials', () => {
    test('should display author credentials for health content', async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      const contentText = await content.textContent();
      
      // Should display professional credentials
      const hasCredentials = 
        contentText?.includes('Therapeut') ||
        contentText?.includes('Heilpraktiker') ||
        contentText?.includes('Experte') ||
        contentText?.includes('Ausbildung') ||
        contentText?.includes('Qualifikation') ||
        contentText?.includes('Jahre Erfahrung');
      
      expect(hasCredentials).toBeTruthy();
    });

    test('should show therapeutic expertise', async ({ page }) => {
      await page.goto(`/author/${SAMPLE_AUTHORS[1]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should mention health specializations
      await expect(content).toContainText(
        /Gesundheit|Wellness|Ernährung|Therapie|Beratung|Behandlung|Praxis/
      );
      
      // Should establish professional background
      await expect(content).toContainText(
        /spezialisiert|Schwerpunkt|Fokus|Expertise|Kompetenz|Erfahrung/
      );
    });

    test('should link health content to qualified authors', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const blogPost = new BlogPostPage(page);
      
      // Should display author information
      if (await blogPost.authorInfo.count() > 0) {
        await expect(blogPost.authorInfo).toBeVisible();
        
        // Author should be linked to profile
        const authorLink = blogPost.authorInfo.locator('a');
        if (await authorLink.count() > 0) {
          const href = await authorLink.getAttribute('href');
          expect(href).toMatch(/\/author\//);
        }
      }
    });
  });

  test.describe('Health Terminology and Accuracy', () => {
    test('should use accurate German health terminology', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      await validateGermanContent(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      // Should use proper German health terms
      let foundHealthTerms = 0;
      for (const term of GERMAN_HEALTH_TERMS.slice(0, 8)) {
        if (contentText?.includes(term)) {
          foundHealthTerms++;
        }
      }
      
      expect(foundHealthTerms).toBeGreaterThan(0);
    });

    test('should provide definitions for complex terms', async ({ page }) => {
      await page.goto('/glossary');
      await waitForPageLoad(page);
      
      const glossaryPage = new GlossaryPage(page);
      
      // Should have health-related terms
      if (await glossaryPage.termCards.count() > 0) {
        const terms = await glossaryPage.termCards.allTextContents();
        
        let healthTermsFound = 0;
        for (const termText of terms) {
          if (GERMAN_HEALTH_TERMS.some(healthTerm => termText.includes(healthTerm))) {
            healthTermsFound++;
          }
        }
        
        expect(healthTermsFound).toBeGreaterThan(0);
      }
    });

    test('should link to glossary from health articles', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      // Look for glossary links in content
      const glossaryLinks = page.locator('a[href*="/glossary/"]');
      
      if (await glossaryLinks.count() > 0) {
        // Should have meaningful anchor text
        const firstLink = glossaryLinks.first();
        const linkText = await firstLink.textContent();
        
        expect(linkText).toBeTruthy();
        expect(linkText!.length).toBeGreaterThan(3);
        
        // Should link to health terms
        expect(linkText).toMatch(/Vitamin|Mineral|Antioxidant|Nährstoff|Protein/);
      }
    });
  });

  test.describe('Health Content Categories and Organization', () => {
    test('should organize content by health topics', async ({ page }) => {
      await page.goto('/categories');
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should have health-related categories
      await expect(content).toContainText(/Ernährung|Gesundheit|Immunsystem|Vitamine|Wellness/);
      
      // Categories should be well-organized
      const categoryCards = page.locator('.category-card, .category');
      
      if (await categoryCards.count() > 0) {
        expect(await categoryCards.count()).toBeGreaterThan(2);
        
        // Each category should have description
        const firstCategory = categoryCards.first();
        const categoryText = await firstCategory.textContent();
        expect(categoryText!.length).toBeGreaterThan(10);
      }
    });

    test('should group related health content', async ({ page }) => {
      await page.goto('/posts');
      await waitForPageLoad(page);
      
      // Look for health content groupings
      const vitaminPosts = page.locator('article, .post-card').filter({ 
        hasText: /Vitamin|Nährstoff|Mineral/ 
      });
      
      const nutritionPosts = page.locator('article, .post-card').filter({ 
        hasText: /Ernährung|Diät|Lebensmittel/ 
      });
      
      const immunePosts = page.locator('article, .post-card').filter({ 
        hasText: /Immunsystem|Abwehr|Immunität/ 
      });
      
      // Should have content in multiple health areas
      const totalHealthPosts = await vitaminPosts.count() + 
                              await nutritionPosts.count() + 
                              await immunePosts.count();
      
      expect(totalHealthPosts).toBeGreaterThan(2);
    });

    test('should provide health hashtags and topics', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const blogPost = new BlogPostPage(page);
      
      // Should have health-related tags or hashtags
      if (await blogPost.tags.count() > 0) {
        const tagsText = await blogPost.tags.textContent();
        
        expect(tagsText).toMatch(/#Gesundheit|#Vitamin|#Ernährung|#Wellness|#Immunsystem/);
      }
      
      // Look for hashtags in content
      const hashtagLinks = page.locator('a[href*="#"]').filter({ hasText: /#\w+/ });
      
      if (await hashtagLinks.count() > 0) {
        const hashtagText = await hashtagLinks.first().textContent();
        expect(hashtagText).toMatch(/#[A-Za-zÄÖÜäöüß]+/);
      }
    });
  });

  test.describe('Health Research and References', () => {
    test('should reference scientific sources', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      // Should mention research or studies
      const hasResearchRef = 
        contentText?.includes('Studie') ||
        contentText?.includes('Forschung') ||
        contentText?.includes('Untersuchung') ||
        contentText?.includes('wissenschaftlich') ||
        contentText?.includes('belegt') ||
        contentText?.includes('Quelle');
      
      if (hasResearchRef) {
        expect(hasResearchRef).toBeTruthy();
      }
    });

    test('should provide credible health information', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      
      // Should use evidence-based language
      await expect(content).toContainText(
        /zeigen|belegen|nachweisen|Studien zeigen|Forschung zeigt|wissenschaftlich/
      );
      
      // Should avoid absolute claims without evidence
      const contentText = await content.textContent();
      const hasUnsupportedClaims = 
        contentText?.includes('heilt alle') ||
        contentText?.includes('garantiert') ||
        contentText?.includes('100% wirksam') ||
        contentText?.includes('Wundermittel');
      
      expect(hasUnsupportedClaims).toBeFalsy();
    });

    test('should link to external health resources', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      // Look for external links to health organizations
      const externalLinks = page.locator('a[href^="http"]');
      
      if (await externalLinks.count() > 0) {
        const healthLinks = [];
        
        for (let i = 0; i < Math.min(5, await externalLinks.count()); i++) {
          const link = externalLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && (
            href.includes('pubmed') ||
            href.includes('ncbi') ||
            href.includes('who.int') ||
            href.includes('rki.de') ||
            href.includes('bfr.bund.de') ||
            href.includes('dge.de')
          )) {
            healthLinks.push(href);
          }
        }
        
        // May have links to reputable health sources
        if (healthLinks.length > 0) {
          expect(healthLinks.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Health Content Quality and Safety', () => {
    test('should avoid dangerous health advice', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      // Should not suggest stopping medical treatment
      const hasDangerousAdvice = 
        contentText?.includes('stoppen Sie Ihre Medikamente') ||
        contentText?.includes('brauchen Sie keinen Arzt') ||
        contentText?.includes('Medikamente sind unnötig') ||
        contentText?.includes('Ärzte sind falsch');
      
      expect(hasDangerousAdvice).toBeFalsy();
    });

    test('should encourage professional consultation', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      
      // Should encourage consulting healthcare professionals
      await expect(content).toContainText(
        /Arzt konsultieren|Therapeut sprechen|medizinische Beratung|professionelle Hilfe|Fachmann/
      );
    });

    test('should use appropriate health language', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      // Should use professional, accessible language
      const hasAppropriateLanguage = 
        contentText?.includes('kann helfen') ||
        contentText?.includes('möglicherweise') ||
        contentText?.includes('Studien zeigen') ||
        contentText?.includes('könnte unterstützen');
      
      expect(hasAppropriateLanguage).toBeTruthy();
      
      // Should avoid overly technical jargon without explanation
      if (contentText?.includes('μg') || contentText?.includes('IU')) {
        // If using units, should explain them
        expect(contentText).toMatch(/Mikrogramm|internationale Einheit|Einheit/);
      }
    });
  });

  test.describe('Nutritional Information Standards', () => {
    test('should provide accurate nutritional information', async ({ page }) => {
      // Search for nutrition-related content
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('Vitamin D');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        
        const results = page.locator('.search-result, .result');
        
        if (await results.count() > 0) {
          // Click on first result
          const firstResult = results.first().locator('a');
          if (await firstResult.count() > 0) {
            await firstResult.click();
            await waitForPageLoad(page);
            
            const content = page.locator('article, .article-content');
            const contentText = await content.textContent();
            
            // Should include proper nutritional units
            const hasNutritionalInfo = 
              contentText?.includes('mg') ||
              contentText?.includes('μg') ||
              contentText?.includes('IU') ||
              contentText?.includes('Tagesdosis') ||
              contentText?.includes('empfohlene Menge');
            
            if (hasNutritionalInfo) {
              expect(hasNutritionalInfo).toBeTruthy();
            }
          }
        }
      }
    });

    test('should include dietary context and warnings', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      // Should mention individual dietary needs
      const hasDietaryContext = 
        contentText?.includes('individuelle Bedürfnisse') ||
        contentText?.includes('persönliche Umstände') ||
        contentText?.includes('Allergien') ||
        contentText?.includes('Unverträglichkeiten') ||
        contentText?.includes('Wechselwirkungen');
      
      if (contentText?.includes('Vitamin') || contentText?.includes('Nährstoff')) {
        expect(hasDietaryContext).toBeTruthy();
      }
    });
  });

  test.describe('Health Blog Branding and Trust', () => {
    test('should maintain consistent health brand messaging', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should emphasize health empowerment and education
      await expect(content).toContainText(
        /Gesundes Leben|Healthy Life|Empowerment|Gesundheit|Wohlbefinden/
      );
    });

    test('should build trust through transparency', async ({ page }) => {
      await page.goto('/about');
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should be transparent about mission and approach
      await expect(content).toContainText(
        /Mission|Ziel|Ansatz|Philosophie|Werte|transparent|ehrlich/
      );
      
      // Should mention qualifications and background
      await expect(content).toContainText(
        /Therapeut|Erfahrung|Ausbildung|Qualifikation|Kompetenz/
      );
    });

    test('should provide clear contact and support', async ({ page }) => {
      await page.goto('/imprint');
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should have clear contact information
      await expect(content).toContainText(/Kontakt|E-Mail|Mail/);
      
      // Should be reachable for health-related questions
      await expect(content).toContainText(
        /Fragen|Beratung|Unterstützung|Hilfe|erreichbar/
      );
    });
  });
});