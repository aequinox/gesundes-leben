import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { ReferenceData } from "../../types/references";

/**
 * Custom error class for reference-related operations
 */
class ReferenceError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ReferenceError";
  }
}

/**
 * Type alias for Reference Collection Entry
 */
type ReferenceEntry = CollectionEntry<"references">;

/**
 * Utility class for managing academic references
 * Provides methods for retrieving, filtering, sorting, and grouping references
 * @class ReferenceUtils
 */
export class ReferenceUtils {
  // Cache for frequently accessed data
  private static referenceCache: ReferenceEntry[] | null = null;

  /**
   * Clears the reference cache
   * @private
   */
  private static clearCache(): void {
    ReferenceUtils.referenceCache = null;
  }

  /**
   * Retrieves all references with caching
   * @returns Promise<ReferenceEntry[]> Array of all references
   * @throws {ReferenceError} If there's an error fetching references
   */
  public static async getAllReferences(): Promise<ReferenceEntry[]> {
    try {
      if (!ReferenceUtils.referenceCache) {
        ReferenceUtils.referenceCache = await getCollection("references");
      }
      return ReferenceUtils.referenceCache;
    } catch (error) {
      throw new ReferenceError("Failed to fetch references", error);
    }
  }

  /**
   * Retrieves a single reference by its ID
   * @param id - The unique identifier for the reference
   * @returns Promise<ReferenceEntry | null> The found reference or null if not found
   * @throws {ReferenceError} If there's an error fetching the reference
   */
  public static async getReference(id: string): Promise<ReferenceEntry | null> {
    try {
      const reference = await getEntry("references", id);
      return reference || null;
    } catch (error) {
      throw new ReferenceError(
        `Failed to fetch reference with id: ${id}`,
        error
      );
    }
  }

  /**
   * Finds references related to a given reference based on multiple criteria
   * @param referenceOrId - Reference entry or ID to find related references for
   * @returns Promise<ReferenceEntry[]> Array of related references
   */
  public static async getRelatedReferences(
    referenceOrId: ReferenceEntry | string
  ): Promise<ReferenceEntry[]> {
    try {
      const reference =
        typeof referenceOrId === "string"
          ? await ReferenceUtils.getReference(referenceOrId)
          : referenceOrId;

      if (!reference) return [];

      const allReferences = await ReferenceUtils.getAllReferences();

      return allReferences.filter(ref => {
        if (ref.id === reference.id) return false;

        return (
          (reference.data.journal &&
            reference.data.journal === ref.data.journal) ||
          reference.data.year === ref.data.year ||
          (reference.data.volume &&
            reference.data.volume === ref.data.volume) ||
          ReferenceUtils.hasSharedAuthors(
            reference.data.authors,
            ref.data.authors
          )
        );
      });
    } catch (error) {
      throw new ReferenceError("Failed to fetch related references", error);
    }
  }

  /**
   * Checks if two author arrays share any authors (case-insensitive)
   * @private
   * @param authors1 - First array of authors
   * @param authors2 - Second array of authors
   * @returns boolean indicating if there are shared authors
   */
  private static hasSharedAuthors(
    authors1: ReadonlyArray<string>,
    authors2: ReadonlyArray<string>
  ): boolean {
    const normalizedAuthors1 = authors1.map((name: string) =>
      name.toLowerCase()
    );
    const normalizedAuthors2 = authors2.map((name: string) =>
      name.toLowerCase()
    );

    return normalizedAuthors1.some((name: string) =>
      normalizedAuthors2.includes(name)
    );
  }

  /**
   * Retrieves references by author name (case-insensitive partial match)
   * @param authorName - Name of the author to search for
   * @returns Promise<ReferenceEntry[]> Array of references by the author
   */
  public static async getReferencesByAuthor(
    authorName: string
  ): Promise<ReferenceEntry[]> {
    const references = await ReferenceUtils.getAllReferences();
    const searchName = authorName.toLowerCase();

    return references.filter(reference =>
      reference.data.authors.some((author: string) =>
        author.toLowerCase().includes(searchName)
      )
    );
  }

  /**
   * Groups references by year in descending order
   * @returns Promise<Record<number, ReferenceEntry[]>> Object with years as keys and reference arrays as values
   */
  public static async groupReferencesByYear(): Promise<
    Record<number, ReferenceEntry[]>
  > {
    const references = await ReferenceUtils.getAllReferences();
    const grouped = references.reduce(
      (acc: Record<number, ReferenceEntry[]>, ref) => {
        const year = ref.data.year;
        (acc[year] = acc[year] || []).push(ref);
        return acc;
      },
      {}
    );

    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a))
    );
  }

  /**
   * Groups references by journal alphabetically
   * @returns Promise<Record<string, ReferenceEntry[]>> Object with journals as keys and reference arrays as values
   */
  public static async groupReferencesByJournal(): Promise<
    Record<string, ReferenceEntry[]>
  > {
    const references = await ReferenceUtils.getAllReferences();
    const grouped = references.reduce(
      (acc: Record<string, ReferenceEntry[]>, ref) => {
        const journal = ref.data.journal || "Uncategorized";
        (acc[journal] = acc[journal] || []).push(ref);
        return acc;
      },
      {}
    );

    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  /**
   * Searches references across multiple fields
   * @param query - Search term
   * @returns Promise<ReferenceEntry[]> Array of matching references
   */
  public static async searchReferences(
    query: string
  ): Promise<ReferenceEntry[]> {
    const references = await ReferenceUtils.getAllReferences();
    const searchTerm = query.toLowerCase();

    return references.filter(reference => {
      const { title, authors, journal, keywords } = reference.data;
      return (
        title.toLowerCase().includes(searchTerm) ||
        authors.some((author: string) =>
          author.toLowerCase().includes(searchTerm)
        ) ||
        journal?.toLowerCase().includes(searchTerm) ||
        keywords?.some((keyword: string) =>
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    });
  }

  /**
   * Sorts references by specified criteria
   * @param references - Array of references to sort
   * @param criteria - 'year' | 'title'
   * @param order - 'asc' | 'desc'
   * @returns ReferenceEntry[] Sorted array of references
   */
  public static sortReferences(
    references: ReadonlyArray<ReferenceEntry>,
    criteria: "year" | "title" = "year",
    order: "asc" | "desc" = "desc"
  ): ReferenceEntry[] {
    const sortFunctions = {
      year: (a: ReferenceEntry, b: ReferenceEntry) => b.data.year - a.data.year,
      title: (a: ReferenceEntry, b: ReferenceEntry) =>
        a.data.title.localeCompare(b.data.title, undefined, {
          sensitivity: "base",
        }),
    };

    const sorted = [...references].sort(sortFunctions[criteria]);
    return order === "desc" ? sorted : sorted.reverse();
  }

  /**
   * Gets the most recent references
   * @param limit - Maximum number of references to return
   * @returns Promise<ReferenceEntry[]> Array of most recent references
   */
  public static async getRecentReferences(
    limit: number = 5
  ): Promise<ReferenceEntry[]> {
    const references = await ReferenceUtils.getAllReferences();
    return ReferenceUtils.sortReferences(references, "year", "desc").slice(
      0,
      limit
    );
  }

  /**
   * Gets references for a specific volume and optional issue
   * @param volume - Volume number
   * @param issue - Optional issue number
   * @returns Promise<ReferenceEntry[]> Array of matching references
   */
  public static async getReferencesByVolumeAndIssue(
    volume: number,
    issue?: number
  ): Promise<ReferenceEntry[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(
      reference =>
        reference.data.volume === volume &&
        (!issue || reference.data.issue === issue)
    );
  }

  /**
   * Gets references with URLs
   * @returns Promise<ReferenceEntry[]> Array of references with URLs
   */
  public static async getReferencesWithUrls(): Promise<ReferenceEntry[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(reference => reference.data.url);
  }
}
