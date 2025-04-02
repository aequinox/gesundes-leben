import chalk from "chalk";
import { injectable } from "inversify";
import { ILoggerService } from "../domain/interfaces/ILoggerService.js";

/**
 * Implementation of the logger service
 */
@injectable()
export class LoggerService implements ILoggerService {
  private readonly _isDebugMode: boolean;

  /**
   * Creates a new logger service
   * @param isDebugMode Whether to enable debug logging
   */
  constructor(isDebugMode = false) {
    this._isDebugMode = isDebugMode;
  }

  /**
   * Log an informational message
   * @param message The message to log
   */
  public info(message: string): void {
    console.log(`\n${chalk.blue("INFO")} ${message}`);
  }

  /**
   * Log a success message
   * @param message The message to log
   */
  public success(message: string): void {
    console.log(`\n${chalk.green("SUCCESS")} ${message}`);
  }

  /**
   * Log a warning message
   * @param message The message to log
   */
  public warn(message: string): void {
    console.log(`\n${chalk.yellow("WARNING")} ${message}`);
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error object
   */
  public error(message: string, error?: Error): void {
    console.error(`\n${chalk.red("ERROR")} ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Log a debug message (only in debug mode)
   * @param message The message to log
   */
  public debug(message: string): void {
    if (this._isDebugMode) {
      console.log(`\n${chalk.gray("DEBUG")} ${message}`);
    }
  }
}
