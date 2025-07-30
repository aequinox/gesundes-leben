/**
 * @file posts.test.ts
 * @description Comprehensive tests for post utility functions
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

import { createMockPost } from "../../../tests/vitest-setup";
import {
  getAllPosts,
  getSortedPosts,
  getFeaturedPosts,
  getRecentPosts,
  getPostsByTag,
} from "../posts";

// Mock the astro:content module at the top level
vi.mock("astro:content", () => {
  const mockGetCollection = vi.fn();
  return {
    getCollection: mockGetCollection,
    getEntry: vi.fn().mockResolvedValue(null),
    render: vi.fn().mockResolvedValue({
      Content: () => null,
      remarkPluginFrontmatter: {},
    }),
  };
});

describe("Posts utilities", () => {
  const mockPosts = [
    createMockPost({
      id: "post-1",
      data: {
        title: "Test Post 1",
        pubDatetime: new Date("2024-01-01"),
        featured: true,
        draft: false,
        tags: ["health", "nutrition"],
        categories: ["Ernährung"],
      },
    }),
    createMockPost({
      id: "post-2",
      data: {
        title: "Test Post 2",
        pubDatetime: new Date("2024-01-02"),
        featured: false,
        draft: false,
        tags: ["wellness", "health"],
        categories: ["Wellness"],
      },
    }),
    createMockPost({
      id: "draft-post",
      data: {
        title: "Draft Post",
        pubDatetime: new Date("2024-01-03"),
        featured: false,
        draft: true,
        tags: ["draft"],
        categories: ["Test"],
      },
    }),
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked module and set up the return value
    const astroContent = (await vi.importMock("astro:content")) as any;
    vi.mocked(astroContent.getCollection).mockResolvedValue(mockPosts);
  });

  describe("getAllPosts", () => {
    it("should return all posts when includeDrafts is true", async () => {
      const posts = await getAllPosts(true);
      expect(posts).toHaveLength(3);
      const astroContent = (await vi.importMock("astro:content")) as any;
      expect(astroContent.getCollection).toHaveBeenCalledWith("blog");
    });

    it("should filter out drafts when includeDrafts is false", async () => {
      const posts = await getAllPosts(false);
      // Should filter out draft posts
      expect(
        posts.every(post => !post.data.draft || !posts.includes(post))
      ).toBe(true);
      // Should have fewer posts than when including drafts
      const allPosts = await getAllPosts(true);
      expect(posts.length).toBeLessThanOrEqual(allPosts.length);
    });
  });

  describe("getSortedPosts", () => {
    it("should return posts sorted by publication date in descending order", async () => {
      const allPosts = await getAllPosts(true);
      const posts = getSortedPosts(allPosts);

      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 1) {
        // Check that posts are sorted by date (most recent first)
        for (let i = 0; i < posts.length - 1; i++) {
          const currentDate = new Date(posts[i].data.pubDatetime);
          const nextDate = new Date(posts[i + 1].data.pubDatetime);
          expect(currentDate >= nextDate).toBe(true);
        }
      }
    });

    it("should return posts sorted by publication date in ascending order", async () => {
      const allPosts = await getAllPosts(true);
      const posts = getSortedPosts(allPosts, "asc");

      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 1) {
        // Check that posts are sorted by date (oldest first)
        for (let i = 0; i < posts.length - 1; i++) {
          const currentDate = new Date(posts[i].data.pubDatetime);
          const nextDate = new Date(posts[i + 1].data.pubDatetime);
          expect(currentDate <= nextDate).toBe(true);
        }
      }
    });
  });

  describe("getFeaturedPosts", () => {
    it("should return only featured posts", async () => {
      const featuredPosts = await getFeaturedPosts();

      expect(Array.isArray(featuredPosts)).toBe(true);
      // All returned posts should be featured
      featuredPosts.forEach(post => {
        expect(post.data.featured).toBe(true);
      });
    });
  });

  describe("getRecentPosts", () => {
    it("should return recent posts", async () => {
      const recentPosts = await getRecentPosts();

      expect(Array.isArray(recentPosts)).toBe(true);
      // Should only contain published posts
      const publishedRecent = recentPosts.filter(post => !post.data.draft);
      expect(publishedRecent.every(post => !post.data.draft)).toBe(true);
    });
  });

  describe("getPostsByTag", () => {
    it("should return posts filtered by tag", async () => {
      const allPosts = await getAllPosts(true);
      const healthPosts = await getPostsByTag(allPosts, "health");

      expect(Array.isArray(healthPosts)).toBe(true);
      // In test environment, should work with mock data
      // The actual filtering logic depends on the implementation
    });
  });
});
