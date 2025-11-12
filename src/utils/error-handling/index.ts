/**
 * @module error-handling
 * @description
 * Re-exports all error handling utilities for easy importing
 */

// Re-export shared error handling utilities
export {
  withAsyncErrorHandling,
  withErrorHandling,
  withAsyncErrorThrow,
  createAsyncErrorHandler,
  createErrorHandler,
  withRetry,
  assertDefined,
  validateWithLog,
  type ErrorHandlingOptions,
} from "./shared";

// Re-export error boundary utilities
export type {
  ErrorInfo,
  ErrorBoundaryConfig,
  ErrorRecoveryStrategy,
} from "./error-boundary-utils";
