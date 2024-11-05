import { getCollection, getEntry } from "astro:content";
import type { Author, AuthorData } from "./types";

/**
 * Author-related utility functions
 */
export class AuthorUtils {
  /**
   * Retrieves an author entry by slug or author reference
   */
  public static async getAuthorEntry(author: string | { slug: string }): Promise<Author | undefined | null> {
    try {
      const slug = typeof author === 'string' ? author : author.slug;
      const entry = await getEntry('authors', slug);
      return entry || null;
    } catch (error) {
      console.error('Error fetching author:', error);
      return null;
    }
  }

  /**
   * Retrieves all authors
   */
  public static async getAllAuthors(): Promise<Author[]> {
    try {
      return await getCollection('authors');
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  /**
   * Retrieves an author's data by slug
   */
  public static async getAuthorData(slug: string): Promise<AuthorData | null> {
    const author = await AuthorUtils.getAuthorEntry(slug);
    return author ? author.data : null;
  }

  /**
   * Maps author references to full author data
   */
  public static async resolveAuthors(authors: (string | { slug: string })[]): Promise<(Author | null)[]> {
    const resolved = await Promise.all(
      authors.map(async author => {
        const entry = await AuthorUtils.getAuthorEntry(author);
        return entry || null;
      })
    );
    return resolved;
  }
}
