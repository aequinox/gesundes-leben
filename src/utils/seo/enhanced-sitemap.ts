/**
 * @file enhanced-sitemap.ts
 * @description Advanced sitemap generation utilities with health content optimization
 *
 * Features:
 * - Priority-based URL ranking
 * - German content optimization
 * - Health category prioritization
 * - Mobile-first indexing hints
 * - News sitemap generation
 * - Image sitemap integration
 */
import type { CollectionEntry } from "astro:content";

import { SITE } from "@/config";

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  images?: Array<{
    url: string;
    title?: string;
    caption?: string;
  }>;
  news?: {
    title: string;
    publicationDate: Date;
    language: string;
  };
}

export interface SitemapConfig {
  /** Base URL for the site */
  baseUrl: string;
  /** Default change frequency */
  defaultChangeFreq: SitemapEntry["changeFrequency"];
  /** Default priority */
  defaultPriority: number;
  /** Maximum URLs per sitemap file */
  maxUrls: number;
  /** Include news sitemap */
  includeNews: boolean;
  /** Include images */
  includeImages: boolean;
}

const DEFAULT_CONFIG: SitemapConfig = {
  baseUrl: SITE.website,
  defaultChangeFreq: "weekly",
  defaultPriority: 0.5,
  maxUrls: 50000,
  includeNews: false,
  includeImages: true,
};

/**
 * Enhanced sitemap generator with German health content optimization
 */
export class EnhancedSitemapGenerator {
  private config: SitemapConfig;

  constructor(config: Partial<SitemapConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate priority based on content type and category
   */
  private calculatePriority(
    type: "homepage" | "article" | "category" | "page" | "archive",
    category?: string,
    isHealthContent = false,
    isFeatured = false
  ): number {
    let priority = this.config.defaultPriority;

    // Base priorities by type
    switch (type) {
      case "homepage":
        priority = 1.0;
        break;
      case "article":
        priority = 0.8;
        break;
      case "category":
        priority = 0.7;
        break;
      case "page":
        priority = 0.6;
        break;
      case "archive":
        priority = 0.4;
        break;
    }

    // Health content boost
    if (isHealthContent) {
      priority += 0.1;
    }

    // Featured content boost
    if (isFeatured) {
      priority += 0.1;
    }

    // Category-specific adjustments
    if (category) {
      const healthCategories = [
        "gesundheit",
        "ernährung",
        "fitness",
        "wellness",
      ];
      if (healthCategories.some(cat => category.toLowerCase().includes(cat))) {
        priority += 0.05;
      }
    }

    return Math.min(priority, 1.0);
  }

  /**
   * Determine change frequency based on content type
   */
  private getChangeFrequency(
    type: "homepage" | "article" | "category" | "page" | "archive",
    publishDate?: Date,
    modifiedDate?: Date
  ): SitemapEntry["changeFrequency"] {
    const now = new Date();
    const daysSinceModified = modifiedDate
      ? Math.floor(
          (now.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 365;

    switch (type) {
      case "homepage":
        return "daily";
      case "article":
        if (daysSinceModified < 7) {
          return "weekly";
        }
        if (daysSinceModified < 30) {
          return "monthly";
        }
        return "yearly";
      case "category":
        return "weekly";
      case "page":
        return "monthly";
      case "archive":
        return "monthly";
      default:
        return this.config.defaultChangeFreq;
    }
  }

  /**
   * Generate sitemap entry for blog post
   */
  generateBlogPostEntry(post: CollectionEntry<"blog">): SitemapEntry {
    const url = `${this.config.baseUrl}/posts/${post.id}/`;
    const isHealthContent = this.isHealthContent(post);

    const images = post.data.heroImage
      ? [
          {
            url:
              typeof post.data.heroImage.src === "string"
                ? new URL(post.data.heroImage.src, this.config.baseUrl).href
                : post.data.heroImage.src.src,
            title: post.data.title,
            caption: post.data.heroImage.alt,
          },
        ]
      : [];

    const entry: SitemapEntry = {
      url,
      lastModified: post.data.modDatetime || post.data.pubDatetime,
      changeFrequency: this.getChangeFrequency(
        "article",
        post.data.pubDatetime,
        post.data.modDatetime
      ),
      priority: this.calculatePriority(
        "article",
        post.data.categories[0],
        isHealthContent,
        post.data.featured
      ),
    };

    if (this.config.includeImages && images.length > 0) {
      entry.images = images;
    }

    // Add news entry for recent health articles
    if (
      this.config.includeNews &&
      isHealthContent &&
      this.isRecentContent(post.data.pubDatetime)
    ) {
      entry.news = {
        title: post.data.title,
        publicationDate: post.data.pubDatetime,
        language: "de",
      };
    }

    return entry;
  }

  /**
   * Generate sitemap entry for static page
   */
  generatePageEntry(
    path: string,
    type: "homepage" | "category" | "page" | "archive",
    lastModified?: Date,
    category?: string
  ): SitemapEntry {
    const url =
      path === "/"
        ? this.config.baseUrl
        : `${this.config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    return {
      url: url.endsWith("/") ? url : `${url}/`,
      lastModified: lastModified || new Date(),
      changeFrequency: this.getChangeFrequency(type),
      priority: this.calculatePriority(type, category),
    };
  }

  /**
   * Check if content is health-related
   */
  private isHealthContent(post: CollectionEntry<"blog">): boolean {
    const healthKeywords = [
      "gesundheit",
      "ernährung",
      "fitness",
      "wellness",
      "medizin",
      "therapie",
      "gesund",
      "nährstoff",
      "vitamin",
      "mineral",
      "diät",
      "abnehmen",
      "prevention",
      "heilung",
    ];

    const contentText =
      `${post.data.title} ${post.data.description} ${post.data.tags.join(" ")} ${post.data.categories.join(" ")}`.toLowerCase();

    return healthKeywords.some(keyword => contentText.includes(keyword));
  }

  /**
   * Check if content is recent (within last 2 days for news sitemap)
   */
  private isRecentContent(publishDate: Date): boolean {
    const now = new Date();
    const daysSincePublished = Math.floor(
      (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSincePublished <= 2;
  }

  /**
   * Generate XML sitemap from entries
   */
  generateSitemapXML(entries: SitemapEntry[]): string {
    const urlElements = entries
      .map(entry => {
        let xml = `  <url>\n    <loc>${entry.url}</loc>\n`;

        if (entry.lastModified) {
          xml += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
        }

        if (entry.changeFrequency) {
          xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
        }

        if (entry.priority !== undefined) {
          xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
        }

        // Add image information
        if (entry.images && entry.images.length > 0) {
          entry.images.forEach(image => {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${image.url}</image:loc>\n`;
            if (image.title) {
              xml += `      <image:title>${this.escapeXml(image.title)}</image:title>\n`;
            }
            if (image.caption) {
              xml += `      <image:caption>${this.escapeXml(image.caption)}</image:caption>\n`;
            }
            xml += `    </image:image>\n`;
          });
        }

        xml += `  </url>`;
        return xml;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Generate news sitemap XML
   */
  generateNewsSitemapXML(entries: SitemapEntry[]): string {
    const newsEntries = entries.filter(entry => entry.news);

    if (newsEntries.length === 0) {
      return "";
    }

    const urlElements = newsEntries
      .map(entry => {
        const news = entry.news!;
        return `  <url>
    <loc>${entry.url}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE.title}</news:name>
        <news:language>${news.language}</news:language>
      </news:publication>
      <news:publication_date>${news.publicationDate.toISOString()}</news:publication_date>
      <news:title>${this.escapeXml(news.title)}</news:title>
    </news:news>
  </url>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Escape XML characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
}

/**
 * Generate comprehensive sitemap entries for the site
 */
export function generateSitemapEntries(
  blogPosts: CollectionEntry<"blog">[],
  staticPages: Array<{
    path: string;
    type: "page" | "category";
    lastModified?: Date;
  }> = []
): SitemapEntry[] {
  const generator = new EnhancedSitemapGenerator({
    includeNews: true,
    includeImages: true,
  });

  const entries: SitemapEntry[] = [];

  // Homepage
  entries.push(generator.generatePageEntry("/", "homepage"));

  // Blog posts
  blogPosts
    .filter(post => !post.data.draft)
    .forEach(post => {
      entries.push(generator.generateBlogPostEntry(post));
    });

  // Static pages
  staticPages.forEach(page => {
    entries.push(
      generator.generatePageEntry(page.path, page.type, page.lastModified)
    );
  });

  // Category pages
  const categories = [
    "gesundheit",
    "ernährung",
    "fitness",
    "wellness",
    "lifestyle",
  ];
  categories.forEach(category => {
    entries.push(
      generator.generatePageEntry(
        `/categories/${category}/`,
        "category",
        new Date(),
        category
      )
    );
  });

  // Archive pages
  entries.push(generator.generatePageEntry("/posts/", "archive"));
  entries.push(generator.generatePageEntry("/search/", "page"));
  entries.push(generator.generatePageEntry("/about/", "page"));
  entries.push(generator.generatePageEntry("/contact/", "page"));

  return entries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
