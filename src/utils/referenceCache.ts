/**
 * Reference caching system for improved performance
 * Caches processed references and provides invalidation mechanisms
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { logger } from "@/utils/logger";
// import type { Reference } from "@/utils/references"; // Unused in current scope

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
  version: string;
}

interface CacheMetadata {
  lastUpdate: number;
  totalEntries: number;
  version: string;
}

const CACHE_VERSION = "1.0.0";
const CACHE_DIR = join(process.cwd(), ".cache", "references");
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const METADATA_FILE = join(CACHE_DIR, "metadata.json");

/**
 * Generate cache key from data
 */
function generateCacheKey(data: unknown): string {
  const content = JSON.stringify(
    data,
    typeof data === "object" && data !== null
      ? Object.keys(data as Record<string, unknown>).sort()
      : undefined
  );
  return createHash("md5").update(content).digest("hex");
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    logger.warn("Failed to create cache directory:", error);
  }
}

/**
 * Get cache file path for a key
 */
function getCacheFilePath(key: string): string {
  return join(CACHE_DIR, `${key}.json`);
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: CacheEntry<unknown>): boolean {
  const now = Date.now();
  const age = now - entry.timestamp;

  return entry.version === CACHE_VERSION && age < CACHE_TTL;
}

/**
 * Get item from cache
 */
export async function getCachedItem<T>(key: string): Promise<T | null> {
  try {
    const filePath = getCacheFilePath(key);

    if (!existsSync(filePath)) {
      return null;
    }

    const content = await readFile(filePath, "utf8");
    const entry: CacheEntry<T> = JSON.parse(content);

    if (!isCacheValid(entry)) {
      logger.debug(`Cache entry expired: ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return entry.data;
  } catch (error) {
    logger.warn(`Failed to read from cache: ${key}`, error);
    return null;
  }
}

/**
 * Set item in cache
 */
export async function setCachedItem<T>(key: string, data: T): Promise<void> {
  try {
    await ensureCacheDir();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash: generateCacheKey(data),
      version: CACHE_VERSION,
    };

    const filePath = getCacheFilePath(key);
    await writeFile(filePath, JSON.stringify(entry, null, 2), "utf8");

    await updateMetadata();
    logger.debug(`Cache write: ${key}`);
  } catch (error) {
    logger.warn(`Failed to write to cache: ${key}`, error);
  }
}

/**
 * Update cache metadata
 */
async function updateMetadata(): Promise<void> {
  try {
    const metadata: CacheMetadata = {
      lastUpdate: Date.now(),
      totalEntries: await getCacheSize(),
      version: CACHE_VERSION,
    };

    await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf8");
  } catch (error) {
    logger.warn("Failed to update cache metadata:", error);
  }
}

/**
 * Get cache size (number of entries)
 */
async function getCacheSize(): Promise<number> {
  try {
    if (!existsSync(CACHE_DIR)) {
      return 0;
    }

    const { readdir } = await import("node:fs/promises");
    const files = await readdir(CACHE_DIR);
    return files.filter(
      file => file.endsWith(".json") && file !== "metadata.json"
    ).length;
  } catch (error) {
    logger.warn("Failed to get cache size:", error);
    return 0;
  }
}

/**
 * Clear all cache entries
 */
export async function clearCache(): Promise<void> {
  try {
    if (!existsSync(CACHE_DIR)) {
      return;
    }

    const { readdir, unlink } = await import("node:fs/promises");
    const files = await readdir(CACHE_DIR);

    for (const file of files) {
      if (file.endsWith(".json")) {
        await unlink(join(CACHE_DIR, file));
      }
    }

    logger.info("Cache cleared");
  } catch (error) {
    logger.error("Failed to clear cache:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  cacheSize: string;
  lastUpdate: Date | null;
  version: string;
  ttlHours: number;
}> {
  const size = await getCacheSize();
  let lastUpdate: Date | null = null;
  let version = CACHE_VERSION;

  try {
    if (existsSync(METADATA_FILE)) {
      const content = await readFile(METADATA_FILE, "utf8");
      const metadata: CacheMetadata = JSON.parse(content);
      lastUpdate = new Date(metadata.lastUpdate);
      version = metadata.version;
    }
  } catch (error) {
    logger.warn("Failed to read cache metadata:", error);
  }

  // Estimate cache size on disk
  let totalSize = 0;
  try {
    if (existsSync(CACHE_DIR)) {
      const { readdir } = await import("node:fs/promises");
      const files = await readdir(CACHE_DIR);

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = join(CACHE_DIR, file);
          const stats = await stat(filePath);
          totalSize += stats.size;
        }
      }
    }
  } catch (error) {
    logger.warn("Failed to calculate cache size:", error);
  }

  const cacheSizeFormatted =
    totalSize > 1024 * 1024
      ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
      : totalSize > 1024
        ? `${(totalSize / 1024).toFixed(2)} KB`
        : `${totalSize} B`;

  return {
    totalEntries: size,
    cacheSize: cacheSizeFormatted,
    lastUpdate,
    version,
    ttlHours: CACHE_TTL / (1000 * 60 * 60),
  };
}

/**
 * Cached wrapper for expensive operations
 */
export async function withCache<T>(
  key: string,
  operation: () => Promise<T>,
  options: { ttl?: number; force?: boolean } = {}
): Promise<T> {
  const { force = false } = options;

  // Check cache first (unless forced)
  if (!force) {
    const cached = await getCachedItem<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  // Execute operation and cache result
  const result = await operation();
  await setCachedItem(key, result);

  return result;
}

// Reference-specific caching utilities

/**
 * Cache key generators for different reference operations
 */
export const CacheKeys = {
  allReferences: () => "references:all",
  referenceById: (id: string) => `references:by-id:${id}`,
  referencesByIds: (ids: string[]) =>
    `references:by-ids:${generateCacheKey(ids.sort())}`,
  referenceSearch: (options: unknown) =>
    `references:search:${generateCacheKey(options)}`,
  referenceStats: () => "references:stats",
  referencesByType: () => "references:by-type",
  duplicateCheck: () => "references:duplicates",
} as const;

/**
 * Invalidate reference-related cache entries
 */
export async function invalidateReferenceCache(
  patterns?: string[]
): Promise<void> {
  try {
    if (!existsSync(CACHE_DIR)) {
      return;
    }

    const { readdir, unlink } = await import("node:fs/promises");
    const files = await readdir(CACHE_DIR);

    const defaultPatterns = ["references:"];

    const patternsToCheck = patterns || defaultPatterns;

    for (const file of files) {
      if (!file.endsWith(".json") || file === "metadata.json") {
        continue;
      }

      const shouldDelete = patternsToCheck.some(pattern =>
        file.includes(pattern.replace(":", "-"))
      );

      if (shouldDelete) {
        await unlink(join(CACHE_DIR, file));
        logger.debug(`Invalidated cache: ${file}`);
      }
    }

    await updateMetadata();
    logger.info("Reference cache invalidated");
  } catch (error) {
    logger.error("Failed to invalidate reference cache:", error);
  }
}

/**
 * Warm up cache with commonly accessed data
 */
export async function warmupReferenceCache(): Promise<void> {
  logger.info("Warming up reference cache...");

  try {
    // Import here to avoid circular dependencies
    const { getAllReferences, getReferenceStats, getReferencesByType } =
      await import("./references");

    // Cache all references
    await withCache(CacheKeys.allReferences(), getAllReferences);

    // Cache statistics
    await withCache(CacheKeys.referenceStats(), getReferenceStats);

    // Cache references by type
    await withCache(CacheKeys.referencesByType(), getReferencesByType);

    logger.info("Reference cache warmed up");
  } catch (error) {
    logger.error("Failed to warm up reference cache:", error);
  }
}

/**
 * Middleware for automatic cache invalidation on file changes
 */
export async function setupCacheInvalidation(): Promise<void> {
  // This would be called during build or development setup
  // to watch for file changes and invalidate cache accordingly

  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    logger.info("Cache invalidation middleware setup (development mode)");

    // In a real implementation, you might use chokidar or similar
    // to watch the references directory and invalidate cache on changes

    // For now, we'll just clear cache on startup in development
    await invalidateReferenceCache();
  }
}
