/**
 * Performance monitoring utilities for production optimization
 *
 * Provides lightweight performance tracking with minimal overhead
 * for key application metrics and user experience monitoring.
 *
 * @example
 * ```typescript
 * import { PerformanceMonitor, measureAsync } from '@/utils/performance/performance-monitor';
 *
 * const monitor = new PerformanceMonitor();
 * 
 * // Measure component render time
 * const renderTime = await measureAsync('component-render', () => renderComponent());
 * 
 * // Track Web Vitals
 * monitor.trackWebVitals();
 * ```
 */

import { logger } from '@/utils/logger';
import type { PerformanceMetrics } from '@/types';

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface WebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Lightweight performance monitoring utility
 */
export class PerformanceMonitor {
  private entries: Map<string, PerformanceEntry> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  /**
   * Initialize performance observers for Web Vitals
   */
  private initializeObservers(): void {
    try {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        this.createObserver('largest-contentful-paint', (entries) => {
          const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
          this.recordMetric('lcp', lastEntry.startTime);
        });

        // First Input Delay
        this.createObserver('first-input', (entries) => {
          const firstEntry = entries[0] as PerformanceEventTiming;
          this.recordMetric('fid', firstEntry.processingStart - firstEntry.startTime);
        });

        // Cumulative Layout Shift
        this.createObserver('layout-shift', (entries) => {
          let clsValue = 0;
          for (const entry of entries) {
            const layoutShift = entry as unknown as { value: number; hadRecentInput: boolean };
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
          this.recordMetric('cls', clsValue);
        });
      }
    } catch (error) {
      logger.warn('Failed to initialize performance observers:', error);
    }
  }

  /**
   * Create a performance observer for specific entry types
   */
  private createObserver(
    type: string, 
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (error) {
      logger.warn(`Failed to create observer for ${type}:`, error);
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    const entry: PerformanceEntry = {
      name,
      startTime: performance.now(),
      duration: value,
      metadata
    };

    this.entries.set(name, entry);
    
    // Log significant metrics in development
    if (import.meta.env.DEV) {
      logger.debug(`Performance metric - ${name}: ${value.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Start measuring performance for a named operation
   */
  public startMeasure(name: string, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    try {
      performance.mark(`${name}-start`);
      this.recordMetric(`${name}-start`, performance.now(), metadata);
    } catch (error) {
      logger.warn(`Failed to start measure for ${name}:`, error);
    }
  }

  /**
   * End measuring performance for a named operation
   */
  public endMeasure(name: string, metadata?: Record<string, unknown>): number {
    if (!this.isEnabled) return 0;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure?.duration ?? 0;

      this.recordMetric(name, duration, metadata);
      
      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);

      return duration;
    } catch (error) {
      logger.warn(`Failed to end measure for ${name}:`, error);
      return 0;
    }
  }

  /**
   * Get all recorded performance entries
   */
  public getEntries(): Map<string, PerformanceEntry> {
    return new Map(this.entries);
  }

  /**
   * Get a specific performance entry
   */
  public getEntry(name: string): PerformanceEntry | undefined {
    return this.entries.get(name);
  }

  /**
   * Get Web Vitals metrics
   */
  public getWebVitals(): WebVitalsMetrics {
    return {
      lcp: this.entries.get('lcp')?.duration,
      fid: this.entries.get('fid')?.duration,
      cls: this.entries.get('cls')?.duration,
      ttfb: this.getTTFB()
    };
  }

  /**
   * Get Time to First Byte
   */
  private getTTFB(): number {
    if (!this.isEnabled) return 0;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation?.responseStart - navigation?.requestStart ?? 0;
    } catch (error) {
      logger.warn('Failed to get TTFB:', error);
      return 0;
    }
  }

  /**
   * Clear all performance entries
   */
  public clear(): void {
    this.entries.clear();
    
    if (this.isEnabled) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Dispose of all observers and clear data
   */
  public dispose(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.clear();
  }
}

/**
 * Measure the execution time of a function
 */
export function measure<T>(name: string, fn: () => T): T {
  const monitor = new PerformanceMonitor();
  
  monitor.startMeasure(name);
  const result = fn();
  monitor.endMeasure(name);
  
  return result;
}

/**
 * Measure the execution time of an async function
 */
export async function measureAsync<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const monitor = new PerformanceMonitor();
  
  monitor.startMeasure(name);
  const result = await fn();
  monitor.endMeasure(name);
  
  return result;
}

/**
 * Create a singleton performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Get performance metrics for component rendering
 */
export function getComponentMetrics(componentName: string): PerformanceMetrics {
  const entry = performanceMonitor.getEntry(componentName);
  
  return {
    renderTime: entry?.duration ?? 0,
    mountTime: performanceMonitor.getEntry(`${componentName}-mount`)?.duration ?? 0,
    updateTime: performanceMonitor.getEntry(`${componentName}-update`)?.duration,
    memoryUsage: getMemoryUsage()
  };
}

/**
 * Get current memory usage if available
 */
function getMemoryUsage(): number | undefined {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
    return memory.usedJSHeapSize;
  }
  return undefined;
}

/**
 * Track Web Vitals and report to analytics
 */
export function trackWebVitals(callback?: (metrics: WebVitalsMetrics) => void): void {
  const monitor = new PerformanceMonitor();
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const vitals = monitor.getWebVitals();
      
      if (import.meta.env.DEV) {
        logger.info('Web Vitals:', vitals);
      }
      
      callback?.(vitals);
    }, 0);
  });
}