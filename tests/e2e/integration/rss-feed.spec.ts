import { test, expect } from '@playwright/test';

import { RSS_FEED_REQUIREMENTS } from '../utils/fixtures';

test.describe('RSS Feed Integration', () => {
  test.describe('RSS Feed Availability and Format', () => {
    test('should serve RSS feed at /rss.xml', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      
      expect(response).toBeTruthy();
      expect(response!.status()).toBe(200);
      
      // Should have correct content type
      const contentType = response!.headers()['content-type'];
      expect(contentType).toMatch(/xml|rss/);
    });

    test('should have valid RSS XML structure', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should contain required RSS elements
      for (const element of RSS_FEED_REQUIREMENTS.elements) {
        expect(rssContent).toContain(`<${element}`);
      }
      
      // Should be valid XML
      expect(rssContent).toMatch(/^<\?xml/);
      expect(rssContent).toContain('<rss');
      expect(rssContent).toContain('</rss>');
    });

    test('should include channel metadata', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should have channel title and description
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<link>');
      
      // Should include German health blog information
      expect(rssContent).toMatch(/Gesundheit|Health|Wellness|Ernährung/);
    });
  });

  test.describe('RSS Feed Content', () => {
    test('should include recent blog posts', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should have multiple items
      const itemMatches = rssContent.match(/<item>/g);
      expect(itemMatches).toBeTruthy();
      expect(itemMatches!.length).toBeGreaterThan(0);
      
      // Items should have required elements
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('<description>');
      expect(rssContent).toContain('<pubDate>');
    });

    test('should have proper German content in feed', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should contain German health content
      expect(rssContent).toMatch(/Gesundheit|Ernährung|Vitamin|Immunsystem|Wellness/);
      
      // Should have German language specification
      expect(rssContent).toMatch(/language>de|xml:lang="de"/);
    });

    test('should include complete post information', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should include author information
      if (rssContent.includes('<author>') || rssContent.includes('<dc:creator>')) {
        expect(rssContent).toMatch(/Sandra|Kai|Therapeut/);
      }
      
      // Should include categories
      if (rssContent.includes('<category>')) {
        expect(rssContent).toMatch(/Ernährung|Gesundheit|Vitamin|Immunsystem/);
      }
      
      // Links should be absolute URLs
      const linkMatches = rssContent.match(/<link>([^<]+)<\/link>/g);
      if (linkMatches) {
        for (const link of linkMatches.slice(0, 3)) {
          expect(link).toMatch(/https?:\/\//);
        }
      }
    });
  });

  test.describe('RSS Feed Discovery', () => {
    test('should be discoverable from homepage', async ({ page }) => {
      await page.goto('/');
      
      // Should have RSS feed link in head
      const rssLink = page.locator('link[type="application/rss+xml"]');
      await expect(rssLink).toBeAttached();
      
      const href = await rssLink.getAttribute('href');
      expect(href).toMatch(/rss\.xml$/);
    });

    test('should have RSS feed links in footer/navigation', async ({ page }) => {
      await page.goto('/');
      
      // Should have RSS feed link accessible to users
      const rssLinks = page.locator('a[href="/rss.xml"], a[href*="rss"]');
      
      if (await rssLinks.count() > 0) {
        await expect(rssLinks.first()).toBeVisible();
        
        // Link should have appropriate text or icon
        const linkText = await rssLinks.first().textContent();
        const linkHtml = await rssLinks.first().innerHTML();
        
        expect(linkText ?? linkHtml).toMatch(/RSS|Feed|Abonnieren|Subscribe/i);
      }
    });
  });

  test.describe('RSS Feed Performance', () => {
    test('should load RSS feed quickly', async ({ page }) => {
      const startTime = Date.now();
      
      const response = await page.goto('/rss.xml');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
      
      expect(response!.status()).toBe(200);
    });

    test('should have reasonable RSS feed size', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // RSS feed should not be excessively large
      expect(rssContent.length).toBeLessThan(500000); // 500KB max
      expect(rssContent.length).toBeGreaterThan(1000); // Should have content
    });

    test('should handle RSS feed caching', async ({ page }) => {
      // First request
      const response1 = await page.goto('/rss.xml');
      const headers1 = response1!.headers();
      
      // Should have cache headers
      expect(headers1['cache-control'] || headers1['etag'] || headers1['last-modified']).toBeTruthy();
      
      // Second request
      await page.reload();
      const response2 = await page.goto('/rss.xml');
      
      expect(response2!.status()).toBe(200);
    });
  });

  test.describe('RSS Feed Validation', () => {
    test('should have valid publication dates', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Extract publication dates
      const pubDateMatches = rssContent.match(/<pubDate>([^<]+)<\/pubDate>/g);
      
      if (pubDateMatches) {
        for (const pubDateMatch of pubDateMatches.slice(0, 3)) {
          const dateString = pubDateMatch.replace(/<\/?pubDate>/g, '');
          
          // Should be valid RFC 2822 date format
          const date = new Date(dateString);
          expect(date.getTime()).not.toBeNaN();
          
          // Should be reasonable date (not in far future)
          expect(date.getTime()).toBeLessThan(Date.now() + 86400000); // Within 1 day
        }
      }
    });

    test('should escape XML content properly', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should not contain unescaped HTML entities
      expect(rssContent).not.toMatch(/[<>&](?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/);
      
      // German characters should be properly encoded
      if (rssContent.includes('ä') || rssContent.includes('ö') || rssContent.includes('ü')) {
        // Should be valid UTF-8 or properly escaped
        expect(rssContent).toMatch(/encoding="UTF-8"|encoding="utf-8"/i);
      }
    });

    test('should include required RSS 2.0 elements', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      const rssContent = await response!.text();
      
      // Should specify RSS version
      expect(rssContent).toMatch(/<rss[^>]+version="2\.0"/);
      
      // Channel should have required elements
      expect(rssContent).toContain('<title>');
      expect(rssContent).toContain('<link>');
      expect(rssContent).toContain('<description>');
      
      // Items should have required elements
      const hasItems = rssContent.includes('<item>');
      if (hasItems) {
        expect(rssContent).toMatch(/<item>[\s\S]*?<title>[\s\S]*?<\/title>[\s\S]*?<\/item>/);
        expect(rssContent).toMatch(/<item>[\s\S]*?<link>[\s\S]*?<\/link>[\s\S]*?<\/item>/);
      }
    });
  });
});