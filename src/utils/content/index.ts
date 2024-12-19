import { AuthorUtils } from "./authors";
import { PostUtils } from "./posts";
import { GlossaryUtils } from "./glossary";
import { FavoriteUtils } from "./favorites";
import { ReferenceUtils } from "./references";

// Re-export all types for convenience
export * from "./types";

/**
 * Interface defining the structure of the content management system
 */
interface IContentManager {
  readonly authors: typeof AuthorUtils;
  readonly posts: typeof PostUtils;
  readonly glossary: typeof GlossaryUtils;
  readonly favorites: typeof FavoriteUtils;
  readonly references: typeof ReferenceUtils;
}

/**
 * Helper class for thread-safe singleton implementation
 * @private
 */
class AsyncLock {
  /**
   * Map to track locks by key
   * @private
   */
  private locks: Map<string, boolean> = new Map();

  /**
   * Acquires a lock for a given key and executes a callback
   * @param key - Unique identifier for the lock
   * @param callback - Function to execute while holding the lock
   */
  public acquire(key: string, callback: () => void): void {
    if (this.locks.get(key)) {
      return;
    }

    this.locks.set(key, true);
    try {
      callback();
    } finally {
      this.locks.set(key, false);
    }
  }
}

/**
 * @class ContentManager
 * @description Singleton class providing a unified interface for managing all content collections.
 * Implements the thread-safe singleton pattern and provides type-safe access to all content utilities.
 *
 * @example
 * ```typescript
 * // Get singleton instance
 * const cms = ContentManager.getInstance();
 *
 * // Access utilities
 * const authors = await cms.authors.getAllAuthors();
 * const posts = await cms.posts.getAllPosts();
 * ```
 */
export class ContentManager implements IContentManager {
  /**
   * Singleton instance of the ContentManager
   * @private
   */
  private static instance: ContentManager;

  /**
   * Lock for thread-safe singleton instantiation
   * @private
   */
  private static readonly lock = new AsyncLock();

  public readonly authors = AuthorUtils;
  public readonly posts = PostUtils;
  public readonly glossary = GlossaryUtils;
  public readonly favorites = FavoriteUtils;
  public readonly references = ReferenceUtils;

  /**
   * Private constructor to prevent direct instantiation
   * @private
   */
  private constructor() {
    // Freeze the instance to prevent modification
    Object.freeze(this);
  }

  /**
   * Gets the singleton instance of ContentManager in a thread-safe way
   * @returns The singleton instance
   */
  public static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.lock.acquire("singleton", () => {
        if (!ContentManager.instance) {
          ContentManager.instance = new ContentManager();
        }
      });
    }
    return ContentManager.instance;
  }

  /**
   * Resets the singleton instance (mainly for testing purposes)
   * @private
   */
  private static resetInstance(): void {
    ContentManager.instance = new ContentManager();
  }
}

// Export the singleton instance
export const contentManager = ContentManager.getInstance();

// Export individual utilities for direct access when singleton pattern isn't needed
export { AuthorUtils, PostUtils, GlossaryUtils, FavoriteUtils, ReferenceUtils };
