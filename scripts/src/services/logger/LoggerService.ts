/**
 * Logger service for consistent console output with TypeScript types.
 * Provides different log levels and formatting options.
 */

/**
 * Log level enum for controlling verbosity.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 5,
}

/**
 * Interface for logger configuration.
 */
export interface LoggerConfig {
  /**
   * Minimum log level to display.
   * Messages with a level below this will be suppressed.
   */
  minLevel: LogLevel;

  /**
   * Whether to include timestamps in log messages.
   */
  includeTimestamps: boolean;

  /**
   * Whether to use colors in log messages.
   */
  useColors: boolean;

  /**
   * Whether to include newlines before log messages.
   */
  includeNewlines: boolean;
}

/**
 * Interface for the logger service.
 */
export interface ILoggerService {
  /**
   * Logs a debug message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  debug(message: string, data?: unknown): void;

  /**
   * Logs an informational message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  info(message: string, data?: unknown): void;

  /**
   * Logs a success message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  success(message: string, data?: unknown): void;

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  warn(message: string, data?: unknown): void;

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param error - Optional error object to include with the message.
   */
  error(message: string, error?: Error | unknown): void;

  /**
   * Updates the logger configuration.
   * @param config - Partial configuration to update.
   */
  updateConfig(config: Partial<LoggerConfig>): void;
}

/**
 * Service for logging messages to the console.
 */
export class LoggerService implements ILoggerService {
  private config: LoggerConfig;

  /**
   * Creates an instance of LoggerService.
   * @param config - Optional configuration for the logger.
   */
  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: LogLevel.INFO,
      includeTimestamps: false,
      useColors: true,
      includeNewlines: true,
      ...config,
    };
  }

  /**
   * Updates the logger configuration.
   * @param config - Partial configuration to update.
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Logs a debug message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Logs an informational message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  /**
   * Logs a success message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  public success(message: string, data?: unknown): void {
    this.log(LogLevel.SUCCESS, 'SUCCESS', message, data);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param error - Optional error object to include with the message.
   */
  public error(message: string, error?: Error | unknown): void {
    this.log(LogLevel.ERROR, 'ERROR', message, error);

    // Log additional error details if available
    if (error) {
      if (error instanceof Error) {
        console.error(error.stack || error.message);
      } else {
        console.error(error);
      }
    }
  }

  /**
   * Internal method for logging messages.
   * @param level - The log level.
   * @param levelName - The name of the log level.
   * @param message - The message to log.
   * @param data - Optional data to include with the message.
   */
  private log(level: LogLevel, levelName: string, message: string, data?: unknown): void {
    if (level < this.config.minLevel) {
      return;
    }

    let formattedMessage = '';

    // Add newline if configured
    if (this.config.includeNewlines) {
      formattedMessage += '\n';
    }

    // Add timestamp if configured
    if (this.config.includeTimestamps) {
      formattedMessage += `[${new Date().toISOString()}] `;
    }

    // Add level name
    formattedMessage += `${levelName}: `;

    // Add message
    formattedMessage += message;

    // Log to console with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.log(formattedMessage);
        break;
      case LogLevel.SUCCESS:
        console.log(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // Log data if provided (except for errors, which are handled separately)
    if (data && level !== LogLevel.ERROR) {
      console.log(data);
    }
  }
}

// Export a singleton instance of the LoggerService
export const loggerService = new LoggerService();
