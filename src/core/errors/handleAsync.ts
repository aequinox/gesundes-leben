import { ApplicationError, ErrorCode } from "./ApplicationError";

/**
 * Async error handling utility to standardize error management
 * @param fn Async function to execute
 * @param errorHandler Optional custom error handler
 */
export async function handleAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // If a custom error handler is provided, use it
    if (errorHandler) {
      return errorHandler(error);
    }

    // If it's already an ApplicationError, rethrow
    if (error instanceof ApplicationError) {
      throw error;
    }

    // Convert unknown errors to ApplicationError
    if (error instanceof Error) {
      throw new ApplicationError(error.message, ErrorCode.SYSTEM_ERROR, {
        originalError: error.name,
      });
    }

    // For non-Error objects
    throw new ApplicationError(String(error), ErrorCode.UNKNOWN);
  }
}
