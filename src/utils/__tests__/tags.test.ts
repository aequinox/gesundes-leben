import {
  filterPosts,
  extractUniqueTags,
  filterPostsByTag,
  getTagCounts,
} from "../tags";
import type { Post } from "../types";
import { describe, expect, it, beforeEach } from "vitest";

// Mock data for testing
const createMockPost = (overrides: any = {}): any => ({
  data: {
    title: "Test Post",
    description: "Test description",
    pubDatetime: new Date("2024-01-15"),
    categories: ["Ernährung"],
    draft: false,
    featured: false,
    tags: ["test", "health"],
    references: [],
    author: "test-author",
    keywords: [],
    ...overrides,
  },
  slug: "test-post",
  body: "Test content",
  collection: "blog",
  id: "test-post.mdx",
  render: async () => ({
    Content: () => null,
    headings: [],
    remarkPluginFrontmatter: {},
  }),
});

describe("Tags Utilities", () => {
  describe("filterPosts", () => {
    let mockPosts: Post[];

    beforeEach(() => {
      mockPosts = [
        createMockPost({
          title: "Published Post",
          pubDatetime: new Date("2024-01-01"),
          draft: false,
        }),
        createMockPost({
          title: "Draft Post",
          pubDatetime: new Date("2024-01-01"),
          draft: true,
        }),
        createMockPost({
          title: "Future Post",
          pubDatetime: new Date("2025-12-01"),
          draft: false,
        }),
        createMockPost({
          title: "Post without date",
          pubDatetime: undefined as any,
          draft: false,
        }),
        createMockPost({
          title: "Post with invalid date",
          pubDatetime: "invalid-date" as any,
          draft: false,
        }),
      ];
    });

    it("should filter out posts without pubDatetime", () => {
      const result = filterPosts(mockPosts);
      expect(result.every(post => post.data.pubDatetime)).toBe(true);
      expect(result.length).toBeLessThan(mockPosts.length);
    });

    it("should filter out posts with invalid pubDatetime", () => {
      const result = filterPosts(mockPosts);
      const invalidDatePost = result.find(
        post => post.data.title === "Post with invalid date"
      );
      expect(invalidDatePost).toBeUndefined();
    });

    it("should include published posts in production mode", () => {
      // Mock production environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const result = filterPosts(mockPosts);
      const publishedPost = result.find(
        post => post.data.title === "Published Post"
      );
      expect(publishedPost).toBeDefined();

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should exclude draft posts in production mode", () => {
      // Mock production environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const result = filterPosts(mockPosts);
      const draftPost = result.find(post => post.data.title === "Draft Post");
      expect(draftPost).toBeUndefined();

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should exclude future posts in production mode", () => {
      // Mock production environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const result = filterPosts(mockPosts);
      const futurePost = result.find(post => post.data.title === "Future Post");
      expect(futurePost).toBeUndefined();

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should include all valid posts in development mode", () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const result = filterPosts(mockPosts);
      const publishedPost = result.find(
        post => post.data.title === "Published Post"
      );
      const draftPost = result.find(post => post.data.title === "Draft Post");
      const futurePost = result.find(post => post.data.title === "Future Post");

      expect(publishedPost).toBeDefined();
      expect(draftPost).toBeDefined();
      expect(futurePost).toBeDefined();

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should handle empty posts array", () => {
      const result = filterPosts([]);
      expect(result).toEqual([]);
    });
  });

  describe("extractUniqueTags", () => {
    it("should extract unique tags from posts", () => {
      const posts = [
        createMockPost({
          tags: ["health", "nutrition", "wellness"],
          draft: false,
        }),
        createMockPost({ tags: ["health", "fitness"], draft: false }),
        createMockPost({ tags: ["nutrition", "diet"], draft: false }),
      ];

      const result = extractUniqueTags(posts);

      expect(result).toHaveLength(5);
      expect(result.map(t => t.tag)).toContain("health");
      expect(result.map(t => t.tag)).toContain("nutrition");
      expect(result.map(t => t.tag)).toContain("wellness");
      expect(result.map(t => t.tag)).toContain("fitness");
      expect(result.map(t => t.tag)).toContain("diet");
    });

    it("should filter out draft posts", () => {
      const posts = [
        createMockPost({ tags: ["published-tag"], draft: false }),
        createMockPost({ tags: ["draft-tag"], draft: true }),
      ];

      const result = extractUniqueTags(posts);

      expect(result.map(t => t.tag)).toContain("published-tag");
      expect(result.map(t => t.tag)).not.toContain("draft-tag");
    });

    it("should handle posts without tags", () => {
      const posts = [
        createMockPost({ tags: ["health"], draft: false }),
        createMockPost({ tags: undefined, draft: false }),
        createMockPost({ tags: [], draft: false }),
      ];

      const result = extractUniqueTags(posts);

      expect(result).toHaveLength(1);
      expect(result[0].tag).toBe("health");
    });

    it("should maintain original tag names for display", () => {
      const posts = [
        createMockPost({ tags: ["Health & Wellness"], draft: false }),
      ];

      const result = extractUniqueTags(posts);

      expect(result[0].tagName).toBe("Health & Wellness");
      expect(result[0].tag).toBe("health-und-wellness"); // slugified
    });

    it("should sort tags alphabetically", () => {
      const posts = [
        createMockPost({ tags: ["zebra", "alpha", "beta"], draft: false }),
      ];

      const result = extractUniqueTags(posts);

      expect(result[0].tag).toBe("alpha");
      expect(result[1].tag).toBe("beta");
      expect(result[2].tag).toBe("zebra");
    });

    it("should handle empty posts array", () => {
      const result = extractUniqueTags([]);
      expect(result).toEqual([]);
    });

    it("should preserve first occurrence of tag name for consistent display", () => {
      const posts = [
        createMockPost({ tags: ["Health & Wellness"], draft: false }),
        createMockPost({ tags: ["health & wellness"], draft: false }), // different case
      ];

      const result = extractUniqueTags(posts);

      expect(result).toHaveLength(1);
      expect(result[0].tagName).toBe("Health & Wellness"); // First occurrence preserved
    });
  });

  describe("filterPostsByTag", () => {
    let mockPosts: Post[];

    beforeEach(() => {
      mockPosts = [
        createMockPost({
          title: "Health Post",
          tags: ["health", "wellness"],
        }),
        createMockPost({
          title: "Fitness Post",
          tags: ["fitness", "exercise"],
        }),
        createMockPost({
          title: "Nutrition Post",
          tags: ["nutrition", "health"],
        }),
        createMockPost({
          title: "No Tags Post",
          tags: undefined,
        }),
        createMockPost({
          title: "Empty Tags Post",
          tags: [],
        }),
      ];
    });

    it("should filter posts by exact tag match", () => {
      const result = filterPostsByTag(mockPosts, "health");

      expect(result).toHaveLength(2);
      expect(result.map(p => p.data.title)).toContain("Health Post");
      expect(result.map(p => p.data.title)).toContain("Nutrition Post");
    });

    it("should handle case-insensitive tag matching through slugification", () => {
      const result = filterPostsByTag(mockPosts, "HEALTH");

      expect(result).toHaveLength(2);
      expect(result.map(p => p.data.title)).toContain("Health Post");
      expect(result.map(p => p.data.title)).toContain("Nutrition Post");
    });

    it("should handle special characters in tag names", () => {
      const postsWithSpecialTags = [
        createMockPost({
          title: "Special Tag Post",
          tags: ["Health & Wellness"],
        }),
      ];

      const result = filterPostsByTag(
        postsWithSpecialTags,
        "Health & Wellness"
      );

      expect(result).toHaveLength(1);
      expect(result[0].data.title).toBe("Special Tag Post");
    });

    it("should return empty array for non-existent tags", () => {
      const result = filterPostsByTag(mockPosts, "non-existent");

      expect(result).toEqual([]);
    });

    it("should handle posts without tags gracefully", () => {
      const result = filterPostsByTag(mockPosts, "health");

      // Should not throw error and should only include posts that actually have the tag
      expect(result).toHaveLength(2);
      expect(result.every(p => p.data.tags?.includes("health"))).toBe(true);
    });

    it("should handle empty posts array", () => {
      const result = filterPostsByTag([], "health");
      expect(result).toEqual([]);
    });
  });

  describe("getTagCounts", () => {
    let mockPosts: Post[];

    beforeEach(() => {
      mockPosts = [
        createMockPost({
          title: "Post 1",
          tags: ["health", "wellness"],
          pubDatetime: new Date("2024-01-01"),
          draft: false,
        }),
        createMockPost({
          title: "Post 2",
          tags: ["health", "fitness"],
          pubDatetime: new Date("2024-01-02"),
          draft: false,
        }),
        createMockPost({
          title: "Post 3",
          tags: ["nutrition"],
          pubDatetime: new Date("2024-01-03"),
          draft: false,
        }),
        createMockPost({
          title: "Draft Post",
          tags: ["health"],
          pubDatetime: new Date("2024-01-04"),
          draft: true,
        }),
        createMockPost({
          title: "Future Post",
          tags: ["health"],
          pubDatetime: new Date("2025-12-01"),
          draft: false,
        }),
      ];
    });

    it("should count tags correctly for published posts", () => {
      // Mock production environment to test filtering
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const result = getTagCounts(mockPosts);

      expect(result.get("health")).toBe(2); // Only from published posts
      expect(result.get("wellness")).toBe(1);
      expect(result.get("fitness")).toBe(1);
      expect(result.get("nutrition")).toBe(1);

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should include all posts in development mode", () => {
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const result = getTagCounts(mockPosts);

      expect(result.get("health")).toBe(4); // Includes draft and future posts in dev
      expect(result.get("wellness")).toBe(1);
      expect(result.get("fitness")).toBe(1);
      expect(result.get("nutrition")).toBe(1);

      // Restore original environment
      (import.meta.env as any).DEV = originalEnv;
    });

    it("should handle posts without tags", () => {
      const postsWithoutTags = [
        createMockPost({ tags: undefined, draft: false }),
        createMockPost({ tags: [], draft: false }),
        createMockPost({ tags: ["health"], draft: false }),
      ];

      const result = getTagCounts(postsWithoutTags);

      expect(result.get("health")).toBe(1);
      expect(result.size).toBe(1);
    });

    it("should return empty map for empty posts array", () => {
      const result = getTagCounts([]);

      expect(result.size).toBe(0);
    });

    it("should handle case-insensitive counting through slugification", () => {
      const caseSensitivePosts = [
        createMockPost({
          tags: ["Health"],
          pubDatetime: new Date("2024-01-01"),
          draft: false,
        }),
        createMockPost({
          tags: ["health"],
          pubDatetime: new Date("2024-01-02"),
          draft: false,
        }),
        createMockPost({
          tags: ["HEALTH"],
          pubDatetime: new Date("2024-01-03"),
          draft: false,
        }),
      ];

      const result = getTagCounts(caseSensitivePosts);

      expect(result.get("health")).toBe(3); // All variations counted as same tag
      expect(result.size).toBe(1);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed post data gracefully", () => {
      const malformedPosts = [
        {
          data: {
            title: "Valid Post",
            tags: ["health"],
            pubDatetime: new Date("2024-01-01"),
            draft: false,
          },
        } as Post,
        {
          data: {
            title: "Post with null tags",
            tags: null,
            pubDatetime: new Date("2024-01-01"),
            draft: false,
          },
        } as any,
      ];

      expect(() => extractUniqueTags(malformedPosts)).not.toThrow();
      expect(() => filterPostsByTag(malformedPosts, "health")).not.toThrow();
      expect(() => getTagCounts(malformedPosts)).not.toThrow();
    });

    it("should handle extremely long tag names", () => {
      const longTag = "a".repeat(1000);
      const posts = [createMockPost({ tags: [longTag], draft: false })];

      expect(() => extractUniqueTags(posts)).not.toThrow();
      expect(() => filterPostsByTag(posts, longTag)).not.toThrow();
      expect(() => getTagCounts(posts)).not.toThrow();
    });

    it("should handle special Unicode characters in tags", () => {
      const unicodeTags = ["健康", "Gesundheit", "صحة", "здоровье"];
      const posts = [createMockPost({ tags: unicodeTags, draft: false })];

      expect(() => extractUniqueTags(posts)).not.toThrow();
      expect(() => filterPostsByTag(posts, "健康")).not.toThrow();
      expect(() => getTagCounts(posts)).not.toThrow();
    });
  });
});
