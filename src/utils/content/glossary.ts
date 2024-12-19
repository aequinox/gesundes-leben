import { getCollection, getEntry } from "astro:content";
import { AuthorUtils } from "./authors";
import type { Glossary, ContentMetadata } from "./types";

/**
 * Custom error class for glossary-related operations
 */
class GlossaryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GlossaryError";
  }
}

/**
 * Sort options for glossary entries
 */
type SortOption = "date" | "title";

/**
 * @class GlossaryUtils
 * @description Utility class for managing glossary entries in the content system.
 * Provides methods for retrieving, sorting, filtering, and analyzing glossary entries
 * with robust error handling and type safety.
 */
export class GlossaryUtils {
  /**
   * Cache for storing glossary collection to minimize database hits
   * @private
   */
  private static glossaryCache: Glossary[] | null = null;

  /**
   * Minimum similarity threshold for related entries
   * @private
   */
  private static readonly SIMILARITY_THRESHOLD = 0.3;

  /**
   * Clears the glossary cache
   * @private
   */
  private static clearCache(): void {
    GlossaryUtils.glossaryCache = null;
  }

  /**
   * Sorts glossary entries by date (newest first)
   * @param entries - Array of entries to sort
   * @returns Sorted array of entries
   */
  public static sortByDate(entries: ReadonlyArray<Glossary>): Glossary[] {
    return [...entries].sort((a, b) => {
      const dateA = a.data.modDatetime ?? a.data.pubDatetime;
      const dateB = b.data.modDatetime ?? b.data.pubDatetime;
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Sorts glossary entries alphabetically by title
   * @param entries - Array of entries to sort
   * @returns Sorted array of entries
   */
  public static sortByTitle(entries: ReadonlyArray<Glossary>): Glossary[] {
    return [...entries].sort((a, b) =>
      a.data.title.localeCompare(b.data.title, undefined, {
        sensitivity: "base",
      })
    );
  }

  /**
   * Retrieves all glossary entries with optional sorting and caching
   * @param options - Optional configuration for sorting and caching
   * @returns Promise resolving to array of entries
   * @throws GlossaryError if retrieval fails
   */
  public static async getAllEntries(
    options: {
      sortBy?: SortOption;
      useCache?: boolean;
    } = {}
  ): Promise<Glossary[]> {
    const { sortBy = "title", useCache = true } = options;

    try {
      if (useCache && GlossaryUtils.glossaryCache) {
        const cached = GlossaryUtils.glossaryCache;
        return sortBy === "date"
          ? GlossaryUtils.sortByDate(cached)
          : GlossaryUtils.sortByTitle(cached);
      }

      const entries = await getCollection("glossary");
      if (useCache) {
        GlossaryUtils.glossaryCache = entries;
      }

      return sortBy === "date"
        ? GlossaryUtils.sortByDate(entries)
        : GlossaryUtils.sortByTitle(entries);
    } catch (error) {
      throw new GlossaryError("Failed to fetch glossary entries", error);
    }
  }

  /**
   * Retrieves a single glossary entry by slug
   * @param slug - Unique identifier for the entry
   * @returns Promise resolving to entry or null if not found
   * @throws GlossaryError if retrieval fails
   */
  public static async getEntry(slug: string): Promise<Glossary | null> {
    try {
      const entry = await getEntry("glossary", slug);
      return entry || null;
    } catch (error) {
      throw new GlossaryError(
        `Failed to fetch glossary entry with slug: ${slug}`,
        error
      );
    }
  }

  /**
   * Retrieves entries by author with proper error handling
   * @param authorSlug - Author's unique identifier
   * @returns Promise resolving to array of entries by the author
   */
  public static async getEntriesByAuthor(
    authorSlug: string
  ): Promise<Glossary[]> {
    try {
      const entries = await GlossaryUtils.getAllEntries();
      const filteredEntries = await Promise.all(
        entries.map(async entry => {
          const entryAuthor = await AuthorUtils.getAuthorEntry(
            entry.data.author
          );
          return entryAuthor?.slug === authorSlug ? entry : null;
        })
      );
      return filteredEntries.filter(
        (entry): entry is Glossary => entry !== null
      );
    } catch (error) {
      throw new GlossaryError(
        `Failed to fetch entries for author: ${authorSlug}`,
        error
      );
    }
  }

  /**
   * Searches glossary entries by title or content with improved error handling
   * @param query - Search term
   * @returns Promise resolving to array of matching entries
   */
  public static async searchEntries(query: string): Promise<Glossary[]> {
    try {
      const entries = await GlossaryUtils.getAllEntries();
      const searchTerm = query.toLowerCase();
      const results = await Promise.all(
        entries.map(async entry => {
          try {
            const { title } = entry.data;
            const rendered = await entry.render();
            const content = rendered.toString().toLowerCase();

            return title.toLowerCase().includes(searchTerm) ||
              content.includes(searchTerm)
              ? entry
              : null;
          } catch {
            return null; // Skip entries that fail to render
          }
        })
      );

      return results.filter((entry): entry is Glossary => entry !== null);
    } catch (error) {
      throw new GlossaryError(
        `Failed to search entries with query: ${query}`,
        error
      );
    }
  }

  /**
   * Groups entries by first letter of title with improved sorting
   * @returns Promise resolving to record of letters and their entries
   */
  public static async getEntriesByAlphabet(): Promise<
    Record<string, Glossary[]>
  > {
    try {
      const entries = await GlossaryUtils.getAllEntries();
      const grouped = entries.reduce(
        (acc: Record<string, Glossary[]>, entry) => {
          const firstLetter = entry.data.title.charAt(0).toUpperCase();
          (acc[firstLetter] = acc[firstLetter] || []).push(entry);
          return acc;
        },
        {}
      );

      // Sort entries within each group
      return Object.fromEntries(
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([letter, entries]) => [
            letter,
            GlossaryUtils.sortByTitle(entries),
          ])
      );
    } catch (error) {
      throw new GlossaryError("Failed to group entries by alphabet", error);
    }
  }

  /**
   * Gets related entries based on title similarity with improved filtering
   * @param entry - Reference entry to find related entries for
   * @param limit - Maximum number of related entries to return
   * @returns Promise resolving to array of related entries
   */
  public static async getRelatedEntries(
    entry: Glossary,
    limit = 5
  ): Promise<Glossary[]> {
    try {
      const allEntries = await GlossaryUtils.getAllEntries();
      const currentTitle = entry.data.title.toLowerCase();

      return allEntries
        .filter(e => e.id !== entry.id)
        .map(e => ({
          entry: e,
          similarity: GlossaryUtils.calculateSimilarity(
            currentTitle,
            e.data.title.toLowerCase()
          ),
        }))
        .filter(
          ({ similarity }) => similarity >= GlossaryUtils.SIMILARITY_THRESHOLD
        )
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => item.entry);
    } catch (error) {
      throw new GlossaryError(
        `Failed to get related entries for: ${entry.id}`,
        error
      );
    }
  }

  /**
   * Calculates similarity between two strings using Levenshtein distance
   * @param str1 - First string to compare
   * @param str2 - Second string to compare
   * @returns Similarity score between 0 and 1
   * @private
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }

  /**
   * Validates if a glossary entry exists
   * @param slug - Entry's unique identifier
   * @returns Promise resolving to boolean indicating existence
   */
  public static async entryExists(slug: string): Promise<boolean> {
    try {
      const entry = await GlossaryUtils.getEntry(slug);
      return entry !== null;
    } catch {
      return false;
    }
  }
}
