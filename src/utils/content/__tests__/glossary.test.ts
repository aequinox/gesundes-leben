import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GlossaryUtils } from "../glossary";
import { getCollection, getEntry } from "astro:content";
import type { Glossary } from "../types";

// Mock the astro:content module
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

describe("GlossaryUtils", () => {
  // Sample test data
  const mockGlossaryData = {
    title: "Test Entry",
    author: "kai-renner",
    pubDatetime: new Date("2024-01-01"),
    modDatetime: new Date("2024-01-02"),
  };

  const mockGlossary: Glossary = {
    id: "test-entry",
    slug: "test-entry",
    collection: "glossary",
    data: mockGlossaryData,
    body: "Test content",
    rendered: undefined,
    render: vi.fn().mockResolvedValue({ toString: () => "Test content" }),
  };

  const mockGlossaryEntries: Glossary[] = [
    mockGlossary,
    {
      ...mockGlossary,
      id: "entry-2",
      data: {
        ...mockGlossaryData,
        title: "Another Entry",
        pubDatetime: new Date("2024-01-03"),
      },
    },
    {
      ...mockGlossary,
      id: "entry-3",
      data: {
        ...mockGlossaryData,
        title: "Similar Test Entry",
        pubDatetime: new Date("2024-01-04"),
      },
    },
  ];

  // Setup and cleanup
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    GlossaryUtils["glossaryCache"] = null;
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe("sortByDate", () => {
    it("should sort entries by date (newest first)", () => {
      const sorted = GlossaryUtils.sortByDate(mockGlossaryEntries);

      expect(sorted.map(e => e.data.pubDatetime)).toEqual([
        mockGlossaryEntries[2].data.pubDatetime,
        mockGlossaryEntries[1].data.pubDatetime,
        mockGlossaryEntries[0].data.pubDatetime,
      ]);
    });

    it("should consider modification date when available", () => {
      const entries = [
        {
          ...mockGlossary,
          data: { ...mockGlossaryData, modDatetime: new Date("2024-01-05") },
        },
        {
          ...mockGlossary,
          data: { ...mockGlossaryData, pubDatetime: new Date("2024-01-06") },
        },
      ];

      const sorted = GlossaryUtils.sortByDate(entries);

      expect(sorted[0].data.pubDatetime).toEqual(entries[1].data.pubDatetime);
    });
  });

  describe("sortByTitle", () => {
    it("should sort entries alphabetically by title", () => {
      const sorted = GlossaryUtils.sortByTitle(mockGlossaryEntries);

      expect(sorted.map(e => e.data.title)).toEqual([
        "Another Entry",
        "Similar Test Entry",
        "Test Entry",
      ]);
    });

    it("should sort case-insensitively", () => {
      const entries = [
        { ...mockGlossary, data: { ...mockGlossaryData, title: "zebra" } },
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Alpha" } },
      ];

      const sorted = GlossaryUtils.sortByTitle(entries);

      expect(sorted.map(e => e.data.title)).toEqual(["Alpha", "zebra"]);
    });
  });

  describe("getAllEntries", () => {
    it("should retrieve all entries with default sorting by title", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);

      const result = await GlossaryUtils.getAllEntries();

      expect(result.map(e => e.data.title)).toEqual([
        "Another Entry",
        "Similar Test Entry",
        "Test Entry",
      ]);
    });

    it("should sort by date when specified", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);

      const result = await GlossaryUtils.getAllEntries({ sortBy: "date" });

      expect(result[0].data.pubDatetime).toEqual(
        mockGlossaryEntries[2].data.pubDatetime
      );
    });

    it("should use cache when enabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);

      await GlossaryUtils.getAllEntries();
      await GlossaryUtils.getAllEntries();

      expect(getCollection).toHaveBeenCalledTimes(1);
    });

    it("should bypass cache when disabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);

      await GlossaryUtils.getAllEntries({ useCache: false });
      await GlossaryUtils.getAllEntries({ useCache: false });

      expect(getCollection).toHaveBeenCalledTimes(2);
    });

    it("should return empty array when collection retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getCollection).mockRejectedValueOnce(error);

      const result = await GlossaryUtils.getAllEntries();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch glossary entries",
        error
      );
    });

    it("should handle empty collection", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([]);

      const result = await GlossaryUtils.getAllEntries();
      expect(result).toEqual([]);
    });

    it("should return empty array when response is not an array", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce({} as any);

      const result = await GlossaryUtils.getAllEntries();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Invalid glossary collection format"
      );
    });
  });

  describe("getEntry", () => {
    it("should retrieve a single entry by slug", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockGlossary);

      const result = await GlossaryUtils.getEntry("test-entry");

      expect(result).toEqual(mockGlossary);
    });

    it("should return null for non-existent entry", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await GlossaryUtils.getEntry("non-existent");

      expect(result).toBeNull();
    });

    it("should return null when retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      const result = await GlossaryUtils.getEntry("test-entry");

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to fetch glossary entry with slug: test-entry",
        error
      );
    });
  });

  describe("getRelatedEntries", () => {
    const createMockEntry = (id: string, title: string): Glossary => ({
      ...mockGlossary,
      id,
      data: { ...mockGlossaryData, title },
    });

    it("should find entries with shared significant words", async () => {
      const entries = [
        createMockEntry("1", "JavaScript Programming Guide"),
        createMockEntry("2", "Advanced JavaScript Techniques"),
        createMockEntry("3", "Python Programming"),
        createMockEntry("4", "Unrelated Topic"),
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getRelatedEntries(entries[0]);

      expect(result).toHaveLength(2);
      // Test for presence of expected titles without enforcing order
      const titles = result.map(e => e.data.title);
      expect(titles).toContain("Advanced JavaScript Techniques");
      expect(titles).toContain("Python Programming");
    });

    it("should ignore common words and numbers", async () => {
      const entries = [
        createMockEntry("1", "The Art of Programming"),
        createMockEntry("2", "Programming 101"),
        createMockEntry("3", "A Guide to the Art"),
        createMockEntry("4", "Something Different"),
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getRelatedEntries(entries[0]);

      expect(result).toHaveLength(2);
      // Test for presence of expected titles without enforcing order
      const titles = result.map(e => e.data.title);
      expect(titles).toContain("Programming 101");
      expect(titles).toContain("A Guide to the Art");
    });

    it("should respect the limit parameter", async () => {
      const entries = [
        createMockEntry("1", "Web Development"),
        createMockEntry("2", "Web Design"),
        createMockEntry("3", "Web Security"),
        createMockEntry("4", "Web Performance"),
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getRelatedEntries(entries[0], 2);

      expect(result).toHaveLength(2);
    });

    it("should exclude the reference entry", async () => {
      const entries = [
        createMockEntry("1", "Test Topic"),
        createMockEntry("2", "Test Topic"), // Same title, different ID
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getRelatedEntries(entries[0]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should handle entries with no significant words", async () => {
      const entries = [
        createMockEntry("1", "The and of"),
        createMockEntry("2", "A to the"),
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getRelatedEntries(entries[0]);

      expect(result).toHaveLength(0);
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(getCollection).mockRejectedValueOnce(new Error("Test error"));

      const result = await GlossaryUtils.getRelatedEntries(mockGlossary);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("entryExists", () => {
    it("should return true for existing entry", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockGlossary);

      const result = await GlossaryUtils.entryExists("test-entry");

      expect(result).toBe(true);
    });

    it("should return false for non-existent entry", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await GlossaryUtils.entryExists("non-existent");

      expect(result).toBe(false);
    });

    it("should return false when getEntry throws", async () => {
      vi.mocked(getEntry).mockRejectedValueOnce(new Error("Database error"));

      const result = await GlossaryUtils.entryExists("test-entry");

      expect(result).toBe(false);
    });
  });
});
