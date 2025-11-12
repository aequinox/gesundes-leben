/**
 * @module error-handling/shared
 * @description
 * Shared error handling utilities for consistent error management across utilities.
 * Provides typed error handling with logging and fallback values.
 *
 * @example
 * ```typescript
 * import { withErrorHandling, withAsyncErrorHandling } from './utils/error-handling/shared';
 *
 * // Async operation with error handling
 * const posts = await withAsyncErrorHandling(
 *   async () => await fetchPosts(),
 *   'getAllPosts',
 *   []  // fallback value
 * );
 *
 * // Sync operation with error handling
 * const sorted = withErrorHandling(
 *   () => sortPosts(posts),
 *   'sortPosts',
 *   posts  // fallback value on error
 * );
 * ```
 */

import { logger } from "@/utils/logger";
import { createError, isAppError, formatErrorMessage } from "@/utils/errors";
import type { AppError } from "@/utils/errors";

/**
 * Options for error handling configuration
 */
export interface ErrorHandlingOptions<T> {
  /** Context name for logging (e.g., function name) */
  context: string;
  /** Fallback value to return on error */
  fallbackValue: T;
  /** Whether to log the error (default: true) */
  logError?: boolean;
  /** Custom error transformer function */
  transformError?: (error: unknown) => AppError;
  /** Callback to execute on error (e.g., for analytics) */
  onError?: (error: unknown, context: string) => void;
}

/**
 * Wraps an async operation with consistent error handling and logging.
 * Returns fallback value if operation fails.
 *
 * @param operation - Async operation to execute
 * @param context - Context name for logging (e.g., 'getAllPosts')
 * @param fallbackValue - Value to return on error
 * @param options - Additional error handling options
 * @returns Promise resolving to operation result or fallback value
 *
 * @example
 * ```typescript
 * const posts = await withAsyncErrorHandling(
 *   async () => await getCollection("blog"),
 *   'getAllPosts',
 *   []
 * );
 * ```
 */
export async function withAsyncErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  fallbackValue: T,
  options?: Partial<Omit<ErrorHandlingOptions<T>, "context" | "fallbackValue">>
): Promise<T> {
  const { logError = true, transformError, onError } = options || {};

  try {
    return await operation();
  } catch (error) {
    // Transform error if transformer provided
    const finalError = transformError ? transformError(error) : error;

    // Log error if enabled
    if (logError) {
      logger.error(`Error in ${context}:`, finalError);
    }

    // Execute custom error callback if provided
    if (onError) {
      try {
        onError(finalError, context);
      } catch (callbackError) {
        logger.error(`Error in onError callback for ${context}:`, callbackError);
      }
    }

    // Return fallback value
    return fallbackValue;
  }
}

/**
 * Wraps a synchronous operation with consistent error handling and logging.
 * Returns fallback value if operation fails.
 *
 * @param operation - Synchronous operation to execute
 * @param context - Context name for logging (e.g., 'sortPosts')
 * @param fallbackValue - Value to return on error
 * @param options - Additional error handling options
 * @returns Operation result or fallback value
 *
 * @example
 * ```typescript
 * const sorted = withErrorHandling(
 *   () => posts.sort((a, b) => b.date - a.date),
 *   'sortPosts',
 *   posts
 * );
 * ```
 */
export function withErrorHandling<T>(
  operation: () => T,
  context: string,
  fallbackValue: T,
  options?: Partial<Omit<ErrorHandlingOptions<T>, "context" | "fallbackValue">>
): T {
  const { logError = true, transformError, onError } = options || {};

  try {
    return operation();
  } catch (error) {
    // Transform error if transformer provided
    const finalError = transformError ? transformError(error) : error;

    // Log error if enabled
    if (logError) {
      logger.error(`Error in ${context}:`, finalError);
    }

    // Execute custom error callback if provided
    if (onError) {
      try {
        onError(finalError, context);
      } catch (callbackError) {
        logger.error(`Error in onError callback for ${context}:`, callbackError);
      }
    }

    // Return fallback value
    return fallbackValue;
  }
}

/**
 * Wraps an async operation with error handling but throws AppError on failure.
 * Use this when you want to handle errors at a higher level.
 *
 * @param operation - Async operation to execute
 * @param context - Context name for logging and error context
 * @param options - Additional error handling options
 * @returns Promise resolving to operation result
 * @throws AppError with context information
 *
 * @example
 * ```typescript
 * try {
 *   const reference = await withAsyncErrorThrow(
 *     async () => await getReferenceById(id),
 *     'getReferenceById',
 *     { contextData: { id } }
 *   );
 * } catch (error) {
 *   // Handle error at higher level
 * }
 * ```
 */
export async function withAsyncErrorThrow<T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    logError?: boolean;
    contextData?: Record<string, unknown>;
    onError?: (error: unknown, context: string) => void;
  }
): Promise<T> {
  const { logError = true, contextData, onError } = options || {};

  try {
    return await operation();
  } catch (error) {
    // Log error if enabled
    if (logError) {
      logger.error(`Error in ${context}:`, error);
    }

    // Execute custom error callback if provided
    if (onError) {
      try {
        onError(error, context);
      } catch (callbackError) {
        logger.error(`Error in onError callback for ${context}:`, callbackError);
      }
    }

    // Create AppError with context
    const appError = isAppError(error)
      ? error
      : createError(formatErrorMessage(error), {
          context,
          ...contextData,
        });

    throw appError;
  }
}

/**
 * Creates a wrapped version of an async function with built-in error handling.
 * Useful for creating reusable error-handled functions.
 *
 * @param fn - Function to wrap
 * @param context - Context name for logging
 * @param fallbackValue - Value to return on error
 * @returns Wrapped function with error handling
 *
 * @example
 * ```typescript
 * const safeGetPosts = createAsyncErrorHandler(
 *   async (includeDrafts: boolean) => await getCollection("blog"),
 *   'getAllPosts',
 *   []
 * );
 *
 * const posts = await safeGetPosts(false);
 * ```
 */
export function createAsyncErrorHandler<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context: string,
  fallbackValue: TReturn,
  options?: Partial<Omit<ErrorHandlingOptions<TReturn>, "context" | "fallbackValue">>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return withAsyncErrorHandling(
      () => fn(...args),
      context,
      fallbackValue,
      options
    );
  };
}

/**
 * Creates a wrapped version of a synchronous function with built-in error handling.
 * Useful for creating reusable error-handled functions.
 *
 * @param fn - Function to wrap
 * @param context - Context name for logging
 * @param fallbackValue - Value to return on error
 * @returns Wrapped function with error handling
 *
 * @example
 * ```typescript
 * const safeSortPosts = createErrorHandler(
 *   (posts: Post[]) => posts.sort((a, b) => b.date - a.date),
 *   'sortPosts',
 *   []
 * );
 *
 * const sorted = safeSortPosts(posts);
 * ```
 */
export function createErrorHandler<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  context: string,
  fallbackValue: TReturn,
  options?: Partial<Omit<ErrorHandlingOptions<TReturn>, "context" | "fallbackValue">>
): (...args: TArgs) => TReturn {
  return (...args: TArgs): TReturn => {
    return withErrorHandling(() => fn(...args), context, fallbackValue, options);
  };
}

/**
 * Retries an async operation with exponential backoff on failure.
 *
 * @param operation - Async operation to retry
 * @param context - Context name for logging
 * @param options - Retry options
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   async () => await fetchFromAPI(),
 *   'fetchFromAPI',
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    onRetry?: (error: unknown, attempt: number) => void;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry,
  } = options || {};

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      logger.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} for ${context} after ${delay}ms`
      );

      // Execute retry callback if provided
      if (onRetry) {
        onRetry(error, attempt);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay *= backoffMultiplier;
    }
  }

  // All retries failed
  logger.error(`All ${maxRetries} retry attempts failed for ${context}`);
  throw lastError;
}

/**
 * Validates that a value is not null/undefined, throws error if it is.
 *
 * @param value - Value to validate
 * @param context - Context for error message
 * @param fieldName - Name of the field being validated
 * @returns The value if valid
 * @throws AppError if value is null/undefined
 *
 * @example
 * ```typescript
 * const user = assertDefined(getUserById(id), 'getUserById', 'user');
 * // user is guaranteed to be non-null here
 * ```
 */
export function assertDefined<T>(
  value: T | null | undefined,
  context: string,
  fieldName: string = "value"
): T {
  if (value === null || value === undefined) {
    const error = createError(`${fieldName} is null or undefined in ${context}`, {
      context,
      fieldName,
    });
    logger.error(error.message);
    throw error;
  }
  return value;
}

/**
 * Type guard that logs and returns false if condition fails.
 * Useful for validation with logging.
 *
 * @param condition - Condition to check
 * @param context - Context for logging
 * @param message - Error message
 * @returns Boolean indicating if condition is true
 *
 * @example
 * ```typescript
 * if (!validateWithLog(posts.length > 0, 'getPosts', 'No posts found')) {
 *   return [];
 * }
 * ```
 */
export function validateWithLog(
  condition: boolean,
  context: string,
  message: string
): boolean {
  if (!condition) {
    logger.warn(`Validation failed in ${context}: ${message}`);
    return false;
  }
  return true;
}
