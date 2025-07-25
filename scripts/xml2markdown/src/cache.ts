import crypto from "crypto";
import fs from "fs";

import { xmlLogger } from "./logger.js";

/**
 * Cache entry for Visionati API results
 * Immutable cache entry containing AI-generated metadata
 */
export interface CacheEntry {
  /** AI-generated alt text for the image */
  readonly altText: string;
  /** AI-generated SEO-optimized filename */
  readonly filename: string;
  /** Number of AI credits used for generation */
  readonly creditsUsed: number;
  /** ISO timestamp when entry was created */
  readonly timestamp: string;
  /** Hash of configuration used for generation */
  readonly configHash: string;
}

/**
 * Cache data structure
 * Root cache file format with version and entries
 */
export interface CacheData {
  /** Cache format version for compatibility checking */
  readonly version: string;
  /** Global configuration hash */
  readonly configHash: string;
  /** Map of image URLs to cached results */
  entries: Record<string, CacheEntry>;
}

/**
 * Cache configuration options
 * Controls cache behavior and persistence settings
 */
export interface CacheConfig {
  /** Enable/disable caching functionality (default: true) */
  readonly enabled?: boolean;
  /** Path to cache file (default: .visionati-cache.json) */
  readonly cacheFile?: string;
  /** Cache entry TTL in days (default: 30) */
  readonly ttlDays?: number;
}

/**
 * Visionati configuration interface for cache hashing
 * Subset of configuration that affects AI generation results
 */
interface VisionatiConfig {
  /** AI backend service (claude, gpt4, gemini) */
  readonly backend?: string;
  /** Target language for generated text */
  readonly language?: string;
  /** Custom prompt for AI generation */
  readonly prompt?: string;
}

/**
 * Visionati API result interface
 * Result structure returned by AI image processing
 */
interface VisionatiResult {
  /** Generated image description/alt text */
  readonly description: string;
  /** Generated SEO-optimized filename */
  readonly filename: string;
  /** Number of AI credits consumed */
  readonly creditsUsed: number;
}

/**
 * Persistent file-based cache for Visionati API results
 * Stores processed image metadata to avoid redundant API calls
 */
export class CacheService {
  private data: CacheData | null = null;
  private isDirty = false;
  private readonly enabled: boolean;
  private readonly cacheFile: string;
  private readonly ttlDays: number;
  private readonly version = "1.0" as const;

  constructor(config: CacheConfig) {
    this.enabled = config.enabled !== false;
    this.cacheFile = config.cacheFile ?? ".visionati-cache.json";
    this.ttlDays = config.ttlDays ?? 30;

    if (this.enabled) {
      this.load();
    }
  }

  /**
   * Generate hash of configuration to detect changes
   * Only includes configuration that affects AI generation results
   */
  generateConfigHash(config: VisionatiConfig): string {
    const relevantConfig = {
      backend: config.backend ?? "claude",
      language: config.language ?? "en",
      prompt: config.prompt ?? "",
    } as const;

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(relevantConfig))
      .digest("hex");
  }

  /**
   * Load cache from disk with optimized parsing and validation
   */
  load(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const content = fs.readFileSync(this.cacheFile, "utf8");
        
        // Validate JSON structure before parsing
        if (!content.trim() || !content.startsWith("{")) {
          xmlLogger.warn("⚠️ Cache file appears corrupted, reinitializing");
          this.initializeCache();
          return;
        }

        this.data = JSON.parse(content);

        // Validate data structure
        if (!this.data || typeof this.data !== "object" || !this.data.entries) {
          xmlLogger.warn("⚠️ Cache data structure invalid, reinitializing");
          this.initializeCache();
          return;
        }

        // Check version compatibility
        if (this.data.version !== this.version) {
          xmlLogger.warn(
            `⚠️ Cache version mismatch (${this.data.version} vs ${this.version}), clearing cache`
          );
          this.clear();
        } else {
          const entryCount = Object.keys(this.data.entries).length;
          xmlLogger.info(`📋 Loaded Visionati cache with ${entryCount} entries`);
          
          // Prune old entries on load for immediate cleanup
          this.prune();
        }
      } else {
        this.initializeCache();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      xmlLogger.error(
        "❌ Failed to load cache, initializing new cache:",
        errorMessage
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
   * Save cache to disk if dirty with atomic write operation
   */
  save(): void {
    if (!this.enabled || !this.isDirty || !this.data) {
      return;
    }

    try {
      // Validate data before saving
      if (!this.data.entries || typeof this.data.entries !== "object") {
        xmlLogger.warn("⚠️ Invalid cache data, skipping save");
        return;
      }

      const content = JSON.stringify(this.data, null, 2);
      const tempFile = `${this.cacheFile}.tmp`;
      
      // Atomic write: write to temp file first, then rename
      fs.writeFileSync(tempFile, content, "utf8");
      fs.renameSync(tempFile, this.cacheFile);
      
      this.isDirty = false;
      xmlLogger.debug(
        `💾 Saved cache with ${Object.keys(this.data.entries).length} entries`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      xmlLogger.error("❌ Failed to save cache:", errorMessage);
      
      // Clean up temp file if it exists
      try {
        const tempFile = `${this.cacheFile}.tmp`;
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch {
        // Ignore cleanup errors
      }
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
   * Remove expired entries with optimized batch processing
   */
  prune(): void {
    if (!this.enabled || !this.data) {
      return;
    }

    const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const entries = Object.entries(this.data.entries);
    
    // Early return if no entries to process
    if (entries.length === 0) {
      return;
    }

    const validEntries = {} as Record<string, CacheEntry>;
    let prunedCount = 0;
    let invalidTimestampCount = 0;

    // Process entries in batches to handle large caches efficiently
    const BATCH_SIZE = 100;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      
      for (const [url, entry] of batch) {
        try {
          const entryTime = new Date(entry.timestamp).getTime();
          
          // Check for invalid timestamps
          if (isNaN(entryTime)) {
            invalidTimestampCount++;
            continue;
          }
          
          const entryAge = now - entryTime;
          if (entryAge <= ttlMs) {
            validEntries[url] = entry;
          } else {
            prunedCount++;
          }
        } catch {
          // Skip entries with invalid timestamp format
          invalidTimestampCount++;
        }
      }
    }

    const totalRemoved = prunedCount + invalidTimestampCount;
    if (totalRemoved > 0) {
      this.data = {
        ...this.data,
        entries: validEntries,
      };
      this.isDirty = true;
      
      if (prunedCount > 0 && invalidTimestampCount > 0) {
        xmlLogger.info(
          `🧹 Pruned ${prunedCount} expired and ${invalidTimestampCount} invalid cache entries`
        );
      } else if (prunedCount > 0) {
        xmlLogger.info(`🧹 Pruned ${prunedCount} expired cache entries`);
      } else {
        xmlLogger.info(`🧹 Removed ${invalidTimestampCount} invalid cache entries`);
      }
      
      // Save immediately after pruning
      this.save();
    }
  }

  /**
   * Get cache statistics with optimized single-pass analysis
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
    averageCreditsPerEntry?: number;
    oldestEntryAge?: number;
    newestEntryAge?: number;
  } {
    if (!this.enabled || !this.data) {
      return {
        enabled: false,
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        totalCreditsSaved: 0,
      };
    }

    const entries = Object.entries(this.data.entries);
    
    // Early return for empty cache
    if (entries.length === 0) {
      return {
        enabled: true,
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        totalCreditsSaved: 0,
        cacheFile: this.cacheFile,
        cacheSizeBytes: 0,
        cacheSizeKB: 0,
        ttlDays: this.ttlDays,
      };
    }

    const now = Date.now();
    const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;

    // Single pass analysis with comprehensive statistics
    let validCount = 0;
    let totalCredits = 0;
    let oldestAge = 0;
    let newestAge = Infinity;

    for (const [, entry] of entries) {
      try {
        const entryTime = new Date(entry.timestamp).getTime();
        if (!isNaN(entryTime)) {
          const age = now - entryTime;
          
          if (age <= ttlMs) {
            validCount++;
          }
          
          // Track age extremes
          oldestAge = Math.max(oldestAge, age);
          newestAge = Math.min(newestAge, age);
        }
        
        totalCredits += entry.creditsUsed || 0;
      } catch {
        // Skip invalid entries
      }
    }

    // Lazy file size calculation with error handling
    let fileSize = 0;
    try {
      if (fs.existsSync(this.cacheFile)) {
        const stats = fs.statSync(this.cacheFile);
        fileSize = stats.size;
      }
    } catch {
      // File size unavailable
    }

    return {
      enabled: true,
      totalEntries: entries.length,
      validEntries: validCount,
      expiredEntries: entries.length - validCount,
      totalCreditsSaved: totalCredits,
      cacheFile: this.cacheFile,
      cacheSizeBytes: fileSize,
      cacheSizeKB: Math.round((fileSize / 1024) * 10) / 10,
      ttlDays: this.ttlDays,
      averageCreditsPerEntry: entries.length > 0 ? Math.round((totalCredits / entries.length) * 100) / 100 : 0,
      oldestEntryAge: oldestAge > 0 ? Math.round(oldestAge / (24 * 60 * 60 * 1000) * 10) / 10 : 0,
      newestEntryAge: newestAge < Infinity ? Math.round(newestAge / (24 * 60 * 60 * 1000) * 10) / 10 : 0,
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
