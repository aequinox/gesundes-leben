import { getCollection, getEntry } from "astro:content";
import type { Favorite } from "./types";

/**
 * Favorites-related utility functions
 */
export class FavoriteUtils {
  /**
   * Sorts favorites by name
   */
  public static sortByName(favorites: Favorite[]): Favorite[] {
    return [...favorites].sort((a, b) => 
      a.data.name.localeCompare(b.data.name, undefined, { sensitivity: 'base' })
    );
  }

  /**
   * Sorts favorites by category priority (Profi > Premium > Basis)
   */
  public static sortByCategory(favorites: Favorite[]): Favorite[] {
    const categoryPriority: Record<string, number> = {
      'Profi': 3,
      'Premium': 2,
      'Basis': 1
    };

    return [...favorites].sort((a, b) => {
      const priorityA = a.data.category ? categoryPriority[a.data.category] : 0;
      const priorityB = b.data.category ? categoryPriority[b.data.category] : 0;
      return priorityB - priorityA;
    });
  }

  /**
   * Retrieves all favorites with optional sorting
   */
  public static async getAllFavorites(options: {
    sortBy?: 'name' | 'category';
  } = {}): Promise<Favorite[]> {
    const { sortBy = 'name' } = options;
    try {
      const favorites = await getCollection('favorites');
      return sortBy === 'category'
        ? FavoriteUtils.sortByCategory(favorites)
        : FavoriteUtils.sortByName(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Retrieves a single favorite by slug
   */
  public static async getFavorite(slug: string): Promise<Favorite | undefined | null> {
    try {
      const favorite = await getEntry('favorites', slug);
      return favorite || null;
    } catch (error) {
      console.error('Error fetching favorite:', error);
      return null;
    }
  }

  /**
   * Retrieves favorites by category
   */
  public static async getFavoritesByCategory(category: 'Basis' | 'Premium' | 'Profi'): Promise<Favorite[]> {
    const favorites = await FavoriteUtils.getAllFavorites();
    return favorites.filter(favorite => favorite.data.category === category);
  }

  /**
   * Retrieves favorites by manufacturer
   */
  public static async getFavoritesByManufacturer(manufacturer: string): Promise<Favorite[]> {
    const favorites = await FavoriteUtils.getAllFavorites();
    return favorites.filter(favorite => 
      favorite.data.manufacturer.toLowerCase() === manufacturer.toLowerCase()
    );
  }

  /**
   * Groups favorites by category
   */
  public static async getFavoritesByCategories(): Promise<Record<string, Favorite[]>> {
    const favorites = await FavoriteUtils.getAllFavorites({ sortBy: 'name' });
    const grouped: Record<string, Favorite[]> = {
      'Profi': [],
      'Premium': [],
      'Basis': [],
      'Uncategorized': []
    };

    favorites.forEach(favorite => {
      const category = favorite.data.category || 'Uncategorized';
      grouped[category].push(favorite);
    });

    return grouped;
  }

  /**
   * Groups favorites by manufacturer
   */
  public static async getFavoritesByManufacturers(): Promise<Record<string, Favorite[]>> {
    const favorites = await FavoriteUtils.getAllFavorites({ sortBy: 'name' });
    const grouped: Record<string, Favorite[]> = {};

    favorites.forEach(favorite => {
      const manufacturer = favorite.data.manufacturer;
      if (!grouped[manufacturer]) {
        grouped[manufacturer] = [];
      }
      grouped[manufacturer].push(favorite);
    });

    return grouped;
  }

  /**
   * Searches favorites by name or description
   */
  public static async searchFavorites(query: string): Promise<Favorite[]> {
    const favorites = await FavoriteUtils.getAllFavorites();
    const searchTerm = query.toLowerCase();

    return favorites.filter(favorite => {
      const { name, descriptions, manufacturer } = favorite.data;
      return (
        name.toLowerCase().includes(searchTerm) ||
        manufacturer.toLowerCase().includes(searchTerm) ||
        descriptions.some((desc: string) => desc.toLowerCase().includes(searchTerm))
      );
    });
  }
}
