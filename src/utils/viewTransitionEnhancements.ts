/**
 * View Transitions Performance Enhancements
 *
 * This module provides a backward-compatible interface to the new modular
 * view transitions architecture. It re-exports the modular components
 * while maintaining the existing API for seamless migration.
 *
 * @deprecated Use the modular architecture from @/utils/viewTransitions instead
 */

// Re-export everything from the modular architecture
// Backward compatibility: provide a default initialization
// that uses the new modular architecture
import {
  initViewTransitions,
  type ViewTransitionEnhancer,
} from "./viewTransitions";

// Auto-initialize with default config for backward compatibility
if (typeof window !== "undefined") {
  let enhancer: ViewTransitionEnhancer | null = null;

  const initialize = () => {
    try {
      enhancer = initViewTransitions({
        debug: false, // Set to true for development
        enablePerformanceMetrics: true,
        preloadStrategy: "hover",
        accessibility: {
          respectReducedMotion: true,
          announceRouteChanges: true,
          routeAnnouncementLanguage: "de",
        },
      });
    } catch {
      // Silently fail - view transitions are progressive enhancement
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Re-initialize after view transitions
  document.addEventListener("astro:after-swap", () => {
    if (enhancer) {
      // The modular architecture handles re-initialization automatically
      // No need to manually re-init
    }
  });
}

// Export types at the end of the file
export type {
  ViewTransitionConfig,
  TransitionMetrics,
  ValidationError,
  PreloadStrategy,
  TransitionType,
  AccessibilityConfig,
  ViewTransitionDurations,
} from "./viewTransitions/config";

// Export functions at the end of the file
export {
  ViewTransitionEnhancer,
  AccessibilityManager,
  MetricsCollector,
  PreloadManager,
  FallbackHandler,
  initViewTransitions,
  getViewTransitionsInstance,
  cleanupViewTransitions,
  reinitViewTransitions,
  DEFAULT_CONFIG,
  VALIDATION_RULES,
  validateConfig,
  mergeConfig,
} from "./viewTransitions";

// Maintain backward compatibility for the main class
export { ViewTransitionEnhancer as default } from "./viewTransitions/enhancer";
