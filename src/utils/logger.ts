import chalk, { type ChalkInstance } from "chalk";

/**
 * Available log levels in order of verbosity (lowest to highest)
 */
export enum LogLevelName {
  SILLY = "SILLY",
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

/**
 * Timestamp format options for log messages
 */
export type TimestampFormat = "iso" | "locale" | "time" | "none";

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
  /** Minimum log level to display */
  minLevel?: LogLevelName;
  /** Whether to use colors in log output */
  useColors?: boolean;
  /** Format for timestamps in log messages */
  timestampFormat?: TimestampFormat;
  /** Component name to display in logs (e.g., "[vite]") */
  component?: string;
  /** Custom log handler function */
  logHandler?: (message: string) => void;
}

/**
 * Internal log level definition
 */
interface LogLevel {
  /** Numeric ID for level comparison */
  id: number;
  /** Display name of the log level */
  name: LogLevelName;
  /** Chalk styles to apply to this log level */
  styles: ChalkInstance[];
}

/**
 * Type for any loggable content
 */
export type LogContent = string | Error | object | unknown;

/**
 * A flexible, configurable logger with colored output and multiple log levels
 */
class LoggerService {
  /**
   * Map of log levels with their configurations
   */
  private readonly levels: Record<LogLevelName, LogLevel> = {
    [LogLevelName.SILLY]: {
      id: 0,
      name: LogLevelName.SILLY,
      styles: [chalk.bold, chalk.white],
    },
    [LogLevelName.TRACE]: {
      id: 1,
      name: LogLevelName.TRACE,
      styles: [chalk.bold, chalk.whiteBright],
    },
    [LogLevelName.DEBUG]: {
      id: 2,
      name: LogLevelName.DEBUG,
      styles: [chalk.bold, chalk.green],
    },
    [LogLevelName.INFO]: {
      id: 3,
      name: LogLevelName.INFO,
      styles: [chalk.bold, chalk.blue],
    },
    [LogLevelName.WARN]: {
      id: 4,
      name: LogLevelName.WARN,
      styles: [chalk.bold, chalk.yellow],
    },
    [LogLevelName.ERROR]: {
      id: 5,
      name: LogLevelName.ERROR,
      styles: [chalk.bold, chalk.red],
    },
    [LogLevelName.FATAL]: {
      id: 6,
      name: LogLevelName.FATAL,
      styles: [chalk.bold, chalk.redBright],
    },
  };

  /**
   * Logger settings
   */
  private settings = {
    minLevel: this.levels[LogLevelName.INFO].id,
    useColors: true,
    timestampFormat: "time" as TimestampFormat,
    component: "",
    logHandler: (message: string): void => {
      try {
        // eslint-disable-next-line no-console
        console.log(message);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Fallback if console.log fails
        process.stdout.write(`${message}\n`);
      }
    },
  };

  /**
   * Creates a new Logger instance
   */
  constructor() {
    // Initialize chalk if needed
    this.initializeChalk();
  }

  /**
   * Ensures chalk is properly initialized with color support
   */
  private initializeChalk(): void {
    try {
      // Check if chalk supports color and set level if needed
      // @ts-expect-error - supportsColor may not be in type definitions but exists at runtime
      if (!chalk?.supportsColor) {
        chalk.level = 1; // Basic color support
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // If chalk initialization fails, disable colors
      this.settings.useColors = false;
    }
  }

  /**
   * Gets a formatted timestamp based on the configured format
   * @returns Formatted timestamp string
   */
  private getTimestamp(): string {
    try {
      switch (this.settings.timestampFormat) {
        case "iso":
          return new Date().toISOString();
        case "locale":
          return new Date().toLocaleString();
        case "time": {
          // Format like "13:44:25" (Astro.js style)
          const now = new Date();
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        }
        case "none":
          return "";
        default:
          return new Date().toISOString();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Fallback if date formatting fails
      return new Date().toString();
    }
  }

  /**
   * Formats a message for logging
   * @param content The content to format
   * @returns Formatted string representation
   */
  private formatMessage(content: LogContent): string {
    if (content instanceof Error) {
      return `${content.message}\n${content.stack || ""}`;
    } else if (typeof content === "object" && content !== null) {
      try {
        return JSON.stringify(content, null, 2);
      } catch (error) {
        return `[Object] (Failed to stringify: ${error})`;
      }
    } else {
      return String(content);
    }
  }

  /**
   * Applies chalk styles to text if colors are enabled
   * @param text Text to style
   * @param styles Chalk styles to apply
   * @returns Styled text
   */
  private styleText(text: string, ...styles: ChalkInstance[]): string {
    if (!this.settings.useColors) return text;

    try {
      return styles.reduce((acc, style) => style(acc), text);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // If styling fails, return unstyled text
      return text;
    }
  }

  /**
   * Internal method to log a message with a specific level
   * @param level Log level to use
   * @param content Content to log
   */
  private logMessage(level: LogLevelName, content: LogContent): void {
    const logLevel = this.levels[level];

    // Skip if below minimum log level
    if (logLevel.id < this.settings.minLevel) return;

    try {
      const timestamp = this.getTimestamp();
      const formattedMessage = this.formatMessage(content);
      const styledLevel = this.styleText(
        `[${logLevel.name}]`,
        ...logLevel.styles
      );

      // Only style the first line of the message to avoid styling stack traces
      const messageLines = formattedMessage.split("\n");
      const styledFirstLine = this.styleText(
        messageLines[0],
        ...logLevel.styles
      );
      const restLines = messageLines.slice(1).join("\n");

      const styledMessage = restLines
        ? `${styledFirstLine}\n${restLines}`
        : styledFirstLine;

      // Format the output with optional component name
      let output = "";
      if (timestamp) {
        output = this.settings.component
          ? `${timestamp} [${this.settings.component}] ${styledLevel} ${styledMessage}`
          : `${timestamp} ${styledLevel} ${styledMessage}`;
      } else {
        output = this.settings.component
          ? `[${this.settings.component}] ${styledLevel} ${styledMessage}`
          : `${styledLevel} ${styledMessage}`;
      }

      this.settings.logHandler(output);
    } catch (error) {
      // Fallback if logging fails
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error(`[LOGGER_ERROR] Failed to log message: ${errorMessage}`);
      // eslint-disable-next-line no-console
      console.error(`Original content: ${String(content)}`);
    }
  }

  /**
   * Configures the logger with new settings
   * @param options Configuration options
   * @returns The logger instance for chaining
   */
  configure(options: LoggerConfig): LoggerService {
    if (options.minLevel !== undefined && this.levels[options.minLevel]) {
      this.settings.minLevel = this.levels[options.minLevel].id;
    }

    if (options.useColors !== undefined) {
      this.settings.useColors = Boolean(options.useColors);
    }

    if (options.timestampFormat !== undefined) {
      this.settings.timestampFormat = options.timestampFormat;
    }

    if (options.component !== undefined) {
      this.settings.component = options.component;
    }

    if (
      options.logHandler !== undefined &&
      typeof options.logHandler === "function"
    ) {
      this.settings.logHandler = options.logHandler;
    }

    return this;
  }

  /**
   * Gets the current minimum log level name
   * @returns The current minimum log level
   */
  getLogLevel(): LogLevelName {
    const currentLevelId = this.settings.minLevel;
    const entry = Object.entries(this.levels).find(
      ([, level]) => level.id === currentLevelId
    );
    return entry ? (entry[0] as LogLevelName) : LogLevelName.INFO;
  }

  /**
   * Logs a silly message (lowest priority)
   * @param content Content to log
   */
  silly(content: LogContent): void {
    this.logMessage(LogLevelName.SILLY, content);
  }

  /**
   * Logs a trace message
   * @param content Content to log
   */
  trace(content: LogContent): void {
    this.logMessage(LogLevelName.TRACE, content);
  }

  /**
   * Logs a debug message
   * @param content Content to log
   */
  debug(content: LogContent): void {
    this.logMessage(LogLevelName.DEBUG, content);
  }

  /**
   * Logs an info message
   * @param content Content to log
   */
  info(content: LogContent): void {
    this.logMessage(LogLevelName.INFO, content);
  }

  /**
   * Logs a warning message
   * @param content Content to log
   */
  warn(content: LogContent): void {
    this.logMessage(LogLevelName.WARN, content);
  }

  /**
   * Logs an error message
   * @param content Content to log
   */
  error(content: LogContent): void {
    this.logMessage(LogLevelName.ERROR, content);
  }

  /**
   * Logs a fatal error message (highest priority)
   * @param content Content to log
   */
  fatal(content: LogContent): void {
    this.logMessage(LogLevelName.FATAL, content);
  }

  /**
   * Legacy method for backward compatibility
   * @param content Content to log
   */
  log(content: LogContent): void {
    this.info(content);
  }
}

// Create and export a singleton instance
export const logger = new LoggerService();

// For backward compatibility, also export the class
export const Logger = LoggerService;
