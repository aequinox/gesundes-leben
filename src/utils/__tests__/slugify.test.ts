import { describe, expect, test, vi } from "vitest";
import {
  slugifyStr,
  slugifyAll,
  slugify,
  isValidSlug,
  ensureSlug,
  combineSlug,
  type SlugifyOptions,
} from "../slugify";

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

describe("slugify utilities", () => {
  describe("slugifyStr", () => {
    test("converts string to slug", () => {
      expect(slugifyStr("Hello World")).toBe("hello-world");
    });

    test("handles German characters", () => {
      expect(slugifyStr("Über Äpfel")).toBe("ueber-aepfel");
    });

    test("handles custom options", () => {
      expect(slugifyStr("Hello World", { replacement: "_" })).toBe(
        "hello_world"
      );
    });

    test("throws error for empty string", () => {
      expect(() => slugifyStr("")).toThrow("Invalid input: string required");
    });

    test("throws error for non-string input", () => {
      expect(() => slugifyStr(123 as unknown as string)).toThrow(
        "Invalid input: string required"
      );
    });

    test("trims whitespace", () => {
      expect(slugifyStr("  Hello World  ")).toBe("hello-world");
    });
  });

  describe("slugifyAll", () => {
    test("converts array of strings to slugs", () => {
      expect(slugifyAll(["Hello World", "Test String"])).toEqual([
        "hello-world",
        "test-string",
      ]);
    });

    test("throws error for non-array input", () => {
      expect(() => slugifyAll("not an array" as unknown as string[])).toThrow(
        "Invalid input: array required"
      );
    });

    test("handles empty array", () => {
      expect(slugifyAll([])).toEqual([]);
    });

    test("applies options to all items", () => {
      expect(
        slugifyAll(["Hello World", "Test String"], { replacement: "_" })
      ).toEqual(["hello_world", "test_string"]);
    });
  });

  describe("slugify", () => {
    test("handles single string", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    test("handles array of strings", () => {
      expect(slugify(["Hello World", "Test String"])).toEqual([
        "hello-world",
        "test-string",
      ]);
    });

    test("applies options correctly", () => {
      expect(slugify("Hello World", { replacement: "_" })).toBe("hello_world");
    });
  });

  describe("isValidSlug", () => {
    test("validates correct slugs", () => {
      expect(isValidSlug("hello-world")).toBe(true);
      expect(isValidSlug("hello")).toBe(true);
      expect(isValidSlug("hello-123")).toBe(true);
    });

    test("invalidates incorrect slugs", () => {
      expect(isValidSlug("Hello World")).toBe(false);
      expect(isValidSlug("hello_world")).toBe(false);
      expect(isValidSlug("hello--world")).toBe(false);
      expect(isValidSlug("-hello-world")).toBe(false);
      expect(isValidSlug("hello-world-")).toBe(false);
    });

    test("handles empty input", () => {
      expect(isValidSlug("")).toBe(false);
      expect(isValidSlug(undefined as unknown as string)).toBe(false);
    });
  });

  describe("ensureSlug", () => {
    test("returns valid slug unchanged", () => {
      expect(ensureSlug("hello-world")).toBe("hello-world");
    });

    test("converts invalid slug to valid slug", () => {
      expect(ensureSlug("Hello World!")).toBe("hello-world");
    });

    test("applies options when converting", () => {
      expect(ensureSlug("Hello World!", { replacement: "_" })).toBe(
        "hello_world"
      );
    });
  });

  describe("combineSlug", () => {
    test("combines multiple strings into single slug", () => {
      expect(combineSlug(["Hello", "World", "Test"])).toBe("hello-world-test");
    });

    test("filters out empty strings", () => {
      expect(combineSlug(["Hello", "", "World"])).toBe("hello-world");
    });

    test("throws error for empty array", () => {
      expect(() => combineSlug([])).toThrow(
        "Invalid input: non-empty array required"
      );
    });

    test("throws error for non-array input", () => {
      expect(() => combineSlug("not an array" as unknown as string[])).toThrow(
        "Invalid input: non-empty array required"
      );
    });

    test("applies options to all parts", () => {
      expect(combineSlug(["Hello", "World"], { replacement: "_" })).toBe(
        "hello_world"
      );
    });
  });
});
