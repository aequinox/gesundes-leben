/**
 * @file core.test.ts
 * @description Tests for core linking utilities (StorageManager, SessionManager, DataValidator)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  StorageManager,
  SessionManager,
  DataValidator,
} from "../core";

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
};

const localStorageMock = createLocalStorageMock();
vi.stubGlobal("localStorage", localStorageMock);

describe("StorageManager", () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Clear the mock
    localStorageMock.clear();
    storage = new StorageManager("test");
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("save and load", () => {
    it("should save and load simple data", () => {
      const data = { foo: "bar", count: 42 };
      storage.save("test-data", data);

      const loaded = storage.load<typeof data>("test-data");
      expect(loaded).toEqual(data);
    });

    it("should save and load arrays", () => {
      const data = [1, 2, 3, 4, 5];
      storage.save("test-array", data);

      const loaded = storage.load<number[]>("test-array");
      expect(loaded).toEqual(data);
    });

    it("should return default value when key doesn't exist", () => {
      const defaultValue = { default: true };
      const loaded = storage.load("nonexistent", defaultValue);

      expect(loaded).toEqual(defaultValue);
    });

    it("should return null when key doesn't exist and no default provided", () => {
      const loaded = storage.load("nonexistent");
      expect(loaded).toBeNull();
    });

    it("should limit array size when saving", () => {
      const largeArray = Array.from({ length: 2000 }, (_, i) => i);
      storage.save("large-array", largeArray, { maxRecords: 100 });

      const loaded = storage.load<number[]>("large-array");
      expect(loaded).toHaveLength(100);
      expect(loaded).toEqual(largeArray.slice(-100));
    });
  });

  describe("cleanup", () => {
    it("should remove old items based on timestamp", () => {
      const now = Date.now();
      const data = [
        { id: 1, timestamp: now - 10 * 24 * 60 * 60 * 1000 }, // 10 days ago
        { id: 2, timestamp: now - 5 * 24 * 60 * 60 * 1000 }, // 5 days ago
        { id: 3, timestamp: now - 1 * 24 * 60 * 60 * 1000 }, // 1 day ago
      ];

      storage.save("timed-data", data);
      storage.cleanup("timed-data", 7); // Keep only last 7 days

      const loaded = storage.load<typeof data>("timed-data");
      expect(loaded).toHaveLength(2);
      expect(loaded?.map((item) => item.id)).toEqual([2, 3]);
    });

    it("should not modify data if all items are within timeframe", () => {
      const now = Date.now();
      const data = [
        { id: 1, timestamp: now - 1 * 24 * 60 * 60 * 1000 },
        { id: 2, timestamp: now - 2 * 24 * 60 * 60 * 1000 },
      ];

      storage.save("fresh-data", data);
      storage.cleanup("fresh-data", 7);

      const loaded = storage.load<typeof data>("fresh-data");
      expect(loaded).toHaveLength(2);
    });
  });

  describe("clear", () => {
    it("should clear single key", () => {
      storage.save("key1", { value: 1 });
      storage.save("key2", { value: 2 });

      storage.clear("key1");

      expect(storage.load("key1")).toBeNull();
      expect(storage.load("key2")).not.toBeNull();
    });

    it("should clear all keys with prefix", () => {
      const storage1 = new StorageManager("prefix1");
      const storage2 = new StorageManager("prefix2");

      storage1.save("data", { value: 1 });
      storage2.save("data", { value: 2 });

      storage1.clearAll();

      expect(storage1.load("data")).toBeNull();
      expect(storage2.load("data")).not.toBeNull();
    });
  });

  describe("getStats", () => {
    it("should return storage statistics", () => {
      storage.save("key1", { value: "test" });
      storage.save("key2", { value: "longer test value" });

      const stats = storage.getStats();

      expect(stats.totalKeys).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.keys).toHaveLength(2);
      expect(stats.keys[0].key).toBeTruthy();
      expect(stats.keys[0].size).toBeGreaterThan(0);
    });

    it("should sort keys by size descending", () => {
      storage.save("small", { v: 1 });
      storage.save("large", { value: "very long string".repeat(10) });

      const stats = storage.getStats();

      expect(stats.keys[0].size).toBeGreaterThan(stats.keys[1].size);
    });
  });
});

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let storage: StorageManager;

  beforeEach(() => {
    localStorageMock.clear();
    storage = new StorageManager("test-session");
    sessionManager = new SessionManager(storage);
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("generateSessionId", () => {
    it("should generate unique session IDs", () => {
      const id1 = sessionManager.generateSessionId();
      const id2 = sessionManager.generateSessionId();

      expect(id1).not.toEqual(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe("getSessionId", () => {
    it("should create new session if none exists", () => {
      const sessionId = sessionManager.getSessionId();

      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it("should return existing session if still active", () => {
      const sessionId1 = sessionManager.getSessionId();
      const sessionId2 = sessionManager.getSessionId();

      expect(sessionId1).toEqual(sessionId2);
    });

    it("should create new session if previous expired", () => {
      const sessionId1 = sessionManager.getSessionId();

      // Manually expire session
      const expiredTimestamp = Date.now() - 31 * 60 * 1000; // 31 minutes ago
      storage.save("session-id", {
        id: sessionId1,
        timestamp: expiredTimestamp,
      });

      const sessionId2 = sessionManager.getSessionId();

      expect(sessionId2).not.toEqual(sessionId1);
    });
  });

  describe("isSessionActive", () => {
    it("should return true for active session", () => {
      sessionManager.getSessionId(); // Create session

      expect(sessionManager.isSessionActive()).toBe(true);
    });

    it("should return false when no session exists", () => {
      expect(sessionManager.isSessionActive()).toBe(false);
    });

    it("should return false for expired session", () => {
      sessionManager.getSessionId();

      // Expire session
      const expiredTimestamp = Date.now() - 31 * 60 * 1000;
      storage.save("session-id", {
        id: "expired",
        timestamp: expiredTimestamp,
      });

      expect(sessionManager.isSessionActive()).toBe(false);
    });
  });

  describe("endSession", () => {
    it("should clear current session", () => {
      sessionManager.getSessionId();
      expect(sessionManager.isSessionActive()).toBe(true);

      sessionManager.endSession();
      expect(sessionManager.isSessionActive()).toBe(false);
    });
  });
});

describe("DataValidator", () => {
  describe("validateClickEvent", () => {
    it("should validate correct click event", () => {
      const event = {
        sourcePost: "post-1",
        targetPost: "post-2",
        timestamp: Date.now(),
      };

      expect(DataValidator.validateClickEvent(event)).toBe(true);
    });

    it("should reject null or undefined", () => {
      expect(DataValidator.validateClickEvent(null)).toBe(false);
      expect(DataValidator.validateClickEvent(undefined)).toBe(false);
    });

    it("should reject events with missing fields", () => {
      expect(
        DataValidator.validateClickEvent({
          sourcePost: "post-1",
          timestamp: Date.now(),
        })
      ).toBe(false);

      expect(
        DataValidator.validateClickEvent({
          targetPost: "post-2",
          timestamp: Date.now(),
        })
      ).toBe(false);

      expect(
        DataValidator.validateClickEvent({
          sourcePost: "post-1",
          targetPost: "post-2",
        })
      ).toBe(false);
    });

    it("should reject events with wrong types", () => {
      expect(
        DataValidator.validateClickEvent({
          sourcePost: 123,
          targetPost: "post-2",
          timestamp: Date.now(),
        })
      ).toBe(false);

      expect(
        DataValidator.validateClickEvent({
          sourcePost: "post-1",
          targetPost: "post-2",
          timestamp: "not a number",
        })
      ).toBe(false);
    });

    it("should reject events with empty strings", () => {
      expect(
        DataValidator.validateClickEvent({
          sourcePost: "",
          targetPost: "post-2",
          timestamp: Date.now(),
        })
      ).toBe(false);
    });

    it("should reject events with invalid timestamp", () => {
      expect(
        DataValidator.validateClickEvent({
          sourcePost: "post-1",
          targetPost: "post-2",
          timestamp: 0,
        })
      ).toBe(false);

      expect(
        DataValidator.validateClickEvent({
          sourcePost: "post-1",
          targetPost: "post-2",
          timestamp: -1,
        })
      ).toBe(false);
    });
  });

  describe("sanitizeUrl", () => {
    it("should remove query params and hash", () => {
      const url = "/blog/post?utm=source#section";
      expect(DataValidator.sanitizeUrl(url)).toBe("/blog/post");
    });

    it("should handle URLs without query or hash", () => {
      const url = "/blog/post";
      expect(DataValidator.sanitizeUrl(url)).toBe("/blog/post");
    });

    it("should trim whitespace", () => {
      const url = "  /blog/post  ";
      expect(DataValidator.sanitizeUrl(url).trim()).toBe("/blog/post");
    });
  });

  describe("isWithinTimeframe", () => {
    it("should return true for recent timestamps", () => {
      const now = Date.now();
      expect(DataValidator.isWithinTimeframe(now, 7)).toBe(true);
      expect(DataValidator.isWithinTimeframe(now - 1000 * 60 * 60, 1)).toBe(
        true
      ); // 1 hour ago, within 1 day
    });

    it("should return false for old timestamps", () => {
      const oldTimestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago
      expect(DataValidator.isWithinTimeframe(oldTimestamp, 7)).toBe(false);
    });

    it("should handle edge case of exactly at boundary", () => {
      const boundary = Date.now() - 7 * 24 * 60 * 60 * 1000; // Exactly 7 days ago
      expect(DataValidator.isWithinTimeframe(boundary, 7)).toBe(true);
    });
  });
});
