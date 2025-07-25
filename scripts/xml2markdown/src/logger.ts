import {
  logger as projectLogger,
  LogLevelName,
} from "../../../src/utils/logger.js";

/**
 * XML converter logger configured for the project
 * Uses the project's centralized logging system with enhanced context
 */
const configuredLogger = projectLogger.configure({
  component: "xml2markdown",
  minLevel: LogLevelName.DEBUG, // Enhanced logging for development
  timestampFormat: "time",
});

/**
 * Enhanced logger interface with structured logging support
 * Provides backward compatibility while supporting structured data
 */
export interface Logger {
  info: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
  
  // Enhanced structured logging methods
  logProgress: (operation: string, current: number, total: number, metadata?: Record<string, unknown>) => void;
  logPerformance: (operation: string, durationMs: number, metadata?: Record<string, unknown>) => void;
  logOperation: (operation: string, status: 'start' | 'success' | 'error', metadata?: Record<string, unknown>) => void;
}

const logger: Logger = {
  info: (...args) => configuredLogger.info(...args),
  success: (...args) => configuredLogger.info(...args), // Map success to info
  error: (...args) => configuredLogger.error(...args),
  warn: (...args) => configuredLogger.warn(...args),
  debug: (...args) => configuredLogger.debug(...args),
  trace: (...args) => configuredLogger.trace(...args),
  
  // Enhanced structured logging implementations
  logProgress: (operation: string, current: number, total: number, metadata = {}) => {
    const percentage = Math.round((current / total) * 100);
    configuredLogger.info(`📊 ${operation}: ${current}/${total} (${percentage}%)`, {
      operation,
      current,
      total,
      percentage,
      ...metadata,
    });
  },
  
  logPerformance: (operation: string, durationMs: number, metadata = {}) => {
    const durationSeconds = Math.round(durationMs / 10) / 100; // 2 decimal places
    let emoji = '⚡';
    let performance = 'fast';
    
    if (durationMs >= 5000) {
      emoji = '🐌';
      performance = 'slow';
    } else if (durationMs >= 1000) {
      emoji = '⏱️';
      performance = 'normal';
    }
    
    configuredLogger.info(`${emoji} ${operation} completed in ${durationSeconds}s`, {
      operation,
      durationMs,
      durationSeconds,
      performance,
      ...metadata,
    });
  },
  
  logOperation: (operation: string, status: 'start' | 'success' | 'error', metadata = {}) => {
    const emojis = { start: '🚀', success: '✅', error: '❌' };
    const emoji = emojis[status];
    const message = `${emoji} ${operation} ${status}`;
    
    switch (status) {
      case 'start':
        configuredLogger.info(message, { operation, status, ...metadata });
        break;
      case 'success':
        configuredLogger.info(message, { operation, status, ...metadata });
        break;
      case 'error':
        configuredLogger.error(message, { operation, status, ...metadata });
        break;
    }
  },
};

export default logger;

// Create a type-safe wrapper for internal xmlLogger usage
export const xmlLogger = {
  info: (...args: unknown[]) => configuredLogger.info(...args),
  success: (...args: unknown[]) => configuredLogger.info(...args),
  error: (...args: unknown[]) => configuredLogger.error(...args),
  warn: (...args: unknown[]) => configuredLogger.warn(...args),
  debug: (...args: unknown[]) => configuredLogger.debug(...args),
  trace: (...args: unknown[]) => configuredLogger.trace(...args),
};
