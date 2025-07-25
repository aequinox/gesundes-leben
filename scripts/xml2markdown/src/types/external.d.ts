// Type definitions for external imports from the main project

declare module "../../../src/utils/errors.js" {
  export interface AppError extends Error {
    code?: string;
    context?: Record<string, unknown>;
  }

  export class ValidationError extends Error implements AppError {
    code: string;
    context?: Record<string, unknown>;
    constructor(message: string, context?: Record<string, unknown>);
  }

  export class ConfigurationError extends Error implements AppError {
    code: string;
    context?: Record<string, unknown>;
    constructor(message: string, context?: Record<string, unknown>);
  }

  export class ContentProcessingError extends Error implements AppError {
    code: string;
    context?: Record<string, unknown>;
    constructor(message: string, context?: Record<string, unknown>);
  }

  export function handleAsync<T>(operation: () => Promise<T>): Promise<T>;
}

declare module "../../../src/utils/logger.js" {
  export enum LogLevelName {
    SILLY = "SILLY",
    TRACE = "TRACE",
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL",
  }

  export type TimestampFormat = "iso" | "locale" | "time" | "none";

  export interface LoggerConfig {
    minLevel?: LogLevelName;
    useColors?: boolean;
    timestampFormat?: TimestampFormat;
    component?: string;
    logHandler?: (message: string) => void;
  }

  export interface LoggerService {
    configure(options: LoggerConfig): LoggerService;
    silly(...args: unknown[]): void;
    trace(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    fatal(...args: unknown[]): void;
  }

  export const logger: LoggerService;
}
