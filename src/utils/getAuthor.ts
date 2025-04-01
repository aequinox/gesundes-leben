/**
 * @module getAuthor
 * @description
 * Utility module for retrieving author information from the content collection.
 * Provides error handling and type-safe author retrieval using new core utilities.
 */

import { contentManager } from "./content";
import { handleAsync } from "@/core/errors/handleAsync";
import { ContentError, ErrorCode } from "@/core/errors/ApplicationError";
import type { CollectionEntry } from "astro:content";

/**
 * Retrieves an author entry from the content collection.
 * Handles both string IDs and reference objects with improved error handling.
 *
 * @param author - Author identifier (string ID or reference object)
 * @returns Promise resolving to author entry or null if not found
 *
 * @throws {ContentError} If author retrieval fails
 */
export const getAuthorEntry = async (
  author: string | { collection: "authors"; id: string }
): Promise<CollectionEntry<"authors"> | null> => {
  return handleAsync(async () => {
    try {
      // Determine the author ID
      const authorId = typeof author === "string" ? author : author.id;

      // Attempt to retrieve the author
      const authorEntry = await contentManager.authors.getAuthorEntry(authorId);

      // If no author found, throw a specific content error
      if (!authorEntry) {
        throw new ContentError(
          `Author with ID '${authorId}' not found`,
          ErrorCode.NOT_FOUND,
          { authorId }
        );
      }

      return authorEntry;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error fetching author entry:", error);

      // If it's already a ContentError, rethrow
      if (error instanceof ContentError) {
        throw error;
      }

      // Wrap other errors in a ContentError
      throw new ContentError(
        "Failed to retrieve author entry",
        ErrorCode.SYSTEM_ERROR,
        {
          originalError: error instanceof Error ? error.message : String(error),
          author,
        }
      );
    }
  });
};

/**
 * Retrieves multiple author entries based on an array of IDs
 *
 * @param authorIds - Array of author identifiers
 * @returns Promise resolving to an array of author entries
 *
 * @throws {ContentError} If any author retrieval fails
 */
export const getAuthorEntries = async (
  authorIds: (string | { collection: "authors"; id: string })[]
): Promise<CollectionEntry<"authors">[]> => {
  return handleAsync(async () => {
    const authorPromises = authorIds.map(getAuthorEntry);
    const authors = await Promise.all(authorPromises);

    // Filter out any null entries (though this shouldn't happen due to error throwing)
    return authors.filter(
      (author): author is CollectionEntry<"authors"> => author !== null
    );
  });
};
