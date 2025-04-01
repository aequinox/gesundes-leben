/**
 * Base application error class for standardized error handling
 */
export enum ErrorCode {
  UNKNOWN = "UNKNOWN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}

export class ApplicationError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where it was thrown (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts error to a standardized error response
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Content-related errors
 */
export class ContentError extends ApplicationError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.NOT_FOUND,
    details?: Record<string, unknown>
  ) {
    super(message, code, details);
  }
}

/**
 * Validation-related errors
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
  }
}
