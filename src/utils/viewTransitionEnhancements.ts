/**
 * View Transitions Performance Enhancements
 * Provides advanced functionality for Astro view transitions
 */

export interface ViewTransitionConfig {
  enablePerformanceMetrics?: boolean;
  fallbackDelay?: number;
  maxTransitionDuration?: number;
  preloadStrategy?: "hover" | "visible" | "none";
}

export class ViewTransitionEnhancer {
  private config: ViewTransitionConfig;
  private metrics: Map<string, number> = new Map();

  constructor(config: ViewTransitionConfig = {}) {
    this.config = {
      enablePerformanceMetrics: true,
      fallbackDelay: 500,
      maxTransitionDuration: 1000,
      preloadStrategy: "hover",
      ...config,
    };
  }

  /**
   * Initialize view transition enhancements
   */
  public init(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.setupPerformanceMonitoring();
    this.setupPreloadStrategy();
    this.setupAccessibilityEnhancements();
    this.setupFallbackHandling();
  }

  /**
   * Performance monitoring for view transitions
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMetrics) {
      return;
    }

    document.addEventListener("astro:before-preparation", () => {
      this.metrics.set("preparation-start", performance.now());
    });

    document.addEventListener("astro:after-preparation", () => {
      const start = this.metrics.get("preparation-start");
      if (start) {
        const duration = performance.now() - start;
        this.metrics.set("preparation-duration", duration);

        // Log slow preparations for debugging
        if (duration > 100) {
          // eslint-disable-next-line no-console
          console.warn(
            `Slow view transition preparation: ${duration.toFixed(2)}ms`
          );
        }
      }
    });

    document.addEventListener("astro:before-swap", () => {
      this.metrics.set("swap-start", performance.now());
    });

    document.addEventListener("astro:after-swap", () => {
      const start = this.metrics.get("swap-start");
      if (start) {
        const duration = performance.now() - start;
        this.metrics.set("swap-duration", duration);

        // Performance optimization: clean up will-change properties
        this.cleanupPerformanceProperties();
      }
    });
  }

  /**
   * Clean up performance properties after transitions
   */
  private cleanupPerformanceProperties(): void {
    // Remove will-change properties after transitions complete
    const elementsWithWillChange = document.querySelectorAll(
      '[style*="will-change"]'
    );
    elementsWithWillChange.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.willChange = "auto";
      }
    });
  }

  /**
   * Setup intelligent preloading strategy
   */
  private setupPreloadStrategy(): void {
    if (this.config.preloadStrategy === "none") {
      return;
    }

    const links = document.querySelectorAll('a[href^="/"]');

    links.forEach(link => {
      if (this.config.preloadStrategy === "hover") {
        this.setupHoverPreload(link as HTMLAnchorElement);
      } else if (this.config.preloadStrategy === "visible") {
        this.setupVisibilityPreload(link as HTMLAnchorElement);
      }
    });
  }

  /**
   * Setup hover-based preloading
   */
  private setupHoverPreload(link: HTMLAnchorElement): void {
    let preloadTimer: number;

    link.addEventListener("mouseenter", () => {
      preloadTimer = window.setTimeout(() => {
        this.preloadPage(link.href);
      }, 100); // Small delay to avoid unnecessary preloads
    });

    link.addEventListener("mouseleave", () => {
      if (preloadTimer) {
        clearTimeout(preloadTimer);
      }
    });
  }

  /**
   * Setup visibility-based preloading
   */
  private setupVisibilityPreload(link: HTMLAnchorElement): void {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.preloadPage(link.href);
            observer.unobserve(link);
          }
        });
      },
      { rootMargin: "100px" }
    );

    observer.observe(link);
  }

  /**
   * Preload a page for faster transitions
   */
  private preloadPage(url: string): void {
    // Check if already preloaded
    const existingPreload = document.querySelector(
      `link[rel="prefetch"][href="${url}"]`
    );
    if (existingPreload) {
      return;
    }

    // Create prefetch link
    const prefetchLink = document.createElement("link");
    prefetchLink.rel = "prefetch";
    prefetchLink.href = url;
    prefetchLink.as = "document";

    document.head.appendChild(prefetchLink);
  }

  /**
   * Setup accessibility enhancements
   */
  private setupAccessibilityEnhancements(): void {
    // Announce route changes to screen readers
    document.addEventListener("astro:after-swap", () => {
      this.announceRouteChange();
    });

    // Skip animation for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.style.setProperty("--vt-duration-fast", "1ms");
      document.documentElement.style.setProperty("--vt-duration-normal", "1ms");
      document.documentElement.style.setProperty("--vt-duration-slow", "1ms");
    }
  }

  /**
   * Announce route changes for accessibility
   */
  private announceRouteChange(): void {
    const title = document.title;
    const announcement = `Navigiert zu: ${title}`;

    // Create temporary announcement element
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = announcement;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * Setup fallback handling for unsupported browsers
   */
  private setupFallbackHandling(): void {
    // Check for View Transitions API support
    const hasViewTransitions = "startViewTransition" in document;
    if (!hasViewTransitions) {
      // Add fallback class for styling
      document.documentElement.classList.add("no-view-transitions");

      // Simple fade effect for navigation
      this.setupFallbackTransitions();
    }
  }

  /**
   * Setup fallback transitions for unsupported browsers
   */
  private setupFallbackTransitions(): void {
    let isNavigating = false;

    document.addEventListener("click", event => {
      const link = (event.target as Element)?.closest('a[href^="/"]');
      if (!link || isNavigating) {
        return;
      }

      isNavigating = true;

      // Add fade out effect
      document.body.style.opacity = "0.8";
      document.body.style.transition = "opacity 150ms ease-out";

      // Navigate after animation
      setTimeout(() => {
        window.location.href = (link as HTMLAnchorElement).href;
      }, this.config.fallbackDelay || 150);
    });
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics.clear();
  }
}

// Auto-initialize with default config
if (typeof window !== "undefined") {
  const enhancer = new ViewTransitionEnhancer();

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enhancer.init());
  } else {
    enhancer.init();
  }

  // Re-initialize after view transitions
  document.addEventListener("astro:after-swap", () => enhancer.init());
}
