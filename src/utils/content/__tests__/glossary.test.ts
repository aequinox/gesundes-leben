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
    author: "john-doe",
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

  // Clear mocks and cache before each test
  beforeEach(() => {
    vi.clearAllMocks();
    GlossaryUtils["glossaryCache"] = null;
  });

  // Clean up after all tests
  afterEach(() => {
    vi.resetAllMocks();
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

    it("should throw GlossaryError when collection retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getCollection).mockRejectedValueOnce(error);

      await expect(GlossaryUtils.getAllEntries()).rejects.toThrow(
        "Failed to fetch glossary entries"
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

    it("should throw GlossaryError when retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      await expect(GlossaryUtils.getEntry("test-entry")).rejects.toThrow(
        "Failed to fetch glossary entry with slug: test-entry"
      );
    });
  });

  describe("getEntriesByAuthor", () => {
    it("should retrieve entries by author", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);
      vi.mocked(getEntry).mockResolvedValue({
        ...mockGlossary,
        id: "john-doe",
        slug: "john-doe",
      });

      const result = await GlossaryUtils.getEntriesByAuthor("john-doe");

      expect(result).toEqual(mockGlossaryEntries);
    });

    it("should handle invalid author references", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockGlossaryEntries);
      vi.mocked(getEntry).mockRejectedValue(new Error("Invalid author"));

      const result = await GlossaryUtils.getEntriesByAuthor("invalid-author");

      expect(result).toEqual([]);
    });
  });

  describe("searchEntries", () => {
    const mockRender = vi.fn();

    beforeEach(() => {
      mockRender.mockResolvedValue({
        toString: () => "Test content with searchable text",
      });
    });

    it("should search entries by title", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([
        {
          ...mockGlossary,
          data: { ...mockGlossaryData, title: "Searchable Title" },
        },
      ]);

      const result = await GlossaryUtils.searchEntries("searchable");

      expect(result.length).toBe(1);
      expect(result[0].data.title).toBe("Searchable Title");
    });

    it("should search entries by content", async () => {
      const entryWithRender = {
        ...mockGlossary,
        render: mockRender.mockResolvedValue({
          toString: () => "Test content with searchable text",
        }),
      };
      vi.mocked(getCollection).mockResolvedValueOnce([entryWithRender]);

      const result = await GlossaryUtils.searchEntries("searchable");

      expect(result.length).toBe(1);
    });

    it("should handle render failures gracefully", async () => {
      const entryWithFailingRender = {
        ...mockGlossary,
        render: vi.fn().mockRejectedValue(new Error("Render failed")),
        rendered: undefined,
      };
      vi.mocked(getCollection).mockResolvedValueOnce([entryWithFailingRender]);

      const result = await GlossaryUtils.searchEntries("xx");

      expect(result).toEqual([]);
    });
  });

  describe("getEntriesByAlphabet", () => {
    it("should group entries by first letter of title", async () => {
      const entries = [
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Apple" } },
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Banana" } },
        { ...mockGlossary, data: { ...mockGlossaryData, title: "another" } },
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getEntriesByAlphabet();

      expect(Object.keys(result).sort()).toEqual(["A", "B"]);
      expect(result["A"].length).toBe(2); // "Apple" and "another"
      expect(result["B"].length).toBe(1);
    });

    it("should sort entries within each group", async () => {
      const entries = [
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Alpha" } },
        { ...mockGlossary, data: { ...mockGlossaryData, title: "another" } },
      ];
      vi.mocked(getCollection).mockResolvedValueOnce(entries);

      const result = await GlossaryUtils.getEntriesByAlphabet();

      expect(result["A"].map(e => e.data.title)).toEqual(["Alpha", "another"]);
    });
  });

  describe.skip("getRelatedEntries", () => {
    it("should find related entries based on title similarity", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Test Entry" } },
        {
          ...mockGlossary,
          data: { ...mockGlossaryData, title: "Test Entry 2" },
        },
        { ...mockGlossary, data: { ...mockGlossaryData, title: "Unrelated" } },
      ]);

      const result = await GlossaryUtils.getRelatedEntries(mockGlossary);

      expect(result.length).toBe(1);
      expect(result[0].data.title).toBe("Test Entry 2");
    });

    it("should limit the number of related entries", async () => {
      const similarEntries = Array.from({ length: 10 }, (_, i) => ({
        ...mockGlossary,
        id: `entry-${i}`,
        data: { ...mockGlossaryData, title: `Test Entry ${i}` },
      }));
      vi.mocked(getCollection).mockResolvedValueOnce(similarEntries);

      const result = await GlossaryUtils.getRelatedEntries(mockGlossary, 3);

      expect(result.length).toBe(3);
    });

    it("should exclude the reference entry from results", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([mockGlossary]);

      const result = await GlossaryUtils.getRelatedEntries(mockGlossary);

      expect(result.length).toBe(0);
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
