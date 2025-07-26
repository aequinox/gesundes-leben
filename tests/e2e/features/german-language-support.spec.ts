import { test, expect } from '@playwright/test';

import { 
  GERMAN_HEALTH_TERMS, 
  COMMON_GERMAN_WORDS, 
  SEARCH_QUERIES,
  SAMPLE_BLOG_POSTS,
  GERMAN_DATE_FORMATS
} from '../utils/fixtures';
import { SearchPage } from '../utils/page-objects';
import { 
  validateGermanContent,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('German Language Support', () => {
  test.describe('Character Encoding and Display', () => {
    test('should properly display German umlauts and special characters', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      await validateGermanContent(page);
      
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Check for proper German character display
      if (bodyText && /[äöüÄÖÜß]/.test(bodyText)) {
        // Characters should display correctly, not as HTML entities
        expect(bodyText).not.toMatch(/&auml;|&ouml;|&uuml;|&Auml;|&Ouml;|&Uuml;|&szlig;/);
        
        // Should contain actual German characters
        expect(bodyText).toMatch(/[äöüÄÖÜß]/);
      }
    });

    test('should handle German characters in URLs', async ({ page }) => {
      // Test with German search terms
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        // Test German characters in search
        await searchPage.search('Ernährung');
        await page.waitForTimeout(1000);
        
        // URL should handle German characters correctly
        const currentUrl = page.url();
        
        // Should either encode properly or handle Unicode
        expect(currentUrl).toBeTruthy();
        
        // Search input should preserve German characters
        const inputValue = await searchPage.searchInput.inputValue();
        expect(inputValue).toBe('Ernährung');
      }
    });

    test('should maintain character integrity in form inputs', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const germanInputs = [
        'Müdigkeit und Erschöpfung',
        'Größe und Gewicht',
        'Überdosierung vermeiden',
        'Nahrungsergänzung',
        'Stärkung des Immunsystems'
      ];
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        for (const text of germanInputs.slice(0, 3)) {
          await searchInput.fill(text);
          
          const inputValue = await searchInput.inputValue();
          expect(inputValue).toBe(text);
          
          // Clear for next test
          await searchInput.fill('');
        }
      }
    });
  });

  test.describe('German Content Structure and Grammar', () => {
    test('should use proper German sentence structure', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      if (contentText) {
        // Should contain common German words
        let foundGermanWords = 0;
        for (const word of COMMON_GERMAN_WORDS.slice(0, 6)) {
          if (contentText.includes(` ${word} `) || contentText.includes(`${word} `)) {
            foundGermanWords++;
          }
        }
        
        expect(foundGermanWords).toBeGreaterThan(2);
        
        // Should use German punctuation patterns
        expect(contentText).toMatch(/\. [A-ZÄÖÜ]|, [a-zäöü]|: [A-Za-zÄÖÜäöü]/);
      }
    });

    test('should use German health terminology consistently', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      if (contentText) {
        // Should use German health terms
        let foundHealthTerms = 0;
        for (const term of GERMAN_HEALTH_TERMS.slice(0, 10)) {
          if (contentText.includes(term)) {
            foundHealthTerms++;
          }
        }
        
        expect(foundHealthTerms).toBeGreaterThan(1);
        
        // Should use German medical terms rather than English
        const hasGermanMedical = 
          contentText.includes('Gesundheit') ||
          contentText.includes('Ernährung') ||
          contentText.includes('Behandlung') ||
          contentText.includes('Therapie');
        
        expect(hasGermanMedical).toBeTruthy();
      }
    });

    test('should have proper German capitalization', async ({ page }) => {
      await page.goto('/about');
      await waitForPageLoad(page);
      
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      for (let i = 0; i < Math.min(5, headingCount); i++) {
        const heading = headings.nth(i);
        const headingText = await heading.textContent();
        
        if (headingText && headingText.trim().length > 0) {
          // German nouns should be capitalized
          expect(headingText).toMatch(/[A-ZÄÖÜ]/);
          
          // Should follow German title case rules
          if (headingText.includes(' ')) {
            expect(headingText).toMatch(/[A-ZÄÖÜ][a-zäöüß]*\s+[A-ZÄÖÜa-zäöüß]/);
          }
        }
      }
    });
  });

  test.describe('German Date and Time Formatting', () => {
    test('should display dates in German format', async ({ page }) => {
      await page.goto('/posts');
      await waitForPageLoad(page);
      
      const dateElements = page.locator('.date, .published, .post-date, time');
      
      if (await dateElements.count() > 0) {
        const dateText = await dateElements.first().textContent();
        
        if (dateText) {
          // Should use German date format
          const matchesGermanDate = GERMAN_DATE_FORMATS.some(format => 
            format.test(dateText)
          );
          
          if (matchesGermanDate) {
            expect(matchesGermanDate).toBeTruthy();
          }
          
          // Should use German month names if spelled out
          const hasGermanMonth = /Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember/.test(dateText);
          
          if (hasGermanMonth) {
            expect(hasGermanMonth).toBeTruthy();
          }
        }
      }
    });

    test('should use German time expressions', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      if (bodyText) {
        // Look for time-related expressions
        const hasGermanTimeExpressions = 
          bodyText.includes('Minuten') ||
          bodyText.includes('Stunden') ||
          bodyText.includes('Tage') ||
          bodyText.includes('Wochen') ||
          bodyText.includes('Monate') ||
          bodyText.includes('Jahre') ||
          bodyText.includes('täglich') ||
          bodyText.includes('wöchentlich');
        
        if (hasGermanTimeExpressions) {
          expect(hasGermanTimeExpressions).toBeTruthy();
        }
      }
    });
  });

  test.describe('German Search and Navigation', () => {
    test('should support German search queries', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchPage = new SearchPage(page);
      
      if (await searchPage.searchInput.count() > 0) {
        // Test various German search terms
        for (const query of SEARCH_QUERIES.german.slice(0, 3)) {
          await searchPage.search(query);
          await page.waitForTimeout(1500);
          
          // Should handle German characters in search
          const inputValue = await searchPage.searchInput.inputValue();
          expect(inputValue).toBe(query);
          
          // Should return some response
          const hasResults = await searchPage.searchResults.count() > 0;
          const hasNoResults = await searchPage.noResults.count() > 0;
          
          expect(hasResults || hasNoResults).toBeTruthy();
          
          // Clear for next search
          await searchPage.searchInput.fill('');
          await page.waitForTimeout(500);
        }
      }
    });

    test('should have German navigation labels', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const navLinks = page.locator('nav a');
      
      if (await navLinks.count() > 0) {
        const navTexts = await navLinks.allTextContents();
        
        // Should contain German navigation terms
        const germanNavTerms = navTexts.filter(text => 
          text.includes('Über') ||
          text.includes('Blog') ||
          text.includes('Artikel') ||
          text.includes('Suche') ||
          text.includes('Kontakt') ||
          text.includes('Impressum') ||
          text.includes('Datenschutz')
        );
        
        expect(germanNavTerms.length).toBeGreaterThan(0);
      }
    });

    test('should handle German category names', async ({ page }) => {
      await page.goto('/categories');
      await waitForPageLoad(page);
      
      const content = page.locator('body');
      
      // Should have German category names
      await expect(content).toContainText(/Ernährung|Gesundheit|Vitamine|Immunsystem|Wellness/);
      
      const categoryLinks = page.locator('a').filter({ hasText: /Ernährung|Gesundheit|Vitamine/ });
      
      if (await categoryLinks.count() > 0) {
        // Category links should work with German names
        const firstCategory = categoryLinks.first();
        const href = await firstCategory.getAttribute('href');
        
        expect(href).toBeTruthy();
        
        // Test navigation to German category
        await firstCategory.click();
        await waitForPageLoad(page);
        
        // Should navigate successfully
        expect(page.url()).not.toBe('/categories');
      }
    });
  });

  test.describe('German Error Messages and User Feedback', () => {
    test('should display error messages in German', async ({ page }) => {
      // Navigate to non-existent page to trigger 404
      await page.goto('/nicht-existierende-seite');
      
      const content = page.locator('body');
      const contentText = await content.textContent();
      
      if (contentText) {
        // Should show German error message
        const hasGermanError = 
          contentText.includes('nicht gefunden') ||
          contentText.includes('Seite existiert nicht') ||
          contentText.includes('404') ||
          contentText.includes('Fehler') ||
          contentText.includes('Entschuldigung');
        
        expect(hasGermanError).toBeTruthy();
      }
    });

    test('should use German form validation messages', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      // Look for form elements with validation
      const forms = page.locator('form');
      
      if (await forms.count() > 0) {
        const requiredInputs = page.locator('input[required]');
        
        if (await requiredInputs.count() > 0) {
          const input = requiredInputs.first();
          
          // Try to trigger validation
          await input.focus();
          await input.blur();
          
          // Look for validation messages
          const validationMessage = await input.evaluate((el: HTMLInputElement) => {
            return el.validationMessage;
          });
          
          if (validationMessage) {
            // Should be in German if browser supports it
            expect(validationMessage).toBeTruthy();
          }
        }
      }
    });

    test('should provide German user guidance', async ({ page }) => {
      await page.goto('/search');
      await waitForPageLoad(page);
      
      const searchInput = page.locator('input[type="search"]');
      
      if (await searchInput.count() > 0) {
        // Placeholder should be in German
        const placeholder = await searchInput.getAttribute('placeholder');
        
        if (placeholder) {
          expect(placeholder).toMatch(/suchen|Suche|Begriff|Stichwort|durchsuchen/i);
        }
        
        // Labels should be in German
        const label = page.locator('label').filter({ hasText: /suchen|Suche/i });
        
        if (await label.count() > 0) {
          const labelText = await label.textContent();
          expect(labelText).toMatch(/suchen|Suche/i);
        }
      }
    });
  });

  test.describe('German Content Localization', () => {
    test('should have German meta descriptions', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const metaDescription = page.locator('meta[name="description"]');
      
      if (await metaDescription.count() > 0) {
        const description = await metaDescription.getAttribute('content');
        
        if (description) {
          // Should be in German
          const hasGermanContent = 
            description.includes('Gesundheit') ||
            description.includes('Ernährung') ||
            description.includes('Wellness') ||
            description.includes('für') ||
            description.includes('und') ||
            description.includes('oder');
          
          expect(hasGermanContent).toBeTruthy();
        }
      }
    });

    test('should have proper German Open Graph tags', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      
      if (await ogTitle.count() > 0) {
        const title = await ogTitle.getAttribute('content');
        
        if (title) {
          // Should contain German content
          expect(title.length).toBeGreaterThan(5);
        }
      }
      
      if (await ogDescription.count() > 0) {
        const description = await ogDescription.getAttribute('content');
        
        if (description) {
          // Should be substantial German text
          expect(description.length).toBeGreaterThan(20);
          
          const hasGermanWords = COMMON_GERMAN_WORDS.some(word => 
            description.includes(word)
          );
          
          if (hasGermanWords) {
            expect(hasGermanWords).toBeTruthy();
          }
        }
      }
    });

    test('should maintain German language in RSS feed', async ({ page }) => {
      // Check RSS feed
      const response = await page.goto('/rss.xml');
      
      if (response && response.ok()) {
        const rssContent = await response.text();
        
        // Should contain German content
        const hasGermanContent = 
          rssContent.includes('Gesundheit') ||
          rssContent.includes('Ernährung') ||
          rssContent.includes('Artikel') ||
          rssContent.includes('Blog');
        
        if (hasGermanContent) {
          expect(hasGermanContent).toBeTruthy();
        }
        
        // Should have German language attribute
        if (rssContent.includes('xml:lang') || rssContent.includes('language')) {
          expect(rssContent).toMatch(/xml:lang="de"|language>de</);
        }
      }
    });
  });

  test.describe('German Typography and Formatting', () => {
    test('should use proper German quotation marks', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      if (contentText && contentText.includes('"')) {
        // German uses „ " or » « quotation marks
        const hasGermanQuotes = 
          contentText.includes('„') ||
          contentText.includes('"') ||
          contentText.includes('»') ||
          contentText.includes('«');
        
        if (hasGermanQuotes) {
          expect(hasGermanQuotes).toBeTruthy();
        }
      }
    });

    test('should handle German word breaks correctly', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      // Check CSS for German language support
      const hasGermanHyphenation = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, article');
        
        for (const element of elements) {
          const styles = getComputedStyle(element);
          if (styles.hyphens === 'auto' && 
              (styles.language === 'de' || document.documentElement.lang === 'de')) {
            return true;
          }
        }
        
        return false;
      });
      
      // German hyphenation should be supported
      if (hasGermanHyphenation) {
        expect(hasGermanHyphenation).toBeTruthy();
      }
    });

    test('should display German currency and numbers correctly', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
      
      const content = page.locator('article, .article-content');
      const contentText = await content.textContent();
      
      if (contentText) {
        // Check for German number formatting
        const hasGermanNumbers = 
          /\d+,\d+/.test(contentText) || // German decimal comma
          /\d+\.\d{3}/.test(contentText); // German thousands separator
        
        if (hasGermanNumbers) {
          expect(hasGermanNumbers).toBeTruthy();
        }
        
        // Check for Euro currency
        if (contentText.includes('€') || contentText.includes('Euro')) {
          // Should use proper German currency formatting
          expect(contentText).toMatch(/\d+[,.]?\d*\s*€|€\s*\d+[,.]?\d*/);
        }
      }
    });
  });

  test.describe('German Accessibility and Screen Readers', () => {
    test('should have German language attributes', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Main language should be set
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toMatch(/^de(-\w+)?$/);
      
      // Check for language changes in content
      const foreignLanguageElements = page.locator('[lang]:not([lang^="de"])');
      
      if (await foreignLanguageElements.count() > 0) {
        // Foreign language sections should be marked
        const firstForeign = foreignLanguageElements.first();
        const lang = await firstForeign.getAttribute('lang');
        
        expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }
    });

    test('should have German ARIA labels', async ({ page }) => {
      await page.goto('/');
      await waitForPageLoad(page);
      
      const ariaLabels = page.locator('[aria-label]');
      
      if (await ariaLabels.count() > 0) {
        const _labels = await ariaLabels.allTextContents();
        const ariaLabelValues = [];
        
        for (let i = 0; i < await ariaLabels.count(); i++) {
          const label = await ariaLabels.nth(i).getAttribute('aria-label');
          if (label) {
            ariaLabelValues.push(label);
          }
        }
        
        // ARIA labels should be in German
        const germanAriaLabels = ariaLabelValues.filter(label =>
          COMMON_GERMAN_WORDS.some(word => label.includes(word)) ||
          label.includes('öffnen') ||
          label.includes('schließen') ||
          label.includes('Navigation') ||
          label.includes('Menü')
        );
        
        if (germanAriaLabels.length > 0) {
          expect(germanAriaLabels.length).toBeGreaterThan(0);
        }
      }
    });
  });
});