/**
 * @file slugs.test.ts
 * @description Comprehensive tests for slug utility functions
 */
import { slugify, getPostSlug } from "../slugs";
import type { Post } from "../types";
import { describe, it, expect, vi } from "vitest";

describe("Slug Utilities", () => {
  describe("slugify", () => {
    describe("string input", () => {
      it("should convert strings to lowercase slugs", () => {
        expect(slugify("Hello World")).toBe("hello-world");
        expect(slugify("Test String")).toBe("test-string");
      });

      it("should handle German characters", () => {
        expect(slugify("Über uns")).toBe("ueber-uns");
        expect(slugify("Schöne Welt")).toBe("schoene-welt");
        expect(slugify("Größe")).toBe("groesse");
      });

      it("should remove special characters", () => {
        expect(slugify("Hello & World!")).toBe("hello-und-world");
        expect(slugify("Test@#$%^&*()String")).toBe(
          "testdollarprozentundstring"
        );
        expect(slugify("Multiple---Dashes")).toBe("multiple-dashes");
      });

      it("should trim whitespace", () => {
        expect(slugify("  Hello World  ")).toBe("hello-world");
        expect(slugify("\t\nTest\t\n")).toBe("test");
      });

      it("should handle empty strings", () => {
        expect(slugify("")).toBe("");
        expect(slugify("   ")).toBe("");
      });

      it("should handle numbers", () => {
        expect(slugify("Test 123")).toBe("test-123");
        expect(slugify("2024 New Year")).toBe("2024-new-year");
      });
    });

    describe("array input", () => {
      it("should slugify arrays of strings", () => {
        const input = ["Hello World", "Test String", "Another Test"];
        const expected = ["hello-world", "test-string", "another-test"];
        expect(slugify(input)).toEqual(expected);
      });

      it("should handle empty arrays", () => {
        expect(slugify([])).toEqual([]);
      });

      it("should handle arrays with special characters", () => {
        const input = ["Hello & World!", "Test@String", "Über uns"];
        const expected = ["hello-und-world", "teststring", "ueber-uns"];
        expect(slugify(input)).toEqual(expected);
      });

      it("should handle mixed content arrays", () => {
        const input = ["Normal Text", "  Spaced  ", "Special!@#", ""];
        const expected = ["normal-text", "spaced", "special", ""];
        expect(slugify(input)).toEqual(expected);
      });
    });

    describe("custom options", () => {
      it("should respect custom replacement character", () => {
        expect(slugify("Hello World", { replacement: "_" })).toBe(
          "hello_world"
        );
        expect(slugify("Test String", { replacement: "." })).toBe(
          "test.string"
        );
      });

      it("should respect custom locale", () => {
        expect(slugify("Café", { locale: "en" })).toBe("cafe");
        expect(slugify("Naïve", { locale: "en" })).toBe("naive");
      });

      it("should handle strict mode", () => {
        expect(slugify("Hello World!", { strict: true })).toBe("hello-world");
        expect(slugify("Test@String", { strict: true })).toBe("teststring");
      });

      it("should handle case preservation when lower is false", () => {
        expect(slugify("Hello World", { lower: false })).toBe("Hello-World");
        expect(slugify("CamelCase", { lower: false })).toBe("CamelCase");
      });
    });

    describe("error handling", () => {
      it("should throw error for non-string input", () => {
        expect(() => slugify(123 as any)).toThrow(
          "Invalid input: string required"
        );
        expect(() => slugify(null as any)).toThrow(
          "Invalid input: string required"
        );
        expect(() => slugify(undefined as any)).toThrow(
          "Invalid input: string required"
        );
      });

      it("should throw error for non-array input when expecting array", () => {
        expect(() => slugify("string" as any)).not.toThrow(); // String is valid
        expect(() => slugify(123 as any)).toThrow(); // Number is not valid
      });
    });
  });

  // Mock post creation helper
  const createMockPost = (title: string): Post => ({
    id: "test-post",
    body: "Test content",
    collection: "blog",
    data: {
      title,
      author: "test-author",
      pubDatetime: new Date("2024-01-01"),
      modDatetime: undefined,
      featured: false,
      draft: false,
      tags: [],
      categories: [],
      description: "Test description",
      heroImage: {
        src: "/test.jpg",
        alt: "Test",
        format: "jpg" as const,
        width: 800,
        height: 600,
      } as any,
      keywords: ["test"],
      group: "pro",
      references: [],
    },
    rendered: undefined,
  });

  describe("getPostSlug", () => {
    it("should generate slug from post title", () => {
      const post = createMockPost("Hello World Post");
      expect(getPostSlug(post)).toBe("hello-world-post");
    });

    it("should remove date prefix from title", () => {
      const post = createMockPost("2024-01-01-Hello World Post");
      expect(getPostSlug(post)).toBe("hello-world-post");

      const post2 = createMockPost("2023-12-25-Christmas Special");
      expect(getPostSlug(post2)).toBe("christmas-special");
    });

    it("should handle titles with various date formats", () => {
      const post1 = createMockPost("2024-01-01 Hello World");
      expect(getPostSlug(post1)).toBe("hello-world");

      const post2 = createMockPost("2024-01-01  Spaced Title");
      expect(getPostSlug(post2)).toBe("spaced-title");

      const post3 = createMockPost("2024-01-01-No Space Title");
      expect(getPostSlug(post3)).toBe("no-space-title");
    });

    it("should handle titles without date prefix", () => {
      const post = createMockPost("Regular Title Without Date");
      expect(getPostSlug(post)).toBe("regular-title-without-date");
    });

    it("should handle German characters in titles", () => {
      const post = createMockPost(
        "2024-01-01-Über die schöne deutsche Sprache"
      );
      expect(getPostSlug(post)).toBe("ueber-die-schoene-deutsche-sprache");
    });

    it("should handle special characters in titles", () => {
      const post = createMockPost("2024-01-01-Hello & World: A Test!");
      expect(getPostSlug(post)).toBe("hello-und-world-a-test");
    });

    describe("error handling", () => {
      it("should throw error for invalid post object", () => {
        expect(() => getPostSlug(null as any)).toThrow(
          "Invalid post object or missing title"
        );
        expect(() => getPostSlug(undefined as any)).toThrow(
          "Invalid post object or missing title"
        );
        expect(() => getPostSlug({} as any)).toThrow(
          "Invalid post object or missing title"
        );
      });

      it("should throw error for post without data", () => {
        const invalidPost = { id: "test" } as any;
        expect(() => getPostSlug(invalidPost)).toThrow(
          "Invalid post object or missing title"
        );
      });

      it("should throw error for post without title", () => {
        const postWithoutTitle = createMockPost("Test");
        postWithoutTitle.data.title = undefined as any;
        expect(() => getPostSlug(postWithoutTitle)).toThrow(
          "Invalid post object or missing title"
        );
      });

      it("should throw error for post with empty title", () => {
        const postWithEmptyTitle = createMockPost("");
        expect(() => getPostSlug(postWithEmptyTitle)).toThrow(
          "Invalid post object or missing title"
        );
      });
    });
  });

  describe("Edge Cases", () => {
    describe("getPostSlug edge cases", () => {
      it("should handle posts with only date in title", () => {
        const post = createMockPost("2024-01-01");
        expect(getPostSlug(post)).toBe("2024-01-01");
      });

      it("should handle posts with date-like strings that are not dates", () => {
        const post = createMockPost("1234-56-78-Not A Real Date");
        expect(getPostSlug(post)).toBe("not-a-real-date");
      });

      it("should handle posts with multiple date-like patterns", () => {
        const post = createMockPost("2024-01-01-2023-12-25-Title");
        expect(getPostSlug(post)).toBe("2023-12-25-title");
      });

      it("should handle very long titles", () => {
        const longTitle = "2024-01-01-" + "Very Long Title Word ".repeat(5);
        const post = createMockPost(longTitle);
        const result = getPostSlug(post);
        expect(result).toContain("very-long-title-word");
        expect(result.split("-")).toContain("very");
      });
    });

    describe("Type safety", () => {
      it("should maintain type safety for string input", () => {
        const result: string = slugify("test");
        expect(typeof result).toBe("string");
      });

      it("should maintain type safety for array input", () => {
        const result: readonly string[] = slugify(["test1", "test2"]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.every(item => typeof item === "string")).toBe(true);
      });
    });
  });

  describe("Performance", () => {
    it("should handle large arrays efficiently", () => {
      const largeArray = Array.from(
        { length: 100 },
        (_, i) => `Test String ${i}`
      );
      const start = performance.now();
      const result = slugify(largeArray);
      const end = performance.now();

      expect(result).toHaveLength(100);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle very long strings efficiently", () => {
      const longString = "Test String With Many Words ".repeat(10);
      const start = performance.now();
      const result = slugify(longString);
      const end = performance.now();

      expect(typeof result).toBe("string");
      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});
