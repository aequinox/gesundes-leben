/**
 * View Transitions Enhancer - Modular Architecture
 * Main orchestrator class that coordinates all view transition modules
 */

import { logger } from "@/utils/logger";

import { AccessibilityManager } from "./accessibility";
import type { ViewTransitionConfig } from "./config";
import { FallbackHandler } from "./fallback";
import { MetricsCollector } from "./metrics";
import { PreloadManager } from "./preloader";

export class ViewTransitionEnhancer {
  private config: Required<ViewTransitionConfig>;
  private accessibilityManager: AccessibilityManager;
  private metricsCollector: MetricsCollector;
  private preloadManager: PreloadManager;
  private fallbackHandler: FallbackHandler;
  private isInitialized = false;

  constructor(config: Required<ViewTransitionConfig>) {
    this.config = config;

    // Initialize modules
    this.accessibilityManager = new AccessibilityManager(
      config.accessibility,
      config.debug
    );

    this.metricsCollector = new MetricsCollector(config.debug);

    this.preloadManager = new PreloadManager(
      config.preloadStrategy,
      config.debug
    );

    this.fallbackHandler = new FallbackHandler({
      maxTransitionDuration: config.maxTransitionDuration,
      fallbackDelay: config.fallbackDelay,
      debug: config.debug,
    });
  }

  /**
   * Initialize all view transition enhancements
   */
  public init(): void {
    if (this.isInitialized) {
      if (this.config.debug) {
        logger.warn("ViewTransitionEnhancer: Already initialized");
      }
      return;
    }

    try {
      // Check browser support first
      this.fallbackHandler.setupProgressiveEnhancement();

      // Initialize core functionality
      this.setupViewTransitions();
      this.applyDynamicDurations();

      // Initialize modules
      this.accessibilityManager.init();

      if (this.config.enablePerformanceMetrics) {
        this.metricsCollector.init();
      }

      this.preloadManager.init();
      this.fallbackHandler.init();

      // Setup cleanup on page unload
      this.setupCleanup();

      this.isInitialized = true;

      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: Initialized successfully", {
          config: this.config,
          modules: {
            accessibility: true,
            metrics: this.config.enablePerformanceMetrics,
            preload: this.config.preloadStrategy !== "none",
            fallback: true,
          },
        });
      }
    } catch (error) {
      logger.error("ViewTransitionEnhancer: Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Setup basic view transitions functionality
   */
  private setupViewTransitions(): void {
    const hasViewTransitions = "startViewTransition" in document;

    if (!hasViewTransitions) {
      document.documentElement.classList.add("no-view-transitions");
      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: View transitions not supported");
      }
      return;
    }

    // Add view transitions support class
    document.documentElement.classList.add("view-transitions-supported");

    // Setup transition event handlers
    this.setupTransitionHandlers();
  }

  /**
   * Setup transition event handlers
   */
  private setupTransitionHandlers(): void {
    // Handle before preparation
    document.addEventListener("astro:before-preparation", () => {
      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: Before preparation");
      }
    });

    // Handle after swap
    document.addEventListener("astro:after-swap", () => {
      // Reapply dynamic durations after DOM changes
      this.applyDynamicDurations();

      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: After swap");
      }
    });
  }

  /**
   * Apply dynamic CSS custom properties for transition durations
   */
  private applyDynamicDurations(): void {
    const { durations } = this.config;
    const root = document.documentElement;

    root.style.setProperty("--vt-duration-fast", `${durations.fast}ms`);
    root.style.setProperty("--vt-duration-normal", `${durations.normal}ms`);
    root.style.setProperty("--vt-duration-slow", `${durations.slow}ms`);

    if (this.config.debug) {
      logger.debug(
        "ViewTransitionEnhancer: Applied dynamic durations",
        durations
      );
    }
  }

  /**
   * Setup cleanup handlers
   */
  private setupCleanup(): void {
    const cleanup = () => {
      this.cleanup();
    };

    window.addEventListener("beforeunload", cleanup);
    window.addEventListener("pagehide", cleanup);

    // Cleanup on Astro navigation
    document.addEventListener("astro:before-preparation", () => {
      // Don't cleanup completely, just prepare for transition
      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: Preparing for transition");
      }
    });
  }

  /**
   * Update configuration and reinitialize affected modules
   */
  public updateConfig(newConfig: Partial<ViewTransitionConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Update individual modules based on changed config
    if (newConfig.accessibility) {
      this.accessibilityManager.updateConfig(newConfig.accessibility);
    }

    if (
      newConfig.preloadStrategy &&
      newConfig.preloadStrategy !== oldConfig.preloadStrategy
    ) {
      this.preloadManager.updateStrategy(newConfig.preloadStrategy);
    }

    if (newConfig.maxTransitionDuration || newConfig.fallbackDelay) {
      this.fallbackHandler.updateConfig({
        maxTransitionDuration: this.config.maxTransitionDuration,
        fallbackDelay: this.config.fallbackDelay,
        debug: this.config.debug,
      });
    }

    if (newConfig.durations) {
      this.applyDynamicDurations();
    }

    if (this.config.debug) {
      logger.debug("ViewTransitionEnhancer: Configuration updated", {
        old: oldConfig,
        new: this.config,
      });
    }
  }

  /**
   * Get comprehensive status of all modules
   */
  public getStatus(): {
    isInitialized: boolean;
    config: Required<ViewTransitionConfig>;
    modules: {
      accessibility: ReturnType<AccessibilityManager["getStatus"]>;
      metrics: {
        latest: ReturnType<MetricsCollector["getLatestMetrics"]>;
        summary: ReturnType<MetricsCollector["getSummary"]>;
      };
      preload: ReturnType<PreloadManager["getStats"]>;
      fallback: ReturnType<FallbackHandler["getStats"]>;
    };
  } {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      modules: {
        accessibility: this.accessibilityManager.getStatus(),
        metrics: {
          latest: this.metricsCollector.getLatestMetrics(),
          summary: this.metricsCollector.getSummary(),
        },
        preload: this.preloadManager.getStats(),
        fallback: this.fallbackHandler.getStats(),
      },
    };
  }

  /**
   * Export metrics and diagnostics
   */
  public exportDiagnostics(): string {
    const status = this.getStatus();
    const diagnostics = {
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      status,
      browser: {
        userAgent: navigator.userAgent,
        viewTransitions: "startViewTransition" in document,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
      },
      performance: {
        metrics: this.metricsCollector.exportMetrics(),
      },
    };

    return JSON.stringify(diagnostics, null, 2);
  }

  /**
   * Reset all modules to initial state
   */
  public reset(): void {
    if (this.config.enablePerformanceMetrics) {
      this.metricsCollector.reset();
    }

    void this.preloadManager.clearCache();

    if (this.config.debug) {
      logger.debug("ViewTransitionEnhancer: Reset completed");
    }
  }

  /**
   * Cleanup all resources and event listeners
   */
  public cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Cleanup modules
      this.fallbackHandler.cleanup();
      // Note: Other modules don't have explicit cleanup methods yet,
      // but they could be added in the future

      // Remove CSS custom properties
      const root = document.documentElement;
      root.style.removeProperty("--vt-duration-fast");
      root.style.removeProperty("--vt-duration-normal");
      root.style.removeProperty("--vt-duration-slow");

      this.isInitialized = false;

      if (this.config.debug) {
        logger.debug("ViewTransitionEnhancer: Cleanup completed");
      }
    } catch (error) {
      logger.error("ViewTransitionEnhancer: Cleanup failed:", error);
    }
  }

  /**
   * Get individual module instances for advanced usage
   */
  public getModules(): {
    accessibility: AccessibilityManager;
    metrics: MetricsCollector;
    preload: PreloadManager;
    fallback: FallbackHandler;
  } {
    return {
      accessibility: this.accessibilityManager,
      metrics: this.metricsCollector,
      preload: this.preloadManager,
      fallback: this.fallbackHandler,
    };
  }
}
