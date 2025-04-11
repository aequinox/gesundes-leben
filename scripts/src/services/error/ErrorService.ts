/**
 * Error service for handling application-specific errors.
 * Provides a centralized way to create and handle errors.
 */

/**
 * Base error class for application-specific errors.
 * Extends the built-in Error class.
 */
export class ApplicationError extends Error {
  /**
   * Additional details or the original error object associated with this error.
   */
  public readonly details?: unknown;

  /**
   * Creates an instance of ApplicationError.
   * @param message - The primary error message.
   * @param details - Optional additional details or the original error object.
   */
  constructor(message: string, details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = 'ApplicationError';
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

/**
 * Error class for conversion-related errors.
 */
export class ConversionError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, ConversionError.prototype);
    this.name = 'ConversionError';
  }
}

/**
 * Error class for configuration-related errors.
 */
export class ConfigurationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
    this.name = 'ConfigurationError';
  }
}

/**
 * Error class for parsing-related errors.
 */
export class ParsingError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, ParsingError.prototype);
    this.name = 'ParsingError';
  }
}

/**
 * Error class for transformation-related errors.
 */
export class TransformationError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, TransformationError.prototype);
    this.name = 'TransformationError';
  }
}

/**
 * Error class for file system-related errors.
 */
export class FileSystemError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, FileSystemError.prototype);
    this.name = 'FileSystemError';
  }
}

/**
 * Error class for image processing-related errors.
 */
export class ImageProcessingError extends ApplicationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    Object.setPrototypeOf(this, ImageProcessingError.prototype);
    this.name = 'ImageProcessingError';
  }
}

/**
 * Service for handling errors in the application.
 */
export class ErrorService {
  /**
   * Creates a ConversionError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns A ConversionError instance.
   */
  public createConversionError(message: string, details?: unknown): ConversionError {
    return new ConversionError(message, details);
  }

  /**
   * Creates a ConfigurationError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns A ConfigurationError instance.
   */
  public createConfigurationError(message: string, details?: unknown): ConfigurationError {
    return new ConfigurationError(message, details);
  }

  /**
   * Creates a ParsingError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns A ParsingError instance.
   */
  public createParsingError(message: string, details?: unknown): ParsingError {
    return new ParsingError(message, details);
  }

  /**
   * Creates a TransformationError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns A TransformationError instance.
   */
  public createTransformationError(message: string, details?: unknown): TransformationError {
    return new TransformationError(message, details);
  }

  /**
   * Creates a FileSystemError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns A FileSystemError instance.
   */
  public createFileSystemError(message: string, details?: unknown): FileSystemError {
    return new FileSystemError(message, details);
  }

  /**
   * Creates an ImageProcessingError.
   * @param message - The error message.
   * @param details - Optional additional details or the original error object.
   * @returns An ImageProcessingError instance.
   */
  public createImageProcessingError(message: string, details?: unknown): ImageProcessingError {
    return new ImageProcessingError(message, details);
  }

  /**
   * Wraps an error in an ApplicationError if it's not already one.
   * @param error - The error to wrap.
   * @param message - Optional message to use instead of the original error message.
   * @returns An ApplicationError instance.
   */
  public wrapError(error: unknown, message?: string): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    const errorMessage = message || (error instanceof Error ? error.message : String(error));
    return new ApplicationError(errorMessage, error);
  }
}

// Export a singleton instance of the ErrorService
export const errorService = new ErrorService();
