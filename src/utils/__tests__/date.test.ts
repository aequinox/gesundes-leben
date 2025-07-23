import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LOCALE } from "@/config";

import { clearDateFormatterCache, createSafeDate, formatDate } from "../date";

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
      Intl.DateTimeFormat = function (_locale: any, _options: any) {
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
      } as any;

      const result = formatDate(testDate);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format timestamp", () => {
      // Simple mock that returns expected format
      Intl.DateTimeFormat = function () {
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as any;

      const result = formatDate(testTimestamp);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format date string", () => {
      // Simple mock that returns expected format
      Intl.DateTimeFormat = function () {
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as any;

      const result = formatDate(testDateString);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should throw error when formatting fails", () => {
      const mockError = new Error("Formatting error");
      Intl.DateTimeFormat = function () {
        throw mockError;
      } as any;

      expect(() => formatDate(testDate)).toThrow(
        "Failed to format date: Formatting error"
      );
    });

    it("should use first locale from config", () => {
      let calledWith: any = null;

      Intl.DateTimeFormat = function (locale: any, options: any) {
        calledWith = { locale, options };
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as any;

      formatDate(testDate);

      expect(calledWith?.locale).toBe("de-DE");
      expect(calledWith?.options).toEqual(
        expect.objectContaining({
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    });

    it("should fallback to en-US if no locales configured", () => {
      let calledWith: any = null;

      // Mock empty langTag array
      const originalLangTag = LOCALE.langTag;
      (LOCALE as any).langTag = [];

      Intl.DateTimeFormat = function (locale: any, options: any) {
        calledWith = { locale, options };
        return {
          format: () => "Jan 15, 2025",
        } as unknown as Intl.DateTimeFormat;
      } as any;

      formatDate(testDate);

      expect(calledWith?.locale).toBe("en-US");

      // Restore original
      (LOCALE as any).langTag = originalLangTag;
    });
  });
});
