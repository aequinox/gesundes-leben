/**
 * @module errors
 * @description
 * Centralized error handling utilities for consistent error management
 * across the application. Provides typed error classes and helper functions
 * for creating and handling errors.
 *
 * @example
 * ```typescript
 * import { createError, ValidationError } from './utils/core/errors';
 *
 * throw createError('Invalid input', { field: 'email' });
 * throw new ValidationError('Invalid date format');
 * ```
 */

/**
 * Base error interface for application errors.
 * Provides consistent structure for error handling.
 */
export interface AppError extends Error {
  code?: string;
  context?: Record<string, unknown>;
}

/**
 * Error class for validation failures.
 * Used when input validation fails.
 */
export class ValidationError extends Error implements AppError {
  code = "VALIDATION_ERROR";
  context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "ValidationError";
    this.context = context;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error class for configuration errors.
 * Used when configuration validation or processing fails.
 */
export class ConfigurationError extends Error implements AppError {
  code = "CONFIGURATION_ERROR";
  context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "ConfigurationError";
    this.context = context;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error class for content processing errors.
 * Used when content manipulation or transformation fails.
 */
export class ContentProcessingError extends Error implements AppError {
  code = "CONTENT_PROCESSING_ERROR";
  context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "ContentProcessingError";
    this.context = context;
    Object.setPrototypeOf(this, ContentProcessingError.prototype);
  }
}

/**
 * Creates a typed error with optional context.
 * Provides a consistent way to create errors across the application.
 *
 * @param message - Error message
 * @param context - Optional error context
 * @returns Typed Error object
 *
 * @example
 * ```typescript
 * throw createError('Invalid date', {
 *   value: inputDate,
 *   expected: 'YYYY-MM-DD'
 * });
 * ```
 */
export function createError(
  message: string,
  context?: Record<string, unknown>
): AppError {
  const error: AppError = new Error(message);
  error.context = context;
  return error;
}

/**
 * Type guard to check if an error is an AppError.
 *
 * @param error - Error to check
 * @returns Boolean indicating if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && "context" in error;
}

/**
 * Safely extracts error message from any error type.
 * Provides consistent error message formatting.
 *
 * @param error - Error to format
 * @returns Formatted error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return isAppError(error) && error.context
      ? `${error.message} (${JSON.stringify(error.context)})`
      : error.message;
  }
  return String(error);
}

/**
 * Wraps async operations with consistent error handling.
 * Provides type-safe error handling for async functions.
 *
 * @param operation - Async operation to wrap
 * @returns Promise resolving to operation result or throwing AppError
 *
 * @example
 * ```typescript
 * const result = await handleAsync(async () => {
 *   const data = await fetchData();
 *   return processData(data);
 * });
 * ```
 */
export async function handleAsync<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw isAppError(error) ? error : createError(formatErrorMessage(error));
  }
}
