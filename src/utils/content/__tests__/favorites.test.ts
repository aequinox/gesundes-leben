import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { FavoriteUtils } from "../favorites";
import { getCollection, getEntry } from "astro:content";
import type { Favorite } from "../types";

// Mock the astro:content module
vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

describe("FavoriteUtils", () => {
  // Sample test data
  const mockFavoriteData = {
    name: "Test Product",
    manufacturer: "Test Corp",
    category: "Premium" as const,
    descriptions: ["Description 1", "Description 2"],
    url: "https://example.com",
  };

  const mockFavorite: Favorite = {
    id: "test-product",
    collection: "favorites",
    data: mockFavoriteData,
    body: "",
    rendered: undefined,
  };

  const mockFavorites: Favorite[] = [
    mockFavorite,
    {
      ...mockFavorite,
      id: "product-2",
      data: {
        ...mockFavoriteData,
        name: "Another Product",
        category: "Basis" as const,
      },
    },
    {
      ...mockFavorite,
      id: "product-3",
      data: {
        ...mockFavoriteData,
        name: "Pro Product",
        category: "Profi" as const,
        manufacturer: "Other Corp",
      },
    },
  ];

  // Clear mocks and cache before each test
  beforeEach(() => {
    vi.clearAllMocks();
    FavoriteUtils["favoritesCache"] = null;
  });

  // Clean up after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("sortByName", () => {
    it("should sort favorites by name case-insensitively", () => {
      const unsortedFavorites = [
        { ...mockFavorite, data: { ...mockFavoriteData, name: "zebra" } },
        { ...mockFavorite, data: { ...mockFavoriteData, name: "Alpha" } },
        { ...mockFavorite, data: { ...mockFavoriteData, name: "beta" } },
      ];

      const sorted = FavoriteUtils.sortByName(unsortedFavorites);

      expect(sorted.map(f => f.data.name)).toEqual(["Alpha", "beta", "zebra"]);
    });
  });

  describe("sortByCategory", () => {
    it("should sort favorites by category priority (Profi > Premium > Basis)", () => {
      const sorted = FavoriteUtils.sortByCategory(mockFavorites);

      expect(sorted.map(f => f.data.category)).toEqual([
        "Profi",
        "Premium",
        "Basis",
      ]);
    });

    it("should handle favorites without categories", () => {
      const mixedFavorites = [
        { ...mockFavorite, data: { ...mockFavoriteData, category: undefined } },
        ...mockFavorites,
      ];

      const sorted = FavoriteUtils.sortByCategory(mixedFavorites);

      expect(sorted[sorted.length - 1].data.category).toBeUndefined();
    });
  });

  describe("getAllFavorites", () => {
    it("should retrieve all favorites with default sorting by name", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getAllFavorites();

      expect(result.map(f => f.data.name)).toEqual([
        "Another Product",
        "Pro Product",
        "Test Product",
      ]);
    });

    it("should sort by category when specified", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getAllFavorites({
        sortBy: "category",
      });

      expect(result.map(f => f.data.category)).toEqual([
        "Profi",
        "Premium",
        "Basis",
      ]);
    });

    it("should use cache when enabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      await FavoriteUtils.getAllFavorites();
      await FavoriteUtils.getAllFavorites();

      expect(getCollection).toHaveBeenCalledTimes(1);
    });

    it("should bypass cache when disabled", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      await FavoriteUtils.getAllFavorites({ useCache: false });
      await FavoriteUtils.getAllFavorites({ useCache: false });

      expect(getCollection).toHaveBeenCalledTimes(2);
    });

    it("should throw FavoriteError when collection retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getCollection).mockRejectedValueOnce(error);

      await expect(FavoriteUtils.getAllFavorites()).rejects.toThrow(
        "Failed to fetch favorites collection"
      );
    });
  });

  describe("getFavorite", () => {
    it("should retrieve a single favorite by slug", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockFavorite);

      const result = await FavoriteUtils.getFavorite("test-product");

      expect(result).toEqual(mockFavorite);
    });

    it("should return null for non-existent favorite", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await FavoriteUtils.getFavorite("non-existent");

      expect(result).toBeNull();
    });

    it("should throw FavoriteError when retrieval fails", async () => {
      const error = new Error("Database error");
      vi.mocked(getEntry).mockRejectedValueOnce(error);

      await expect(FavoriteUtils.getFavorite("test-product")).rejects.toThrow(
        "Failed to fetch favorite with slug: test-product"
      );
    });
  });

  describe("getFavoritesByCategory", () => {
    it("should retrieve favorites filtered by category", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getFavoritesByCategory("Premium");

      expect(result.length).toBe(1);
      expect(result[0].data.category).toBe("Premium");
    });

    it("should return empty array for non-existent category", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getFavoritesByCategory(
        "NonExistent" as any
      );

      expect(result).toEqual([]);
    });
  });

  describe("getFavoritesByManufacturer", () => {
    it("should retrieve favorites by manufacturer case-insensitively", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result =
        await FavoriteUtils.getFavoritesByManufacturer("test corp");

      expect(result.length).toBe(2);
      expect(
        result.every(f => f.data.manufacturer.toLowerCase() === "test corp")
      ).toBe(true);
    });

    it("should return empty array for non-existent manufacturer", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result =
        await FavoriteUtils.getFavoritesByManufacturer("non-existent");

      expect(result).toEqual([]);
    });
  });

  describe("getFavoritesByCategories", () => {
    it("should group favorites by category", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getFavoritesByCategories();

      expect(Object.keys(result)).toEqual([
        "Profi",
        "Premium",
        "Basis",
        "Uncategorized",
      ]);
      expect(result.Premium.length).toBe(1);
      expect(result.Basis.length).toBe(1);
      expect(result.Profi.length).toBe(1);
      expect(result.Uncategorized.length).toBe(0);
    });
  });

  describe("getFavoritesByManufacturers", () => {
    it("should group favorites by manufacturer", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.getFavoritesByManufacturers();

      expect(Object.keys(result)).toEqual(["Test Corp", "Other Corp"]);
      expect(result["Test Corp"].length).toBe(2);
      expect(result["Other Corp"].length).toBe(1);
    });
  });

  describe("searchFavorites", () => {
    it("should search favorites by name", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.searchFavorites("pro");

      expect(result.length).toBe(3);
      expect(result[0].data.name).toBe("Another Product");
    });

    it("should search favorites by manufacturer", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.searchFavorites("other");

      expect(result.length).toBe(2);
      expect(result[0].data.manufacturer).toBe("Test Corp");
    });

    it("should search favorites by description", async () => {
      vi.mocked(getCollection).mockResolvedValueOnce(mockFavorites);

      const result = await FavoriteUtils.searchFavorites("description");

      expect(result.length).toBe(3); // All mock favorites have this in their descriptions
    });
  });

  describe("favoriteExists", () => {
    it("should return true for existing favorite", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(mockFavorite);

      const result = await FavoriteUtils.favoriteExists("test-product");

      expect(result).toBe(true);
    });

    it("should return false for non-existent favorite", async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await FavoriteUtils.favoriteExists("non-existent");

      expect(result).toBe(false);
    });

    it("should return false when getEntry throws", async () => {
      vi.mocked(getEntry).mockRejectedValueOnce(new Error("Database error"));

      const result = await FavoriteUtils.favoriteExists("test-product");

      expect(result).toBe(false);
    });
  });
});
