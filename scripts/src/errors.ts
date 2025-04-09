/**
 * Custom error class for application-specific errors during the conversion process.
 * Extends the built-in Error class.
 */
export class ConversionError extends Error {
  /**
   * Additional details or the original error object associated with this error.
   * Using 'unknown' allows flexibility in what can be stored.
   */
  public readonly details?: unknown;

  /**
   * Creates an instance of ConversionError.
   * @param message - The primary error message.
   * @param details - Optional additional details or the original error object.
   */
  constructor(message: string, details?: unknown) {
    super(message); // Call the parent Error constructor

    // Set the prototype explicitly for correct instanceof checks
    Object.setPrototypeOf(this, ConversionError.prototype);

    // Set the error name
    this.name = 'ConversionError';

    // Store the details
    this.details = details;

    // Capture stack trace (optional, improves debugging in some environments)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConversionError);
    }
  }
}