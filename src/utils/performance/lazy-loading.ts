/**
 * @file lazy-loading.ts
 * @description Performance utilities for lazy loading and code splitting
 *
 * Provides optimized lazy loading strategies for Astro components,
 * including intersection observer-based loading and dynamic imports.
 */

import { logger } from "@/utils/logger";

/**
 * Configuration for lazy loading behavior
 */
export interface LazyLoadConfig {
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Intersection threshold */
  threshold?: number | number[];
  /** Whether to load only once (unobserve after first intersection) */
  once?: boolean;
  /** Custom loading placeholder */
  placeholder?: string;
  /** Error fallback */
  errorFallback?: string;
}

/**
 * Default lazy loading configuration
 */
const DEFAULT_LAZY_CONFIG: Required<LazyLoadConfig> = {
  rootMargin: "50px",
  threshold: 0.1,
  once: true,
  placeholder: '<div class="animate-pulse bg-muted rounded h-32"></div>',
  errorFallback: '<div class="text-error p-4">Failed to load content</div>',
};

/**
 * Creates an intersection observer for lazy loading
 */
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  config: LazyLoadConfig = {}
): IntersectionObserver {
  const options = { ...DEFAULT_LAZY_CONFIG, ...config };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry);

          if (options.once) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    {
      rootMargin: options.rootMargin,
      threshold: options.threshold,
    }
  );

  return observer;
}

/**
 * Lazy load images with modern loading attributes
 */
export function setupLazyImages(container?: Element): void {
  const images = (container || document).querySelectorAll<HTMLImageElement>(
    'img[data-src], img[loading="lazy"]'
  );

  if ("loading" in HTMLImageElement.prototype) {
    // Native lazy loading is supported
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      img.loading = "lazy";
    });
    return;
  }

  // Fallback to intersection observer
  const observer = createLazyObserver(entry => {
    const img = entry.target as HTMLImageElement;

    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;

      img.onload = () => {
        img.classList.add("loaded");
      };

      img.onerror = () => {
        img.classList.add("error");
        logger.warn("Failed to load image:", img.dataset.src);
      };
    }
  });

  images.forEach(img => observer.observe(img));
}

/**
 * Lazy load components with dynamic imports
 */
export async function lazyLoadComponent<T = unknown>(
  importFn: () => Promise<T>,
  fallback?: () => HTMLElement
): Promise<T> {
  try {
    const start = performance.now();
    const component = await importFn();
    const end = performance.now();

    if (import.meta.env.DEV && end - start > 100) {
      logger.warn(`Slow component import: ${end - start}ms`);
    }

    return component;
  } catch (error) {
    logger.error("Failed to lazy load component:", error);

    if (fallback) {
      const fallbackElement = fallback();
      return fallbackElement as unknown as T;
    }

    throw error;
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]): void {
  if (typeof document === "undefined") {
    return;
  }

  resources.forEach(resource => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource;

    // Determine resource type based on extension
    if (resource.endsWith(".css")) {
      link.as = "style";
    } else if (resource.match(/\.(js|mjs)$/)) {
      link.as = "script";
    } else if (resource.match(/\.(woff2?|ttf|otf)$/)) {
      link.as = "font";
      link.crossOrigin = "anonymous";
    } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = "image";
    }

    document.head.appendChild(link);
  });
}

/**
 * Defer non-critical JavaScript execution
 */
export function deferNonCriticalJS(callback: () => void): void {
  if (typeof window === "undefined") {
    return;
  }

  const defer = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 1);
    }
  };

  if (document.readyState === "complete") {
    defer();
  } else {
    window.addEventListener("load", defer, { once: true });
  }
}

/**
 * Bundle size monitoring helper
 */
export function trackBundleSize(bundleName: string, size: number): void {
  if (!import.meta.env.DEV) {
    return;
  }

  const sizeKB = Math.round(size / 1024);
  const sizeClass = sizeKB > 500 ? "large" : sizeKB > 100 ? "medium" : "small";

  logger.info(`Bundle ${bundleName}: ${sizeKB}KB (${sizeClass})`);

  if (sizeKB > 500) {
    logger.warn(`Large bundle detected: ${bundleName} (${sizeKB}KB)`);
  }
}

/**
 * Performance mark utilities for measuring
 */
export const perf = {
  mark(name: string): void {
    if (typeof performance !== "undefined" && performance.mark) {
      performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === "undefined" || !performance.measure) {
      return 0;
    }

    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }

      const entries = performance.getEntriesByName(name);
      const lastEntry = entries[entries.length - 1];
      return lastEntry?.duration || 0;
    } catch (error) {
      logger.warn("Performance measurement failed:", error);
      return 0;
    }
  },

  clear(name?: string): void {
    if (typeof performance !== "undefined") {
      if (name) {
        performance.clearMarks(name);
        performance.clearMeasures(name);
      } else {
        performance.clearMarks();
        performance.clearMeasures();
      }
    }
  },
};

/**
 * Resource hints for better loading performance
 */
export function addResourceHints(
  hints: Array<{
    href: string;
    rel: "preload" | "prefetch" | "preconnect" | "dns-prefetch";
    as?: string;
    crossorigin?: boolean;
  }>
): void {
  if (typeof document === "undefined") {
    return;
  }

  hints.forEach(({ href, rel, as, crossorigin }) => {
    // Check if hint already exists
    const existing = document.querySelector(
      `link[rel="${rel}"][href="${href}"]`
    );
    if (existing) {
      return;
    }

    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;

    if (as) {
      link.setAttribute("as", as);
    }
    if (crossorigin) {
      link.crossOrigin = "anonymous";
    }

    document.head.appendChild(link);
  });
}

/**
 * Optimize critical CSS delivery
 */
export function optimizeCriticalCSS(criticalStyles: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const style = document.createElement("style");
  style.textContent = criticalStyles;
  style.setAttribute("data-critical", "true");

  // Insert before any existing stylesheets
  const firstStylesheet = document.querySelector('link[rel="stylesheet"]');
  if (firstStylesheet) {
    document.head.insertBefore(style, firstStylesheet);
  } else {
    document.head.appendChild(style);
  }
}
