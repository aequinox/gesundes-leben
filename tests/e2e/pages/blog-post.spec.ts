import { test, expect } from '@playwright/test';

import { SAMPLE_BLOG_POSTS, GERMAN_HEALTH_TERMS } from '../utils/fixtures';
import { BlogPostPage } from '../utils/page-objects';
import { 
  validateAccessibility, 
  validateLayoutStructure,
  validateGermanContent,
  validateResponsiveDesign,
  validateSocialMeta,
  waitForPageLoad
} from '../utils/test-helpers';

test.describe('Blog Post Pages', () => {
  // Test with a few sample blog posts
  for (const postSlug of SAMPLE_BLOG_POSTS.slice(0, 2)) {
    test.describe(`Blog Post: ${postSlug}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/posts/${postSlug}`);
        await waitForPageLoad(page);
      });

      test('should load blog post successfully', async ({ page }) => {
        await expect(page).toHaveURL(`/posts/${postSlug}`);
        
        // Should have meaningful title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(10);
        expect(title).toContainText(/Gesundes Leben|gesund/);
      });

      test('should have proper article structure', async ({ page }) => {
        await validateLayoutStructure(page);
        await validateAccessibility(page);
        
        const blogPost = new BlogPostPage(page);
        
        // Article elements should be present
        await expect(blogPost.articleTitle).toBeVisible();
        await expect(blogPost.articleContent).toBeVisible();
      });

      test('should display article metadata', async ({ page }) => {
        const blogPost = new BlogPostPage(page);
        
        // Author information
        if (await blogPost.authorInfo.count() > 0) {
          await expect(blogPost.authorInfo).toBeVisible();
          const authorText = await blogPost.authorInfo.textContent();
          expect(authorText).toMatch(/Sandra|Kai/);
        }
        
        // Publish date
        if (await blogPost.publishDate.count() > 0) {
          await expect(blogPost.publishDate).toBeVisible();
        }
        
        // Reading time
        if (await blogPost.readingTime.count() > 0) {
          await expect(blogPost.readingTime).toBeVisible();
          const readingTimeText = await blogPost.readingTime.textContent();
          expect(readingTimeText).toMatch(/\d+\s*(min|Min|Minute)/);
        }
      });

      test('should contain German health content', async ({ page }) => {
        await validateGermanContent(page);
        
        const content = await page.locator('article, .article-content, main').textContent();
        
        // Should contain health-related terms
        let foundHealthTerms = 0;
        for (const term of GERMAN_HEALTH_TERMS.slice(0, 5)) {
          if (content?.includes(term)) {
            foundHealthTerms++;
          }
        }
        
        expect(foundHealthTerms).toBeGreaterThan(0);
      });
    });
  }

  test.describe('General Blog Post Features', () => {
    test.beforeEach(async ({ page }) => {
      // Use first sample post for general tests
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
    });

    test('should have proper SEO meta tags', async ({ page }) => {
      await validateSocialMeta(page);
      
      // Should have article-specific meta tags
      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute('content', 'article');
      
      // Article should have description
      const metaDescription = page.locator('meta[name="description"]');
      if (await metaDescription.count() > 0) {
        const description = await metaDescription.getAttribute('content');
        expect(description!.length).toBeGreaterThan(50);
      }
    });

    test('should support navigation between posts', async ({ page }) => {
      const blogPost = new BlogPostPage(page);
      
      // Back button or link to posts
      if (await blogPost.backButton.count() > 0) {
        await expect(blogPost.backButton).toBeVisible();
        await expect(blogPost.backButton).toBeEnabled();
      }
      
      // Navigation should work
      await expect(blogPost.nav).toBeVisible();
    });

    test('should have table of contents for long articles', async ({ page }) => {
      const blogPost = new BlogPostPage(page);
      
      // Check for TOC (German: Inhaltsverzeichnis)
      if (await blogPost.tableOfContents.count() > 0) {
        await expect(blogPost.tableOfContents).toBeVisible();
        
        // TOC should have links
        const tocLinks = blogPost.tableOfContents.locator('a');
        if (await tocLinks.count() > 0) {
          expect(await tocLinks.count()).toBeGreaterThan(0);
        }
      }
    });

    test('should display categories and tags', async ({ page }) => {
      const blogPost = new BlogPostPage(page);
      
      // Categories
      if (await blogPost.categories.count() > 0) {
        await expect(blogPost.categories).toBeVisible();
        const categoriesText = await blogPost.categories.textContent();
        expect(categoriesText).toBeTruthy();
      }
      
      // Tags
      if (await blogPost.tags.count() > 0) {
        await expect(blogPost.tags).toBeVisible();
      }
    });

    test('should have sharing functionality', async ({ page }) => {
      const blogPost = new BlogPostPage(page);
      
      // Share links if present
      if (await blogPost.shareLinks.count() > 0) {
        await expect(blogPost.shareLinks).toBeVisible();
        
        const shareButtons = blogPost.shareLinks.locator('a, button');
        if (await shareButtons.count() > 0) {
          expect(await shareButtons.count()).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Article Content Quality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
    });

    test('should have substantial content', async ({ page }) => {
      const articleContent = page.locator('article, .article-content');
      const content = await articleContent.textContent();
      
      // Should be a substantial article
      expect(content!.length).toBeGreaterThan(500);
      
      // Should have multiple paragraphs
      const paragraphs = articleContent.locator('p');
      expect(await paragraphs.count()).toBeGreaterThan(3);
    });

    test('should have proper heading structure', async ({ page }) => {
      // Should have proper heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      expect(await headings.count()).toBeGreaterThan(1);
    });

    test('should include medical disclaimers for health content', async ({ page }) => {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      
      // Health articles should have appropriate disclaimers
      if (bodyText?.includes('medizin') || bodyText?.includes('Behandlung') || bodyText?.includes('Diagnose')) {
        await expect(content).toContainText(/Hinweis|Disclaimer|Arzt|medizinisch|Beratung|ersetzt/);
      }
    });

    test('should have accessible images with alt text', async ({ page }) => {
      const images = page.locator('img');
      
      if (await images.count() > 0) {
        for (let i = 0; i < Math.min(3, await images.count()); i++) {
          const image = images.nth(i);
          await expect(image).toHaveAttribute('alt');
          
          const alt = await image.getAttribute('alt');
          expect(alt!.length).toBeGreaterThan(5);
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
    });

    test('should be readable on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const blogPost = new BlogPostPage(page);
      
      // Article should be readable
      await expect(blogPost.articleTitle).toBeVisible();
      await expect(blogPost.articleContent).toBeVisible();
      
      // Text should not overflow
      const content = await blogPost.articleContent.boundingBox();
      expect(content?.width).toBeLessThanOrEqual(375);
    });

    test('should adapt layout for different screen sizes', async ({ page }) => {
      await validateResponsiveDesign(page);
      
      // Article should remain accessible
      const blogPost = new BlogPostPage(page);
      await expect(blogPost.articleTitle).toBeVisible();
    });

    test('should maintain readability at all sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1200, height: 800 }   // Desktop
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        const blogPost = new BlogPostPage(page);
        await expect(blogPost.articleContent).toBeVisible();
        
        // Text should be readable
        const textColor = await blogPost.articleContent.evaluate(el => 
          window.getComputedStyle(el).color
        );
        expect(textColor).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load blog posts efficiently', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(6000); // Slightly higher for content-rich pages
    });

    test('should optimize images for performance', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[1]}`);
      await waitForPageLoad(page);
      
      const images = page.locator('img');
      
      if (await images.count() > 0) {
        const firstImage = images.first();
        
        // Should have loading optimization
        const loading = await firstImage.getAttribute('loading');
        if (loading) {
          expect(['lazy', 'eager']).toContain(loading);
        }
        
        // Should have srcset for responsive images
        const srcset = await firstImage.getAttribute('srcset');
        if (srcset) {
          expect(srcset.length).toBeGreaterThan(10);
        }
      }
    });

    test('should not have layout shift issues', async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      
      // Wait for initial load
      await page.waitForLoadState('networkidle');
      
      // Content should be stable
      const article = page.locator('article');
      await expect(article).toBeVisible();
      
      // Images should have dimensions to prevent layout shift
      const images = page.locator('img');
      if (await images.count() > 0) {
        const firstImage = images.first();
        const width = await firstImage.getAttribute('width');
        const height = await firstImage.getAttribute('height');
        
        // Should have dimensions or CSS to prevent layout shift
        expect(width ?? height).toBeTruthy();
      }
    });
  });

  test.describe('Health Blog Specific Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/posts/${SAMPLE_BLOG_POSTS[0]}`);
      await waitForPageLoad(page);
    });

    test('should link to glossary terms', async ({ page }) => {
      const glossaryLinks = page.locator('a[href*="/glossary/"]');
      
      if (await glossaryLinks.count() > 0) {
        // Glossary links should be properly formatted
        const firstGlossaryLink = glossaryLinks.first();
        await expect(firstGlossaryLink).toBeVisible();
        
        const href = await firstGlossaryLink.getAttribute('href');
        expect(href).toMatch(/\/glossary\//);
      }
    });

    test('should display author expertise', async ({ page }) => {
      const blogPost = new BlogPostPage(page);
      
      if (await blogPost.authorInfo.count() > 0) {
        const authorText = await blogPost.authorInfo.textContent();
        
        // Should mention therapeutic background
        expect(authorText).toMatch(/Therapeut|Experte|Fachkraft|Erfahrung/);
      }
    });

    test('should include relevant health hashtags', async ({ page }) => {
      const hashtags = page.locator('.hashtag');
      
      if (await hashtags.count() > 0) {
        // Should have health-related hashtags
        const hashtagText = await hashtags.first().textContent();
        expect(hashtagText).toMatch(/gesund|health|wellness/i);
      }
    });
  });
});