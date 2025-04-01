/**
 * @jest-environment node
 */

import { describe, expect, test, vi } from "vitest";
import { slugService } from "@/services/format/SlugService";
import type { SlugifyOptions } from "@/services/format/SlugService";

// Mock the slugifier dependency
vi.mock("slugify", () => ({
  default: (str: string, options: SlugifyOptions) => {
    // Simple mock implementation
    let result = str.toLowerCase();
    if (options.locale === "de") {
      // Handle German umlauts
      result = result
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss");
    }
    return result.replace(/[^a-z0-9]+/g, options.replacement);
  },
}));

describe("SlugService", () => {
  describe("slugifyStr", () => {
    test("converts string to slug", () => {
      expect(slugService.slugifyStr("Hello World")).toBe("hello-world");
    });

    test("handles German characters", () => {
      expect(slugService.slugifyStr("Über Äpfel")).toBe("ueber-aepfel");
    });

    test("handles custom options", () => {
      expect(slugService.slugifyStr("Hello World", { replacement: "_" })).toBe(
        "hello_world"
      );
    });

    test("throws error for empty string", () => {
      expect(() => slugService.slugifyStr("")).toThrow(
        "Invalid input: string required"
      );
    });

    test("throws error for non-string input", () => {
      expect(() => slugService.slugifyStr(123 as unknown as string)).toThrow(
        "Invalid input: string required"
      );
    });

    test("trims whitespace", () => {
      expect(slugService.slugifyStr("  Hello World  ")).toBe("hello-world");
    });
  });

  describe("slugifyAll", () => {
    test("converts array of strings to slugs", () => {
      expect(slugService.slugifyAll(["Hello World", "Test String"])).toEqual([
        "hello-world",
        "test-string",
      ]);
    });

    test("throws error for non-array input", () => {
      expect(() =>
        slugService.slugifyAll("not an array" as unknown as string[])
      ).toThrow("Invalid input: array required");
    });

    test("handles empty array", () => {
      expect(slugService.slugifyAll([])).toEqual([]);
    });

    test("applies options to all items", () => {
      expect(
        slugService.slugifyAll(["Hello World", "Test String"], {
          replacement: "_",
        })
      ).toEqual(["hello_world", "test_string"]);
    });
  });

  describe("slugify", () => {
    test("handles single string", () => {
      expect(slugService.slugify("Hello World")).toBe("hello-world");
    });

    test("handles array of strings", () => {
      expect(slugService.slugify(["Hello World", "Test String"])).toEqual([
        "hello-world",
        "test-string",
      ]);
    });

    test("applies options correctly", () => {
      expect(slugService.slugify("Hello World", { replacement: "_" })).toBe(
        "hello_world"
      );
    });
  });

  describe("isValidSlug", () => {
    test("validates correct slugs", () => {
      expect(slugService.isValidSlug("hello-world")).toBe(true);
      expect(slugService.isValidSlug("hello")).toBe(true);
      expect(slugService.isValidSlug("hello-123")).toBe(true);
    });

    test("invalidates incorrect slugs", () => {
      expect(slugService.isValidSlug("Hello World")).toBe(false);
      expect(slugService.isValidSlug("hello_world")).toBe(false);
      expect(slugService.isValidSlug("hello--world")).toBe(false);
      expect(slugService.isValidSlug("-hello-world")).toBe(false);
      expect(slugService.isValidSlug("hello-world-")).toBe(false);
    });

    test("handles empty input", () => {
      expect(slugService.isValidSlug("")).toBe(false);
      expect(slugService.isValidSlug(undefined as unknown as string)).toBe(
        false
      );
    });
  });

  describe("ensureSlug", () => {
    test("returns valid slug unchanged", () => {
      expect(slugService.ensureSlug("hello-world")).toBe("hello-world");
    });

    test("converts invalid slug to valid slug", () => {
      expect(slugService.ensureSlug("Hello World!")).toBe("hello-world");
    });

    test("applies options when converting", () => {
      expect(slugService.ensureSlug("Hello World!", { replacement: "_" })).toBe(
        "hello_world"
      );
    });
  });

  describe("combineSlug", () => {
    test("combines multiple strings into single slug", () => {
      expect(slugService.combineSlug(["Hello", "World", "Test"])).toBe(
        "hello-world-test"
      );
    });

    test("filters out empty strings", () => {
      expect(slugService.combineSlug(["Hello", "", "World"])).toBe(
        "hello-world"
      );
    });

    test("throws error for empty array", () => {
      expect(() => slugService.combineSlug([])).toThrow(
        "Invalid input: non-empty array required"
      );
    });

    test("throws error for non-array input", () => {
      expect(() =>
        slugService.combineSlug("not an array" as unknown as string[])
      ).toThrow("Invalid input: non-empty array required");
    });

    test("applies options to all parts", () => {
      expect(
        slugService.combineSlug(["Hello", "World"], { replacement: "_" })
      ).toBe("hello_world");
    });
  });
});
