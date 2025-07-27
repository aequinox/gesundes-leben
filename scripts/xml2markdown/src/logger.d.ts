/**
 * TypeScript declarations for logger.js
 */

import type { Logger } from "../../../src/utils/logger.js";

export const xmlLogger: Logger;

export interface LegacyLogger {
  info: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
}

declare const logger: LegacyLogger;
export default logger;
