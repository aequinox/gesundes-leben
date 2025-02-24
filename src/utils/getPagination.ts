/**
 * @module getPagination
 * @description
 * Utility module for handling content pagination with type safety and flexibility.
 * Provides pagination metadata and paginated content slicing with proper validation.
 *
 * @example
 * ```typescript
 * import generatePagination from './utils/getPagination';
 *
 * const result = generatePagination({
 *   posts: allPosts,
 *   page: '2',
 *   isIndex: false
 * });
 * // Returns: { totalPages: 5, currentPage: 2, paginatedPosts: [...] }
 * ```
 */

import { SITE } from "@/config";

/**
 * Properties required for pagination generation.
 *
 * @typeParam T - Type of items being paginated (must have an id property)
 * @property posts - Array of items to paginate
 * @property page - Current page number (string or number)
 * @property isIndex - Whether this is the index/home page
 */
export interface PaginationProps<T> {
  posts: T[];
  page: string | number;
  isIndex?: boolean;
}

/**
 * Result of pagination generation containing metadata and paginated content.
 *
 * @typeParam T - Type of items being paginated
 * @property totalPages - Total number of pages
 * @property currentPage - Current page number (validated)
 * @property paginatedPosts - Slice of posts for current page
 */
export interface PaginationResult<T> {
  totalPages: number;
  currentPage: number;
  paginatedPosts: T[];
}

/**
 * Generates pagination metadata and paginated posts.
 * Handles page validation, boundary checking, and content slicing.
 *
 * @typeParam T - Type of items being paginated (must have an id property)
 * @param props - Pagination properties including posts and page number
 * @returns Pagination metadata and paginated content
 *
 * @example
 * ```typescript
 * // For blog posts
 * const { totalPages, currentPage, paginatedPosts } = generatePagination({
 *   posts: blogPosts,
 *   page: '2'
 * });
 *
 * // For index page
 * const indexPagination = generatePagination({
 *   posts: blogPosts,
 *   page: '1',
 *   isIndex: true
 * });
 * ```
 */
const generatePagination = <T extends { id: string | number }>({
  posts,
  page,
  isIndex = false,
}: PaginationProps<T>): PaginationResult<T> => {
  const totalPages = Math.ceil(posts.length / SITE.postPerPage);
  const currentPage = isIndex ? 1 : Number(page) || 1;

  // Ensure currentPage is within valid range
  const validatedPage = Math.max(1, Math.min(currentPage, totalPages));

  const startPost = (validatedPage - 1) * SITE.postPerPage;
  const endPost = startPost + SITE.postPerPage;
  const paginatedPosts = posts.slice(startPost, endPost);

  return {
    totalPages,
    currentPage: validatedPage,
    paginatedPosts,
  };
};

export default generatePagination;
