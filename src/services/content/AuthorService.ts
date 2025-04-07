/**
 * @module AuthorService
 * @description
 * Service for retrieving author information from the content collection.
 * Provides error handling and type-safe author retrieval.
 */

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Interface for author service operations
 */
export interface IAuthorService {
  /**
   * Retrieve an author entry from the content collection
   */
  getAuthorEntry(
    author: string | { collection: "authors"; id: string }
  ): Promise<CollectionEntry<"authors"> | null>;

  /**
   * Get all authors from the content collection
   */
  getAllAuthors(): Promise<CollectionEntry<"authors">[]>;

  /**
   * Get display name for an author, either from the content collection or by formatting the slug
   */
  getAuthorDisplayName(authorId: string): Promise<string>;
}

/**
 * Implementation of the author service
 */
export class AuthorService implements IAuthorService {
  private authorCache: Map<string, CollectionEntry<"authors"> | null> =
    new Map();

  constructor(private config: IConfigService = configService) {}

  /**
   * Retrieve an author entry from the content collection with improved error handling
   */
  async getAuthorEntry(
    author: string | { collection: "authors"; id: string }
  ): Promise<CollectionEntry<"authors"> | null> {
    try {
      const authorId = typeof author === "string" ? author : author.id;

      // Check cache first
      if (this.authorCache.has(authorId)) {
        return this.authorCache.get(authorId) || null;
      }

      const authors = await this.getAllAuthors();

      // Normalize IDs for comparison (remove file extensions if present)
      const normalizedAuthorId = this.normalizeAuthorId(authorId);

      // Find author by normalized ID
      const authorEntry =
        authors.find(
          entry => this.normalizeAuthorId(entry.id) === normalizedAuthorId
        ) || null;

      // Cache the result
      this.authorCache.set(authorId, authorEntry);

      return authorEntry;
    } catch (error) {
      console.error(`Error fetching author entry for "${author}":`, error);
      return null;
    }
  }

  /**
   * Get display name for an author, either from the content collection or by formatting the slug
   */
  async getAuthorDisplayName(authorId: string): Promise<string> {
    // Try to get from content collection first
    const authorEntry = await this.getAuthorEntry(authorId);

    if (authorEntry?.data?.name) {
      return authorEntry.data.name;
    }

    // Fallback: Format the slug into a display name
    return this.formatAuthorName(authorId);
  }

  /**
   * Get all authors from the content collection
   */
  async getAllAuthors(): Promise<CollectionEntry<"authors">[]> {
    try {
      return await getCollection("authors");
    } catch (error) {
      console.error("Error fetching authors collection:", error);
      return [];
    }
  }

  /**
   * Normalize author ID by removing file extension if present
   */
  private normalizeAuthorId(id: string): string {
    return id.replace(/\.(md|mdx)$/, "");
  }

  /**
   * Format author slug into a display name
   * Converts "kai-renner" to "Kai Renner"
   */
  private formatAuthorName(slug: string): string {
    return slug
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}

// Export singleton instance for convenience
export const authorService = new AuthorService();

// For backward compatibility
export const getAuthorEntry = authorService.getAuthorEntry.bind(authorService);
