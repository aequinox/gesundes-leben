/**
 * @file performance-optimization.ts
 * @description SEO-focused performance optimization utilities
 *
 * Features:
 * - Core Web Vitals optimization
 * - German content-specific optimizations
 * - Health content performance tuning
 * - Image optimization for health articles
 * - Font loading optimization
 * - Critical resource prioritization
 */
import { logger } from "@/utils/logger";

export interface PerformanceOptimizationConfig {
  /** Enable aggressive image optimization */
  aggressiveImageOptimization: boolean;
  /** Preload critical fonts */
  preloadFonts: boolean;
  /** Enable service worker for caching */
  enableServiceWorker: boolean;
  /** Critical CSS inlining threshold */
  criticalCSSThreshold: number;
  /** Lazy loading threshold for images */
  lazyLoadingThreshold: string;
}

const DEFAULT_CONFIG: PerformanceOptimizationConfig = {
  aggressiveImageOptimization: true,
  preloadFonts: true,
  enableServiceWorker: false, // Will be enabled in production
  criticalCSSThreshold: 14000, // bytes
  lazyLoadingThreshold: "100px",
};

/**
 * Performance optimization utility for SEO enhancement
 */
export class SEOPerformanceOptimizer {
  private config: PerformanceOptimizationConfig;

  constructor(config: Partial<PerformanceOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate optimized image srcset for health content
   */
  generateHealthContentImageSrcSet(
    imageSrc: string,
    alt: string,
    sizes?: string
  ): {
    srcSet: string;
    sizes: string;
    optimizedAlt: string;
  } {
    const extension = imageSrc.split(".").pop() || "jpg";

    // Health content specific breakpoints
    const breakpoints = [400, 600, 800, 1200, 1600, 2000];
    const formats = ["avif", "webp", extension];

    const srcSet = formats
      .map(format => {
        return breakpoints
          .map(width => {
            const optimizedSrc = imageSrc.replace(
              `.${extension}`,
              `_${width}w.${format}`
            );
            return `${optimizedSrc} ${width}w`;
          })
          .join(", ");
      })
      .join(", ");

    // Optimized sizes for health content layout
    const optimizedSizes =
      sizes ||
      "(max-width: 640px) 100vw, " +
        "(max-width: 1024px) 80vw, " +
        "(max-width: 1536px) 60vw, " +
        "50vw";

    // Enhanced alt text for health content SEO
    const optimizedAlt = this.optimizeHealthImageAlt(alt);

    return {
      srcSet,
      sizes: optimizedSizes,
      optimizedAlt,
    };
  }

  /**
   * Optimize alt text for health images
   */
  private optimizeHealthImageAlt(alt: string): string {
    if (!alt || alt.trim() === "") {
      logger.warn("Empty alt text detected for health image");
      return "Gesundheits- und Wellness-Bild";
    }

    // Add descriptive context for screen readers
    const healthKeywords = [
      "gesundheit",
      "ernährung",
      "fitness",
      "wellness",
      "gesund",
      "heilung",
      "therapie",
      "medizin",
    ];

    const lowerAlt = alt.toLowerCase();
    const hasHealthKeyword = healthKeywords.some(keyword =>
      lowerAlt.includes(keyword)
    );

    if (!hasHealthKeyword && lowerAlt.length > 10) {
      // Add health context if missing
      return `${alt} – Gesundheits- und Wellness-Information`;
    }

    return alt;
  }

  /**
   * Generate critical resource hints for German health content
   */
  generateCriticalResourceHints(): string {
    const hints = [];

    // Preconnect to German CDNs and services
    hints.push(
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    );
    hints.push(
      '<link rel="preconnect" href="https://www.google-analytics.com">'
    );
    hints.push(
      '<link rel="preconnect" href="https://www.googletagmanager.com">'
    );

    // DNS prefetch for German health authorities (if referenced)
    hints.push('<link rel="dns-prefetch" href="//www.bfarm.de">');
    hints.push('<link rel="dns-prefetch" href="//www.rki.de">');

    // Preload critical fonts for German typography
    if (this.config.preloadFonts) {
      hints.push(
        '<link rel="preload" href="/fonts/Poppins-400.woff2" as="font" type="font/woff2" crossorigin>'
      );
      hints.push(
        '<link rel="preload" href="/fonts/Poppins-600.woff2" as="font" type="font/woff2" crossorigin>'
      );
    }

    // Preload critical CSS
    hints.push('<link rel="preload" href="/css/critical.css" as="style">');

    return hints.join("\n");
  }

  /**
   * Optimize font loading for German content
   */
  generateFontOptimization(): {
    css: string;
    preloads: string[];
  } {
    const css = `
      /* Font display optimization for German typography */
      @font-face {
        font-family: 'Poppins';
        src: url('/fonts/Poppins-400.woff2') format('woff2'),
             url('/fonts/Poppins-400.woff') format('woff');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        unicode-range: U+0020-007F, U+00A0-00FF, U+0100-017F; /* Latin + German chars */
      }
      
      @font-face {
        font-family: 'Poppins';
        src: url('/fonts/Poppins-600.woff2') format('woff2'),
             url('/fonts/Poppins-600.woff') format('woff');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
        unicode-range: U+0020-007F, U+00A0-00FF, U+0100-017F;
      }

      /* Optimize font loading performance */
      html {
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Prevent layout shift during font load */
      .font-loading {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;

    const preloads = ["/fonts/Poppins-400.woff2", "/fonts/Poppins-600.woff2"];

    return { css, preloads };
  }

  /**
   * Generate service worker for health content caching
   */
  generateHealthContentServiceWorker(): string {
    return `
      // Service Worker for Health Content Performance
      const CACHE_NAME = 'gesundes-leben-v1';
      const HEALTH_CONTENT_CACHE = 'health-content-v1';
      
      // Critical resources to cache
      const CRITICAL_RESOURCES = [
        '/',
        '/css/critical.css',
        '/fonts/Poppins-400.woff2',
        '/fonts/Poppins-600.woff2',
        '/js/search.js'
      ];

      // Health content patterns
      const HEALTH_CONTENT_PATTERNS = [
        /\\/posts\\/.+/,
        /\\/gesundheit\\/.+/,
        /\\/ernaehrung\\/.+/,
        /\\/fitness\\/.+/,
        /\\/wellness\\/.+/
      ];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_RESOURCES))
        );
      });

      self.addEventListener('fetch', (event) => {
        const url = new URL(event.request.url);
        
        // Cache health content with longer TTL
        if (HEALTH_CONTENT_PATTERNS.some(pattern => pattern.test(url.pathname))) {
          event.respondWith(
            caches.match(event.request)
              .then(response => {
                if (response) {
                  // Serve from cache, update in background
                  fetch(event.request).then(fetchResponse => {
                    caches.open(HEALTH_CONTENT_CACHE)
                      .then(cache => cache.put(event.request, fetchResponse.clone()));
                  });
                  return response;
                }
                
                return fetch(event.request).then(fetchResponse => {
                  caches.open(HEALTH_CONTENT_CACHE)
                    .then(cache => cache.put(event.request, fetchResponse.clone()));
                  return fetchResponse;
                });
              })
          );
        }
      });
    `;
  }

  /**
   * Optimize Core Web Vitals for health content
   */
  generateCoreWebVitalsOptimization(): {
    lcp: string[];
    fid: string[];
    cls: string[];
  } {
    return {
      // Largest Contentful Paint optimizations
      lcp: [
        "Preload hero images for health articles",
        "Optimize font loading with font-display: swap",
        "Minimize render-blocking resources",
        "Use efficient image formats (AVIF/WebP)",
        "Implement proper resource hints",
      ],

      // First Input Delay optimizations
      fid: [
        "Defer non-critical JavaScript",
        "Use web workers for heavy computations",
        "Optimize search functionality loading",
        "Minimize main thread blocking time",
        "Implement progressive enhancement",
      ],

      // Cumulative Layout Shift optimizations
      cls: [
        "Define explicit dimensions for health images",
        "Reserve space for dynamic content",
        "Use CSS containment for isolated components",
        "Optimize font loading to prevent FOIT/FOUT",
        "Avoid inserting content above existing content",
      ],
    };
  }

  /**
   * Generate performance budget for health content site
   */
  getPerformanceBudget(): {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    bundle: number;
    images: number;
  } {
    return {
      lcp: 2500, // ms - Largest Contentful Paint
      fid: 100, // ms - First Input Delay
      cls: 0.1, // Cumulative Layout Shift
      ttfb: 600, // ms - Time to First Byte
      bundle: 500, // KB - JavaScript bundle size
      images: 1000, // KB - Total image size per page
    };
  }

  /**
   * Analyze performance metrics for health content
   */
  analyzeHealthContentPerformance(metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }): {
    score: number;
    recommendations: string[];
  } {
    const budget = this.getPerformanceBudget();
    const recommendations: string[] = [];
    let score = 100;

    // LCP analysis
    if (metrics.lcp && metrics.lcp > budget.lcp) {
      score -= 20;
      recommendations.push(
        `LCP (${metrics.lcp}ms) exceeds budget (${budget.lcp}ms). Optimize hero image loading for health articles.`
      );
    }

    // FID analysis
    if (metrics.fid && metrics.fid > budget.fid) {
      score -= 15;
      recommendations.push(
        `FID (${metrics.fid}ms) exceeds budget (${budget.fid}ms). Defer non-critical JavaScript for search functionality.`
      );
    }

    // CLS analysis
    if (metrics.cls && metrics.cls > budget.cls) {
      score -= 25;
      recommendations.push(
        `CLS (${metrics.cls}) exceeds budget (${budget.cls}). Set explicit dimensions for health content images.`
      );
    }

    // TTFB analysis
    if (metrics.ttfb && metrics.ttfb > budget.ttfb) {
      score -= 10;
      recommendations.push(
        `TTFB (${metrics.ttfb}ms) exceeds budget (${budget.ttfb}ms). Optimize server response time for health content delivery.`
      );
    }

    return {
      score: Math.max(0, score),
      recommendations,
    };
  }
}

/**
 * Create singleton instance for global use
 */
export const seoPerformanceOptimizer = new SEOPerformanceOptimizer();
