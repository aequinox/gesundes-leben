/**
 * @module getPagination
 * @description
 * Utility module for handling content pagination with type safety and flexibility.
 *
 * @deprecated This module is deprecated. Please use the PaginationService.generatePagination method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PaginationService instead
 * import generatePagination from './utils/getPagination';
 *
 * // RECOMMENDED
 * import { paginationService } from '@/services/content/PaginationService';
 * const result = paginationService.generatePagination({
 *   posts: allPosts,
 *   page: '2',
 *   isIndex: false
 * });
 * // Returns: { totalPages: 5, currentPage: 2, paginatedPosts: [...] }
 * ```
 */

import { paginationService } from "@/services/content/PaginationService";
import type {
  PaginationProps,
  PaginationResult,
} from "@/services/content/PaginationService";

// Re-export interfaces for backward compatibility
export type { PaginationProps, PaginationResult };

/**
 * Generates pagination metadata and paginated posts.
 *
 * @deprecated This function is deprecated. Please use PaginationService.generatePagination instead.
 *
 * @typeParam T - Type of items being paginated (must have an id property)
 * @param props - Pagination properties including posts and page number
 * @returns Pagination metadata and paginated content
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * const pagination = generatePagination({
 *   posts: blogPosts,
 *   page: '2'
 * });
 *
 * // RECOMMENDED
 * const pagination = paginationService.generatePagination({
 *   posts: blogPosts,
 *   page: '2'
 * });
 * ```
 */
const generatePagination = <T extends { id: string | number }>({
  posts,
  page,
  isIndex = false,
}: PaginationProps<T>): PaginationResult<T> => {
  console.warn(
    "Warning: generatePagination is deprecated. Please use paginationService.generatePagination instead."
  );
  return paginationService.generatePagination({
    posts,
    page,
    isIndex,
  });
};

export default generatePagination;
