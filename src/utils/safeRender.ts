/**
 * @module safeRender
 * @description
 * Utilities for safe component rendering and error handling in Astro.
 * Provides patterns for graceful degradation and error recovery.
 *
 * @example
 * ```typescript
 * import { safelyRender, withErrorBoundary } from './utils/safeRender';
 *
 * const result = await safelyRender(async () => {
 *   return await fetchDataFromAPI();
 * }, 'Failed to load data');
 * ```
 */
import { createError, isAppError, formatErrorMessage } from "./errors";
import { logger } from "./logger";

/**
 * Configuration for safe rendering operations
 */
export interface SafeRenderConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number;

  /** Delay between retries in milliseconds */
  retryDelay?: number;

  /** Whether to log errors */
  logErrors?: boolean;

  /** Component name for error tracking */
  componentName?: string;

  /** Default fallback value */
  fallback?: any;

  /** Whether to show errors in development */
  showDevErrors?: boolean;
}

/**
 * Default configuration for safe rendering
 */
const DEFAULT_CONFIG: Required<SafeRenderConfig> = {
  maxRetries: 0,
  retryDelay: 1000,
  logErrors: true,
  componentName: "Unknown Component",
  fallback: null,
  showDevErrors: true,
};

/**
 * Safely executes an async operation with error handling and optional retries.
 *
 * @param operation - The async operation to execute
 * @param errorMessage - Custom error message for failures
 * @param config - Configuration options
 * @returns Promise resolving to operation result or fallback
 */
export async function safelyRender<T>(
  operation: () => Promise<T>,
  errorMessage?: string,
  config: SafeRenderConfig = {}
): Promise<T | null> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (fullConfig.logErrors) {
        const attemptMsg =
          attempt < fullConfig.maxRetries
            ? ` (attempt ${attempt + 1}/${fullConfig.maxRetries + 1})`
            : "";

        logger.error(
          "Error in",
          fullConfig.componentName + attemptMsg,
          ":",
          formatErrorMessage(error)
        );
      }

      // If we have more retries, wait and try again
      if (attempt < fullConfig.maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, fullConfig.retryDelay)
        );
        continue;
      }

      // Final attempt failed
      break;
    }
  }

  // All attempts failed
  if (fullConfig.showDevErrors && import.meta.env.DEV) {
    throw isAppError(lastError)
      ? lastError
      : createError(errorMessage || "Safe render operation failed", {
          componentName: fullConfig.componentName,
          originalError: lastError,
          attempts: fullConfig.maxRetries + 1,
        });
  }

  return fullConfig.fallback as T | null;
}

/**
 * Safely executes a synchronous operation with error handling.
 *
 * @param operation - The sync operation to execute
 * @param errorMessage - Custom error message for failures
 * @param config - Configuration options
 * @returns Operation result or fallback
 */
export function safelyExecute<T>(
  operation: () => T,
  errorMessage?: string,
  config: SafeRenderConfig = {}
): T | null {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    return operation();
  } catch (error) {
    if (fullConfig.logErrors) {
      logger.error(
        "Error in",
        fullConfig.componentName,
        ":",
        formatErrorMessage(error)
      );
    }

    if (fullConfig.showDevErrors && import.meta.env.DEV) {
      throw isAppError(error)
        ? error
        : createError(errorMessage || "Safe execute operation failed", {
            componentName: fullConfig.componentName,
            originalError: error,
          });
    }

    return fullConfig.fallback as T | null;
  }
}

/**
 * Creates a higher-order function that wraps an async function with error handling.
 *
 * @param config - Default configuration for the wrapper
 * @returns Function wrapper with error handling
 */
export function withErrorBoundary<TArgs extends any[], TReturn>(
  config: SafeRenderConfig = {}
) {
  return function <T extends (...args: TArgs) => Promise<TReturn>>(
    fn: T,
    errorMessage?: string
  ): (...args: TArgs) => Promise<TReturn | null> {
    return async (...args: TArgs) => {
      return safelyRender(() => fn(...args), errorMessage, config);
    };
  };
}

/**
 * Safely renders multiple operations in parallel with individual error handling.
 *
 * @param operations - Array of operations to execute
 * @param config - Configuration options
 * @returns Promise resolving to array of results (some may be null on failure)
 */
export async function safelyRenderAll<T>(
  operations: Array<{
    operation: () => Promise<T>;
    errorMessage?: string;
    config?: SafeRenderConfig;
  }>,
  globalConfig: SafeRenderConfig = {}
): Promise<Array<T | null>> {
  const results = await Promise.allSettled(
    operations.map(({ operation, errorMessage, config }) =>
      safelyRender(operation, errorMessage, { ...globalConfig, ...config })
    )
  );

  return results.map(result =>
    result.status === "fulfilled" ? result.value : null
  );
}

/**
 * Creates a safe version of fetch with automatic error handling and retries.
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param config - Safe render configuration
 * @returns Promise resolving to Response or null
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  config: SafeRenderConfig = {}
): Promise<Response | null> {
  const operation = async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw createError(`HTTP ${response.status}: ${response.statusText}`, {
        url,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  };

  return safelyRender(operation, `Failed to fetch ${url}`, {
    componentName: "safeFetch",
    maxRetries: 2,
    retryDelay: 1000,
    ...config,
  });
}

/**
 * Safely parses JSON with error handling.
 *
 * @param text - JSON string to parse
 * @param config - Configuration options
 * @returns Parsed object or null
 */
export function safeJsonParse<T = any>(
  text: string,
  config: SafeRenderConfig = {}
): T | null {
  return safelyExecute(() => JSON.parse(text) as T, "Failed to parse JSON", {
    componentName: "safeJsonParse",
    ...config,
  });
}

/**
 * Creates a debounced version of an async function with error handling.
 *
 * @param fn - Function to debounce
 * @param delay - Debounce delay in milliseconds
 * @param config - Safe render configuration
 * @returns Debounced function
 */
export function createSafeDebounced<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  delay: number = 300,
  config: SafeRenderConfig = {}
): (...args: TArgs) => Promise<TReturn | null> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let latestResolve: ((value: TReturn | null) => void) | null = null;

  return (...args: TArgs): Promise<TReturn | null> => {
    return new Promise(resolve => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If there's a pending resolve, resolve it with null
      if (latestResolve) {
        latestResolve(null);
      }

      latestResolve = resolve;

      timeoutId = setTimeout(async () => {
        const result = await safelyRender(
          () => fn(...args),
          "Debounced function failed",
          config
        );

        if (latestResolve === resolve) {
          resolve(result);
          latestResolve = null;
        }
      }, delay);
    });
  };
}

/**
 * Utility to check if a value is a safe render result (not null/undefined).
 *
 * @param value - Value to check
 * @returns Type guard indicating if value is not null/undefined
 */
export function isSafeResult<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Creates a memoized version of an async function with error handling and caching.
 *
 * @param fn - Function to memoize
 * @param keyGenerator - Function to generate cache keys
 * @param config - Configuration options
 * @returns Memoized function
 */
export function createSafeMemoized<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyGenerator: (...args: TArgs) => string = (...args) => JSON.stringify(args),
  config: SafeRenderConfig & { cacheTimeout?: number } = {}
): (...args: TArgs) => Promise<TReturn | null> {
  const cache = new Map<
    string,
    {
      value: TReturn | null;
      timestamp: number;
      promise?: Promise<TReturn | null>;
    }
  >();

  const cacheTimeout = config.cacheTimeout ?? 5 * 60 * 1000; // 5 minutes default

  return async (...args: TArgs): Promise<TReturn | null> => {
    const key = keyGenerator(...args);
    const now = Date.now();
    const cached = cache.get(key);

    // Return cached result if valid
    if (cached && now - cached.timestamp < cacheTimeout) {
      // If there's a pending promise, wait for it
      if (cached.promise) {
        return cached.promise;
      }
      return cached.value;
    }

    // Create new promise for this cache key
    const promise = safelyRender(
      () => fn(...args),
      "Memoized function failed",
      config
    );

    cache.set(key, {
      value: null,
      timestamp: now,
      promise,
    });

    const result = await promise;

    // Update cache with result
    cache.set(key, {
      value: result,
      timestamp: now,
    });

    return result;
  };
}

/**
 * Error recovery strategies
 */
export const ErrorRecoveryStrategies = {
  /**
   * Retry with exponential backoff
   */
  exponentialBackoff: (attempt: number, baseDelay: number = 1000): number => {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Cap at 30 seconds
  },

  /**
   * Retry with linear backoff
   */
  linearBackoff: (attempt: number, baseDelay: number = 1000): number => {
    return baseDelay * (attempt + 1);
  },

  /**
   * Retry with random jitter
   */
  withJitter: (baseDelay: number, jitterRange: number = 0.1): number => {
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(0, baseDelay * (1 + jitter));
  },
} as const;
