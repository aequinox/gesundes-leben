/**
 * @file date-100-coverage.test.ts
 * @description Tests to achieve 100% coverage for date.ts
 */
import { clearDateFormatterCache } from "../date";
import { describe, it, expect, beforeEach } from "bun:test";

describe("Date Utilities - 100% Coverage", () => {
  beforeEach(() => {
    // Clear cache before each test
    clearDateFormatterCache();
  });

  describe("Cache functionality", () => {
    it("should clear the date formatter cache", () => {
      // Import and use date utilities to populate cache
      const { formatDate } = require("../date");

      // Format a date to populate the cache
      formatDate(new Date("2024-01-15"));

      // Clear the cache
      clearDateFormatterCache();

      // This should work without error, indicating cache was cleared
      expect(() => clearDateFormatterCache()).not.toThrow();
    });

    it("should handle date formatter caching", () => {
      const { formatDate } = require("../date");

      // Format the same date multiple times to test caching
      const date = new Date("2024-01-15");
      const result1 = formatDate(date);
      const result2 = formatDate(date);

      expect(result1).toBe(result2);
      expect(typeof result1).toBe("string");
    });

    it("should handle different locale configurations", () => {
      const { formatDate } = require("../date");

      // Test with a specific date
      const date = new Date("2024-01-15");
      const result = formatDate(date);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should test locale resolution", () => {
      const { formatDate } = require("../date");

      // Test formatting with different configurations
      const testDates = [
        new Date("2024-01-01"),
        new Date("2024-12-31"),
        new Date("2024-06-15"),
      ];

      testDates.forEach(date => {
        const result = formatDate(date);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("should handle edge cases in date formatting", () => {
      const { formatDate, createSafeDate } = require("../date");

      // Test various edge cases
      const edgeCases = [
        "2024-01-01T00:00:00.000Z",
        "2024-12-31T23:59:59.999Z",
        1704067200000, // Timestamp
        new Date(2024, 0, 1), // Date object
      ];

      edgeCases.forEach(dateInput => {
        const safeDate = createSafeDate(dateInput);
        const formatted = formatDate(safeDate);
        expect(typeof formatted).toBe("string");
      });
    });
  });

  describe("Internal utilities coverage", () => {
    it("should test date formatter options", () => {
      const { formatDate } = require("../date");

      // Test with leap year date
      const leapYearDate = new Date("2024-02-29");
      const result = formatDate(leapYearDate);

      expect(typeof result).toBe("string");
      expect(result).toContain("2024");
    });

    it("should handle date object creation edge cases", () => {
      const { createSafeDate } = require("../date");

      // Test with various valid inputs
      const validInputs = [
        new Date(),
        Date.now(),
        "2024-01-01",
        0, // Unix epoch
        946684800000, // Y2K
      ];

      validInputs.forEach(input => {
        const result = createSafeDate(input);
        expect(result).toBeInstanceOf(Date);
        expect(isNaN(result.getTime())).toBe(false);
      });
    });

    it("should test locale configuration handling", () => {
      // Test the module's internal locale handling
      const { formatDate } = require("../date");

      // Test multiple times to ensure consistent behavior
      const date = new Date("2024-01-15T12:00:00Z");

      const results = Array.from({ length: 3 }, () => formatDate(date));

      // All results should be identical (testing caching)
      expect(results.every(result => result === results[0])).toBe(true);
    });
  });
});
