import crypto from "crypto";
import fs from "fs";

import { xmlLogger } from "./logger.js";

/**
 * Cache entry for Visionati API results
 */
export interface CacheEntry {
  altText: string;
  filename: string;
  creditsUsed: number;
  timestamp: string;
  configHash: string;
}

/**
 * Cache data structure
 */
export interface CacheData {
  version: string;
  configHash: string;
  entries: Record<string, CacheEntry>;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  enabled?: boolean;
  cacheFile?: string;
  ttlDays?: number;
}

/**
 * Visionati configuration interface for cache hashing
 */
interface VisionatiConfig {
  backend?: string;
  language?: string;
  prompt?: string;
}

/**
 * Visionati API result interface
 */
interface VisionatiResult {
  description: string;
  filename: string;
  creditsUsed: number;
}

/**
 * Persistent file-based cache for Visionati API results
 * Stores processed image metadata to avoid redundant API calls
 */
export class CacheService {
  private data: CacheData | null;
  private isDirty: boolean;
  private enabled: boolean;
  private cacheFile: string;
  private ttlDays: number;
  private version: string;

  constructor(config: CacheConfig) {
    this.enabled = config.enabled !== false;
    this.cacheFile = config.cacheFile || ".visionati-cache.json";
    this.ttlDays = config.ttlDays || 30;
    this.version = "1.0";
    this.data = null;
    this.isDirty = false;
    // configHash will be set during load/initialization

    if (this.enabled) {
      this.load();
    }
  }

  /**
   * Generate hash of configuration to detect changes
   */
  generateConfigHash(config: VisionatiConfig): string {
    const relevantConfig = {
      backend: config.backend,
      language: config.language,
      prompt: config.prompt,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(relevantConfig))
      .digest("hex");
  }

  /**
   * Load cache from disk
   */
  load(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const content = fs.readFileSync(this.cacheFile, "utf8");
        this.data = JSON.parse(content);

        // Check version compatibility
        if (this.data && this.data.version !== this.version) {
          xmlLogger.warn(
            `⚠️ Cache version mismatch (${this.data.version} vs ${this.version}), clearing cache`
          );
          this.clear();
        } else if (this.data) {
          xmlLogger.info(
            `📋 Loaded Visionati cache with ${Object.keys(this.data.entries).length} entries`
          );
          // Prune old entries on load
          this.prune();
        }
      } else {
        this.initializeCache();
      }
    } catch (error) {
      xmlLogger.error(
        "❌ Failed to load cache, initializing new cache:",
        error
      );
      this.initializeCache();
    }
  }

  /**
   * Initialize empty cache
   */
  initializeCache(): void {
    this.data = {
      version: this.version,
      configHash: "",
      entries: {},
    };
    this.isDirty = true;
    xmlLogger.debug("🔄 Initialized new cache");
  }

  /**
   * Save cache to disk if dirty
   */
  save(): void {
    if (!this.enabled || !this.isDirty || !this.data) {
      return;
    }

    try {
      const content = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(this.cacheFile, content, "utf8");
      this.isDirty = false;
      xmlLogger.debug(
        `💾 Saved cache with ${Object.keys(this.data.entries).length} entries`
      );
    } catch (error) {
      xmlLogger.error("❌ Failed to save cache:", error);
    }
  }

  /**
   * Get cache entry for URL and config
   */
  get(url: string, config: VisionatiConfig): CacheEntry | null {
    if (!this.enabled || !this.data) {
      return null;
    }

    const currentConfigHash = this.generateConfigHash(config);
    const entry = this.data.entries[url];

    if (!entry) {
      return null;
    }

    // Check if entry was created with same config
    if (entry.configHash !== currentConfigHash) {
      xmlLogger.debug(`🔄 Cache miss - config changed for: ${url}`);
      return null;
    }

    // Check if entry is expired
    const entryAge = Date.now() - new Date(entry.timestamp).getTime();
    const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;

    if (entryAge > ttlMs) {
      xmlLogger.debug(`⏰ Cache miss - expired entry for: ${url}`);
      delete this.data.entries[url];
      this.isDirty = true;
      return null;
    }

    xmlLogger.debug(`✅ Cache hit for: ${url}`);
    return entry;
  }

  /**
   * Set cache entry
   */
  set(url: string, result: VisionatiResult, config: VisionatiConfig): void {
    if (!this.enabled || !this.data) {
      return;
    }

    const configHash = this.generateConfigHash(config);

    this.data.entries[url] = {
      altText: result.description,
      filename: result.filename,
      creditsUsed: result.creditsUsed,
      timestamp: new Date().toISOString(),
      configHash,
    };

    this.isDirty = true;
    xmlLogger.debug(`📝 Cached result for: ${url}`);
  }

  /**
   * Check if URL exists in cache
   */
  has(url: string, config: VisionatiConfig): boolean {
    return this.get(url, config) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.initializeCache();
    this.save();
    xmlLogger.info("🧹 Cache cleared");
  }

  /**
   * Remove expired entries
   */
  prune(): void {
    if (!this.enabled || !this.data) {
      return;
    }

    const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let prunedCount = 0;

    for (const [url, entry] of Object.entries(this.data.entries)) {
      const entryAge = now - new Date(entry.timestamp).getTime();
      if (entryAge > ttlMs) {
        delete this.data.entries[url];
        prunedCount++;
        this.isDirty = true;
      }
    }

    if (prunedCount > 0) {
      xmlLogger.info(`🧹 Pruned ${prunedCount} expired cache entries`);
      this.save();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    enabled: boolean;
    totalEntries?: number;
    validEntries?: number;
    expiredEntries?: number;
    totalCreditsSaved?: number;
    cacheFile?: string;
    cacheSizeBytes?: number;
    cacheSizeKB?: number;
    ttlDays?: number;
    entries?: number;
    hits?: number;
    misses?: number;
    size?: number;
  } {
    if (!this.enabled || !this.data) {
      return {
        enabled: false,
        entries: 0,
        hits: 0,
        misses: 0,
        size: 0,
      };
    }

    const entries = Object.entries(this.data.entries);
    const now = Date.now();
    const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;

    const validEntries = entries.filter(([_, entry]) => {
      const age = now - new Date(entry.timestamp).getTime();
      return age <= ttlMs;
    });

    const totalCredits = entries.reduce(
      (sum, [_, entry]) => sum + entry.creditsUsed,
      0
    );

    let fileSize = 0;
    try {
      if (fs.existsSync(this.cacheFile)) {
        const stats = fs.statSync(this.cacheFile);
        fileSize = stats.size;
      }
    } catch {
      // Ignore error
    }

    return {
      enabled: true,
      totalEntries: entries.length,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      totalCreditsSaved: totalCredits,
      cacheFile: this.cacheFile,
      cacheSizeBytes: fileSize,
      cacheSizeKB: Math.round((fileSize / 1024) * 10) / 10,
      ttlDays: this.ttlDays,
    };
  }

  /**
   * Export cache data for debugging
   */
  export(): CacheData | null {
    return this.data ? { ...this.data } : null;
  }

  /**
   * Import cache data (for testing)
   */
  import(data: CacheData): void {
    if (data && data.version === this.version) {
      this.data = data;
      this.isDirty = true;
      this.save();
    }
  }
}
