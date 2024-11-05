import { AuthorUtils } from "./authors";
import { PostUtils } from "./posts";
import { GlossaryUtils } from "./glossary";
import { FavoriteUtils } from "./favorites";

export * from "./types";

/**
 * Content Management System
 * Provides a unified interface for managing all content collections
 */
export class ContentManager {
  private static instance: ContentManager;

  public readonly authors = AuthorUtils;
  public readonly posts = PostUtils;
  public readonly glossary = GlossaryUtils;
  public readonly favorites = FavoriteUtils;

  private constructor() {}

  public static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }
}

// Export singleton instance
export const contentManager = ContentManager.getInstance();

// Export individual utilities for direct access
export { AuthorUtils, PostUtils, GlossaryUtils, FavoriteUtils };
