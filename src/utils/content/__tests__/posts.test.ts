import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PostUtils } from "../posts";
import { getCollection } from "astro:content";
import type { Blog } from "../types";
import type { Category } from "@/data/taxonomies";

// Mock external modules
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

vi.mock("reading-time", () => ({
  default: vi.fn().mockReturnValue({ minutes: 5 }),
}));

vi.mock("mdast-util-from-markdown", () => ({
  fromMarkdown: vi.fn(),
}));

vi.mock("mdast-util-to-string", () => ({
  toString: vi.fn().mockReturnValue("Mocked content string"),
}));

describe("PostUtils", () => {
  // Sample test data
  const mockPostData = {
    title: "Test Post",
    author: "john-doe",
    pubDatetime: new Date("2024-01-01"),
    modDatetime: new Date("2024-01-02"),
    draft: false,
    featured: false,
    tags: ["test", "sample"],
    categories: ["Ernährung"] as Category[],
    group: "pro" as const,
    description: "Test description",
    heroImage: {
      alt: "Test image",
      src: {
        src: "test.jpg",
        width: 100,
        height: 100,
        format: "jpg" as const,
      },
    },
  };

  const mockPost: Blog = {
    id: "test-post",
    slug: "test-post",
    collection: "blog",
    data: mockPostData,
    body: "Test content",
    rendered: undefined,
    render: vi.fn(),
  };

  const mockPosts: Blog[] = [
    mockPost,
    {
      ...mockPost,
      id: "post-2",
      slug: "post-2",
      data: {
        ...mockPostData,
        title: "Another Post",
        pubDatetime: new Date("2024-01-03"),
        draft: true,
      },
    },
    {
      ...mockPost,
      id: "post-3",
      slug: "post-3",
      data: {
        ...mockPostData,
        title: "Featured Post",
        pubDatetime: new Date("2024-01-04"),
        featured: true,
        categories: ["Immunsystem"] as Category[],
        group: "kontra" as const,
      },
    },
  ];

  // Clear mocks and cache before each test
  beforeEach(() => {
    vi.clearAllMocks();
    PostUtils["postsCache"] = null;
  });

  // Clean up after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("sortByDate", () => {
    it("should sort posts by date (newest first)", () => {
      const sorted = PostUtils.sortByDate(mockPosts);

      expect(sorted.map(p => p.data.pubDatetime)).toEqual([
        mockPosts[2].data.pubDatetime,
        mockPosts[1].data.pubDatetime,
        mockPosts[0].data.pubDatetime,
      ]);
    });

    it("should consider modification date when available", () => {
      const posts = [
        {
          ...mockPost,
          data: { ...mockPostData, modDatetime: new Date("2024-01-05") },
        },
        {
          ...mockPost,
          data: { ...mockPostData, pubDatetime: new Date("2024-01-06") },
        },
      ];

      const sorted = PostUtils.sortByDate(posts);

      expect(sorted[0].data.pubDatetime).toEqual(posts[1].data.pubDatetime);
    });
  });

  describe("getAllPosts", () => {
    it("should retrieve all posts with default filtering", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getAllPosts();

      expect(result.length).toBe(1); // Only non-draft, non-scheduled posts
    });

    it("should include drafts when specified", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getAllPosts({ includeDrafts: true });

      expect(result.length).toBe(2);
    });

    it("should include scheduled posts when specified", async () => {
      const futurePosts = [
        ...mockPosts,
        {
          ...mockPost,
          data: {
            ...mockPostData,
            pubDatetime: new Date(Date.now() + 86400000), // Tomorrow
          },
        },
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(futurePosts);

      const result = await PostUtils.getAllPosts({ includeScheduled: true });

      expect(result.length).toBe(2);
    });

    it("should use cache when enabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      await PostUtils.getAllPosts();
      await PostUtils.getAllPosts();

      expect(getCollection).toHaveBeenCalledTimes(1);
    });

    it("should bypass cache when disabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      await PostUtils.getAllPosts({ useCache: false });
      await PostUtils.getAllPosts({ useCache: false });

      expect(getCollection).toHaveBeenCalledTimes(2);
    });
  });

  describe("getFeaturedPosts", () => {
    it("should retrieve only featured posts", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getFeaturedPosts();

      expect(result.length).toBe(1);
      expect(result[0].data.featured).toBe(true);
    });
  });

  describe("getPostsByTag", () => {
    it("should retrieve posts by tag case-insensitively", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getPostsByTag("TEST");

      expect(result.length).toBe(1);
      expect(result[0].data.tags).toContain("test");
    });

    it("should return empty array for non-existent tag", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getPostsByTag("non-existent");

      expect(result).toEqual([]);
    });
  });

  describe("getPostsByCategory", () => {
    it("should retrieve posts by category", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getPostsByCategory("Immunsystem");

      expect(result.length).toBe(1);
      expect(result[0].data.categories).toContain("Immunsystem");
    });
  });

  describe("getPostsByGroup", () => {
    it("should retrieve posts by group case-insensitively", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.getPostsByGroup("PRO");

      expect(result.length).toBe(1);
      expect(result[0].data.group).toBe("pro");
    });
  });

  describe("calculateReadingTime", () => {
    it("should calculate reading time for valid content", () => {
      const result = PostUtils.calculateReadingTime("Test content");

      expect(result).toBe(5);
    });

    it("should return undefined for empty content", () => {
      const result = PostUtils.calculateReadingTime("");

      expect(result).toBeUndefined();
    });

    it("should handle calculation errors gracefully", () => {
      vi.mocked(
        require("mdast-util-from-markdown").fromMarkdown
      ).mockImplementationOnce(() => {
        throw new Error("Parse error");
      });

      const result = PostUtils.calculateReadingTime("Test content");

      expect(result).toBeUndefined();
    });
  });

  describe("updateReadingTimes", () => {
    it("should update reading times for posts without existing times", async () => {
      const posts = [
        { ...mockPost, data: { ...mockPostData, readingTime: undefined } },
        { ...mockPost, data: { ...mockPostData, readingTime: 3 } },
      ];

      const result = await PostUtils.updateReadingTimes(posts);

      expect(result[0].data.readingTime).toBeDefined();
      expect(result[1].data.readingTime).toBe(3);
    });
  });

  describe("postExists", () => {
    it("should return true for existing post", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.postExists("test-post");

      expect(result).toBe(true);
    });

    it("should return false for non-existent post", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockPosts);

      const result = await PostUtils.postExists("non-existent");

      expect(result).toBe(false);
    });

    it("should return false when getCollection throws", async () => {
      vi.mocked(getCollection).mockRejectedValueOnce(
        new Error("Database error")
      );

      const result = await PostUtils.postExists("test-post");

      expect(result).toBe(false);
    });
  });
});
