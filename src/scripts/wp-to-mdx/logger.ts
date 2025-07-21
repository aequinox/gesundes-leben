/**
 * Simple logger for WordPress to MDX converter
 */
export class Logger {
  private static instance: Logger;

  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  info(message: string): void {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`);
  }

  warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`);
    }
  }
}

export const logger = Logger.getInstance();