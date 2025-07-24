import { logger as projectLogger } from '../../../src/utils/logger.js';

/**
 * XML converter logger configured for the project
 * Uses the project's centralized logging system
 */
export const xmlLogger = projectLogger.configure({
  component: 'xml2markdown',
  minLevel: 'INFO',
  timestampFormat: 'time'
});

/**
 * Legacy logger interface for backward compatibility
 * @typedef {Object} Logger
 * @property {function(string): void} info - Log info message
 * @property {function(string): void} success - Log success message  
 * @property {function(string, Error=): void} error - Log error message with optional Error object
 */

/** @type {Logger} */
const logger = {
  info: (...args) => xmlLogger.info(...args),
  success: (...args) => xmlLogger.info(...args), // Map success to info
  error: (...args) => xmlLogger.error(...args),
  warn: (...args) => xmlLogger.warn(...args),
  debug: (...args) => xmlLogger.debug(...args),
  trace: (...args) => xmlLogger.trace(...args)
};

export default logger;
