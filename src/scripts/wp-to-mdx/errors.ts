/**
 * Enhanced error handling system for WordPress to MDX conversion
 */
import { logger } from "./logger";
import type { ConversionError } from "./types";

export class ConversionErrorCollector {
  private errors: ConversionError[] = [];
  private warnings: string[] = [];

  /**
   * Add an error to the collection
   */
  addError(error: ConversionError): void {
    this.errors.push(error);
    logger.error(
      `${error.type}: ${error.message}${error.postTitle ? ` (Post: ${error.postTitle})` : ""}`
    );
  }

  /**
   * Add a warning to the collection
   */
  addWarning(message: string, postTitle?: string): void {
    const warningMessage = postTitle
      ? `${message} (Post: ${postTitle})`
      : message;
    this.warnings.push(warningMessage);
    logger.warn(warningMessage);
  }

  /**
   * Add multiple errors at once
   */
  addErrors(errors: ConversionError[]): void {
    errors.forEach(error => this.addError(error));
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /**
   * Get all errors
   */
  getErrors(): ConversionError[] {
    return [...this.errors];
  }

  /**
   * Get all warnings
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Clear all errors and warnings
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Get error summary grouped by type
   */
  getErrorSummary(): {
    totalErrors: number;
    totalWarnings: number;
    errorsByType: Record<string, number>;
    errorsByPost: Record<string, number>;
    criticalErrors: ConversionError[];
  } {
    const errorsByType: Record<string, number> = {};
    const errorsByPost: Record<string, number> = {};
    const criticalErrors: ConversionError[] = [];

    this.errors.forEach(error => {
      // Count by type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;

      // Count by post
      const postKey = error.postTitle || error.postId || "Unknown";
      errorsByPost[postKey] = (errorsByPost[postKey] || 0) + 1;

      // Identify critical errors
      if (error.type === "parse" || error.type === "write") {
        criticalErrors.push(error);
      }
    });

    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errorsByType,
      errorsByPost,
      criticalErrors,
    };
  }

  /**
   * Generate detailed error report
   */
  generateErrorReport(): string {
    const summary = this.getErrorSummary();
    const lines: string[] = [];

    lines.push("=".repeat(60));
    lines.push("CONVERSION ERROR REPORT");
    lines.push("=".repeat(60));
    lines.push(`Total Errors: ${summary.totalErrors}`);
    lines.push(`Total Warnings: ${summary.totalWarnings}`);
    lines.push("");

    if (summary.criticalErrors.length > 0) {
      lines.push("CRITICAL ERRORS:");
      lines.push("-".repeat(40));
      summary.criticalErrors.forEach(error => {
        lines.push(`[${error.type.toUpperCase()}] ${error.message}`);
        if (error.postTitle) {lines.push(`  Post: ${error.postTitle}`);}
        if (error.postId) {lines.push(`  ID: ${error.postId}`);}
        lines.push("");
      });
    }

    if (Object.keys(summary.errorsByType).length > 0) {
      lines.push("ERRORS BY TYPE:");
      lines.push("-".repeat(40));
      Object.entries(summary.errorsByType).forEach(([type, count]) => {
        lines.push(`${type}: ${count}`);
      });
      lines.push("");
    }

    if (Object.keys(summary.errorsByPost).length > 0) {
      lines.push("ERRORS BY POST:");
      lines.push("-".repeat(40));
      Object.entries(summary.errorsByPost)
        .sort(([, a], [, b]) => b - a) // Sort by error count descending
        .forEach(([post, count]) => {
          lines.push(`${post}: ${count} error${count > 1 ? "s" : ""}`);
        });
      lines.push("");
    }

    if (this.warnings.length > 0) {
      lines.push("WARNINGS:");
      lines.push("-".repeat(40));
      this.warnings.forEach(warning => {
        lines.push(`• ${warning}`);
      });
      lines.push("");
    }

    lines.push("=".repeat(60));
    return lines.join("\n");
  }
}

/**
 * Utility class for creating conversion errors
 */
export class ErrorFactory {
  static createParseError(
    message: string,
    postId?: string,
    postTitle?: string
  ): ConversionError {
    return {
      type: "parse",
      message: `Parsing failed: ${message}`,
      postId,
      postTitle,
    };
  }

  static createValidationError(
    message: string,
    postId?: string,
    postTitle?: string
  ): ConversionError {
    return {
      type: "validate",
      message: `Validation failed: ${message}`,
      postId,
      postTitle,
    };
  }

  static createConversionError(
    message: string,
    postId?: string,
    postTitle?: string
  ): ConversionError {
    return {
      type: "convert",
      message: `Conversion failed: ${message}`,
      postId,
      postTitle,
    };
  }

  static createWriteError(
    message: string,
    postId?: string,
    postTitle?: string
  ): ConversionError {
    return {
      type: "write",
      message: `Write operation failed: ${message}`,
      postId,
      postTitle,
    };
  }

  static createDownloadError(
    message: string,
    postId?: string,
    postTitle?: string
  ): ConversionError {
    return {
      type: "download",
      message: `Download failed: ${message}`,
      postId,
      postTitle,
    };
  }
}

/**
 * Utility for wrapping operations with error handling
 */
export class ErrorHandler {
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorCollector: ConversionErrorCollector,
    errorFactory: () => ConversionError
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const conversionError = errorFactory();
      conversionError.message += `: ${error}`;
      errorCollector.addError(conversionError);
      return null;
    }
  }

  static withSyncErrorHandling<T>(
    operation: () => T,
    errorCollector: ConversionErrorCollector,
    errorFactory: () => ConversionError
  ): T | null {
    try {
      return operation();
    } catch (error) {
      const conversionError = errorFactory();
      conversionError.message += `: ${error}`;
      errorCollector.addError(conversionError);
      return null;
    }
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          break;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        logger.debug(
          `Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
