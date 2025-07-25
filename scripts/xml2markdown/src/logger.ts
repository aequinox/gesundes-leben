import {
  logger as projectLogger,
  LogLevelName,
} from "../../../src/utils/logger.js";

/**
 * XML converter logger configured for the project
 * Uses the project's centralized logging system with enhanced context
 */
const xmlLogger = projectLogger.configure({
  component: "xml2markdown",
  minLevel: LogLevelName.DEBUG, // Enhanced logging for development
  timestampFormat: "time",
}) as typeof projectLogger;

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
  info: (...args) => xmlLogger.info(...args),
  success: (...args) => xmlLogger.info(...args), // Map success to info
  error: (...args) => xmlLogger.error(...args),
  warn: (...args) => xmlLogger.warn(...args),
  debug: (...args) => xmlLogger.debug(...args),
  trace: (...args) => xmlLogger.trace(...args),
  
  // Enhanced structured logging implementations
  logProgress: (operation: string, current: number, total: number, metadata = {}) => {
    const percentage = Math.round((current / total) * 100);
    xmlLogger.info(`📊 ${operation}: ${current}/${total} (${percentage}%)`, {
      operation,
      current,
      total,
      percentage,
      ...metadata,
    });
  },
  
  logPerformance: (operation: string, durationMs: number, metadata = {}) => {
    const durationSeconds = Math.round(durationMs / 10) / 100; // 2 decimal places
    const emoji = durationMs < 1000 ? '⚡' : durationMs < 5000 ? '⏱️' : '🐌';
    
    xmlLogger.info(`${emoji} ${operation} completed in ${durationSeconds}s`, {
      operation,
      durationMs,
      durationSeconds,
      performance: durationMs < 1000 ? 'fast' : durationMs < 5000 ? 'normal' : 'slow',
      ...metadata,
    });
  },
  
  logOperation: (operation: string, status: 'start' | 'success' | 'error', metadata = {}) => {
    const emojis = { start: '🚀', success: '✅', error: '❌' };
    const emoji = emojis[status];
    const message = `${emoji} ${operation} ${status}`;
    
    switch (status) {
      case 'start':
        xmlLogger.info(message, { operation, status, ...metadata });
        break;
      case 'success':
        xmlLogger.info(message, { operation, status, ...metadata });
        break;
      case 'error':
        xmlLogger.error(message, { operation, status, ...metadata });
        break;
    }
  },
};

export default logger;
// xmlLogger is used internally by converter.ts
export { xmlLogger };
