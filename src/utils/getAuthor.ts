/**
 * @module getAuthor
 * @description
 * Utility module for retrieving author information from the content collection.
 * Provides error handling and type-safe author retrieval using new core utilities.
 */

import { contentManager } from "./content";
import { handleAsync } from "@/core/errors/handleAsync";
import type { CollectionEntry } from "astro:content";

/**
 * Retrieves an author entry from the content collection.
 * Handles both string IDs and reference objects with improved error handling.
 *
 * @param author - Author identifier (string ID or reference object)
 * @returns Promise resolving to author entry or null if not found
 */
export const getAuthorEntry = async (
  author: string | { collection: "authors"; id: string }
): Promise<CollectionEntry<"authors"> | null> => {
  return handleAsync(async () => {
    try {
      // Attempt to retrieve the author
      const authorEntry = await contentManager.authors.getAuthorEntry(author);

      // Return the author entry or null if not found
      return authorEntry ?? null;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error fetching author entry:", error);

      // Return null for any errors
      return null;
    }
  });
};

/**
 * Retrieves multiple author entries based on an array of IDs
 *
 * @param authorIds - Array of author identifiers
 * @returns Promise resolving to an array of author entries
 */
export const getAuthorEntries = async (
  authorIds: (string | { collection: "authors"; id: string })[]
): Promise<CollectionEntry<"authors">[]> => {
  return handleAsync(async () => {
    const authorPromises = authorIds.map(getAuthorEntry);
    const authors = await Promise.all(authorPromises);

    // Filter out any null entries
    return authors.filter(
      (author): author is CollectionEntry<"authors"> => author !== null
    );
  });
};
