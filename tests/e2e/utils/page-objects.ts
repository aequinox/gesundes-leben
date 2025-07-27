import type { Page, Locator } from '@playwright/test';

/**
 * Base page object for common elements
 */
export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly main: Locator;
  readonly nav: Locator;
  readonly rssLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header[role="banner"]');
    this.footer = page.locator('footer');
    this.main = page.locator('main');
    this.nav = page.locator('nav');
    this.rssLink = page.locator('a[href="/rss.xml"]');
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // Allow for animations
  }
}

/**
 * Homepage specific page object
 */
export class HomePage extends BasePage {
  readonly heroSection: Locator;
  readonly mainHeading: Locator;
  readonly welcomeHeading: Locator;
  readonly featuredSection: Locator;
  readonly recentSection: Locator;
  readonly allPostsButton: Locator;
  readonly socialLinks: Locator;
  readonly glossaryLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('#hero');
    this.mainHeading = page.locator('h1');
    this.welcomeHeading = page.locator('h2').first();
    this.featuredSection = page.locator('#featured');
    this.recentSection = page.locator('#recent-posts');
    this.allPostsButton = page.locator('a[href="/posts/"]');
    this.socialLinks = page.locator('.social-links');
    this.glossaryLink = this.heroSection.locator('a[href="/glossary/"]');
  }

  async goto() {
    await super.goto('/');
  }

  async validateHeroContent() {
    await this.mainHeading.waitFor();
    await this.welcomeHeading.waitFor();
    await this.glossaryLink.waitFor();
  }
}

/**
 * Search page specific page object
 */
export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly resultsCount: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[type="search"], input#pagefind-search');
    this.searchResults = page.locator('#pagefind-results, .search-results');
    this.resultsCount = page.locator('.results-count, .pagefind-results');
    this.noResults = page.locator('.no-results, .pagefind-zero-results');
  }

  async goto() {
    await super.goto('/search');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1000); // Wait for search results
  }
}

/**
 * Blog post page object
 */
export class BlogPostPage extends BasePage {
  readonly articleTitle: Locator;
  readonly articleContent: Locator;
  readonly authorInfo: Locator;
  readonly publishDate: Locator;
  readonly categories: Locator;
  readonly tags: Locator;
  readonly readingTime: Locator;
  readonly tableOfContents: Locator;
  readonly backButton: Locator;
  readonly shareLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.articleTitle = page.locator('h1');
    this.articleContent = page.locator('article, .article-content');
    this.authorInfo = page.locator('.author-info, .post-author');
    this.publishDate = page.locator('.publish-date, .post-date');
    this.categories = page.locator('.categories, .post-categories');
    this.tags = page.locator('.tags, .post-tags');
    this.readingTime = page.locator('.reading-time');
    this.tableOfContents = page.locator('#toc, #inhaltsverzeichnis');
    this.backButton = page.locator('.back-button, [href="/posts/"]');
    this.shareLinks = page.locator('.share-links');
  }

  async gotoPost(slug: string) {
    await super.goto(`/posts/${slug}`);
  }
}

/**
 * Author page object
 */
export class AuthorPage extends BasePage {
  readonly authorName: Locator;
  readonly authorBio: Locator;
  readonly authorImage: Locator;
  readonly authorArticles: Locator;
  readonly contactInfo: Locator;
  readonly socialLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.authorName = page.locator('h1');
    this.authorBio = page.locator('.author-bio, .bio, .author-description');
    this.authorImage = page.locator('.author-image img, .author-photo img');
    this.authorArticles = page.locator('.author-articles, .author-posts, .posts-by-author');
    this.contactInfo = page.locator('.contact-info, .author-contact');
    this.socialLinks = page.locator('.social-links, .author-social');
  }

  async gotoAuthor(authorSlug: string) {
    await super.goto(`/author/${authorSlug}`);
  }
}

/**
 * Glossary page object
 */
export class GlossaryPage extends BasePage {
  readonly termsList: Locator;
  readonly termCards: Locator;
  readonly alphabetIndex: Locator;
  readonly termName: Locator;
  readonly termDefinition: Locator;
  readonly relatedTerms: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.termsList = page.locator('.terms-list, .glossary-list');
    this.termCards = page.locator('.term-card, .glossary-entry, .term-item');
    this.alphabetIndex = page.locator('.alphabet-index, .alphabet-navigation, .letter-nav');
    this.termName = page.locator('h1, .term-name');
    this.termDefinition = page.locator('.term-definition, .definition, .term-content');
    this.relatedTerms = page.locator('.related-terms, .see-also');
    this.searchInput = page.locator('input[type="search"], .glossary-search input');
  }

  async goto() {
    await super.goto('/glossary');
  }

  async searchTerm(term: string) {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.fill(term);
      await this.page.waitForTimeout(500);
    }
  }
}

/**
 * Categories page object
 */
export class CategoriesPage extends BasePage {
  readonly categoriesList: Locator;
  readonly categoryCards: Locator;

  constructor(page: Page) {
    super(page);
    this.categoriesList = page.locator('.categories-list');
    this.categoryCards = page.locator('.category-card');
  }

  async goto() {
    await super.goto('/categories');
  }
}

/**
 * Navigation component object
 */
export class Navigation {
  readonly page: Page;
  readonly mobileMenuButton: Locator;
  readonly mobileMenu: Locator;
  readonly navLinks: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileMenuButton = page.locator('.mobile-menu-button, .menu-toggle');
    this.mobileMenu = page.locator('#mobile-menu, .mobile-nav');
    this.navLinks = page.locator('nav a');
    this.themeToggle = page.locator('.theme-toggle, #theme-btn');
  }

  async openMobileMenu() {
    if (await this.mobileMenuButton.isVisible()) {
      await this.mobileMenuButton.click();
      await this.mobileMenu.waitFor();
    }
  }

  async closeMobileMenu() {
    if (await this.mobileMenu.isVisible()) {
      await this.mobileMenuButton.click();
      await this.mobileMenu.waitFor({ state: 'hidden' });
    }
  }

  async toggleTheme() {
    if (await this.themeToggle.count() > 0) {
      await this.themeToggle.click();
      await this.page.waitForTimeout(300); // Wait for theme transition
    }
  }
}