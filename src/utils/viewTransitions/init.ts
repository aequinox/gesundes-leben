/**
 * View Transitions Initialization Module
 * Provides convenient initialization functions for the modular view transitions system
 */

import { mergeConfig, validateConfig } from "./config";
import type { ViewTransitionConfig } from "./config";
import { ViewTransitionEnhancer } from "./enhancer";

/**
 * Initialize view transitions with configuration
 */
export function initViewTransitions(config: ViewTransitionConfig = {}): ViewTransitionEnhancer {
  // Validate configuration
  const errors = validateConfig(config);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error("ViewTransitions: Configuration validation failed:", errors);
    if (config.debug) {
      errors.forEach(error => {
        // eslint-disable-next-line no-console
        console.error(`  - ${error.field}: ${error.message} (${error.code})`);
      });
    }
    throw new Error(`Invalid view transitions configuration: ${errors.map(e => e.message).join(", ")}`);
  }

  // Merge with defaults
  const finalConfig = mergeConfig(config);

  // Create and initialize enhancer
  const enhancer = new ViewTransitionEnhancer(finalConfig);
  enhancer.init();

  // Store reference for cleanup
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__viewTransitionEnhancer = enhancer;
  }

  return enhancer;
}

/**
 * Get the current view transitions enhancer instance
 */
export function getViewTransitionsInstance(): ViewTransitionEnhancer | null {
  if (typeof window === "undefined") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__viewTransitionEnhancer || null;
}

/**
 * Cleanup view transitions
 */
export function cleanupViewTransitions(): void {
  const instance = getViewTransitionsInstance();
  if (instance) {
    instance.cleanup();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__viewTransitionEnhancer;
  }
}

/**
 * Reinitialize view transitions with new configuration
 */
export function reinitViewTransitions(config: ViewTransitionConfig = {}): ViewTransitionEnhancer {
  cleanupViewTransitions();
  return initViewTransitions(config);
}