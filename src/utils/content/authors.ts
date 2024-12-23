import { getCollection, getEntry } from "astro:content";
import type { Author, AuthorData } from "./types";

/**
 * @class AuthorUtils
 * @description Utility class for managing author-related operations in the content system.
 * Provides methods for retrieving and managing author data with built-in error handling
 * and type safety.
 */
export class AuthorUtils {
  /**
   * Cache for storing author collection to minimize database hits
   * @private
   */
  private static authorCache: Author[] | null = null;

  /**
   * Clears the author cache
   * @private
   */
  private static clearCache(): void {
    AuthorUtils.authorCache = null;
  }

  /**
   * Retrieves an author entry by slug or author reference with error handling
   * @param author - Author identifier (string slug or reference object)
   * @returns Promise resolving to Author entry or null if not found
   * Returns null if the author is not found or if retrieval fails
   */
  public static async getAuthorEntry(
    author: string | { collection: "authors"; id: string }
  ): Promise<Author | null> {
    try {
      const identifier = typeof author === "string" ? author : author.id;
      const entry = await getEntry("authors", identifier);
      return entry || null;
    } catch (error) {
      // Log the error but return null instead of throwing
      console.error(
        `Failed to fetch author with identifier: ${typeof author === "string" ? author : author.id}`,
        error
      );
      return null;
    }
  }

  /**
   * Retrieves all authors with caching for performance
   * @returns Promise resolving to array of all authors, or empty array if retrieval fails
   */
  public static async getAllAuthors(): Promise<Author[]> {
    try {
      if (!AuthorUtils.authorCache) {
        const result = await getCollection("authors");
        if (!Array.isArray(result)) {
          console.error("Invalid authors collection format");
          return [];
        }
        AuthorUtils.authorCache = result;
      }
      return AuthorUtils.authorCache || [];
    } catch (error) {
      console.error("Failed to fetch authors collection", error);
      return [];
    }
  }

  /**
   * Retrieves an author's data by slug with type safety
   * @param slug - Author's unique identifier
   * @returns Promise resolving to author data or null if not found
   */
  public static async getAuthorData(slug: string): Promise<AuthorData | null> {
    const author = await AuthorUtils.getAuthorEntry(slug);
    return author?.data || null;
  }

  /**
   * Maps author references to full author data with parallel processing
   * @param authors - Array of author references
   * @returns Promise resolving to array of resolved authors
   */
  public static async resolveAuthors(
    authors: ReadonlyArray<string | { collection: "authors"; id: string }>
  ): Promise<(Author | null)[]> {
    // Since getAuthorEntry now handles errors internally, we can simplify this
    return Promise.all(
      authors.map(author => AuthorUtils.getAuthorEntry(author))
    );
  }

  /**
   * Validates if an author exists in the collection
   * @param slug - Author's unique identifier
   * @returns Promise resolving to boolean indicating existence
   */
  public static async authorExists(slug: string): Promise<boolean> {
    try {
      const author = await AuthorUtils.getAuthorEntry(slug);
      return author !== null;
    } catch {
      return false;
    }
  }
}
