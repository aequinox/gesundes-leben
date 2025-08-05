/**
 * Enhanced error handling utilities for robust error boundary implementation
 *
 * Provides comprehensive error tracking, reporting, and recovery mechanisms
 * with production-ready error boundary patterns for Astro components.
 *
 * @example
 * ```typescript
 * import { ErrorTracker, createErrorBoundary } from '@/utils/error-handling/error-boundary-utils';
 *
 * const tracker = new ErrorTracker();
 * tracker.reportError('ComponentName', new Error('Something went wrong'));
 *
 * // Create error boundary wrapper
 * const SafeComponent = createErrorBoundary(RiskyComponent, {
 *   fallback: 'Component failed to load'
 * });
 * ```
 */
import type { ErrorBoundaryContext } from "@/types";
import { logger } from "@/utils/logger";

export interface ErrorInfo {
  componentName: string;
  error: Error;
  errorInfo?: {
    componentStack?: string;
    errorBoundary?: string;
  };
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, unknown>;
}

export interface ErrorBoundaryConfig {
  fallback?: string | (() => string);
  onError?: (errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: string[];
  isolate?: boolean;
}

export interface ErrorRecoveryStrategy {
  canRecover: (error: Error) => boolean;
  recover: (
    error: Error,
    context: ErrorBoundaryContext
  ) => Promise<void> | void;
  description: string;
}

/**
 * Comprehensive error tracking and reporting system
 */
export class ErrorTracker {
  private errorCount = 0;
  private errorHistory: ErrorInfo[] = [];
  private maxHistorySize = 100;
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];

  constructor(private config: { maxHistorySize?: number } = {}) {
    this.maxHistorySize = config.maxHistorySize ?? 100;
    this.setupGlobalErrorHandlers();
    this.registerDefaultRecoveryStrategies();
  }

  /**
   * Setup global error handlers for comprehensive error tracking
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === "undefined") {
      return;
    }

    // Global JavaScript errors
    window.addEventListener("error", event => {
      this.reportError("Global", event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", event => {
      this.reportError("Promise", new Error(String(event.reason)), {
        promise: "unhandled-rejection",
      });
    });

    // Resource loading errors
    window.addEventListener(
      "error",
      event => {
        if (event.target && event.target !== window) {
          const target = event.target as HTMLElement;
          this.reportError(
            "Resource",
            new Error(`Failed to load ${target.tagName}`),
            {
              resource: target.outerHTML,
              type: "resource-load-error",
            }
          );
        }
      },
      true
    );
  }

  /**
   * Register default error recovery strategies
   */
  private registerDefaultRecoveryStrategies(): void {
    // Network error recovery
    this.addRecoveryStrategy({
      canRecover: error =>
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("NetworkError"),
      recover: async () => {
        logger.info("Attempting network error recovery with retry...");
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 1000);
        });
      },
      description: "Network connectivity retry",
    });

    // Chunk loading error recovery (common in SPAs)
    this.addRecoveryStrategy({
      canRecover: error =>
        error.message.includes("Loading chunk") ||
        error.message.includes("ChunkLoadError"),
      recover: () => {
        logger.info("Chunk load error detected, reloading page...");
        window.location.reload();
      },
      description: "Chunk loading error page reload",
    });

    // Memory pressure recovery
    this.addRecoveryStrategy({
      canRecover: error =>
        error.message.includes("out of memory") ||
        error.name === "QuotaExceededError",
      recover: () => {
        logger.warn("Memory pressure detected, clearing caches...");
        this.clearCaches();
      },
      description: "Memory pressure cache clearing",
    });
  }

  /**
   * Clear various browser caches to free memory
   */
  private clearCaches(): void {
    try {
      // Clear localStorage if getting full
      if (typeof localStorage !== "undefined") {
        const usage = JSON.stringify(localStorage).length;
        if (usage > 5000000) {
          // ~5MB
          localStorage.clear();
          logger.info("LocalStorage cleared due to memory pressure");
        }
      }

      // Clear sessionStorage
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
      }

      // Request garbage collection if available
      if ("gc" in window && typeof window.gc === "function") {
        window.gc();
      }
    } catch (error) {
      logger.warn("Failed to clear caches:", error);
    }
  }

  /**
   * Report an error with comprehensive context
   */
  public reportError(
    componentName: string,
    error: Error,
    additionalContext?: Record<string, unknown>
  ): void {
    this.errorCount++;

    const errorInfo: ErrorInfo = {
      componentName,
      error,
      timestamp: new Date(),
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      sessionId: this.getSessionId(),
      additionalContext,
    };

    // Add to history
    this.errorHistory.push(errorInfo);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Log the error
    logger.error(
      `[${componentName}] Error #${this.errorCount}:`,
      error.message,
      {
        stack: error.stack,
        context: additionalContext,
      }
    );

    // Attempt recovery
    void this.attemptRecovery(error, {
      error,
      errorInfo: { componentStack: error.stack || "unknown" },
      retry: () => this.retryOperation(componentName, error),
      reset: () => this.resetComponent(componentName),
    });

    // Report to external services in production
    if (import.meta.env.PROD) {
      this.sendToErrorService(errorInfo);
    }
  }

  /**
   * Get or create a session ID for error tracking
   */
  private getSessionId(): string {
    if (typeof sessionStorage === "undefined") {
      return "unknown";
    }

    let sessionId = sessionStorage.getItem("error-tracker-session");
    if (sessionId === null) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem("error-tracker-session", sessionId);
    }
    return sessionId;
  }

  /**
   * Attempt to recover from an error using registered strategies
   */
  private async attemptRecovery(
    error: Error,
    _context: ErrorBoundaryContext
  ): Promise<void> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          logger.info(`Attempting recovery strategy: ${strategy.description}`);
          await strategy.recover(error, _context);
          return;
        } catch (recoveryError) {
          logger.warn(
            `Recovery strategy failed: ${strategy.description}`,
            recoveryError
          );
        }
      }
    }
  }

  /**
   * Add a custom recovery strategy
   */
  public addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * Retry an operation after an error
   */
  private retryOperation(componentName: string, _error: Error): void {
    logger.info(`Retrying operation for ${componentName}`);
    // Implementation would depend on the specific operation
    // For now, we'll just reload the page as a last resort
    window.location.reload();
  }

  /**
   * Reset a component's state
   */
  private resetComponent(componentName: string): void {
    logger.info(`Resetting component: ${componentName}`);

    // Dispatch custom event for component reset
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("component-reset", {
          detail: { componentName },
        })
      );
    }
  }

  /**
   * Send error information to external error tracking service
   */
  private sendToErrorService(errorInfo: ErrorInfo): void {
    // In a real application, you would send to services like:
    // - Sentry: Sentry.captureException(errorInfo.error, { extra: errorInfo });
    // - LogRocket: LogRocket.captureException(errorInfo.error);
    // - Bugsnag: Bugsnag.notify(errorInfo.error, errorInfo);

    logger.debug("Would send to error tracking service:", {
      component: errorInfo.componentName,
      message: errorInfo.error.message,
      timestamp: errorInfo.timestamp.toISOString(),
    });
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    recentErrors: ErrorInfo[];
    errorsByComponent: Record<string, number>;
    commonErrorTypes: Record<string, number>;
  } {
    const recentErrors = this.errorHistory.slice(-10);

    const errorsByComponent = this.errorHistory.reduce(
      (acc, error) => {
        acc[error.componentName] = (acc[error.componentName] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const commonErrorTypes = this.errorHistory.reduce(
      (acc, error) => {
        const errorType = error.error.name ?? "UnknownError";
        acc[errorType] = (acc[errorType] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalErrors: this.errorCount,
      recentErrors,
      errorsByComponent,
      commonErrorTypes,
    };
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory = [];
    this.errorCount = 0;
  }
}

/**
 * Create a higher-order component with error boundary capabilities
 */
export function createErrorBoundary<T extends Record<string, unknown>>(
  Component: (props: T) => unknown,
  config: ErrorBoundaryConfig = {}
): (props: T) => unknown {
  const tracker = new ErrorTracker();

  return function ErrorBoundaryWrapper(props: T) {
    try {
      return Component(props);
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));

      tracker.reportError(Component.name ?? "Anonymous", errorInstance, {
        props: props as Record<string, unknown>,
      });

      if (config.onError !== undefined) {
        const errorInfo: ErrorInfo = {
          componentName: Component.name ?? "Anonymous",
          error: errorInstance,
          timestamp: new Date(),
          url: typeof window !== "undefined" ? window.location.href : "unknown",
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          additionalContext: { props: props as Record<string, unknown> },
        };
        config.onError(errorInfo);
      }

      // Return fallback
      if (typeof config.fallback === "function") {
        return config.fallback();
      }
      return config.fallback ?? "Component failed to render";
    }
  };
}

/**
 * Validate component props to prevent errors
 */
export function validateProps<T extends Record<string, unknown>>(
  props: T,
  schema: Record<keyof T, (value: unknown) => boolean>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(props[key as keyof T])) {
      errors.push(`Invalid prop: ${key}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a singleton error tracker instance
 */
export const errorTracker = new ErrorTracker();

/**
 * Global error reporting function
 */
export function reportComponentError(
  componentName: string,
  error: Error
): void {
  errorTracker.reportError(componentName, error);
}

// Make error reporting available globally
if (typeof window !== "undefined") {
  (
    window as Window & { reportComponentError?: typeof reportComponentError }
  ).reportComponentError = reportComponentError;
}
