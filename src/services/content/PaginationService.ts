/**
 * @module PaginationService
 * @description
 * Service for handling content pagination with type safety and flexibility.
 * Provides pagination metadata and paginated content slicing with proper validation.
 */

import { SITE } from "@/config";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Properties required for pagination generation
 */
export interface PaginationProps<T> {
  posts: T[];
  page: string | number;
  isIndex?: boolean;
}

/**
 * Result of pagination generation
 */
export interface PaginationResult<T> {
  totalPages: number;
  currentPage: number;
  paginatedPosts: T[];
}

/**
 * Interface for pagination service operations
 */
export interface IPaginationService {
  /**
   * Generate pagination metadata and paginated posts
   */
  generatePagination<T extends { id: string | number }>(
    props: PaginationProps<T>
  ): PaginationResult<T>;

  /**
   * Calculate page numbers based on total number of posts
   */
  calculatePageNumbers(numberOfPosts: number): number[];
}

/**
 * Implementation of the pagination service
 */
export class PaginationService implements IPaginationService {
  constructor(private config: IConfigService = configService) {}

  /**
   * Generate pagination metadata and paginated posts
   */
  generatePagination<T extends { id: string | number }>({
    posts,
    page,
    isIndex = false,
  }: PaginationProps<T>): PaginationResult<T> {
    const postsPerPage = this.config.get<number>(
      "postPerPage",
      SITE.postPerPage
    );
    const totalPages = Math.ceil(posts.length / postsPerPage);
    const currentPage = isIndex ? 1 : Number(page) || 1;

    // Ensure currentPage is within valid range
    const validatedPage = Math.max(1, Math.min(currentPage, totalPages));

    const startPost = (validatedPage - 1) * postsPerPage;
    const endPost = startPost + postsPerPage;
    const paginatedPosts = posts.slice(startPost, endPost);

    return {
      totalPages,
      currentPage: validatedPage,
      paginatedPosts,
    };
  }

  /**
   * Calculate page numbers based on total number of posts
   */
  calculatePageNumbers(numberOfPosts: number): number[] {
    if (numberOfPosts < 0) {
      throw new Error("Number of posts cannot be negative");
    }

    const postsPerPage = this.config.get<number>(
      "postPerPage",
      SITE.postPerPage
    );
    const numberOfPages = Math.ceil(numberOfPosts / postsPerPage);

    // Create an array from 1 to numberOfPages
    return Array.from({ length: numberOfPages }, (_, index) => index + 1);
  }
}

// Export singleton instance for convenience
export const paginationService = new PaginationService();
