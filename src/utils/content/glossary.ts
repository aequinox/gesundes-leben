import { getCollection, getEntry } from "astro:content";
import type { Glossary } from "./types";

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
   * Common words to exclude when comparing titles
   * @private
   */
  private static readonly COMMON_WORDS = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

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
      const getDateValue = (entry: Glossary) => {
        const pubDate = new Date(entry.data.pubDatetime).getTime();
        const modDate = entry.data.modDatetime
          ? new Date(entry.data.modDatetime).getTime()
          : 0;
        return Math.max(pubDate, modDate);
      };
      return getDateValue(b) - getDateValue(a);
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

      if (!useCache) {
        GlossaryUtils.clearCache();
      }

      const result = await getCollection("glossary");
      if (!result || !Array.isArray(result)) {
        console.error("Invalid glossary collection format");
        return [];
      }

      if (useCache) {
        GlossaryUtils.glossaryCache = result;
      }

      return sortBy === "date"
        ? GlossaryUtils.sortByDate(result)
        : GlossaryUtils.sortByTitle(result);
    } catch (error) {
      if (!useCache) {
        GlossaryUtils.clearCache();
      }
      console.error("Failed to fetch glossary entries", error);
      return [];
    }
  }

  /**
   * Retrieves a single glossary entry by slug
   * @param slug - Unique identifier for the entry
   * @returns Promise resolving to entry or null
   */
  public static async getEntry(slug: string): Promise<Glossary | null> {
    try {
      const entry = await getEntry("glossary", slug);
      return entry || null;
    } catch (error) {
      console.error(`Failed to fetch glossary entry with slug: ${slug}`, error);
      return null;
    }
  }

  /**
   * Gets related entries based on shared significant words in titles
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
      const otherEntries = allEntries.filter(e => e.id !== entry.id);

      const referenceWords = GlossaryUtils.getSignificantWords(
        entry.data.title
      );
      if (referenceWords.size === 0) return [];

      const scoredEntries = otherEntries.map(e => ({
        entry: e,
        score: GlossaryUtils.calculateRelevanceScore(
          referenceWords,
          GlossaryUtils.getSignificantWords(e.data.title)
        ),
      }));

      return scoredEntries
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ entry }) => entry);
    } catch (error) {
      console.error(`Failed to get related entries for: ${entry.id}`, error);
      return [];
    }
  }

  /**
   * Extracts significant words from a title
   * @param title - Title to process
   * @returns Set of significant words
   * @private
   */
  private static getSignificantWords(title: string): Set<string> {
    return new Set(
      title
        .toLowerCase()
        .split(/[\s-]+/)
        .map(word => word.replace(/[^\w\s]/g, ""))
        .filter(
          word =>
            word.length > 1 &&
            !GlossaryUtils.COMMON_WORDS.has(word) &&
            !/^\d+$/.test(word)
        )
    );
  }

  /**
   * Calculates relevance score between two sets of words
   * @param referenceWords - Words from reference title
   * @param compareWords - Words to compare against
   * @returns Relevance score (0-1)
   * @private
   */
  private static calculateRelevanceScore(
    referenceWords: Set<string>,
    compareWords: Set<string>
  ): number {
    // Convert sets to arrays for easier manipulation
    const refArray = [...referenceWords];
    const compareArray = [...compareWords];

    // Calculate matching words and their positions
    const matches = refArray.filter(word => compareArray.includes(word));

    if (matches.length === 0) return 0;

    // Calculate base score from number of matches
    const baseScore = matches.length / refArray.length;

    // Add position bonus for words that appear earlier in the title
    const positionBonus =
      matches.reduce((sum, word) => {
        const refPosition = refArray.indexOf(word);
        return sum + 1 / (refPosition + 1);
      }, 0) / matches.length;

    // Combine scores with position bonus having less weight
    return baseScore * 0.8 + positionBonus * 0.2;
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
