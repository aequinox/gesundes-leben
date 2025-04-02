/**
 * @module FrontmatterService
 * @description
 * Service for managing blog post frontmatter with operations for validation,
 * transformation, and standardization. Follows SOLID principles and provides
 * a consistent API for frontmatter operations throughout the application.
 */

import { v4 as uuidv4 } from "uuid";
import { parse, stringify } from "yaml";
import { GROUPS, type Category, CATEGORIES } from "@/data/taxonomies";
import { slugService } from "@/services/format/SlugService";
import { dateService } from "@/services/format/DateService";
import { handleAsync } from "@/core/errors/handleAsync";
import { ApplicationError, ErrorCode } from "@/core/errors/ApplicationError";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/** Type representing valid group values from GROUPS constant */
type Group = (typeof GROUPS)[number];

/** Interface for managing favorite entries in blog posts */
interface Favorites {
  [key: string]: string;
}

/**
 * Interface defining the structure of blog post frontmatter
 * Includes both required and optional fields for maximum flexibility
 */
export interface BlogFrontmatter extends Record<string, unknown> {
  id?: string;
  title: string;
  author?: string;
  slug?: string;
  description?: string;
  heroImage?: {
    src: string;
    alt: string;
  };
  coverImage?: string;
  pubDatetime?: string;
  modDatetime?: string;
  date?: string;
  draft?: boolean;
  featured?: boolean;
  group?: Group;
  categories?: Category[];
  tags?: string[];
  favorites?: Favorites;
  readingTime?: number;
}

/**
 * Interface for frontmatter service operations
 */
export interface IFrontmatterService {
  /**
   * Transform blog frontmatter to ensure consistent structure
   */
  transformBlogFrontmatter(
    frontmatter: BlogFrontmatter,
    content: string
  ): Promise<BlogFrontmatter>;

  /**
   * Generate a description from content
   */
  generateDescription(content: string): Promise<string>;

  /**
   * Validate and normalize a category name
   */
  validateCategory(category: string): Category | undefined;

  /**
   * Capitalize the first letter of a string
   */
  capitalizeFirstLetter(str: string): string;
}

/**
 * Implementation of the frontmatter service
 */
export class FrontmatterService implements IFrontmatterService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Generate a description for blog posts by extracting and processing content
   *
   * @param content - The full content of the blog post including frontmatter
   * @returns A promise resolving to a generated description string
   * @todo Implement ChatGPT integration for more intelligent description generation
   */
  async generateDescription(content: string): Promise<string> {
    return handleAsync(async () => {
      try {
        // TODO: Implement ChatGPT integration
        // For now, return first 150 characters of content as description
        const plainText = content
          .replace(/---[\s\S]*?---/, "") // Remove frontmatter
          .replace(/[#*`]/g, "") // Remove markdown syntax
          .replace(/\n/g, " ") // Replace newlines with spaces
          .trim();
        return plainText.slice(0, 150) + "...";
      } catch (error) {
        throw new ApplicationError(
          "Failed to generate description",
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }

  /**
   * Utility function to capitalize the first letter of a string
   * Used for normalizing category names
   *
   * @param str - Input string to capitalize
   * @returns String with first letter capitalized
   */
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Validates and normalizes category names against predefined list
   *
   * @param category - Category string to validate
   * @returns Valid Category type or undefined if invalid
   */
  validateCategory(category: string): Category | undefined {
    const normalizedCategory = this.capitalizeFirstLetter(category);
    return CATEGORIES.find(c => c === normalizedCategory);
  }

  /**
   * Transforms blog post frontmatter to ensure consistent structure and required fields
   *
   * Key transformations:
   * - Generates missing IDs using UUID
   * - Creates URL-friendly slugs from titles
   * - Validates and normalizes categories
   * - Converts date formats to ISO strings
   * - Sets default values for required fields
   *
   * @param frontmatter - Original frontmatter object
   * @param content - Full blog post content
   * @returns Transformed frontmatter object
   */
  async transformBlogFrontmatter(
    frontmatter: BlogFrontmatter,
    content: string
  ): Promise<BlogFrontmatter> {
    return handleAsync(async () => {
      try {
        // Process categories
        const rawCategories = Array.isArray(frontmatter.categories)
          ? frontmatter.categories
          : frontmatter.categories
            ? [frontmatter.categories]
            : [];

        const validCategories = rawCategories
          .map(cat => this.validateCategory(cat))
          .filter((cat): cat is Category => cat !== undefined);

        // Process tags
        const tags = Array.isArray(frontmatter.tags)
          ? frontmatter.tags
          : frontmatter.tags
            ? [frontmatter.tags]
            : [];

        // Generate slug from title
        const slug =
          frontmatter.slug || slugService.slugifyStr(frontmatter.title);

        // Process dates
        const dateString = frontmatter.date || new Date().toISOString();
        const pubDatetime = new Date(dateString).toISOString();
        const modDatetime = frontmatter.modDatetime
          ? new Date(frontmatter.modDatetime).toISOString()
          : pubDatetime;

        // Create hero image from cover image if available
        const heroImage = frontmatter.coverImage
          ? {
              src: `./images/${frontmatter.coverImage}`,
              alt: frontmatter.title,
            }
          : frontmatter.heroImage;

        // Generate description
        const description =
          frontmatter.description || (await this.generateDescription(content));

        const transformed: BlogFrontmatter = {
          id: frontmatter.id || uuidv4(),
          title: frontmatter.title,
          author: frontmatter.author || "sandra-pfeiffer",
          slug,
          description,
          heroImage,
          pubDatetime,
          modDatetime,
          draft: frontmatter.draft !== false, // Default to true
          featured: frontmatter.featured || false,
          group: frontmatter.group || "fragezeiten",
          categories: validCategories,
          tags,
          favorites: frontmatter.favorites || {},
        };

        // Remove old fields
        delete transformed.coverImage;
        delete transformed.date;

        return transformed;
      } catch (error) {
        throw new ApplicationError(
          "Failed to transform frontmatter",
          ErrorCode.SYSTEM_ERROR,
          { originalError: error }
        );
      }
    });
  }
}

// Export singleton instance for convenience
export const frontmatterService = new FrontmatterService();
