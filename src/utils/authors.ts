import { getCollection, getEntry } from "astro:content";

import { logger } from "./logger";
import type { Author } from "./types";

/**
 * Retrieves an author entry by slug or author reference with error handling
 * @param author - Author identifier (string slug or reference object)
 * @returns Promise resolving to Author entry or null if not found
 */
export async function getAuthorEntry(
  author: string | { collection: "authors"; id: string }
): Promise<Author | null> {
  try {
    const identifier = typeof author === "string" ? author : author.id;
    const entry = await getEntry("authors", identifier);
    return entry ?? null;
  } catch (err) {
    logger.error(
      "Failed to fetch author with identifier:",
      typeof author === "string" ? author : author.id,
      "Error:",
      err instanceof Error ? err.stack ?? err.message : String(err)
    );
    return null;
  }
}

/**
 * Retrieves all authors
 * @returns Promise resolving to array of all authors, or empty array if retrieval fails
 */
export async function getAllAuthors(): Promise<Author[]> {
  try {
    const result = await getCollection("authors");
    if (!Array.isArray(result)) {
      logger.error("Invalid authors collection format");
      return [];
    }
    return result;
  } catch (err) {
    logger.error(
      "Failed to fetch authors collection Error:",
      err instanceof Error ? err.stack ?? err.message : String(err)
    );
    return [];
  }
}

/**
 * Retrieves an author's data by slug with type safety
 * @param slug - Author's unique identifier
 * @returns Promise resolving to author data or null if not found
 */
export async function getAuthorData(
  slug: string
): Promise<Author["data"] | null> {
  const author = await getAuthorEntry(slug);
  return author?.data ?? null;
}

/**
 * Maps author references to full author data with parallel processing
 * @param authors - Array of author references
 * @returns Promise resolving to array of resolved authors
 */
export async function resolveAuthors(
  authors: ReadonlyArray<string | { collection: "authors"; id: string }>
): Promise<(Author | null)[]> {
  return Promise.all(authors.map(author => getAuthorEntry(author)));
}

export const getAuthorDisplayName = async (
  authorId: string
): Promise<string> => {
  // Try to get from content collection first
  const authorEntry = await getAuthorEntry(authorId);

  if (authorEntry?.data?.name) {
    return authorEntry.data.name;
  }

  // Fallback: Format the slug into a display name
  return formatAuthorName(authorId);
};

const formatAuthorName = (slug: string): string => {
  return slug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
