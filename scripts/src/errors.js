/**
 * Custom error class for application-specific errors
 * @extends Error
 */
class ConversionError extends Error {
  /**
   * Create a ConversionError
   * @param {string} message - Error message
   * @param {*} [details] - Additional error details
   */
  constructor(message, details) {
    super(message);
    this.name = 'ConversionError';
    this.details = details;
  }
}

module.exports = { ConversionError };
