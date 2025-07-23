/**
 * @file seo.ts
 * @description Centralized SEO configuration for robots.txt, sitemaps, and crawling policies
 *
 * Implements industry best practices for:
 * - Search engine crawling optimization
 * - AI scraper protection
 * - Performance-optimized crawl delays
 * - German health content compliance
 */
import { SITE } from "../config";

import type { SupportedLanguage } from "./i18n";

/**
 * Robots.txt policy interface
 */
export interface RobotPolicy {
  userAgent: string;
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
  sitemap?: string | string[];
}

/**
 * SEO configuration interface
 */
export interface SEOConfig {
  sitemap: {
    baseUrls: string[];
    priority: {
      homepage: number;
      articles: number;
      pages: number;
      archives: number;
    };
    changefreq: {
      homepage: string;
      articles: string;
      pages: string;
      archives: string;
    };
  };
  robots: {
    policies: RobotPolicy[];
    environmentSpecific: {
      development: Partial<RobotPolicy>;
      production: Partial<RobotPolicy>;
    };
  };
  crawling: {
    disallowedPaths: string[];
    allowedPaths: string[];
    specialCrawlDelays: Record<string, number>;
  };
  meta: {
    defaultLanguage: SupportedLanguage;
    supportedLanguages: SupportedLanguage[];
    healthContentCompliance: boolean;
  };
}

/**
 * Main SEO configuration
 */
export const seoConfig: SEOConfig = {
  sitemap: {
    baseUrls: [
      `${SITE.website}sitemap-index.xml`,
      `${SITE.website}sitemap-0.xml`,
    ],
    priority: {
      homepage: 1.0,
      articles: 0.8,
      pages: 0.6,
      archives: 0.4,
    },
    changefreq: {
      homepage: "daily",
      articles: "weekly",
      pages: "monthly",
      archives: "yearly",
    },
  },

  robots: {
    policies: [
      // Default policy for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/search/",
          "/_image/",
          "/api/",
          "/admin/",
          "/temp/",
          "/draft/",
          "*.json$",
          "/rss.xml",
          "/sitemap*.xml",
        ],
        crawlDelay: 1,
      },

      // Optimized policy for Google
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/search/",
          "/_image/",
          "/api/",
          "/admin/",
          "/temp/",
          "/draft/",
        ],
        crawlDelay: 0.5,
      },

      // Optimized policy for Bing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/search/",
          "/_image/",
          "/api/",
          "/admin/",
          "/temp/",
          "/draft/",
        ],
        crawlDelay: 1,
      },

      // Health-specific crawler allowances
      {
        userAgent: "healthbot",
        allow: "/posts/",
        disallow: ["/search/", "/_image/", "/api/", "/admin/"],
        crawlDelay: 2,
      },

      // Block AI scrapers while allowing legitimate research
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Claude-Web",
        disallow: "/",
      },
      {
        userAgent: "PerplexityBot",
        disallow: "/",
      },
    ],

    environmentSpecific: {
      development: {
        userAgent: "*",
        disallow: "/",
        crawlDelay: 86400, // 24 hours
      },
      production: {
        userAgent: "*",
        allow: "/",
        crawlDelay: 1,
      },
    },
  },

  crawling: {
    disallowedPaths: [
      "/search/",
      "/_image/",
      "/api/",
      "/admin/",
      "/temp/",
      "/draft/",
      "/login/",
      "/logout/",
      "/404/",
      "/500/",
      "/_astro/",
      "/node_modules/",
      "/.git/",
      "/src/",
    ],

    allowedPaths: [
      "/",
      "/posts/",
      "/about/",
      "/glossary/",
      "/archives/",
      "/categories/",
      "/tags/",
    ],

    specialCrawlDelays: {
      Googlebot: 0.5,
      Bingbot: 1,
      YandexBot: 2,
      DuckDuckBot: 1,
      Applebot: 1,
      facebookexternalhit: 0.5,
      Twitterbot: 0.5,
      LinkedInBot: 1,
    },
  },

  meta: {
    defaultLanguage: "de",
    supportedLanguages: ["de", "en"],
    healthContentCompliance: true,
  },
};

/**
 * Get environment-specific robot policies
 */
export function getRobotPolicies(): RobotPolicy[] {
  const isDevelopment = import.meta.env.DEV;
  const basePolicy = seoConfig.robots.policies;

  if (isDevelopment) {
    return [
      {
        ...seoConfig.robots.environmentSpecific.development,
        userAgent: seoConfig.robots.environmentSpecific.development
          .userAgent as string,
        sitemap: seoConfig.sitemap.baseUrls,
      },
    ];
  }

  return basePolicy.map(policy => ({
    ...policy,
    ...(policy.userAgent === "*" && { sitemap: seoConfig.sitemap.baseUrls }),
  }));
}

/**
 * Generate sitemap URLs with priority and frequency
 */
export function getSitemapConfig() {
  return {
    filter: (page: string) => {
      // Filter out pages that shouldn't be in sitemap
      const excludePatterns = seoConfig.crawling.disallowedPaths;
      return !excludePatterns.some(pattern =>
        page.includes(pattern.replace("/", ""))
      );
    },

    serialize: (item: { url: string; [key: string]: unknown }) => {
      // Add priority and changefreq based on URL pattern
      if (item.url === SITE.website) {
        return {
          ...item,
          priority: seoConfig.sitemap.priority.homepage,
          changefreq: seoConfig.sitemap.changefreq.homepage,
        };
      }

      if (item.url.includes("/posts/")) {
        return {
          ...item,
          priority: seoConfig.sitemap.priority.articles,
          changefreq: seoConfig.sitemap.changefreq.articles,
        };
      }

      if (item.url.includes("/archives/")) {
        return {
          ...item,
          priority: seoConfig.sitemap.priority.archives,
          changefreq: seoConfig.sitemap.changefreq.archives,
        };
      }

      return {
        ...item,
        priority: seoConfig.sitemap.priority.pages,
        changefreq: seoConfig.sitemap.changefreq.pages,
      };
    },
  };
}

/**
 * Health content specific SEO settings
 */
export const healthSEOConfig = {
  medicalCompliance: {
    disclaimerRequired: true,
    authorityCompliance: "BfArM", // German Federal Institute for Drugs and Medical Devices
    targetRegion: "DACH", // Germany, Austria, Switzerland
    contentType: "HealthInformation",
  },

  crawlerGuidelines: {
    healthSpecificBots: ["healthbot", "medbot", "health-crawler"],
    allowMedicalResearch: true,
    blockCommercialScraping: true,
  },

  contentClassification: {
    categories: ["Gesundheit", "Ernährung", "Wellness", "Fitness", "Lifestyle"],
    medicalAudienceTypes: [
      "Patient",
      "GeneralPublic",
      "HealthcareProfessional",
    ],
  },
};

export default seoConfig;
