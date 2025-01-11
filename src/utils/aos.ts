import AOS from "aos";

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

const DEFAULT_CONFIG: AOSConfig = {
  duration: 800,
  easing: "ease-out-cubic",
  once: true,
  offset: 50,
};

/**
 * Initializes Animate On Scroll library with configuration
 * @param config - Optional custom configuration to override defaults
 * @throws {Error} If configuration values are invalid
 */
export function aosInit(config: Partial<AOSConfig> = {}): void {
  validateConfig(config);
  AOS.init({
    ...DEFAULT_CONFIG,
    ...config,
  });
}

/**
 * Validates AOS configuration values
 * @param config - Configuration to validate
 * @throws {Error} If any configuration values are invalid
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
 * Refreshes AOS instances
 * Useful when dynamically adding elements
 */
export function refreshAOS(): void {
  AOS.refresh();
}

// Store timeout ID outside function for proper debouncing
let refreshTimeoutId: NodeJS.Timeout | undefined;

/**
 * Refreshes AOS instances with a debounce
 * @param delay - Debounce delay in milliseconds
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
