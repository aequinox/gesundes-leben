/**
 * @module getAuthor
 * @description
 * Utility module for retrieving author information from the content collection.
 * Provides error handling and type-safe author retrieval.
 *
 * @example
 * ```typescript
 * import { getAuthorEntry } from './utils/getAuthor';
 *
 * // Using string ID
 * const author = await getAuthorEntry('john-doe');
 *
 * // Using reference object
 * const author = await getAuthorEntry({
 *   collection: 'authors',
 *   id: 'john-doe'
 * });
 * ```
 */

import { contentManager } from "./content";
import { handleAsync } from "./core/errors";

/**
 * Retrieves an author entry from the content collection.
 * Handles both string IDs and reference objects.
 *
 * @param author - Author identifier (string ID or reference object)
 * @returns Promise resolving to author entry or null if not found
 *
 * @example
 * ```typescript
 * // Basic usage
 * const author = await getAuthorEntry('john-doe');
 * if (author) {
 *   console.log(author.data.name);
 * }
 *
 * // Error handling
 * const author = await getAuthorEntry('invalid-id');
 * if (!author) {
 *   console.log('Author not found');
 * }
 * ```
 */
export const getAuthorEntry = async (
  author: string | { collection: "authors"; id: string }
) => {
  return handleAsync(async () => {
    try {
      return await contentManager.authors.getAuthorEntry(author);
    } catch (error) {
      console.error("Error fetching author entry:", error);
      return null;
    }
  });
};
