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
   * @throws Error if the author retrieval fails
   */
  public static async getAuthorEntry(
    author: string | { collection: "authors"; id: string }
  ): Promise<Author | null> {
    try {
      const identifier = typeof author === "string" ? author : author.id;
      const entry = await getEntry("authors", identifier);
      return entry || null;
    } catch (error) {
      console.error(
        `Failed to fetch author with identifier: ${typeof author === "string" ? author : author.id}`,
        error
      );
      throw new Error(
        `Author retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Retrieves all authors with caching for performance
   * @returns Promise resolving to array of all authors
   * @throws Error if authors collection retrieval fails
   */
  public static async getAllAuthors(): Promise<Author[]> {
    try {
      if (!AuthorUtils.authorCache) {
        AuthorUtils.authorCache = await getCollection("authors");
      }
      return AuthorUtils.authorCache;
    } catch (error) {
      console.error("Failed to fetch authors collection", error);
      throw new Error(
        `Authors collection retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Retrieves an author's data by slug with type safety
   * @param slug - Author's unique identifier
   * @returns Promise resolving to author data or null if not found
   */
  public static async getAuthorData(slug: string): Promise<AuthorData | null> {
    try {
      const author = await AuthorUtils.getAuthorEntry(slug);
      return author?.data || null;
    } catch (error) {
      console.error(`Failed to fetch author data for slug: ${slug}`, error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Maps author references to full author data with parallel processing
   * @param authors - Array of author references
   * @returns Promise resolving to array of resolved authors
   */
  public static async resolveAuthors(
    authors: ReadonlyArray<string | { collection: "authors"; id: string }>
  ): Promise<(Author | null)[]> {
    try {
      return await Promise.all(
        authors.map(author => AuthorUtils.getAuthorEntry(author))
      );
    } catch (error) {
      console.error("Failed to resolve authors", error);
      throw new Error(
        `Author resolution failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
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
