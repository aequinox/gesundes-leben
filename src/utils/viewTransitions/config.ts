/**
 * View Transitions Configuration Module
 * Centralized configuration management for view transitions
 */

export type PreloadStrategy = "hover" | "visible" | "none";
export type TransitionType = "slide" | "fade" | "morph" | "custom";
export type AnimationEasing = "enter" | "exit" | "spring" | "bounce";

export interface ViewTransitionDurations {
  fast: number;
  normal: number;
  slow: number;
}

export interface AccessibilityConfig {
  respectReducedMotion: boolean;
  announceRouteChanges: boolean;
  routeAnnouncementLanguage: "de" | "en";
}

export interface ViewTransitionConfig {
  /** Enable performance metrics collection */
  enablePerformanceMetrics?: boolean;
  /** Delay before fallback navigation (ms) */
  fallbackDelay?: number;
  /** Maximum allowed transition duration (ms) */
  maxTransitionDuration?: number;
  /** Strategy for preloading pages */
  preloadStrategy?: PreloadStrategy;
  /** Custom transition durations */
  durations?: Partial<ViewTransitionDurations>;
  /** Debug mode for development */
  debug?: boolean;
  /** Accessibility preferences */
  accessibility?: Partial<AccessibilityConfig>;
}

export interface TransitionMetrics {
  preparationDuration: number;
  swapDuration: number;
  totalDuration: number;
  timestamp: number;
  transitionType?: TransitionType;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<ViewTransitionConfig> = {
  enablePerformanceMetrics: true,
  fallbackDelay: 500,
  maxTransitionDuration: 1000,
  preloadStrategy: "hover",
  durations: {
    fast: 200,
    normal: 350,
    slow: 500,
  },
  debug: false,
  accessibility: {
    respectReducedMotion: true,
    announceRouteChanges: true,
    routeAnnouncementLanguage: "de",
  },
};

/**
 * Validation rules for configuration
 */
export const VALIDATION_RULES = {
  fallbackDelay: { min: 0, max: 5000 },
  maxTransitionDuration: { min: 100, max: 3000 },
  preloadStrategies: ["hover", "visible", "none"] as const,
  durations: {
    fast: { min: 50, max: 500 },
    normal: { min: 100, max: 1000 },
    slow: { min: 200, max: 2000 },
  },
} as const;

/**
 * Validate configuration against rules
 */
export function validateConfig(
  config: ViewTransitionConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate fallbackDelay
  if (config.fallbackDelay !== undefined) {
    const { min, max } = VALIDATION_RULES.fallbackDelay;
    if (
      typeof config.fallbackDelay !== "number" ||
      config.fallbackDelay < min ||
      config.fallbackDelay > max
    ) {
      errors.push({
        field: "fallbackDelay",
        message: `fallbackDelay must be a number between ${min} and ${max}`,
        code: "INVALID_FALLBACK_DELAY",
      });
    }
  }

  // Validate maxTransitionDuration
  if (config.maxTransitionDuration !== undefined) {
    const { min, max } = VALIDATION_RULES.maxTransitionDuration;
    if (
      typeof config.maxTransitionDuration !== "number" ||
      config.maxTransitionDuration < min ||
      config.maxTransitionDuration > max
    ) {
      errors.push({
        field: "maxTransitionDuration",
        message: `maxTransitionDuration must be a number between ${min} and ${max}`,
        code: "INVALID_MAX_DURATION",
      });
    }
  }

  // Validate preloadStrategy
  if (config.preloadStrategy !== undefined) {
    if (!VALIDATION_RULES.preloadStrategies.includes(config.preloadStrategy)) {
      errors.push({
        field: "preloadStrategy",
        message: `preloadStrategy must be one of: ${VALIDATION_RULES.preloadStrategies.join(", ")}`,
        code: "INVALID_PRELOAD_STRATEGY",
      });
    }
  }

  // Validate durations
  if (config.durations) {
    Object.entries(config.durations).forEach(([key, value]) => {
      if (value !== undefined) {
        const durationType = key as keyof ViewTransitionDurations;
        const { min, max } = VALIDATION_RULES.durations[durationType];
        if (typeof value !== "number" || value < min || value > max) {
          errors.push({
            field: `durations.${key}`,
            message: `${key} duration must be a number between ${min} and ${max}`,
            code: `INVALID_DURATION_${key.toUpperCase()}`,
          });
        }
      }
    });
  }

  return errors;
}

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  userConfig: ViewTransitionConfig
): Required<ViewTransitionConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    durations: { ...DEFAULT_CONFIG.durations, ...userConfig.durations },
    accessibility: {
      ...DEFAULT_CONFIG.accessibility,
      ...userConfig.accessibility,
    },
  };
}
