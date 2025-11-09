/**
 * Core Linking Utilities
 *
 * Shared functionality for all linking systems:
 * - Storage management (localStorage with limits)
 * - Session management (ID generation and tracking)
 * - Data cleanup and validation
 *
 * Single Responsibility: Core infrastructure for linking system
 */

import { logger } from "../logger";

import type { StorageOptions } from "./types";

/**
 * Storage Manager
 *
 * Handles localStorage operations with size limits, error handling,
 * and automatic cleanup. Used by all analytics components.
 */
export class StorageManager {
  private readonly prefix: string;

  constructor(prefix: string = "gl-linking") {
    this.prefix = prefix;
  }

  /**
   * Save data to localStorage with optional size limiting
   */
  save<T>(key: string, data: T, options: StorageOptions = {}): void {
    const { maxRecords = 1000 } = options;
    const fullKey = `${this.prefix}-${key}`;

    try {
      let dataToSave = data;

      // If data is an array, limit size
      if (Array.isArray(data) && data.length > maxRecords) {
        logger.warn(
          `Limiting ${key} to ${maxRecords} records (was ${data.length})`
        );
        dataToSave = data.slice(-maxRecords) as T;
      }

      // Serialize and save
      const serialized = JSON.stringify(dataToSave);

      // Check size (warn if > 1MB)
      if (serialized.length > 1048576) {
        logger.warn(
          `Large data size for ${key}: ${(serialized.length / 1024 / 1024).toFixed(2)}MB`
        );
      }

      localStorage.setItem(fullKey, serialized);
    } catch (error) {
      logger.error(`Failed to save ${key} to localStorage`, error);

      // If quota exceeded, try clearing old data and retry
      if (error instanceof Error && error.name === "QuotaExceededError") {
        logger.warn("Storage quota exceeded, attempting cleanup");
        this.cleanup(key, 7); // Keep only last 7 days

        // Retry save
        try {
          const serialized = JSON.stringify(data);
          localStorage.setItem(fullKey, serialized);
          logger.info("Successfully saved after cleanup");
        } catch (retryError) {
          logger.error("Failed to save even after cleanup", retryError);
        }
      }
    }
  }

  /**
   * Load data from localStorage with type safety
   */
  load<T>(key: string, defaultValue: T | null = null): T | null {
    const fullKey = `${this.prefix}-${key}`;

    try {
      const stored = localStorage.getItem(fullKey);

      if (!stored) {
        return defaultValue;
      }

      return JSON.parse(stored) as T;
    } catch (error) {
      logger.error(`Failed to load ${key} from localStorage`, error);
      return defaultValue;
    }
  }

  /**
   * Clean up old data based on age (days)
   */
  cleanup(key: string, daysToKeep: number): void {
    const data = this.load<Array<{ timestamp: number }>>(key);

    if (!Array.isArray(data)) {
      return;
    }

    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const filtered = data.filter(item => item.timestamp >= cutoffTime);

    if (filtered.length < data.length) {
      logger.info(
        `Cleaned up ${data.length - filtered.length} old records from ${key}`
      );
      this.save(key, filtered);
    }
  }

  /**
   * Remove all data for a key
   */
  clear(key: string): void {
    const fullKey = `${this.prefix}-${key}`;
    localStorage.removeItem(fullKey);
    logger.info(`Cleared ${key} from localStorage`);
  }

  /**
   * Remove all data with this prefix
   */
  clearAll(): void {
    const keys: string[] = [];

    // Find all keys with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }

    // Remove them
    keys.forEach(key => localStorage.removeItem(key));
    logger.info(`Cleared ${keys.length} keys from localStorage`);
  }

  /**
   * Get storage usage statistics
   */
  getStats(): {
    totalKeys: number;
    totalSize: number;
    keys: Array<{ key: string; size: number }>;
  } {
    const keys: Array<{ key: string; size: number }> = [];
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        keys.push({ key, size });
        totalSize += size;
      }
    }

    return {
      totalKeys: keys.length,
      totalSize,
      keys: keys.sort((a, b) => b.size - a.size),
    };
  }
}

/**
 * Session Manager
 *
 * Handles session ID generation and tracking.
 * Provides consistent session identification across linking system.
 */
export class SessionManager {
  private static readonly SESSION_KEY = "session-id";
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private storage: StorageManager;

  constructor(storage?: StorageManager) {
    this.storage = storage || new StorageManager();
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current session ID (or create new one if expired)
   */
  getSessionId(): string {
    const session = this.storage.load<{
      id: string;
      timestamp: number;
    }>(SessionManager.SESSION_KEY);

    // Check if session exists and is not expired
    if (
      session &&
      Date.now() - session.timestamp < SessionManager.SESSION_DURATION
    ) {
      // Update timestamp to extend session
      this.storage.save(SessionManager.SESSION_KEY, {
        id: session.id,
        timestamp: Date.now(),
      });
      return session.id;
    }

    // Create new session
    const newSessionId = this.generateSessionId();
    this.storage.save(SessionManager.SESSION_KEY, {
      id: newSessionId,
      timestamp: Date.now(),
    });

    return newSessionId;
  }

  /**
   * End current session
   */
  endSession(): void {
    this.storage.clear(SessionManager.SESSION_KEY);
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    const session = this.storage.load<{
      id: string;
      timestamp: number;
    }>(SessionManager.SESSION_KEY);

    return (
      session !== null &&
      Date.now() - session.timestamp < SessionManager.SESSION_DURATION
    );
  }
}

/**
 * Data Validator
 *
 * Validates and sanitizes data for linking operations
 */
export class DataValidator {
  /**
   * Validate link click event data
   */
  static validateClickEvent(event: unknown): event is {
    sourcePost: string;
    targetPost: string;
    timestamp: number;
  } {
    if (typeof event !== "object" || event === null) {
      return false;
    }

    const e = event as Record<string, unknown>;

    return (
      typeof e.sourcePost === "string" &&
      typeof e.targetPost === "string" &&
      typeof e.timestamp === "number" &&
      e.sourcePost.length > 0 &&
      e.targetPost.length > 0 &&
      e.timestamp > 0
    );
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string {
    try {
      // Remove query params and hash
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, return as-is but trimmed
      return url.trim();
    }
  }

  /**
   * Check if timestamp is within time range
   */
  static isWithinTimeframe(timestamp: number, days: number): boolean {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return timestamp >= cutoff;
  }
}

/**
 * Default storage manager instance
 */
export const defaultStorage = new StorageManager("gl-linking");

/**
 * Default session manager instance
 */
export const defaultSession = new SessionManager(defaultStorage);
