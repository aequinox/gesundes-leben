import {
  logger as projectLogger,
  LogLevelName,
} from "../../../src/utils/logger.js";

/**
 * XML converter logger configured for the project
 * Uses the project's centralized logging system
 */
const xmlLogger = projectLogger.configure({
  component: "xml2markdown",
  minLevel: LogLevelName.INFO,
  timestampFormat: "time",
}) as typeof projectLogger;

/**
 * Legacy logger interface for backward compatibility
 */
export interface Logger {
  info: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
}

const logger: Logger = {
  info: (...args) => xmlLogger.info(...args),
  success: (...args) => xmlLogger.info(...args), // Map success to info
  error: (...args) => xmlLogger.error(...args),
  warn: (...args) => xmlLogger.warn(...args),
  debug: (...args) => xmlLogger.debug(...args),
  trace: (...args) => xmlLogger.trace(...args),
};

export default logger;
// xmlLogger is used internally by converter.ts
export { xmlLogger };
