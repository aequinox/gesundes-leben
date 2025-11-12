/**
 * View Transitions Initialization Module
 * Provides convenient initialization functions for the modular view transitions system
 */

import { logger } from "@/utils/logger";

import {
  mergeConfig,
  validateConfig,
  type ViewTransitionConfig,
} from "./config";
import { ViewTransitionEnhancer } from "./enhancer";

/**
 * Extend Window interface to include view transitions enhancer
 */
declare global {
  interface Window {
    __viewTransitionEnhancer?: ViewTransitionEnhancer;
  }
}

/**
 * Initialize view transitions with configuration
 */
export function initViewTransitions(
  config: ViewTransitionConfig = {}
): ViewTransitionEnhancer {
  // Validate configuration
  const errors = validateConfig(config);
  if (errors.length > 0) {
    logger.error("ViewTransitions: Configuration validation failed:", errors);
    if (config.debug) {
      errors.forEach(error => {
        logger.error(`  - ${error.field}: ${error.message} (${error.code})`);
      });
    }
    throw new Error(
      `Invalid view transitions configuration: ${errors.map(e => e.message).join(", ")}`
    );
  }

  // Merge with defaults
  const finalConfig = mergeConfig(config);

  // Create and initialize enhancer
  const enhancer = new ViewTransitionEnhancer(finalConfig);
  enhancer.init();

  // Store reference for cleanup
  if (typeof window !== "undefined") {
    window.__viewTransitionEnhancer = enhancer;
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

  return window.__viewTransitionEnhancer ?? null;
}

/**
 * Cleanup view transitions
 */
export function cleanupViewTransitions(): void {
  const instance = getViewTransitionsInstance();
  if (instance) {
    instance.cleanup();
    delete window.__viewTransitionEnhancer;
  }
}

/**
 * Reinitialize view transitions with new configuration
 */
export function reinitViewTransitions(
  config: ViewTransitionConfig = {}
): ViewTransitionEnhancer {
  cleanupViewTransitions();
  return initViewTransitions(config);
}
