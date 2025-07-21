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
   * Formats a message for logging with support for multiple arguments
   * @param args The arguments to format
   * @returns Formatted string representation
   */
  private formatMessage(...args: unknown[]): string {
    if (args.length === 0) {
      return "";
    }

    if (args.length === 1) {
      const content = args[0];
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

    // Multiple arguments - format like console.log
    return args
      .map(arg => {
        if (arg instanceof Error) {
          return `${arg.message}\n${arg.stack || ""}`;
        } else if (typeof arg === "object" && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (error) {
            return `[Object] (Failed to stringify: ${error})`;
          }
        } else {
          return String(arg);
        }
      })
      .join(" ");
  }

  /**
   * Applies chalk styles to text if colors are enabled
   * @param text Text to style
   * @param styles Chalk styles to apply
   * @returns Styled text
   */
  private styleText(text: string, ...styles: ChalkInstance[]): string {
    if (!this.settings.useColors) {
      return text;
    }

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
   * @param args Arguments to log
   */
  private logMessage(level: LogLevelName, ...args: unknown[]): void {
    const logLevel = this.levels[level];

    // Skip if below minimum log level
    if (logLevel.id < this.settings.minLevel) {
      return;
    }

    try {
      const timestamp = this.getTimestamp();
      const formattedMessage = this.formatMessage(...args);
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
      console.error(`Original content: ${args.map(String).join(" ")}`);
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
   * @param args Content to log
   */
  silly(...args: unknown[]): void {
    this.logMessage(LogLevelName.SILLY, ...args);
  }

  /**
   * Logs a trace message
   * @param args Content to log
   */
  trace(...args: unknown[]): void {
    this.logMessage(LogLevelName.TRACE, ...args);
  }

  /**
   * Logs a debug message
   * @param args Content to log
   */
  debug(...args: unknown[]): void {
    this.logMessage(LogLevelName.DEBUG, ...args);
  }

  /**
   * Logs an info message
   * @param args Content to log
   */
  info(...args: unknown[]): void {
    this.logMessage(LogLevelName.INFO, ...args);
  }

  /**
   * Logs a warning message
   * @param args Content to log
   */
  warn(...args: unknown[]): void {
    this.logMessage(LogLevelName.WARN, ...args);
  }

  /**
   * Logs an error message
   * @param args Content to log
   */
  error(...args: unknown[]): void {
    this.logMessage(LogLevelName.ERROR, ...args);
  }

  /**
   * Logs a fatal error message (highest priority)
   * @param args Content to log
   */
  fatal(...args: unknown[]): void {
    this.logMessage(LogLevelName.FATAL, ...args);
  }

  /**
   * Legacy method for backward compatibility
   * @param args Content to log
   */
  log(...args: unknown[]): void {
    this.info(...args);
  }
}

// Create and export a singleton instance
export const logger = new LoggerService();

// For backward compatibility, also export the class
export const Logger = LoggerService;
