import { getCollection, getEntry } from "astro:content";
import type { Reference } from "./types";

/**
 * References-related utility functions
 */
export class ReferenceUtils {
  /**
   * Retrieves a reference entry by slug
   */
  public static async getReference(
    slug: string
  ): Promise<Reference | undefined | null> {
    try {
      const reference = await getEntry("references", slug);
      return reference || null;
    } catch (error) {
      console.error("Error fetching reference:", error);
      return null;
    }
  }

  /**
   * Retrieves all references
   */
  public static async getAllReferences(): Promise<Reference[]> {
    try {
      return await getCollection("references");
    } catch (error) {
      console.error("Error fetching references:", error);
      return [];
    }
  }

  /**
   * Retrieves all references related to a given reference or slug
   * References are considered related if they:
   * - Share the same journal
   * - Share at least one author
   * - Are from the same year
   * - Have the same volume
   */
  public static async getReferencesEntries(
    referenceOrSlug: Reference | string
  ): Promise<Reference[]> {
    try {
      // Get the reference if a slug was provided
      const reference =
        typeof referenceOrSlug === "string"
          ? await ReferenceUtils.getReference(referenceOrSlug)
          : referenceOrSlug;

      if (!reference) {
        return [];
      }

      const allReferences = await ReferenceUtils.getAllReferences();

      // Filter out the current reference and find related ones
      return allReferences.filter(ref => {
        if (ref.id === reference.id) return false;

        const { data } = reference;
        const refData = ref.data;

        // Check if references share any characteristics
        const sameJournal = data.journal && data.journal === refData.journal;
        const sameYear = data.year === refData.year;
        const sameVolume = data.volume && data.volume === refData.volume;
        const sharedAuthors = data.authors.some(author =>
          refData.authors.includes(author)
        );

        return sameJournal || sameYear || sameVolume || sharedAuthors;
      });
    } catch (error) {
      console.error("Error fetching related references:", error);
      return [];
    }
  }

  /**
   * Retrieves references by author
   */
  public static async getReferencesByAuthor(
    authorName: string
  ): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    const searchName = authorName.toLowerCase();
    return references.filter(reference =>
      reference.data.authors.some(author =>
        author.toLowerCase().includes(searchName)
      )
    );
  }

  /**
   * Retrieves references by year
   */
  public static async getReferencesByYear(year: number): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(reference => reference.data.year === year);
  }

  /**
   * Retrieves references by journal
   */
  public static async getReferencesByJournal(
    journal: string
  ): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    const searchJournal = journal.toLowerCase();
    return references.filter(reference =>
      reference.data.journal?.toLowerCase().includes(searchJournal)
    );
  }

  /**
   * Retrieves references by volume
   */
  public static async getReferencesByVolume(
    volume: number
  ): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(reference => reference.data.volume === volume);
  }

  /**
   * Groups references by year
   */
  public static async getReferencesByYears(): Promise<
    Record<number, Reference[]>
  > {
    const references = await ReferenceUtils.getAllReferences();
    const grouped: Record<number, Reference[]> = {};

    references.forEach(reference => {
      const year = reference.data.year;
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(reference);
    });

    // Sort years in descending order
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a))
    );
  }

  /**
   * Groups references by journal
   */
  public static async getReferencesByJournals(): Promise<
    Record<string, Reference[]>
  > {
    const references = await ReferenceUtils.getAllReferences();
    const grouped: Record<string, Reference[]> = {};

    references.forEach(reference => {
      const journal = reference.data.journal || "Uncategorized";
      if (!grouped[journal]) {
        grouped[journal] = [];
      }
      grouped[journal].push(reference);
    });

    // Sort journals alphabetically
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  /**
   * Searches references by title, author, or journal
   */
  public static async searchReferences(query: string): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    const searchTerm = query.toLowerCase();

    return references.filter(reference => {
      const { title, authors, journal } = reference.data;
      return (
        title.toLowerCase().includes(searchTerm) ||
        authors.some(author => author.toLowerCase().includes(searchTerm)) ||
        journal?.toLowerCase().includes(searchTerm)
      );
    });
  }

  /**
   * Sorts references by year (newest first)
   */
  public static sortByYear(references: Reference[]): Reference[] {
    return [...references].sort((a, b) => b.data.year - a.data.year);
  }

  /**
   * Sorts references by title
   */
  public static sortByTitle(references: Reference[]): Reference[] {
    return [...references].sort((a, b) =>
      a.data.title.localeCompare(b.data.title, undefined, {
        sensitivity: "base",
      })
    );
  }

  /**
   * Gets references with URLs
   */
  public static async getReferencesWithUrls(): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(reference => reference.data.url);
  }

  /**
   * Gets references for a specific volume and issue
   */
  public static async getReferencesByVolumeAndIssue(
    volume: number,
    issue?: number
  ): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    return references.filter(
      reference =>
        reference.data.volume === volume &&
        (!issue || reference.data.issue === issue)
    );
  }

  /**
   * Gets the most recent references
   */
  public static async getRecentReferences(
    limit: number = 5
  ): Promise<Reference[]> {
    const references = await ReferenceUtils.getAllReferences();
    return ReferenceUtils.sortByYear(references).slice(0, limit);
  }
}
