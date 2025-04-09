/**
 * Logger utility for consistent console output with TypeScript types.
 */

interface Logger {
  /** Logs an informational message to the console. */
  info(message: string): void;

  /** Logs a success message to the console. */
  success(message: string): void;

  /** Logs a warning message to the console. */
  warn(message: string): void;

  /** Logs an error message to the console, optionally including an Error object. */
  error(message: string, error?: Error | unknown): void; // Allow unknown for broader error catching
}

const logger: Logger = {
  /** Prefixes message with a newline for better readability. */
  info: (message: string): void => {
    console.log(`\nINFO: ${message}`); // Added prefix for clarity
  },

  /** Prefixes message with a newline for better readability. */
  success: (message: string): void => {
    console.log(`\nSUCCESS: ${message}`); // Added prefix for clarity
  },

  /** Prefixes message with a newline for better readability. Uses console.warn. */
  warn: (message: string): void => {
    console.warn(`\nWARN: ${message}`); // Added prefix for clarity
  },

  /** Prefixes message with a newline. Logs the error object if provided. */
  error: (message: string, error?: Error | unknown): void => {
    console.error(`\nERROR: ${message}`); // Added prefix for clarity
    if (error) {
      // Check if it's an Error object to potentially log stack trace
      if (error instanceof Error) {
        console.error(error.stack || error.message);
      } else {
        console.error(error);
      }
    }
  },
};

export default logger;