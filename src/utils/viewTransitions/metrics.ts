/**
 * View Transitions Performance Metrics Module
 * Handles performance monitoring and metrics collection
 */

import type { TransitionMetrics } from "./config";

export class MetricsCollector {
  private metrics: Map<string, TransitionMetrics> = new Map();
  private currentTransition: Partial<TransitionMetrics> = {};
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * Initialize metrics collection
   */
  public init(): void {
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for metrics collection
   */
  private setupEventListeners(): void {
    document.addEventListener("astro:before-preparation", () => {
      this.currentTransition = {
        timestamp: performance.now(),
      };
    });

    document.addEventListener("astro:after-preparation", () => {
      if (this.currentTransition.timestamp) {
        const duration = performance.now() - this.currentTransition.timestamp;
        this.currentTransition.preparationDuration = duration;

        if (duration > 100 && this.debug) {
          console.warn(`Slow view transition preparation: ${duration.toFixed(2)}ms`);
        }
      }
    });

    document.addEventListener("astro:before-swap", () => {
      if (this.currentTransition.timestamp) {
        this.currentTransition.swapDuration = 0; // Mark swap start
      }
    });

    document.addEventListener("astro:after-swap", () => {
      if (this.currentTransition.timestamp && this.currentTransition.preparationDuration !== undefined) {
        const totalDuration = performance.now() - this.currentTransition.timestamp;
        const swapDuration = totalDuration - this.currentTransition.preparationDuration;
        
        const metrics: TransitionMetrics = {
          preparationDuration: this.currentTransition.preparationDuration,
          swapDuration,
          totalDuration,
          timestamp: this.currentTransition.timestamp,
        };

        this.storeMetrics(metrics);

        if (this.debug) {
          console.log("Transition metrics:", metrics);
        }
      }
    });
  }

  /**
   * Store metrics with memory management
   */
  private storeMetrics(metrics: TransitionMetrics): void {
    this.metrics.set(metrics.timestamp.toString(), metrics);

    // Keep only last 10 metrics to prevent memory leaks
    if (this.metrics.size > 10) {
      const oldestKey = Array.from(this.metrics.keys())[0];
      this.metrics.delete(oldestKey);
    }
  }

  /**
   * Get all performance metrics
   */
  public getMetrics(): TransitionMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get latest performance metrics
   */
  public getLatestMetrics(): TransitionMetrics | null {
    const metrics = this.getMetrics();
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  /**
   * Get average metrics over time
   */
  public getAverageMetrics(): Partial<TransitionMetrics> | null {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return null;

    const totals = metrics.reduce(
      (acc, metric) => ({
        preparationDuration: acc.preparationDuration + metric.preparationDuration,
        swapDuration: acc.swapDuration + metric.swapDuration,
        totalDuration: acc.totalDuration + metric.totalDuration,
      }),
      { preparationDuration: 0, swapDuration: 0, totalDuration: 0 }
    );

    return {
      preparationDuration: totals.preparationDuration / metrics.length,
      swapDuration: totals.swapDuration / metrics.length,
      totalDuration: totals.totalDuration / metrics.length,
    };
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    totalTransitions: number;
    averageTime: number;
    slowestTransition: number;
    fastestTransition: number;
  } {
    const metrics = this.getMetrics();
    
    if (metrics.length === 0) {
      return {
        totalTransitions: 0,
        averageTime: 0,
        slowestTransition: 0,
        fastestTransition: 0,
      };
    }

    const durations = metrics.map(m => m.totalDuration);
    const averageTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const slowestTransition = Math.max(...durations);
    const fastestTransition = Math.min(...durations);

    return {
      totalTransitions: metrics.length,
      averageTime,
      slowestTransition,
      fastestTransition,
    };
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics.clear();
    this.currentTransition = {};
  }

  /**
   * Export metrics as JSON
   */
  public exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      summary: this.getSummary(),
    }, null, 2);
  }
}