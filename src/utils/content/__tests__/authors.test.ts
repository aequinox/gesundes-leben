import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AuthorUtils } from "../authors";
import { getCollection, getEntry } from "astro:content";
import type { Author, AuthorData } from "../types";

// Mock the astro:content module
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

describe("AuthorUtils", () => {
  // Sample test data
  const mockAuthorData: AuthorData = {
    name: "John Doe",
    bio: "Test bio",
    avatar: "test-avatar.jpg",
    socialLinks: {
      twitter: "https://twitter.com/johndoe",
    },
  };

  const mockAuthor: Author = {
    id: "john-doe",
    slug: "john-doe",
    body: "",
    collection: "authors",
    data: mockAuthorData,
    render: vi.fn(),
  };

  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    AuthorUtils["authorCache"] = null; // Reset cache
  });

  // Clean up after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getAuthorEntry", () => {
    it("should retrieve an author by string slug", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockAuthor);

      const result = await AuthorUtils.getAuthorEntry("john-doe");

      expect(result).toEqual(mockAuthor);
      expect(getEntry).toHaveBeenCalledWith("authors", "john-doe");
    });

    it("should retrieve an author by reference object", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockAuthor);

      const result = await AuthorUtils.getAuthorEntry({
        collection: "authors",
        id: "john-doe",
      });

      expect(result).toEqual(mockAuthor);
      expect(getEntry).toHaveBeenCalledWith("authors", "john-doe");
    });

    it("should return null for non-existent author", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await AuthorUtils.getAuthorEntry("non-existent");

      expect(result).toBeNull();
    });

    it("should throw error when getEntry fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      await expect(AuthorUtils.getAuthorEntry("john-doe")).rejects.toThrow(
        "Author retrieval failed: Database error"
      );
    });
  });

  describe("getAllAuthors", () => {
    it("should retrieve all authors", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([mockAuthor]);

      const result = await AuthorUtils.getAllAuthors();

      expect(result).toEqual([mockAuthor]);
      expect(getCollection).toHaveBeenCalledWith("authors");
    });

    it("should use cache on subsequent calls", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([mockAuthor]);

      // First call
      await AuthorUtils.getAllAuthors();
      // Second call
      await AuthorUtils.getAllAuthors();

      expect(getCollection).toHaveBeenCalledTimes(1);
    });

    it("should throw error when getCollection fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getCollection).mockRejectedValueOnce(error);

      await expect(AuthorUtils.getAllAuthors()).rejects.toThrow(
        "Authors collection retrieval failed: Database error"
      );
    });
  });

  describe("getAuthorData", () => {
    it("should retrieve author data by slug", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockAuthor);

      const result = await AuthorUtils.getAuthorData("john-doe");

      expect(result).toEqual(mockAuthorData);
    });

    it("should return null for non-existent author", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await AuthorUtils.getAuthorData("non-existent");

      expect(result).toBeNull();
    });

    it("should propagate errors from getAuthorEntry", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      await expect(AuthorUtils.getAuthorData("john-doe")).rejects.toThrow();
    });
  });

  describe("resolveAuthors", () => {
    it("should resolve multiple author references", async () => {
      vi.mocked(getEntry)
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockAuthor);

      const result = await AuthorUtils.resolveAuthors([
        "john-doe",
        "non-existent",
        { collection: "authors", id: "john-doe" },
      ]);

      expect(result).toEqual([mockAuthor, null, mockAuthor]);
      expect(getEntry).toHaveBeenCalledTimes(3);
    });

    it("should throw error when resolution fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      await expect(AuthorUtils.resolveAuthors(["john-doe"])).rejects.toThrow(
        "Author resolution failed: Author retrieval failed: Database error"
      );
    });
  });

  describe("authorExists", () => {
    it("should return true for existing author", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockAuthor);

      const result = await AuthorUtils.authorExists("john-doe");

      expect(result).toBe(true);
    });

    it("should return false for non-existent author", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await AuthorUtils.authorExists("non-existent");

      expect(result).toBe(false);
    });

    it("should return false when getEntry throws", async () => {
      vi.mocked(getEntry).mockRejectedValueOnce(new Error("Database error"));

      const result = await AuthorUtils.authorExists("john-doe");

      expect(result).toBe(false);
    });
  });
});
