import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import {
  CacheService,
  type CacheConfig,
  type CacheEntry,
  type CacheData,
} from "./cache.js";
import { mockFs, mockLogger } from "../test-utils/mocks.js";

// Mock dependencies
vi.mock("fs");
vi.mock("./logger.js", () => ({
  xmlLogger: mockLogger,
}));

describe("CacheService", () => {
  let cacheService: CacheService;
  const testCacheFile = ".test-cache.json";
  const testConfig: CacheConfig = {
    enabled: true,
    cacheFile: testCacheFile,
    ttlDays: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fs.existsSync = mockFs.existsSync;
    fs.readFileSync = mockFs.readFileSync;
    fs.writeFileSync = mockFs.writeFileSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default values when enabled", () => {
      cacheService = new CacheService(testConfig);
      expect(cacheService.enabled).toBe(true);
      expect(cacheService.cacheFile).toBe(testCacheFile);
      expect(cacheService.ttlDays).toBe(30);
      expect(cacheService.version).toBe("1.0");
    });

    it("should not load cache when disabled", () => {
      cacheService = new CacheService({ ...testConfig, enabled: false });
      expect(cacheService.enabled).toBe(false);
      expect(mockFs.existsSync).not.toHaveBeenCalled();
    });

    it("should load existing cache file on initialization", () => {
      const mockCacheData: CacheData = {
        version: "1.0",
        configHash: "test-hash",
        entries: {
          "https://example.com/image.jpg": {
            altText: "Test alt text",
            filename: "test-filename",
            creditsUsed: 1,
            timestamp: new Date().toISOString(),
            configHash: "test-hash",
          },
        },
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockCacheData));

      cacheService = new CacheService(testConfig);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(testCacheFile, "utf8");
      expect(cacheService.data).toEqual(mockCacheData);
    });

    it("should clear cache on version mismatch", () => {
      const oldCacheData: CacheData = {
        version: "0.9",
        configHash: "test-hash",
        entries: {},
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(oldCacheData));

      cacheService = new CacheService(testConfig);
      expect(cacheService.data.version).toBe("1.0");
      expect(cacheService.data.entries).toEqual({});
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("version mismatch")
      );
    });

    it("should handle corrupted cache file gracefully", () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue("invalid json");

      cacheService = new CacheService(testConfig);
      expect(cacheService.data).toEqual({
        version: "1.0",
        configHash: "",
        entries: {},
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("generateConfigHash", () => {
    beforeEach(() => {
      cacheService = new CacheService(testConfig);
    });

    it("should generate consistent hash for same config", () => {
      const config1 = {
        backend: "claude",
        language: "de",
        prompt: "test",
      } as const;
      const config2 = {
        backend: "claude",
        language: "de",
        prompt: "test",
      } as const;

      const hash1 = cacheService.generateConfigHash(config1);
      const hash2 = cacheService.generateConfigHash(config2);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash format
    });

    it("should generate different hash for different config", () => {
      const config1 = {
        backend: "claude",
        language: "de",
        prompt: "test",
      } as const;
      const config2 = {
        backend: "gpt4",
        language: "de",
        prompt: "test",
      } as const;

      const hash1 = cacheService.generateConfigHash(config1);
      const hash2 = cacheService.generateConfigHash(config2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("get", () => {
    const testUrl = "https://example.com/test.jpg";
    const testApiConfig = {
      backend: "claude",
      language: "de",
      prompt: "test",
    } as const;

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should return null when cache is disabled", () => {
      cacheService.enabled = false;
      const result = cacheService.get(testUrl, testApiConfig);
      expect(result).toBeNull();
    });

    it("should return null when entry does not exist", () => {
      const result = cacheService.get(testUrl, testApiConfig);
      expect(result).toBeNull();
    });

    it("should return cached entry when exists and valid", () => {
      const configHash = cacheService.generateConfigHash(testApiConfig);
      const entry: CacheEntry = {
        altText: "Test alt text",
        filename: "test-filename",
        creditsUsed: 1,
        timestamp: new Date().toISOString(),
        configHash,
      };

      cacheService.data.entries[testUrl] = entry;
      const result = cacheService.get(testUrl, testApiConfig);

      expect(result).toEqual(entry);
    });

    it("should return null when config hash does not match", () => {
      const differentConfig = {
        backend: "gpt4",
        language: "de",
        prompt: "test",
      };
      const configHash = cacheService.generateConfigHash(differentConfig);
      const entry = {
        altText: "Test alt text",
        filename: "test-filename",
        creditsUsed: 1,
        timestamp: new Date().toISOString(),
        configHash,
      };

      cacheService.data.entries[testUrl] = entry;
      const result = cacheService.get(testUrl, testApiConfig);

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining("config changed")
      );
    });

    it("should return null and remove expired entries", () => {
      const configHash = cacheService.generateConfigHash(testApiConfig);
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31); // 31 days ago

      const entry = {
        altText: "Test alt text",
        filename: "test-filename",
        creditsUsed: 1,
        timestamp: oldDate.toISOString(),
        configHash,
      };

      cacheService.data.entries[testUrl] = entry;
      const result = cacheService.get(testUrl, testApiConfig);

      expect(result).toBeNull();
      expect(cacheService.data.entries[testUrl]).toBeUndefined();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining("expired")
      );
    });
  });

  describe("set", () => {
    const testUrl = "https://example.com/test.jpg";
    const testApiConfig = { backend: "claude", language: "de", prompt: "test" };
    const testResult = {
      description: "Test Beschreibung",
      filename: "test-dateiname",
      creditsUsed: 1,
    };

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should not set when cache is disabled", () => {
      cacheService.enabled = false;
      cacheService.set(testUrl, testResult, testApiConfig);
      expect(cacheService.data.entries).toEqual({});
    });

    it("should set new cache entry correctly", () => {
      cacheService.set(testUrl, testResult, testApiConfig);

      const entry = cacheService.data.entries[testUrl];
      expect(entry).toBeDefined();
      expect(entry.altText).toBe("Test Beschreibung");
      expect(entry.filename).toBe("test-dateiname");
      expect(entry.creditsUsed).toBe(1);
      expect(entry.timestamp).toBeDefined();
      expect(entry.configHash).toBe(
        cacheService.generateConfigHash(testApiConfig)
      );
      expect(cacheService.isDirty).toBe(true);
    });

    it("should update existing cache entry", () => {
      // Set initial entry
      cacheService.set(testUrl, testResult, testApiConfig);
      const firstTimestamp = cacheService.data.entries[testUrl].timestamp;

      // Wait a bit and update
      vi.advanceTimersByTime(100);
      const updatedResult = {
        ...testResult,
        description: "Updated Beschreibung",
      };
      cacheService.set(testUrl, updatedResult, testApiConfig);

      const entry = cacheService.data.entries[testUrl];
      expect(entry.altText).toBe("Updated Beschreibung");
      expect(entry.timestamp).not.toBe(firstTimestamp);
    });
  });

  describe("has", () => {
    const testUrl = "https://example.com/test.jpg";
    const testApiConfig = { backend: "claude", language: "de", prompt: "test" };

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should return false when entry does not exist", () => {
      expect(cacheService.has(testUrl, testApiConfig)).toBe(false);
    });

    it("should return true when valid entry exists", () => {
      const configHash = cacheService.generateConfigHash(testApiConfig);
      cacheService.data.entries[testUrl] = {
        altText: "Test",
        filename: "test",
        creditsUsed: 1,
        timestamp: new Date().toISOString(),
        configHash,
      };

      expect(cacheService.has(testUrl, testApiConfig)).toBe(true);
    });

    it("should return false for expired entry", () => {
      const configHash = cacheService.generateConfigHash(testApiConfig);
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      cacheService.data.entries[testUrl] = {
        altText: "Test",
        filename: "test",
        creditsUsed: 1,
        timestamp: oldDate.toISOString(),
        configHash,
      };

      expect(cacheService.has(testUrl, testApiConfig)).toBe(false);
    });
  });

  describe("save", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should not save when disabled", () => {
      cacheService.enabled = false;
      cacheService.isDirty = true;
      cacheService.save();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it("should not save when not dirty", () => {
      cacheService.isDirty = false;
      cacheService.save();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it("should save when dirty", () => {
      cacheService.isDirty = true;
      cacheService.data.entries["test"] = { altText: "test" };
      cacheService.save();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        testCacheFile,
        expect.stringContaining('"test"'),
        "utf8"
      );
      expect(cacheService.isDirty).toBe(false);
    });

    it("should handle save errors gracefully", () => {
      cacheService.isDirty = true;
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error("Write failed");
      });

      cacheService.save();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to save cache")
      );
    });
  });

  describe("clear", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
      cacheService.data.entries = { test: { altText: "test" } };
    });

    it("should clear all entries", () => {
      cacheService.clear();
      expect(cacheService.data.entries).toEqual({});
      expect(cacheService.isDirty).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Cache cleared")
      );
    });

    it("should save after clearing", () => {
      cacheService.clear();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe("prune", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should not prune when disabled", () => {
      cacheService.enabled = false;
      cacheService.prune();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it("should remove expired entries", () => {
      const now = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      cacheService.data.entries = {
        "old-entry": {
          altText: "Old",
          timestamp: oldDate.toISOString(),
        },
        "new-entry": {
          altText: "New",
          timestamp: now.toISOString(),
        },
      };

      cacheService.prune();

      expect(cacheService.data.entries["old-entry"]).toBeUndefined();
      expect(cacheService.data.entries["new-entry"]).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Pruned 1")
      );
    });

    it("should not log when no entries pruned", () => {
      const now = new Date();
      cacheService.data.entries = {
        "new-entry": {
          altText: "New",
          timestamp: now.toISOString(),
        },
      };

      cacheService.prune();
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining("Pruned")
      );
    });
  });

  describe("getStats", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should return disabled stats when cache disabled", () => {
      cacheService.enabled = false;
      const stats = cacheService.getStats();

      expect(stats).toEqual({
        enabled: false,
        entries: 0,
        hits: 0,
        misses: 0,
        size: 0,
      });
    });

    it("should return comprehensive stats when enabled", () => {
      const now = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      cacheService.data.entries = {
        "old-entry": {
          altText: "Old",
          timestamp: oldDate.toISOString(),
          creditsUsed: 2,
        },
        "new-entry": {
          altText: "New",
          timestamp: now.toISOString(),
          creditsUsed: 3,
        },
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync = vi.fn().mockReturnValue({ size: 1024 });

      const stats = cacheService.getStats();

      expect(stats.enabled).toBe(true);
      expect(stats.totalEntries).toBe(2);
      expect(stats.validEntries).toBe(1);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.totalCreditsSaved).toBe(5);
      expect(stats.cacheFile).toBe(testCacheFile);
      expect(stats.cacheSizeBytes).toBe(1024);
      expect(stats.cacheSizeKB).toBe(1.0);
      expect(stats.ttlDays).toBe(30);
    });

    it("should handle file stat errors gracefully", () => {
      cacheService.data.entries = { test: { creditsUsed: 1 } };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync = vi.fn().mockImplementation(() => {
        throw new Error("Stat failed");
      });

      const stats = cacheService.getStats();
      expect(stats.cacheSizeBytes).toBe(0);
      expect(stats.cacheSizeKB).toBe(0);
    });
  });

  describe("export/import", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should export cache data", () => {
      const testData = {
        version: "1.0",
        configHash: "test",
        entries: { test: { altText: "Test" } },
      };
      cacheService.data = testData;

      const exported = cacheService.export();
      expect(exported).toEqual(testData);
      expect(exported).not.toBe(testData); // Should be a copy
    });

    it("should return null when exporting with no data", () => {
      cacheService.data = null;
      const exported = cacheService.export();
      expect(exported).toBeNull();
    });

    it("should import valid cache data", () => {
      const importData = {
        version: "1.0",
        configHash: "imported",
        entries: { imported: { altText: "Imported" } },
      };

      cacheService.import(importData);
      expect(cacheService.data).toEqual(importData);
      expect(cacheService.isDirty).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it("should not import invalid version data", () => {
      const originalData = cacheService.data;
      const importData = {
        version: "0.9",
        configHash: "imported",
        entries: {},
      };

      cacheService.import(importData);
      expect(cacheService.data).toEqual(originalData);
    });

    it("should not import null data", () => {
      const originalData = cacheService.data;
      cacheService.import(null);
      expect(cacheService.data).toEqual(originalData);
    });
  });

  describe("integration scenarios", () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(false);
      cacheService = new CacheService(testConfig);
    });

    it("should handle complete cache lifecycle", () => {
      const url1 = "https://example.com/image1.jpg";
      const url2 = "https://example.com/image2.jpg";
      const config = { backend: "claude", language: "de", prompt: "test" };
      const result1 = {
        description: "Bild 1",
        filename: "bild-1",
        creditsUsed: 1,
      };
      const result2 = {
        description: "Bild 2",
        filename: "bild-2",
        creditsUsed: 1,
      };

      // Set entries
      cacheService.set(url1, result1, config);
      cacheService.set(url2, result2, config);

      // Check entries exist
      expect(cacheService.has(url1, config)).toBe(true);
      expect(cacheService.has(url2, config)).toBe(true);

      // Get entries
      const cached1 = cacheService.get(url1, config);
      expect(cached1.altText).toBe("Bild 1");

      // Save cache
      cacheService.save();
      expect(cacheService.isDirty).toBe(false);

      // Get stats
      const stats = cacheService.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.totalCreditsSaved).toBe(2);

      // Clear cache
      cacheService.clear();
      expect(cacheService.has(url1, config)).toBe(false);
    });

    it("should handle configuration changes correctly", () => {
      const url = "https://example.com/test.jpg";
      const config1 = { backend: "claude", language: "de", prompt: "test" };
      const config2 = { backend: "gpt4", language: "de", prompt: "test" };
      const result = { description: "Test", filename: "test", creditsUsed: 1 };

      // Set with first config
      cacheService.set(url, result, config1);
      expect(cacheService.has(url, config1)).toBe(true);
      expect(cacheService.has(url, config2)).toBe(false);

      // Set with second config
      cacheService.set(url, result, config2);

      // Both should exist as separate entries
      const entries = Object.keys(cacheService.data.entries);
      expect(entries).toHaveLength(1); // Same URL overwrites

      // Last config wins
      const cached = cacheService.get(url, config2);
      expect(cached).toBeDefined();
    });
  });
});
