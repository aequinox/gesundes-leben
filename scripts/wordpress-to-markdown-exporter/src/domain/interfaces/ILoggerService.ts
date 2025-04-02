/**
 * Interface for logging service
 */
export interface ILoggerService {
  /**
   * Log an informational message
   * @param message The message to log
   */
  info(message: string): void;

  /**
   * Log a success message
   * @param message The message to log
   */
  success(message: string): void;

  /**
   * Log a warning message
   * @param message The message to log
   */
  warn(message: string): void;

  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error object
   */
  error(message: string, error?: Error): void;

  /**
   * Log a debug message (only in debug mode)
   * @param message The message to log
   */
  debug(message: string): void;
}
