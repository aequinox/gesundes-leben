import { test, expect } from '@playwright/test';

import { SITEMAP_REQUIREMENTS } from '../utils/fixtures';

test.describe('Sitemap Integration', () => {
  test.describe('Sitemap Availability and Format', () => {
    test('should serve sitemap at /sitemap.xml', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      
      expect(response).toBeTruthy();
      expect(response!.status()).toBe(200);
      
      // Should have correct content type
      const contentType = response!.headers()['content-type'];
      expect(contentType).toMatch(/xml/);
    });

    test('should have valid sitemap XML structure', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should contain required sitemap elements
      for (const element of SITEMAP_REQUIREMENTS.elements) {
        expect(sitemapContent).toContain(`<${element}`);
      }
      
      // Should be valid XML
      expect(sitemapContent).toMatch(/^<\?xml/);
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain('</urlset>');
      
      // Should have sitemap namespace
      expect(sitemapContent).toContain('http://www.sitemaps.org/schemas/sitemap');
    });

    test('should include all main pages', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should include main pages
      const expectedPages = [
        '/',
        '/about',
        '/posts',
        '/search',
        '/categories',
        '/glossary',
        '/imprint',
        '/our-vision'
      ];
      
      for (const pagePath of expectedPages) {
        expect(sitemapContent).toContain(`<loc>${process.env.SITE_URL || 'http'}${pagePath}`);
      }
    });
  });

  test.describe('Sitemap Content Quality', () => {
    test('should include blog posts with metadata', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should have blog post URLs
      expect(sitemapContent).toMatch(/\/posts\/[^<]+/);
      
      // Should have lastmod dates for posts
      const urlBlocks = sitemapContent.split('<url>').slice(1);
      
      let blogPostsWithDates = 0;
      for (const block of urlBlocks.slice(0, 10)) {
        if (block.includes('/posts/') && block.includes('<lastmod>')) {
          blogPostsWithDates++;
        }
      }
      
      expect(blogPostsWithDates).toBeGreaterThan(0);
    });

    test('should have proper priority values', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Extract priority values
      const priorityMatches = sitemapContent.match(/<priority>([^<]+)<\/priority>/g);
      
      if (priorityMatches) {
        for (const priorityMatch of priorityMatches) {
          const priority = parseFloat(priorityMatch.replace(/<\/?priority>/g, ''));
          
          // Priority should be between 0.0 and 1.0
          expect(priority).toBeGreaterThanOrEqual(0.0);
          expect(priority).toBeLessThanOrEqual(1.0);
        }
        
        // Homepage should have high priority
        if (sitemapContent.includes('<loc>') && sitemapContent.includes('</loc>')) {
          const homepageBlock = sitemapContent.match(/<url>[\s\S]*?<loc>[^\/]*\/?<\/loc>[\s\S]*?<\/url>/);
          if (homepageBlock && homepageBlock[0].includes('<priority>')) {
            const homePriority = homepageBlock[0].match(/<priority>([^<]+)<\/priority>/);
            if (homePriority) {
              expect(parseFloat(homePriority[1])).toBeGreaterThan(0.8);
            }
          }
        }
      }
    });

    test('should have change frequency information', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should have changefreq elements
      const changefreqMatches = sitemapContent.match(/<changefreq>([^<]+)<\/changefreq>/g);
      
      if (changefreqMatches) {
        const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        
        for (const changefreqMatch of changefreqMatches.slice(0, 5)) {
          const frequency = changefreqMatch.replace(/<\/?changefreq>/g, '');
          expect(validFrequencies).toContain(frequency);
        }
      }
    });

    test('should include author and glossary pages', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should include author pages
      expect(sitemapContent).toMatch(/\/author\/[^<]+/);
      
      // Should include glossary terms
      expect(sitemapContent).toMatch(/\/glossary\/[^<]+/);
      
      // Should include category pages
      expect(sitemapContent).toMatch(/\/categories\/[^<]+/);
    });
  });

  test.describe('Sitemap Discovery', () => {
    test('should be referenced in robots.txt', async ({ page }) => {
      const response = await page.goto('/robots.txt');
      
      if (response && response.status() === 200) {
        const robotsContent = await response.text();
        
        // Should reference sitemap
        expect(robotsContent).toMatch(/Sitemap:\s*https?:\/\/[^\/]+\/sitemap\.xml/);
      }
    });

    test('should have sitemap link in robots meta', async ({ page }) => {
      await page.goto('/');
      
      // May have sitemap reference in head
      const sitemapLink = page.locator('link[rel="sitemap"]');
      
      if (await sitemapLink.count() > 0) {
        const href = await sitemapLink.getAttribute('href');
        expect(href).toMatch(/sitemap\.xml$/);
      }
    });
  });

  test.describe('Sitemap Performance', () => {
    test('should load sitemap quickly', async ({ page }) => {
      const startTime = Date.now();
      
      const response = await page.goto('/sitemap.xml');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
      
      expect(response!.status()).toBe(200);
    });

    test('should have reasonable sitemap size', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Sitemap should not be excessively large
      expect(sitemapContent.length).toBeLessThan(10000000); // 10MB max
      expect(sitemapContent.length).toBeGreaterThan(500); // Should have content
      
      // Should not have too many URLs (50,000 limit)
      const urlCount = (sitemapContent.match(/<url>/g) || []).length;
      expect(urlCount).toBeLessThan(50000);
      expect(urlCount).toBeGreaterThan(5); // Should have multiple pages
    });

    test('should handle sitemap compression if available', async ({ page }) => {
      // Test if compressed sitemap is available
      const response = await page.goto('/sitemap.xml.gz');
      
      if (response && response.status() === 200) {
        const contentEncoding = response.headers()['content-encoding'];
        expect(contentEncoding).toMatch(/gzip|compress/);
      }
    });
  });

  test.describe('Sitemap Validation', () => {
    test('should have valid lastmod dates', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Extract lastmod dates
      const lastmodMatches = sitemapContent.match(/<lastmod>([^<]+)<\/lastmod>/g);
      
      if (lastmodMatches) {
        for (const lastmodMatch of lastmodMatches.slice(0, 5)) {
          const dateString = lastmodMatch.replace(/<\/?lastmod>/g, '');
          
          // Should be valid ISO 8601 date format
          const date = new Date(dateString);
          expect(date.getTime()).not.toBeNaN();
          
          // Should be reasonable date (not in far future)
          expect(date.getTime()).toBeLessThan(Date.now() + 86400000); // Within 1 day
          expect(date.getTime()).toBeGreaterThan(new Date('2020-01-01').getTime()); // After 2020
        }
      }
    });

    test('should have properly formatted URLs', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Extract URLs
      const urlMatches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g);
      
      if (urlMatches) {
        for (const urlMatch of urlMatches.slice(0, 10)) {
          const url = urlMatch.replace(/<\/?loc>/g, '');
          
          // Should be valid URLs
          expect(url).toMatch(/^https?:\/\//);
          
          // Should not contain invalid characters
          expect(url).not.toMatch(/[<>&"']/);
          
          // Should be absolute URLs
          expect(url).toMatch(/^https?:\/\/[^\/]+/);
        }
      }
    });

    test('should escape XML content properly', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should not contain unescaped XML characters
      expect(sitemapContent).not.toMatch(/[<>&](?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/);
      
      // URLs should be properly encoded
      if (sitemapContent.includes('ä') || sitemapContent.includes('ö') || sitemapContent.includes('ü')) {
        // German characters in URLs should be percent-encoded
        expect(sitemapContent).toMatch(/%[0-9A-Fa-f]{2}/);
      }
    });

    test('should include required sitemap namespace', async ({ page }) => {
      const response = await page.goto('/sitemap.xml');
      const sitemapContent = await response!.text();
      
      // Should have proper XML namespace
      expect(sitemapContent).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      
      // Should be valid XML structure
      expect(sitemapContent).toMatch(/<urlset[^>]*>[\s\S]*<\/urlset>/);
      
      // Each URL should be properly structured
      const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g);
      
      if (urlBlocks) {
        for (const block of urlBlocks.slice(0, 3)) {
          expect(block).toContain('<loc>');
          expect(block).toContain('</loc>');
        }
      }
    });
  });

  test.describe('Sitemap Index Support', () => {
    test('should handle sitemap index if present', async ({ page }) => {
      // Check for sitemap index
      const response = await page.goto('/sitemap-index.xml');
      
      if (response && response.status() === 200) {
        const indexContent = await response.text();
        
        // Should be valid sitemap index
        expect(indexContent).toContain('<sitemapindex');
        expect(indexContent).toContain('</sitemapindex>');
        expect(indexContent).toContain('<sitemap>');
        
        // Should reference other sitemaps
        expect(indexContent).toMatch(/<loc>[^<]*sitemap[^<]*\.xml<\/loc>/);
      }
    });

    test('should link to category-specific sitemaps if available', async ({ page }) => {
      // Check for post-specific sitemap
      const postSitemapResponse = await page.goto('/sitemap-posts.xml');
      
      if (postSitemapResponse && postSitemapResponse.status() === 200) {
        const postSitemapContent = await postSitemapResponse.text();
        
        // Should contain blog posts
        expect(postSitemapContent).toContain('<urlset');
        expect(postSitemapContent).toMatch(/\/posts\/[^<]+/);
      }
      
      // Check for page-specific sitemap
      const pagesSitemapResponse = await page.goto('/sitemap-pages.xml');
      
      if (pagesSitemapResponse && pagesSitemapResponse.status() === 200) {
        const pagesSitemapContent = await pagesSitemapResponse.text();
        
        // Should contain static pages
        expect(pagesSitemapContent).toContain('<urlset');
        expect(pagesSitemapContent).toMatch(/\/about|\/search|\/glossary/);
      }
    });
  });
});