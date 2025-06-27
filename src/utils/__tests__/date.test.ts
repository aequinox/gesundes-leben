import { createSafeDate, formatDate } from "../date";
import { LOCALE } from "@/config";
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";

// Mock the config module
vi.mock("@/config", () => ({
  LOCALE: {
    lang: "en",
    langTag: ["en-US", "en-GB"],
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
        "Invalid date input"
      );
    });

    it("should throw error for invalid timestamp", () => {
      expect(() => createSafeDate(NaN)).toThrow("Invalid date input");
    });
  });

  describe("formatDate", () => {
    beforeEach(() => {
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(locale => {
        const mockFormat = (date: Date) => {
          const year = date.getFullYear();
          const month = date.toLocaleString(locale, { month: "short" });
          const day = date.getDate();
          return `${month} ${day}, ${year}`;
        };

        return {
          format: mockFormat,
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
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should format Date object", () => {
      const result = formatDate(testDate);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format timestamp", () => {
      const result = formatDate(testTimestamp);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format date string", () => {
      const result = formatDate(testDateString);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should throw error when formatting fails", () => {
      const originalImpl = Intl.DateTimeFormat;
      const mockError = new Error("Formatting error");
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
        throw mockError;
      });

      try {
        expect(() => formatDate(testDate)).toThrowError(mockError);
      } finally {
        Intl.DateTimeFormat = originalImpl;
      }
    });

    it("should use first locale from config", () => {
      const mockFn = vi.fn().mockImplementation(() => ({
        format: () => "Jan 15, 2025",
        resolvedOptions: () => ({}),
        formatToParts: () => [],
        formatRange: () => "",
        formatRangeToParts: () => [],
      }));

      const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(mockFn);
      formatDate(testDate);

      expect(spy).toHaveBeenCalledWith(
        "en-US",
        expect.objectContaining({
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    });

    it("should fallback to en-US if no locales configured", () => {
      const mockFn = vi.fn().mockImplementation(() => ({
        format: () => "Jan 15, 2025",
        resolvedOptions: () => ({}),
        formatToParts: () => [],
        formatRange: () => "",
        formatRangeToParts: () => [],
      }));

      const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(mockFn);
      vi.mocked(LOCALE).langTag = [];
      formatDate(testDate);

      expect(spy).toHaveBeenCalledWith(
        "en-US",
        expect.objectContaining({
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    });
  });
});
