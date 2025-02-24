/**
 * @module aos
 * @description
 * Animate On Scroll (AOS) utility module that provides a type-safe wrapper around the AOS library.
 * This module handles initialization, configuration, and refresh operations for scroll-based animations.
 *
 * @example
 * ```typescript
 * import { aosInit, refreshAOS } from './utils/aos';
 *
 * // Initialize with default settings
 * aosInit();
 *
 * // Initialize with custom configuration
 * aosInit({
 *   duration: 1000,
 *   easing: 'ease-in-out',
 *   once: true
 * });
 * ```
 */

import AOS from "aos";

/**
 * Valid easing functions for AOS animations.
 * These values determine how the animation progresses over time.
 *
 * @see https://michalsnik.github.io/aos/ for visual examples
 */
export type AOSEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-back"
  | "ease-out-back"
  | "ease-in-out-back"
  | "ease-in-sine"
  | "ease-out-sine"
  | "ease-in-out-sine"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-in-quart"
  | "ease-out-quart"
  | "ease-in-out-quart";

/**
 * Valid placement options for AOS animations.
 * These values determine when the animation triggers based on element position.
 *
 * @example
 * - 'top-bottom': Triggers when element's top reaches bottom of viewport
 * - 'center-center': Triggers when element's center reaches center of viewport
 */
export type AOSPlacement =
  | "top-bottom"
  | "top-center"
  | "top-top"
  | "center-bottom"
  | "center-center"
  | "center-top"
  | "bottom-bottom"
  | "bottom-center"
  | "bottom-top";

/**
 * Configuration interface for AOS initialization.
 * Provides type-safe configuration options for customizing animation behavior.
 *
 * @property duration - Animation duration in milliseconds
 * @property easing - Animation timing function
 * @property once - Whether animation should only happen once
 * @property offset - Offset (in px) from the original trigger point
 * @property delay - Additional delay before animation starts
 * @property mirror - Whether elements should animate out while scrolling past them
 * @property anchorPlacement - Defines which position of the element regarding to window should trigger the animation
 * @property disable - Accepts boolean, 'phone', 'tablet', 'mobile' or function
 * @property startEvent - Name of the event dispatched on the document that AOS should initialize on
 * @property disableMutationObserver - Disables automatic mutations' detections
 */
export interface AOSConfig {
  readonly duration: number;
  readonly easing: AOSEasing;
  readonly once: boolean;
  readonly offset: number;
  readonly delay?: number;
  readonly mirror?: boolean;
  readonly anchorPlacement?: AOSPlacement;
  readonly disable?: boolean | "phone" | "tablet" | "mobile" | (() => boolean);
  readonly startEvent?: string;
  readonly disableMutationObserver?: boolean;
}

/**
 * Default configuration for AOS initialization.
 * These values provide a balanced animation experience suitable for most use cases.
 */
const DEFAULT_CONFIG: AOSConfig = {
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 50,
};

/**
 * Initializes the Animate On Scroll library with configuration.
 * This function sets up AOS with either default or custom settings.
 *
 * @param config - Optional custom configuration to override defaults
 * @throws {Error} If any configuration values are invalid (e.g., negative duration)
 *
 * @example
 * ```typescript
 * // Initialize with defaults
 * aosInit();
 *
 * // Initialize with custom config
 * aosInit({
 *   duration: 1200,
 *   easing: 'ease-in-out',
 *   once: false,
 *   mirror: true
 * });
 * ```
 */
export function aosInit(config: Partial<AOSConfig> = {}): void {
  validateConfig(config);
  AOS.init({
    ...DEFAULT_CONFIG,
    ...config,
  });
}

/**
 * Validates AOS configuration values to ensure they meet requirements.
 * Performs type and range checking on numeric values.
 *
 * @param config - Configuration object to validate
 * @throws {Error} If duration, offset, or delay are negative numbers
 *
 * @internal
 */
function validateConfig(config: Partial<AOSConfig>): void {
  if (config.duration !== undefined && config.duration < 0) {
    throw new Error("Duration must be a positive number");
  }

  if (config.offset !== undefined && config.offset < 0) {
    throw new Error("Offset must be a positive number");
  }

  if (config.delay !== undefined && config.delay < 0) {
    throw new Error("Delay must be a positive number");
  }
}

/**
 * Refreshes all AOS instances and recalculates their positions.
 * This is useful when dynamically adding elements or changing the DOM structure.
 *
 * @example
 * ```typescript
 * // After dynamically adding new elements
 * addNewContent();
 * refreshAOS();
 * ```
 */
export function refreshAOS(): void {
  AOS.refresh();
}

// Store timeout ID outside function for proper debouncing
let refreshTimeoutId: NodeJS.Timeout | undefined;

/**
 * Refreshes AOS instances with a debounce to prevent performance issues.
 * This is particularly useful during window resize or dynamic content updates.
 *
 * @param delay - Debounce delay in milliseconds (defaults to 100ms)
 *
 * @example
 * ```typescript
 * // During continuous updates
 * window.addEventListener('resize', () => {
 *   debouncedRefreshAOS(150);
 * });
 * ```
 */
export function debouncedRefreshAOS(delay = 100): void {
  if (refreshTimeoutId) {
    clearTimeout(refreshTimeoutId);
  }

  refreshTimeoutId = setTimeout(() => {
    AOS.refresh();
    refreshTimeoutId = undefined;
  }, delay);
}
