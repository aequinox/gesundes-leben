import { getCollection, getEntry } from "astro:content";
import { AuthorUtils } from "./authors";
import type { Glossary } from "./types";

/**
 * Glossary-related utility functions
 */
export class GlossaryUtils {
  /**
   * Sorts glossary entries by date (newest first)
   */
  public static sortByDate(entries: Glossary[]): Glossary[] {
    return [...entries].sort((a, b) => {
      const dateA = a.data.modDatetime ?? a.data.pubDatetime;
      const dateB = b.data.modDatetime ?? b.data.pubDatetime;
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Sorts glossary entries alphabetically by title
   */
  public static sortByTitle(entries: Glossary[]): Glossary[] {
    return [...entries].sort((a, b) => 
      a.data.title.localeCompare(b.data.title, undefined, { sensitivity: 'base' })
    );
  }

  /**
   * Retrieves all glossary entries with optional sorting
   */
  public static async getAllEntries(options: {
    sortBy?: 'date' | 'title';
  } = {}): Promise<Glossary[]> {
    const { sortBy = 'title' } = options;
    try {
      const entries = await getCollection('glossary');
      return sortBy === 'date' 
        ? GlossaryUtils.sortByDate(entries)
        : GlossaryUtils.sortByTitle(entries);
    } catch (error) {
      console.error('Error fetching glossary entries:', error);
      return [];
    }
  }

  /**
   * Retrieves a single glossary entry by slug
   */
  public static async getEntry(slug: string): Promise<Glossary | undefined | null> {
    try {
      const entry = await getEntry('glossary', slug);
      return entry || null;
    } catch (error) {
      console.error('Error fetching glossary entry:', error);
      return null;
    }
  }

  /**
   * Retrieves entries by author
   */
  public static async getEntriesByAuthor(authorSlug: string): Promise<Glossary[]> {
    const entries = await GlossaryUtils.getAllEntries();
    return entries.filter(async entry => {
      const entryAuthor = await AuthorUtils.getAuthorEntry(entry.data.author);
      return entryAuthor?.slug === authorSlug;
    });
  }

  /**
   * Searches glossary entries by title or content
   */
  public static async searchEntries(query: string): Promise<Glossary[]> {
    const entries = await GlossaryUtils.getAllEntries();
    const searchTerm = query.toLowerCase();
    
    return entries.filter(async entry => {
      const { title } = entry.data;
      const rendered = await entry.render();
      const content = rendered.toString().toLowerCase();
      
      return (
        title.toLowerCase().includes(searchTerm) ||
        content.includes(searchTerm)
      );
    });
  }

  /**
   * Groups entries by first letter of title
   */
  public static async getEntriesByAlphabet(): Promise<Record<string, Glossary[]>> {
    const entries = await GlossaryUtils.getAllEntries();
    const grouped: Record<string, Glossary[]> = {};

    entries.forEach(entry => {
      const firstLetter = entry.data.title.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(entry);
    });

    // Sort entries within each group
    Object.keys(grouped).forEach(letter => {
      grouped[letter] = GlossaryUtils.sortByTitle(grouped[letter]);
    });

    return grouped;
  }

  /**
   * Gets related entries based on title similarity
   */
  public static async getRelatedEntries(entry: Glossary, limit = 5): Promise<Glossary[]> {
    const allEntries = await GlossaryUtils.getAllEntries();
    const currentTitle = entry.data.title.toLowerCase();
    
    return allEntries
      .filter(e => e.id !== entry.id)
      .map(e => ({
        entry: e,
        similarity: GlossaryUtils.calculateSimilarity(currentTitle, e.data.title.toLowerCase())
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.entry);
  }

  /**
   * Calculates similarity between two strings using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

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
}
