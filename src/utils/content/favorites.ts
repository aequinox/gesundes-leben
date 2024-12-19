import { getCollection, getEntry } from "astro:content";
import type { Favorite } from "./types";

/**
 * Custom error class for favorite-related operations
 */
class FavoriteError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "FavoriteError";
  }
}

/**
 * Valid category types for favorites
 */
type FavoriteCategory = "Basis" | "Premium" | "Profi";

/**
 * Sort options for favorites
 */
type SortOption = "name" | "category";

/**
 * @class FavoriteUtils
 * @description Utility class for managing favorite items in the content system.
 * Provides methods for retrieving, sorting, filtering, and grouping favorites
 * with robust error handling and type safety.
 */
export class FavoriteUtils {
  /**
   * Cache for storing favorites collection to minimize database hits
   * @private
   */
  private static favoritesCache: Favorite[] | null = null;

  /**
   * Category priority mapping for sorting
   * @private
   */
  private static readonly CATEGORY_PRIORITY: Record<FavoriteCategory, number> =
    {
      Profi: 3,
      Premium: 2,
      Basis: 1,
    };

  /**
   * Clears the favorites cache
   * @private
   */
  private static clearCache(): void {
    FavoriteUtils.favoritesCache = null;
  }

  /**
   * Sorts favorites by name with locale-aware comparison
   * @param favorites - Array of favorites to sort
   * @returns Sorted array of favorites
   */
  public static sortByName(favorites: ReadonlyArray<Favorite>): Favorite[] {
    return [...favorites].sort((a, b) =>
      a.data.name.localeCompare(b.data.name, undefined, { sensitivity: "base" })
    );
  }

  /**
   * Sorts favorites by category priority
   * @param favorites - Array of favorites to sort
   * @returns Sorted array of favorites (Profi > Premium > Basis)
   */
  public static sortByCategory(favorites: ReadonlyArray<Favorite>): Favorite[] {
    return [...favorites].sort((a, b) => {
      const priorityA = a.data.category
        ? FavoriteUtils.CATEGORY_PRIORITY[a.data.category]
        : 0;
      const priorityB = b.data.category
        ? FavoriteUtils.CATEGORY_PRIORITY[b.data.category]
        : 0;
      return priorityB - priorityA;
    });
  }

  /**
   * Retrieves all favorites with optional sorting and caching
   * @param options - Optional configuration for sorting
   * @returns Promise resolving to array of favorites
   * @throws FavoriteError if retrieval fails
   */
  public static async getAllFavorites(
    options: {
      sortBy?: SortOption;
      useCache?: boolean;
    } = {}
  ): Promise<Favorite[]> {
    const { sortBy = "name", useCache = true } = options;

    try {
      if (useCache && FavoriteUtils.favoritesCache) {
        const cached = FavoriteUtils.favoritesCache;
        return sortBy === "category"
          ? FavoriteUtils.sortByCategory(cached)
          : FavoriteUtils.sortByName(cached);
      }

      const favorites = await getCollection("favorites");
      if (useCache) {
        FavoriteUtils.favoritesCache = favorites;
      }

      return sortBy === "category"
        ? FavoriteUtils.sortByCategory(favorites)
        : FavoriteUtils.sortByName(favorites);
    } catch (error) {
      throw new FavoriteError("Failed to fetch favorites collection", error);
    }
  }

  /**
   * Retrieves a single favorite by slug
   * @param slug - Unique identifier for the favorite
   * @returns Promise resolving to favorite or null if not found
   * @throws FavoriteError if retrieval fails
   */
  public static async getFavorite(slug: string): Promise<Favorite | null> {
    try {
      const favorite = await getEntry("favorites", slug);
      return favorite || null;
    } catch (error) {
      throw new FavoriteError(
        `Failed to fetch favorite with slug: ${slug}`,
        error
      );
    }
  }

  /**
   * Retrieves favorites by category
   * @param category - Category to filter by
   * @returns Promise resolving to array of favorites in the category
   */
  public static async getFavoritesByCategory(
    category: FavoriteCategory
  ): Promise<Favorite[]> {
    try {
      const favorites = await FavoriteUtils.getAllFavorites();
      return favorites.filter(favorite => favorite.data.category === category);
    } catch (error) {
      throw new FavoriteError(
        `Failed to fetch favorites for category: ${category}`,
        error
      );
    }
  }

  /**
   * Retrieves favorites by manufacturer with case-insensitive matching
   * @param manufacturer - Manufacturer name to filter by
   * @returns Promise resolving to array of favorites by the manufacturer
   */
  public static async getFavoritesByManufacturer(
    manufacturer: string
  ): Promise<Favorite[]> {
    try {
      const favorites = await FavoriteUtils.getAllFavorites();
      const normalizedManufacturer = manufacturer.toLowerCase();
      return favorites.filter(
        favorite =>
          favorite.data.manufacturer.toLowerCase() === normalizedManufacturer
      );
    } catch (error) {
      throw new FavoriteError(
        `Failed to fetch favorites for manufacturer: ${manufacturer}`,
        error
      );
    }
  }

  /**
   * Groups favorites by category with proper typing
   * @returns Promise resolving to record of categories and their favorites
   */
  public static async getFavoritesByCategories(): Promise<
    Record<FavoriteCategory | "Uncategorized", Favorite[]>
  > {
    try {
      const favorites = await FavoriteUtils.getAllFavorites({ sortBy: "name" });
      const grouped: Record<FavoriteCategory | "Uncategorized", Favorite[]> = {
        Profi: [],
        Premium: [],
        Basis: [],
        Uncategorized: [],
      };

      favorites.forEach(favorite => {
        const category = favorite.data.category || "Uncategorized";
        grouped[category].push(favorite);
      });

      return grouped;
    } catch (error) {
      throw new FavoriteError("Failed to group favorites by categories", error);
    }
  }

  /**
   * Groups favorites by manufacturer with proper typing
   * @returns Promise resolving to record of manufacturers and their favorites
   */
  public static async getFavoritesByManufacturers(): Promise<
    Record<string, Favorite[]>
  > {
    try {
      const favorites = await FavoriteUtils.getAllFavorites({ sortBy: "name" });
      return favorites.reduce(
        (grouped: Record<string, Favorite[]>, favorite) => {
          const { manufacturer } = favorite.data;
          (grouped[manufacturer] = grouped[manufacturer] || []).push(favorite);
          return grouped;
        },
        {}
      );
    } catch (error) {
      throw new FavoriteError(
        "Failed to group favorites by manufacturers",
        error
      );
    }
  }

  /**
   * Searches favorites by name, description, or manufacturer
   * @param query - Search term
   * @returns Promise resolving to array of matching favorites
   */
  public static async searchFavorites(query: string): Promise<Favorite[]> {
    try {
      const favorites = await FavoriteUtils.getAllFavorites();
      const searchTerm = query.toLowerCase();

      return favorites.filter(favorite => {
        const { name, descriptions, manufacturer } = favorite.data;
        return (
          name.toLowerCase().includes(searchTerm) ||
          manufacturer.toLowerCase().includes(searchTerm) ||
          descriptions.some(desc => desc.toLowerCase().includes(searchTerm))
        );
      });
    } catch (error) {
      throw new FavoriteError(
        `Failed to search favorites with query: ${query}`,
        error
      );
    }
  }

  /**
   * Validates if a favorite exists in the collection
   * @param slug - Favorite's unique identifier
   * @returns Promise resolving to boolean indicating existence
   */
  public static async favoriteExists(slug: string): Promise<boolean> {
    try {
      const favorite = await FavoriteUtils.getFavorite(slug);
      return favorite !== null;
    } catch {
      return false;
    }
  }
}
