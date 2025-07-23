/**
 * Visionati cache management utilities
 */
import { logger } from "./logger";
import type {
  VisionatiCache,
  VisionatiCacheEntry,
  VisionatiStats,
} from "./types";
import { promises as fs } from "fs";
import { join } from "path";

export class VisionatiCacheManager {
  private cache: VisionatiCache = {};
  private cacheFile: string;

  constructor(cacheFile: string) {
    this.cacheFile = cacheFile;
  }

  /**
   * Load cache from file
   */
  async load(): Promise<VisionatiCache> {
    try {
      const cacheData = await fs.readFile(this.cacheFile, "utf-8");
      this.cache = JSON.parse(cacheData);
      logger.debug(`Loaded ${Object.keys(this.cache).length} cache entries`);
      return this.cache;
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        logger.warn(`Failed to load cache: ${error}`);
      }
      this.cache = {};
      return this.cache;
    }
  }

  /**
   * Save cache to file
   */
  async save(cache: VisionatiCache): Promise<void> {
    try {
      this.cache = cache;
      const cacheDir = join(this.cacheFile, "..");
      await fs.mkdir(cacheDir, { recursive: true });

      // Create backup before saving
      await this.createBackup();

      await fs.writeFile(
        this.cacheFile,
        JSON.stringify(cache, null, 2),
        "utf-8"
      );

      logger.debug(`Saved cache with ${Object.keys(cache).length} entries`);
    } catch (error) {
      logger.error(`Failed to save cache: ${error}`);
      throw error;
    }
  }

  /**
   * Create backup of existing cache
   */
  async createBackup(): Promise<void> {
    try {
      await fs.access(this.cacheFile);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = this.cacheFile.replace(
        ".json",
        `-backup-${timestamp}.json`
      );
      await fs.copyFile(this.cacheFile, backupFile);
      logger.debug(`Created cache backup: ${backupFile}`);
    } catch {
      // No existing cache to backup
    }
  }

  /**
   * Merge two caches, preserving newer entries
   */
  merge(cache1: VisionatiCache, cache2: VisionatiCache): VisionatiCache {
    const merged: VisionatiCache = { ...cache1 };

    for (const [url, entry] of Object.entries(cache2)) {
      if (
        !merged[url] ||
        new Date(entry.timestamp) > new Date(merged[url].timestamp)
      ) {
        merged[url] = entry;
      }
    }

    return merged;
  }

  /**
   * Validate cache entry
   */
  isValidEntry(entry: VisionatiCacheEntry): boolean {
    return !!(
      entry.timestamp &&
      entry.imageUrl &&
      entry.visionatiResponse &&
      typeof entry.apiCreditsUsed === "number"
    );
  }

  /**
   * Clean invalid entries from cache
   */
  clean(cache: VisionatiCache): VisionatiCache {
    const cleaned: VisionatiCache = {};
    let removedCount = 0;

    for (const [url, entry] of Object.entries(cache)) {
      if (this.isValidEntry(entry)) {
        cleaned[url] = entry;
      } else {
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug(`Cleaned ${removedCount} invalid cache entries`);
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(cache: VisionatiCache): VisionatiStats {
    const entries = Object.values(cache);
    const totalCreditsUsed = entries.reduce(
      (sum, entry) => sum + entry.apiCreditsUsed,
      0
    );

    return {
      totalEntries: entries.length,
      totalCreditsUsed,
      cacheHits: 0, // This would be tracked by the analyzer
      cacheMisses: 0, // This would be tracked by the analyzer
      costSavings: 0, // This would be calculated by the analyzer
    };
  }

  /**
   * Export cache statistics to JSON
   */
  async exportStats(cache: VisionatiCache, outputFile: string): Promise<void> {
    const stats = this.getStats(cache);
    const detailedStats = {
      ...stats,
      entries: Object.entries(cache).map(([url, entry]) => ({
        url,
        timestamp: entry.timestamp,
        generatedFilename: entry.generatedFilename,
        generatedAltText: entry.generatedAltText,
        creditsUsed: entry.apiCreditsUsed,
        tags: entry.visionatiResponse.data?.tags,
      })),
      generatedAt: new Date().toISOString(),
    };

    await fs.writeFile(outputFile, JSON.stringify(detailedStats, null, 2));
    logger.info(`Exported cache statistics to ${outputFile}`);
  }

  /**
   * Find entries by date range
   */
  findByDateRange(
    cache: VisionatiCache,
    fromDate: Date,
    toDate: Date
  ): VisionatiCache {
    const filtered: VisionatiCache = {};

    for (const [url, entry] of Object.entries(cache)) {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= fromDate && entryDate <= toDate) {
        filtered[url] = entry;
      }
    }

    return filtered;
  }

  /**
   * Find entries that generated specific filenames or alt text patterns
   */
  findByPattern(cache: VisionatiCache, pattern: RegExp): VisionatiCache {
    const matched: VisionatiCache = {};

    for (const [url, entry] of Object.entries(cache)) {
      if (
        (entry.generatedFilename && pattern.test(entry.generatedFilename)) ||
        (entry.generatedAltText && pattern.test(entry.generatedAltText))
      ) {
        matched[url] = entry;
      }
    }

    return matched;
  }

  /**
   * Calculate cost savings from cache usage
   */
  calculateCostSavings(
    cache: VisionatiCache,
    cacheHits: number,
    creditsPerImage: number = 2
  ): number {
    return cacheHits * creditsPerImage;
  }

  /**
   * Get cache file size in MB
   */
  async getCacheSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.cacheFile);
      return stats.size / (1024 * 1024); // Convert to MB
    } catch {
      return 0;
    }
  }

  /**
   * Get most frequently analyzed image patterns
   */
  getTopImagePatterns(
    cache: VisionatiCache,
    limit: number = 10
  ): Array<{
    pattern: string;
    count: number;
    examples: string[];
  }> {
    const patterns: Record<string, string[]> = {};

    // Extract patterns from generated filenames
    for (const entry of Object.values(cache)) {
      if (entry.generatedFilename) {
        const basePattern = entry.generatedFilename
          .replace(/\d+/g, "X") // Replace numbers with X
          .replace(/-\d+x\d+/g, "") // Remove dimensions
          .toLowerCase();

        if (!patterns[basePattern]) {
          patterns[basePattern] = [];
        }
        patterns[basePattern].push(entry.generatedFilename);
      }
    }

    // Sort by frequency and return top patterns
    return Object.entries(patterns)
      .map(([pattern, examples]) => ({
        pattern,
        count: examples.length,
        examples: examples.slice(0, 3), // Show first 3 examples
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
