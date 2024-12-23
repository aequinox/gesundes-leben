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

  // Setup and cleanup
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    AuthorUtils["authorCache"] = null; // Reset cache
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
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

    it("should return null when getEntry fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      const result = await AuthorUtils.getAuthorEntry("john-doe");

      expect(result).toBeNull();
      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Failed to fetch author with identifier: john-doe"
        ),
        error
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

    it("should return an empty array when getCollection fails", async () => {
      const result = await AuthorUtils.getAllAuthors();

      expect(result).toEqual([]);
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

    it("should return null when getEntry fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      const result = await AuthorUtils.getAuthorData("john-doe");

      expect(result).toBeNull();
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

    it("should handle errors during resolution", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      const result = await AuthorUtils.resolveAuthors(["john-doe"]);

      expect(result).toEqual([null]);
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
