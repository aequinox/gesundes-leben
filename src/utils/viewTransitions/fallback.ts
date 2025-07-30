/**
 * View Transitions Fallback Module
 * Handles graceful degradation when view transitions fail or aren't supported
 */

export interface FallbackConfig {
  maxTransitionDuration: number;
  fallbackDelay: number;
  debug: boolean;
}

export class FallbackHandler {
  private config: FallbackConfig;
  private fallbackTimeouts = new Map<string, number>();
  private isEnabled = true;

  constructor(config: FallbackConfig) {
    this.config = config;
  }

  /**
   * Initialize fallback handling
   */
  public init(): void {
    this.setupTransitionTimeouts();
    this.setupErrorHandling();
    this.addFallbackStyles();

    if (this.config.debug) {
      console.log("FallbackHandler: Initialized with config", this.config);
    }
  }

  /**
   * Setup timeout handling for transitions
   */
  private setupTransitionTimeouts(): void {
    document.addEventListener("astro:before-preparation", () => {
      this.startTransitionTimeout();
    });

    document.addEventListener("astro:after-swap", () => {
      this.clearTransitionTimeout();
    });
  }

  /**
   * Setup error handling for failed transitions
   */
  private setupErrorHandling(): void {
    // Listen for JavaScript errors during transitions
    window.addEventListener("error", (event) => {
      if (this.isTransitionError(event)) {
        this.handleTransitionError("JavaScript error during transition", event.error);
      }
    });

    // Listen for unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      if (this.isTransitionError(event)) {
        this.handleTransitionError("Promise rejection during transition", event.reason);
      }
    });
  }

  /**
   * Start timeout for current transition
   */
  private startTransitionTimeout(): void {
    const timeoutId = window.setTimeout(() => {
      this.handleTransitionTimeout();
    }, this.config.maxTransitionDuration);

    this.fallbackTimeouts.set("current", timeoutId);
  }

  /**
   * Clear transition timeout
   */
  private clearTransitionTimeout(): void {
    const timeoutId = this.fallbackTimeouts.get("current");
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.fallbackTimeouts.delete("current");
    }
  }

  /**
   * Handle transition timeout
   */
  private handleTransitionTimeout(): void {
    if (this.config.debug) {
      console.warn(`FallbackHandler: Transition timeout after ${this.config.maxTransitionDuration}ms`);
    }

    this.triggerFallbackNavigation();
  }

  /**
   * Handle transition errors
   */
  private handleTransitionError(message: string, error?: unknown): void {
    if (this.config.debug) {
      console.error(`FallbackHandler: ${message}`, error);
    }

    this.triggerFallbackNavigation();
  }

  /**
   * Check if error is related to view transitions
   */
  private isTransitionError(event: ErrorEvent | PromiseRejectionEvent): boolean {
    const message = "message" in event ? event.message : String(event.reason);
    return (
      message.includes("view-transition") ||
      message.includes("astro") ||
      message.includes("transition")
    );
  }

  /**
   * Trigger fallback navigation
   */
  private triggerFallbackNavigation(): void {
    if (!this.isEnabled) return;

    // Add fallback class to document
    document.documentElement.classList.add("vt-fallback");

    // Disable view transitions temporarily
    this.isEnabled = false;

    // Force a page reload as fallback after delay
    setTimeout(() => {
      if (this.config.debug) {
        console.log("FallbackHandler: Triggering fallback navigation");
      }
      
      // Try to get the intended destination from current navigation
      const currentUrl = window.location.href;
      window.location.href = currentUrl;
    }, this.config.fallbackDelay);

    // Re-enable after a reasonable time
    setTimeout(() => {
      this.isEnabled = true;
      document.documentElement.classList.remove("vt-fallback");
    }, 5000);
  }

  /**
   * Add fallback CSS styles
   */
  private addFallbackStyles(): void {
    const existingStyle = document.getElementById("vt-fallback-styles");
    if (existingStyle) {
      return;
    }

    const style = document.createElement("style");
    style.id = "vt-fallback-styles";
    style.textContent = `
      /* Fallback styles when view transitions fail */
      .vt-fallback {
        --vt-duration-fast: 0ms;
        --vt-duration-normal: 0ms;
        --vt-duration-slow: 0ms;
      }

      .vt-fallback *,
      .vt-fallback *::before,
      .vt-fallback *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
      }

      /* Ensure content is still accessible during fallback */
      .vt-fallback [data-loading] {
        opacity: 1 !important;
        transform: none !important;
      }

      /* Hide transition-specific elements during fallback */
      .vt-fallback [data-transition-only] {
        display: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Check browser support for view transitions
   */
  public static checkSupport(): {
    viewTransitions: boolean;
    documentStartViewTransition: boolean;
    cssViewTransitions: boolean;
  } {
    return {
      viewTransitions: "startViewTransition" in document,
      documentStartViewTransition: typeof document.startViewTransition === "function",
      cssViewTransitions: CSS.supports("view-transition-name", "none"),
    };
  }

  /**
   * Setup progressive enhancement for unsupported browsers
   */
  public setupProgressiveEnhancement(): void {
    const support = FallbackHandler.checkSupport();
    
    if (!support.viewTransitions) {
      document.documentElement.classList.add("no-view-transitions");
      
      if (this.config.debug) {
        console.log("FallbackHandler: View transitions not supported, using fallback mode");
      }
    }

    if (!support.cssViewTransitions) {
      document.documentElement.classList.add("no-css-view-transitions");
    }
  }

  /**
   * Get fallback statistics
   */
  public getStats(): {
    isEnabled: boolean;
    activeTimeouts: number;
    support: ReturnType<typeof FallbackHandler.checkSupport>;
  } {
    return {
      isEnabled: this.isEnabled,
      activeTimeouts: this.fallbackTimeouts.size,
      support: FallbackHandler.checkSupport(),
    };
  }

  /**
   * Update fallback configuration
   */
  public updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Force enable/disable fallback handling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      // Clear any active timeouts
      this.fallbackTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      this.fallbackTimeouts.clear();
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.fallbackTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.fallbackTimeouts.clear();

    const fallbackStyles = document.getElementById("vt-fallback-styles");
    if (fallbackStyles) {
      fallbackStyles.remove();
    }
  }
}