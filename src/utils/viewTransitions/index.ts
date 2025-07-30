/**
 * View Transitions Module - Modular Architecture
 * 
 * This module provides a comprehensive, modular approach to managing Astro view transitions
 * with enhanced performance, accessibility, and developer experience.
 * 
 * Features:
 * - Modular architecture with separation of concerns
 * - Type-safe configuration with runtime validation
 * - Performance metrics and monitoring
 * - Comprehensive accessibility support
 * - Intelligent preloading strategies
 * - Graceful fallback handling
 * - Memory management and cleanup
 */

// Export all types and interfaces
export type {
  ViewTransitionConfig,
  AccessibilityConfig,
  TransitionMetrics,
  TransitionType,
  PreloadStrategy,
  ValidationError,
  ViewTransitionDurations,
} from "./config";

// Export configuration utilities
export {
  DEFAULT_CONFIG,
  VALIDATION_RULES,
  validateConfig,
  mergeConfig,
} from "./config";

// Export modular components
export { AccessibilityManager } from "./accessibility";
export { MetricsCollector } from "./metrics";
export { PreloadManager } from "./preloader";
export { FallbackHandler } from "./fallback";

// Export main enhancer class
export { ViewTransitionEnhancer } from "./enhancer";

// Export convenience initialization functions
export {
  initViewTransitions,
  getViewTransitionsInstance,
  cleanupViewTransitions,
  reinitViewTransitions,
} from "./init";