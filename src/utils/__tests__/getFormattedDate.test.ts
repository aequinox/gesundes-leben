import { describe, expect, test, vi, beforeEach } from "vitest";
import {
  formattedDateTime,
  formatDate,
  formatTime,
  dateFormatterCache,
} from "../getFormattedDate";
import type { DateTimeInput } from "@/types/datetime";

// Mock the LOCALE import
vi.mock("@/config", () => ({
  LOCALE: {
    langTag: "en-US",
  },
}));

describe("Date formatting utilities", () => {
  describe("formattedDateTime", () => {
    test("formats publication date correctly", () => {
      const input: DateTimeInput = {
        pubDatetime: "2024-01-01T12:00:00Z",
      };

      const result = formattedDateTime(input);

      expect(result.dt).toBeInstanceOf(Date);
      expect(result.date).toMatch(/Jan 1, 2024/);
      expect(result.time).toMatch(/\d{2}:\d{2}/);
    });

    test("uses modification date when newer", () => {
      const input: DateTimeInput = {
        pubDatetime: "2024-01-01T12:00:00Z",
        modDatetime: "2024-02-01T12:00:00Z",
      };

      const result = formattedDateTime(input);

      expect(result.date).toMatch(/Feb 1, 2024/);
    });

    test("uses publication date when modification date is older", () => {
      const input: DateTimeInput = {
        pubDatetime: "2024-02-01T12:00:00Z",
        modDatetime: "2024-01-01T12:00:00Z",
      };

      const result = formattedDateTime(input);

      expect(result.date).toMatch(/Feb 1, 2024/);
    });

    test("handles Date object input", () => {
      const input: DateTimeInput = {
        pubDatetime: new Date("2024-01-01T12:00:00Z"),
      };

      const result = formattedDateTime(input);

      expect(result.date).toMatch(/Jan 1, 2024/);
    });

    test("handles timestamp input", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      const input: DateTimeInput = {
        pubDatetime: date,
      };

      const result = formattedDateTime(input);

      expect(result.date).toMatch(/Jan 1, 2024/);
    });

    test("throws error for missing publication date", () => {
      const input = {} as DateTimeInput;

      expect(() => formattedDateTime(input)).toThrow(
        "Publication date is required"
      );
    });

    test("throws error for invalid date", () => {
      const input: DateTimeInput = {
        pubDatetime: "invalid-date",
      };

      expect(() => formattedDateTime(input)).toThrow("Invalid date input");
    });
  });

  describe("formatDate", () => {
    test("formats date string correctly", () => {
      const result = formatDate("2024-01-01");
      expect(result).toMatch(/Jan 1, 2024/);
    });

    test("formats Date object correctly", () => {
      const result = formatDate(new Date("2024-01-01"));
      expect(result).toMatch(/Jan 1, 2024/);
    });

    test("throws error for invalid date", () => {
      expect(() => formatDate("invalid-date")).toThrow("Invalid date input");
    });
  });

  describe("formatTime", () => {
    test("formats time string correctly", () => {
      const result = formatTime("2024-01-01T15:30:00");
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    test("formats Date object correctly", () => {
      const result = formatTime(new Date("2024-01-01T15:30:00"));
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    test("throws error for invalid time", () => {
      expect(() => formatTime("invalid-time")).toThrow("Invalid date input");
    });
  });

  // Test formatter caching
  describe("formatter caching", () => {
    beforeEach(() => {
      // Clear the formatter cache before each test
      dateFormatterCache.clear();
      vi.clearAllMocks();
    });

    test("reuses cached formatters", () => {
      const spy = vi.spyOn(Intl, "DateTimeFormat");

      // First call should create new formatter
      formatDate("2024-01-01");
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call should reuse cached formatter
      formatDate("2024-02-01");
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });
  });
});
