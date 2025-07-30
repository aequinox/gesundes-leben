/**
 * View Transitions Preloading Module
 * Handles intelligent preloading strategies for improved performance
 */

import type { PreloadStrategy } from "./config";

export class PreloadManager {
  private config: { strategy: PreloadStrategy; debug: boolean };
  private preloadedUrls = new Set<string>();
  private isPreloading = false;

  constructor(strategy: PreloadStrategy = "hover", debug = false) {
    this.config = { strategy, debug };
  }

  /**
   * Initialize preloading based on strategy
   */
  public init(): void {
    switch (this.config.strategy) {
      case "hover":
        this.setupHoverPreloading();
        break;
      case "visible":
        this.setupIntersectionPreloading();
        break;
      case "none":
        // No preloading
        break;
      default:
        if (this.config.debug) {
          console.warn(`Unknown preload strategy: ${this.config.strategy}`);
        }
    }
  }

  /**
   * Setup hover-based preloading
   */
  private setupHoverPreloading(): void {
    const prefetchOnHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && this.isInternalLink(link)) {
        this.preloadPage(link.href);
      }
    };

    // Use delegation for better performance
    document.addEventListener("mouseover", prefetchOnHover, { passive: true });

    if (this.config.debug) {
      console.log("PreloadManager: Hover preloading initialized");
    }
  }

  /**
   * Setup intersection-based preloading for visible links
   */
  private setupIntersectionPreloading(): void {
    if (!("IntersectionObserver" in window)) {
      if (this.config.debug) {
        console.warn("PreloadManager: IntersectionObserver not supported, falling back to hover");
      }
      this.setupHoverPreloading();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            if (this.isInternalLink(link)) {
              this.preloadPage(link.href);
              observer.unobserve(link);
            }
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    // Observe all internal links
    document.querySelectorAll("a").forEach((link) => {
      if (this.isInternalLink(link)) {
        observer.observe(link);
      }
    });

    if (this.config.debug) {
      console.log("PreloadManager: Intersection preloading initialized");
    }
  }

  /**
   * Check if link is internal and should be preloaded
   */
  private isInternalLink(link: HTMLAnchorElement): boolean {
    try {
      const url = new URL(link.href, window.location.origin);
      return (
        url.origin === window.location.origin &&
        !link.hasAttribute("data-no-preload") &&
        !link.href.includes("#") &&
        link.href !== window.location.href &&
        !this.preloadedUrls.has(link.href)
      );
    } catch {
      return false;
    }
  }

  /**
   * Preload a page with intelligent caching
   */
  private async preloadPage(url: string): Promise<void> {
    if (this.preloadedUrls.has(url) || this.isPreloading) {
      return;
    }

    this.preloadedUrls.add(url);
    this.isPreloading = true;

    try {
      // Use fetch with low priority to avoid blocking critical resources
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Purpose": "prefetch",
        },
        // Use low priority if supported
        ...(("priority" in Request.prototype) && { priority: "low" }),
      });

      if (response.ok) {
        // Store in cache for faster access
        if ("caches" in window) {
          const cache = await caches.open("view-transitions-preload");
          await cache.put(url, response.clone());
        }

        if (this.config.debug) {
          console.log(`PreloadManager: Successfully preloaded ${url}`);
        }
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn(`PreloadManager: Failed to preload ${url}:`, error);
      }
      // Remove from preloaded set on failure so it can be retried
      this.preloadedUrls.delete(url);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Update preload strategy
   */
  public updateStrategy(strategy: PreloadStrategy): void {
    this.config.strategy = strategy;
    this.cleanup();
    this.init();
  }

  /**
   * Get preload statistics
   */
  public getStats(): {
    strategy: PreloadStrategy;
    preloadedCount: number;
    preloadedUrls: string[];
  } {
    return {
      strategy: this.config.strategy,
      preloadedCount: this.preloadedUrls.size,
      preloadedUrls: Array.from(this.preloadedUrls),
    };
  }

  /**
   * Clear preload cache
   */
  public async clearCache(): Promise<void> {
    this.preloadedUrls.clear();
    
    if ("caches" in window) {
      try {
        await caches.delete("view-transitions-preload");
        if (this.config.debug) {
          console.log("PreloadManager: Cache cleared");
        }
      } catch (error) {
        if (this.config.debug) {
          console.warn("PreloadManager: Failed to clear cache:", error);
        }
      }
    }
  }

  /**
   * Cleanup event listeners and observers
   */
  private cleanup(): void {
    // Remove event listeners (in a real implementation, we'd store references)
    // For now, we'll just clear the preloaded URLs
    this.preloadedUrls.clear();
  }
}