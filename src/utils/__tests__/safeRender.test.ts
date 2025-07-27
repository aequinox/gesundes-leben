/**
 * @file safeRender.test.ts
 * @description Tests for safe rendering and error handling utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  safelyRender,
  safelyExecute,
  withErrorBoundary,
  safelyRenderAll,
  safeFetch,
  safeJsonParse,
  createSafeDebounced,
  createSafeMemoized,
  isSafeResult,
  ErrorRecoveryStrategies,
  type SafeRenderConfig,
} from "../safeRender";

// Mock logger
vi.mock("../logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock import.meta.env
Object.defineProperty(import.meta, "env", {
  value: { DEV: true },
  writable: true,
});

describe("safelyRender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute operation successfully", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await safelyRender(operation);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should handle errors and return fallback in production", async () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const operation = vi.fn().mockRejectedValue(new Error("Test error"));
    const config: SafeRenderConfig = { fallback: "fallback-value" };

    const result = await safelyRender(operation, "Test failed", config);

    expect(result).toBe("fallback-value");
  });

  it("should throw error in development mode", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("Test error"));

    await expect(safelyRender(operation, "Test failed")).rejects.toThrow();
  });

  it("should retry operations when configured", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("First failure"))
      .mockRejectedValueOnce(new Error("Second failure"))
      .mockResolvedValue("success");

    const config: SafeRenderConfig = { maxRetries: 2, retryDelay: 10 };

    const result = await safelyRender(operation, "Test operation", config);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it("should respect retry delay", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("First failure"))
      .mockResolvedValue("success");

    const config: SafeRenderConfig = { maxRetries: 1, retryDelay: 100 };

    const startTime = Date.now();
    await safelyRender(operation, "Test operation", config);
    const endTime = Date.now();

    expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
  });
});

describe("safelyExecute", () => {
  it("should execute synchronous operation successfully", () => {
    const operation = vi.fn().mockReturnValue("sync-success");

    const result = safelyExecute(operation);

    expect(result).toBe("sync-success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should handle synchronous errors", () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const operation = vi.fn().mockImplementation(() => {
      throw new Error("Sync error");
    });

    const result = safelyExecute(operation, "Sync operation failed");

    expect(result).toBeNull();
  });

  it("should use custom fallback value", () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const operation = vi.fn().mockImplementation(() => {
      throw new Error("Sync error");
    });

    const config: SafeRenderConfig = { fallback: "custom-fallback" };
    const result = safelyExecute(operation, "Sync operation failed", config);

    expect(result).toBe("custom-fallback");
  });
});

describe("withErrorBoundary", () => {
  it("should create wrapped function with error handling", async () => {
    const originalFn = vi.fn().mockResolvedValue("wrapped-success");
    const config: SafeRenderConfig = { componentName: "TestComponent" };

    const wrapperFactory = withErrorBoundary(config);
    const wrappedFn = wrapperFactory(originalFn, "Wrapped function failed");

    const result = await wrappedFn("arg1", "arg2");

    expect(result).toBe("wrapped-success");
    expect(originalFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should handle errors in wrapped function", async () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const originalFn = vi.fn().mockRejectedValue(new Error("Wrapped error"));
    const config: SafeRenderConfig = { fallback: "wrapped-fallback" };

    const wrapperFactory = withErrorBoundary(config);
    const wrappedFn = wrapperFactory(originalFn, "Wrapped function failed");

    const result = await wrappedFn();

    expect(result).toBe("wrapped-fallback");
  });
});

describe("safelyRenderAll", () => {
  it("should execute all operations and return results", async () => {
    const operations = [
      { operation: vi.fn().mockResolvedValue("result1") },
      { operation: vi.fn().mockResolvedValue("result2") },
      { operation: vi.fn().mockResolvedValue("result3") },
    ];

    const results = await safelyRenderAll(operations);

    expect(results).toEqual(["result1", "result2", "result3"]);
  });

  it("should handle mixed success and failure results", async () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const operations = [
      { operation: vi.fn().mockResolvedValue("success") },
      { operation: vi.fn().mockRejectedValue(new Error("failure")) },
      { operation: vi.fn().mockResolvedValue("another-success") },
    ];

    const results = await safelyRenderAll(operations);

    expect(results).toEqual(["success", null, "another-success"]);
  });
});

describe("safeFetch", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("should fetch successfully", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await safeFetch("https://api.example.com/data");

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      {}
    );
  });

  it("should handle HTTP error responses", async () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await safeFetch("https://api.example.com/notfound");

    expect(result).toBeNull();
  });

  it("should retry failed requests", async () => {
    const mockErrorResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    };
    const mockSuccessResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValue(mockSuccessResponse);

    const result = await safeFetch("https://api.example.com/retry");

    expect(result).toBe(mockSuccessResponse);
    expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});

describe("safeJsonParse", () => {
  it("should parse valid JSON", () => {
    const jsonString = '{"key": "value", "number": 42}';

    const result = safeJsonParse(jsonString);

    expect(result).toEqual({ key: "value", number: 42 });
  });

  it("should handle invalid JSON", () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const invalidJson = '{"invalid": json}';

    const result = safeJsonParse(invalidJson);

    expect(result).toBeNull();
  });

  it("should use custom fallback for invalid JSON", () => {
    // Set to production mode
    Object.defineProperty(import.meta, "env", {
      value: { DEV: false },
      writable: true,
    });

    const invalidJson = '{"invalid": json}';
    const config: SafeRenderConfig = { fallback: { error: "parsing failed" } };

    const result = safeJsonParse(invalidJson, config);

    expect(result).toEqual({ error: "parsing failed" });
  });
});

describe("createSafeDebounced", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce function calls", async () => {
    const fn = vi.fn().mockResolvedValue("debounced-result");
    const debouncedFn = createSafeDebounced(fn, 100);

    // Call multiple times rapidly
    const promise1 = debouncedFn("arg1");
    const promise2 = debouncedFn("arg2");
    const promise3 = debouncedFn("arg3");

    // Fast-forward time
    vi.advanceTimersByTime(100);

    const results = await Promise.all([promise1, promise2, promise3]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("arg3"); // Last call wins
    expect(results).toEqual([null, null, "debounced-result"]);
  });
});

describe("createSafeMemoized", () => {
  it("should cache function results", async () => {
    const fn = vi.fn().mockResolvedValue("memoized-result");
    const memoizedFn = createSafeMemoized(fn);

    const result1 = await memoizedFn("arg1");
    const result2 = await memoizedFn("arg1"); // Same args

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result1).toBe("memoized-result");
    expect(result2).toBe("memoized-result");
  });

  it("should handle different arguments separately", async () => {
    const fn = vi
      .fn()
      .mockImplementation(arg => Promise.resolve(`result-${arg}`));
    const memoizedFn = createSafeMemoized(fn);

    const result1 = await memoizedFn("arg1");
    const result2 = await memoizedFn("arg2");

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result1).toBe("result-arg1");
    expect(result2).toBe("result-arg2");
  });

  it("should expire cached results after timeout", async () => {
    vi.useFakeTimers();

    const fn = vi.fn().mockResolvedValue("time-sensitive-result");
    const memoizedFn = createSafeMemoized(fn, undefined, {
      cacheTimeout: 1000,
    });

    await memoizedFn("arg1");

    // Advance time past cache timeout
    vi.advanceTimersByTime(1001);

    await memoizedFn("arg1");

    expect(fn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe("isSafeResult", () => {
  it("should return true for valid values", () => {
    expect(isSafeResult("string")).toBe(true);
    expect(isSafeResult(42)).toBe(true);
    expect(isSafeResult({})).toBe(true);
    expect(isSafeResult([])).toBe(true);
    expect(isSafeResult(false)).toBe(true);
    expect(isSafeResult(0)).toBe(true);
  });

  it("should return false for null/undefined", () => {
    expect(isSafeResult(null)).toBe(false);
    expect(isSafeResult(undefined)).toBe(false);
  });
});

describe("ErrorRecoveryStrategies", () => {
  describe("exponentialBackoff", () => {
    it("should calculate exponential backoff delays", () => {
      expect(ErrorRecoveryStrategies.exponentialBackoff(0)).toBe(1000);
      expect(ErrorRecoveryStrategies.exponentialBackoff(1)).toBe(2000);
      expect(ErrorRecoveryStrategies.exponentialBackoff(2)).toBe(4000);
      expect(ErrorRecoveryStrategies.exponentialBackoff(3)).toBe(8000);
    });

    it("should cap at maximum delay", () => {
      const delay = ErrorRecoveryStrategies.exponentialBackoff(10);
      expect(delay).toBe(30000); // Capped at 30 seconds
    });

    it("should use custom base delay", () => {
      expect(ErrorRecoveryStrategies.exponentialBackoff(1, 500)).toBe(1000);
      expect(ErrorRecoveryStrategies.exponentialBackoff(2, 500)).toBe(2000);
    });
  });

  describe("linearBackoff", () => {
    it("should calculate linear backoff delays", () => {
      expect(ErrorRecoveryStrategies.linearBackoff(0)).toBe(1000);
      expect(ErrorRecoveryStrategies.linearBackoff(1)).toBe(2000);
      expect(ErrorRecoveryStrategies.linearBackoff(2)).toBe(3000);
    });

    it("should use custom base delay", () => {
      expect(ErrorRecoveryStrategies.linearBackoff(1, 500)).toBe(1000);
      expect(ErrorRecoveryStrategies.linearBackoff(2, 500)).toBe(1500);
    });
  });

  describe("withJitter", () => {
    it("should add jitter to base delay", () => {
      const baseDelay = 1000;
      const jitterRange = 0.1;

      // Test multiple times since it's random
      for (let i = 0; i < 10; i++) {
        const delay = ErrorRecoveryStrategies.withJitter(
          baseDelay,
          jitterRange
        );
        expect(delay).toBeGreaterThanOrEqual(900); // 10% below base
        expect(delay).toBeLessThanOrEqual(1100); // 10% above base
      }
    });

    it("should not return negative delays", () => {
      const delay = ErrorRecoveryStrategies.withJitter(100, 1.5); // Large jitter
      expect(delay).toBeGreaterThanOrEqual(0);
    });
  });
});
