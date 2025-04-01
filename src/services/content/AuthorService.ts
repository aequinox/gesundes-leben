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
}

/**
 * Implementation of the author service
 */
export class AuthorService implements IAuthorService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Retrieve an author entry from the content collection
   */
  async getAuthorEntry(
    author: string | { collection: "authors"; id: string }
  ): Promise<CollectionEntry<"authors"> | null> {
    try {
      const authors = await this.getAllAuthors();

      const authorId = typeof author === "string" ? author : author.id;

      return authors.find(entry => entry.id === authorId) || null;
    } catch (error) {
      console.error("Error fetching author entry:", error);
      return null;
    }
  }

  /**
   * Get all authors from the content collection
   */
  async getAllAuthors(): Promise<CollectionEntry<"authors">[]> {
    try {
      return await getCollection("authors");
    } catch (error) {
      console.error("Error fetching authors:", error);
      return [];
    }
  }
}

// Export singleton instance for convenience
export const authorService = new AuthorService();

// For backward compatibility
export const getAuthorEntry = authorService.getAuthorEntry.bind(authorService);
