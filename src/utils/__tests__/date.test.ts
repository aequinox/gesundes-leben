import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the mocked LOCALE for test usage
import { LOCALE } from "@/config";

import { clearDateFormatterCache, createSafeDate, formatDate } from "../date";

// Type definitions for testing
interface MockCallData {
  locale: string;
  options: Intl.DateTimeFormatOptions;
}

// Use mocked LOCALE from vitest setup
vi.mock("@/config", () => ({
  LOCALE: {
    lang: "de",
    langTag: ["de-DE"],
  },
  SITE: {
    title: "Healthy Life Test",
  },
}));

describe("date utilities", () => {
  const testDate = new Date("2025-01-15");
  const testTimestamp = testDate.getTime();
  const testDateString = "2025-01-15";

  describe("createSafeDate", () => {
    it("should create Date from Date object", () => {
      const result = createSafeDate(testDate);
      expect(result).toEqual(testDate);
    });

    it("should create Date from timestamp", () => {
      const result = createSafeDate(testTimestamp);
      expect(result).toEqual(testDate);
    });

    it("should create Date from string", () => {
      const result = createSafeDate(testDateString);
      expect(result).toEqual(testDate);
    });

    it("should throw error for invalid date string", () => {
      expect(() => createSafeDate("invalid-date")).toThrow(
        "Invalid date input: invalid-date"
      );
    });

    it("should throw error for invalid timestamp", () => {
      expect(() => createSafeDate(NaN)).toThrow("Invalid date input: NaN");
    });
  });

  describe("formatDate", () => {
    let originalDateTimeFormat: typeof Intl.DateTimeFormat;

    beforeEach(() => {
      originalDateTimeFormat = Intl.DateTimeFormat;
      clearDateFormatterCache();
    });

    afterEach(() => {
      Intl.DateTimeFormat = originalDateTimeFormat;
      clearDateFormatterCache();
    });

    it("should format Date object", () => {
      // Mock Intl.DateTimeFormat to return predictable results
      Intl.DateTimeFormat = function (
        _locale?: string | string[],
        _options?: Intl.DateTimeFormatOptions
      ) {
        return {
          format: (date: Date) => {
            const year = date.getFullYear();
            const month = date.toLocaleDateString("en-US", { month: "short" });
            const day = date.getDate();
            return `${month} ${day}, ${year}`;
          },
          resolvedOptions: () => ({
            locale: "en-US",
            calendar: "gregory",
            numberingSystem: "latn",
            timeZone: "UTC",
            hour12: true,
            weekday: undefined,
            era: undefined,
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: undefined,
            minute: undefined,
            second: undefined,
            timeZoneName: undefined,
          }),
          formatToParts: () => [],
          formatRange: () => "",
          formatRangeToParts: () => [],
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      const result = formatDate(testDate);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format timestamp", () => {
      // Simple mock that returns expected format
      Intl.DateTimeFormat = function (
        _locale?: string | string[],
        _options?: Intl.DateTimeFormatOptions
      ) {
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      const result = formatDate(testTimestamp);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format date string", () => {
      // Simple mock that returns expected format
      Intl.DateTimeFormat = function (
        _locale?: string | string[],
        _options?: Intl.DateTimeFormatOptions
      ) {
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      const result = formatDate(testDateString);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should throw error when formatting fails", () => {
      const mockError = new Error("Formatting error");
      Intl.DateTimeFormat = function (
        _locale?: string | string[],
        _options?: Intl.DateTimeFormatOptions
      ) {
        throw mockError;
      } as unknown as typeof Intl.DateTimeFormat;

      expect(() => formatDate(testDate)).toThrow(
        "Failed to format date: Formatting error"
      );
    });

    it("should use first locale from config", () => {
      let calledWith: MockCallData | null = null;

      Intl.DateTimeFormat = function (
        locale?: string | string[],
        options?: Intl.DateTimeFormatOptions
      ) {
        calledWith = {
          locale:
            typeof locale === "string" ? locale : (locale?.[0] ?? "en-US"),
          options: options ?? {},
        };
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      formatDate(testDate);

      expect(calledWith!.locale).toBe("de-DE");
      expect(calledWith!.options).toEqual(
        expect.objectContaining({
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    });

    it("should fallback to en-US if no locales configured", () => {
      let calledWith: MockCallData | null = null;

      // Mock empty langTag array
      const originalLangTag = LOCALE.langTag;
      (LOCALE as { langTag: any }).langTag = [];

      Intl.DateTimeFormat = function (
        locale?: string | string[],
        options?: Intl.DateTimeFormatOptions
      ) {
        calledWith = {
          locale:
            typeof locale === "string" ? locale : (locale?.[0] ?? "en-US"),
          options: options ?? {},
        };
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      formatDate(testDate);

      expect(calledWith!.locale).toBe("en-US");

      // Restore original
      (LOCALE as { langTag: any }).langTag = originalLangTag;
    });

    it("should handle string langTag configuration", () => {
      let calledWith: MockCallData | null = null;

      // Mock string langTag
      const originalLangTag = LOCALE.langTag;
      (LOCALE as { langTag: any }).langTag = "de-DE";

      Intl.DateTimeFormat = function (
        locale?: string | string[],
        options?: Intl.DateTimeFormatOptions
      ) {
        calledWith = {
          locale:
            typeof locale === "string" ? locale : (locale?.[0] ?? "en-US"),
          options: options ?? {},
        };
        return {
          format: () => "15. Jan 2025",
        } as unknown as Intl.DateTimeFormat;
      } as unknown as typeof Intl.DateTimeFormat;

      formatDate(testDate);

      expect(calledWith!.locale).toBe("de-DE");

      // Restore original
      (LOCALE as { langTag: any }).langTag = originalLangTag;
    });
  });

  describe("Cache functionality", () => {
    it("should clear the date formatter cache", () => {
      // Use date utilities to populate cache
      formatDate(new Date("2024-01-15"));

      // Clear the cache
      clearDateFormatterCache();

      // This should work without error, indicating cache was cleared
      expect(() => clearDateFormatterCache()).not.toThrow();
    });

    it("should handle date formatter caching", () => {
      // Format the same date multiple times to test caching
      const date = new Date("2024-01-15");
      const result1 = formatDate(date);
      const result2 = formatDate(date);

      expect(result1).toBe(result2);
      expect(typeof result1).toBe("string");
    });

    it("should handle edge cases in date formatting", () => {
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
});
