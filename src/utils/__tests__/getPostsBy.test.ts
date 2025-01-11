import { describe, expect, test, vi } from "vitest";
import {
  getPostsByCategory,
  getPostsByGroup,
  getAllPostsByGroup,
  getPostsByTag,
} from "../getPostsBy";
import type { CollectionEntry } from "astro:content";

// Mock dependencies
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

vi.mock("../getSortedPosts", () => ({
  default: vi.fn(posts => Promise.resolve(posts)),
}));

vi.mock("../slugify", () => ({
  slugifyStr: (str: string) => str.toLowerCase(),
  slugifyAll: (arr: string[]) => arr.map(str => str.toLowerCase()),
}));

describe("Posts filtering utilities", () => {
  const createMockPost = (
    id: string,
    categories: (
      | "Ernährung"
      | "Immunsystem"
      | "Lesenswertes"
      | "Lifestyle & Psyche"
      | "Mikronährstoffe"
      | "Organsysteme"
      | "Wissenschaftliches"
      | "Wissenswertes"
    )[],
    group: "pro" | "kontra" | "fragezeiten",
    tags: string[],
    draft = false
  ): CollectionEntry<"blog"> => ({
    id,
    slug: id,
    body: "Test content",
    collection: "blog",
    data: {
      title: `Post ${id}`,
      author: "test-author",
      description: "Test description",
      pubDatetime: new Date(),
      draft,
      heroImage: {
        src: {
          src: "test.jpg",
          width: 100,
          height: 100,
          format: "jpg" as const,
        },
        alt: "Test image",
      },
      categories,
      group,
      tags,
    },
    render: vi.fn(),
  });

  describe("getPostsByCategory", () => {
    test("filters posts by category", async () => {
      const posts = [
        createMockPost("1", ["Ernährung"], "pro", ["tag1"]),
        createMockPost("2", ["Immunsystem"], "pro", ["tag2"]),
        createMockPost("3", ["Ernährung"], "kontra", ["tag3"]),
      ];

      const result = await getPostsByCategory(posts, "Ernährung");

      expect(result).toHaveLength(2);
      expect(result.map(post => post.id)).toEqual(["1", "3"]);
    });

    test("handles empty posts array", async () => {
      const result = await getPostsByCategory([], "health");
      expect(result).toEqual([]);
    });

    test("handles no matching category", async () => {
      const posts = [createMockPost("1", ["Ernährung"], "pro", ["tag1"])];

      const result = await getPostsByCategory(posts, "nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getPostsByGroup", () => {
    test("filters posts by group", async () => {
      const posts = [
        createMockPost("1", ["Ernährung"], "pro", ["tag1"]),
        createMockPost("2", ["Immunsystem"], "kontra", ["tag2"]),
        createMockPost("3", ["Organsysteme"], "pro", ["tag3"]),
      ];

      const result = await getPostsByGroup(posts, "pro");

      expect(result).toHaveLength(2);
      expect(result.map(post => post.id)).toEqual(["1", "3"]);
    });

    test("handles case-insensitive group matching", async () => {
      const posts = [
        createMockPost("1", ["Ernährung"], "pro", ["tag1"]),
        createMockPost("2", ["Immunsystem"], "pro", ["tag2"]),
      ];

      const result = await getPostsByGroup(posts, "pro");

      expect(result).toHaveLength(2);
    });
  });

  describe("getAllPostsByGroup", () => {
    test("filters all non-draft posts by group", async () => {
      const mockGetCollection = vi.mocked(
        await import("astro:content")
      ).getCollection;

      const mockPosts = [
        createMockPost("1", ["Ernährung"], "pro", ["tag1"]),
        createMockPost("2", ["Immunsystem"], "pro", ["tag2"], true), // draft
        createMockPost("3", ["Organsysteme"], "kontra", ["tag3"]),
      ];

      mockGetCollection.mockResolvedValue(mockPosts);

      const result = await getAllPostsByGroup("pro");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getPostsByTag", () => {
    test("filters posts by tag", async () => {
      const posts = [
        createMockPost("1", ["Ernährung"], "pro", ["javascript", "web"]),
        createMockPost("2", ["Immunsystem"], "pro", ["python"]),
        createMockPost("3", ["Organsysteme"], "pro", ["javascript"]),
      ];

      const result = await getPostsByTag(posts, "javascript");

      expect(result).toHaveLength(2);
      expect(result.map(post => post.id)).toEqual(["1", "3"]);
    });

    test("handles case-insensitive tag matching", async () => {
      const posts = [
        createMockPost("1", ["Ernährung"], "pro", ["JavaScript"]),
        createMockPost("2", ["Immunsystem"], "pro", ["JAVASCRIPT"]),
      ];

      const result = await getPostsByTag(posts, "javascript");

      expect(result).toHaveLength(2);
    });

    test("handles posts with no tags", async () => {
      const posts = [createMockPost("1", ["Ernährung"], "pro", [])];

      const result = await getPostsByTag(posts, "javascript");
      expect(result).toEqual([]);
    });
  });
});
