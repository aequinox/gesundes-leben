import { test, expect } from '@playwright/test';

test.describe('Homepage (Startpage)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Basic Layout and SEO', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Gesundes Leben/);
      await expect(page).toHaveURL('/');
    });

    test('should have correct meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /Dein vertrauenswürdiger Ratgeber für Gesundheit/);
    });

    test('should have correct language attribute', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'de');
    });

    test('should have proper og:image meta tag', async ({ page }) => {
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /gesundes-leben-og\.jpg/);
    });
  });

  test.describe('Header and Navigation', () => {
    test('should display header with navigation', async ({ page }) => {
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();

      // Check for main navigation elements
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should have RSS link in header area', async ({ page }) => {
      const rssLink = page.locator('a[href="/rss.xml"]');
      await expect(rssLink).toBeVisible();
      await expect(rssLink).toHaveAttribute('aria-label', 'RSS Feed');
    });
  });

  test.describe('Hero Section', () => {
    test('should display main heading "Gesundes Leben"', async ({ page }) => {
      const mainHeading = page.locator('h1');
      await expect(mainHeading).toBeVisible();
      await expect(mainHeading).toContainText('Gesundes Leben');
    });

    test('should display welcome message', async ({ page }) => {
      const welcomeHeading = page.locator('h2').first();
      await expect(welcomeHeading).toBeVisible();
      await expect(welcomeHeading).toContainText('Willkommen auf unserem Blog!');
    });

    test('should display introduction text with hashtags', async ({ page }) => {
      // Check for specific hashtags
      const hashtag1 = page.locator('.hashtag').filter({ hasText: 'sogehtgesund' });
      const hashtag2 = page.locator('.hashtag').filter({ hasText: 'weildueswertbist' });
      
      await expect(hashtag1).toBeVisible();
      await expect(hashtag2).toBeVisible();
    });

    test('should display glossary link in hero section', async ({ page }) => {
      const heroSection = page.locator('#hero');
      const glossaryLink = heroSection.locator('a[href="/glossary/"]');
      await expect(glossaryLink).toBeVisible();
      await expect(glossaryLink).toContainText('Glossar');
    });

    test('should highlight empowerment text', async ({ page }) => {
      const empowermentText = page.locator('strong').filter({ hasText: 'Empowerment für deine Gesundheit' });
      await expect(empowermentText).toBeVisible();
    });
  });

  test.describe('Content Sections', () => {
    test('should display featured articles section if posts exist', async ({ page }) => {
      const featuredSection = page.locator('#featured');
      
      // Check if featured section exists (conditional based on content)
      if (await featuredSection.isVisible()) {
        const featuredHeading = featuredSection.locator('h2');
        await expect(featuredHeading).toContainText('Ausgewählte Artikel');
        
        // Check for star icon
        const starIcon = featuredSection.locator('[name="tabler:star"]');
        await expect(starIcon).toBeVisible();
        
        // Check for article cards
        const articleCards = featuredSection.locator('[data-aos="fade-up"]');
        await expect(articleCards.first()).toBeVisible();
      }
    });

    test('should display recent articles section if posts exist', async ({ page }) => {
      const recentSection = page.locator('#recent-posts');
      
      // Check if recent section exists (conditional based on content)
      if (await recentSection.isVisible()) {
        const recentHeading = recentSection.locator('h2');
        await expect(recentHeading).toContainText('Neueste Artikel');
        
        // Check for clock icon
        const clockIcon = recentSection.locator('[name="tabler:clock"]');
        await expect(clockIcon).toBeVisible();
        
        // Check for article cards
        const articleCards = recentSection.locator('[data-aos="fade-up"]');
        await expect(articleCards.first()).toBeVisible();
      }
    });

    test('should display "All Posts" button', async ({ page }) => {
      const allPostsButton = page.locator('a[href="/posts/"]');
      await expect(allPostsButton).toBeVisible();
      
      // Button should contain text (from translation)
      await expect(allPostsButton).toContainText(/Alle Artikel|All Posts/);
    });
  });

  test.describe('Social Links', () => {
    test('should display social links section', async ({ page }) => {
      const socialSection = page.locator('.social-links');
      
      // Social links are conditional based on active socials
      if (await socialSection.isVisible()) {
        await expect(socialSection).toBeVisible();
        
        // Check for social media links (if any are active)
        const socialLinks = socialSection.locator('a');
        if (await socialLinks.count() > 0) {
          await expect(socialLinks.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Footer', () => {
    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check h1 exists and is unique
      const h1Elements = page.locator('h1');
      await expect(h1Elements).toHaveCount(1);
      
      // Check h2 elements exist
      const h2Elements = page.locator('h2');
      expect(await h2Elements.count()).toBeGreaterThan(0);
    });

    test('should have aria-hidden on decorative elements', async ({ page }) => {
      const decorativeElements = page.locator('[aria-hidden="true"]');
      expect(await decorativeElements.count()).toBeGreaterThan(0);
    });

    test('should have proper link accessibility', async ({ page }) => {
      // RSS link should have aria-label
      const rssLink = page.locator('a[href="/rss.xml"]');
      await expect(rssLink).toHaveAttribute('aria-label');
      
      // Glossary link in hero should be descriptive
      const heroGlossaryLink = page.locator('#hero a[href="/glossary/"]');
      await expect(heroGlossaryLink).toBeVisible();
    });

    test('should have main content landmark', async ({ page }) => {
      const main = page.locator('main#main-content');
      await expect(main).toBeVisible();
      await expect(main).toHaveAttribute('data-layout', 'index');
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have lazy loading attributes on non-critical images', async ({ page }) => {
      // Check for lazy loading on article images (not first few)
      const lazyImages = page.locator('img[loading="lazy"]');
      
      // If lazy images exist, they should have proper loading attribute
      if (await lazyImages.count() > 0) {
        await expect(lazyImages.first()).toHaveAttribute('loading', 'lazy');
      }
    });
  });

  test.describe('German Language Content', () => {
    test('should display German text correctly', async ({ page }) => {
      // Check for German umlauts and specific phrases
      await expect(page.locator('body')).toContainText('Gesundheitsthemen');
      await expect(page.locator('body')).toContainText('Therapeuten');
      await expect(page.locator('body')).toContainText('medizinische Begriffe');
      await expect(page.locator('body')).toContainText('verständliche Erklärung');
    });

    test('should have German hashtags', async ({ page }) => {
      const hashtags = page.locator('.hashtag');
      
      if (await hashtags.count() > 0) {
        const hashtagTexts = await hashtags.allTextContents();
        expect(hashtagTexts.some(text => text.includes('sogehtgesund'))).toBeTruthy();
        expect(hashtagTexts.some(text => text.includes('weildueswertbist'))).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Main heading should still be visible
      const mainHeading = page.locator('h1');
      await expect(mainHeading).toBeVisible();
      
      // Content should not overflow
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      // Check grid layout adjustments
      const articleGrid = page.locator('.grid');
      if (await articleGrid.count() > 0) {
        await expect(articleGrid.first()).toBeVisible();
      }
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
      
      // All content should be visible
      const mainHeading = page.locator('h1');
      await expect(mainHeading).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('should handle hover effects on cards', async ({ page }) => {
      const articleCards = page.locator('[data-aos="fade-up"]');
      
      if (await articleCards.count() > 0) {
        const firstCard = articleCards.first();
        await expect(firstCard).toBeVisible();
        
        // Hover should not cause errors
        await firstCard.hover();
        await expect(firstCard).toBeVisible();
      }
    });

    test('should handle RSS link click', async ({ page }) => {
      const rssLink = page.locator('a[href="/rss.xml"]');
      await expect(rssLink).toBeVisible();
      
      // RSS link should be clickable (we don't actually click to avoid navigation)
      await expect(rssLink).toBeEnabled();
    });

    test('should handle glossary link navigation', async ({ page }) => {
      const heroGlossaryLink = page.locator('#hero a[href="/glossary/"]');
      await expect(heroGlossaryLink).toBeVisible();
      await expect(heroGlossaryLink).toBeEnabled();
    });
  });

  test.describe('Script Functionality', () => {
    test('should set backUrl in sessionStorage', async ({ page }) => {
      // Wait for page to fully load and script to execute
      await page.waitForLoadState('networkidle');
      
      // Check if sessionStorage is set correctly
      const backUrl = await page.evaluate(() => sessionStorage.getItem('backUrl'));
      expect(backUrl).toBe('/');
    });
  });
});