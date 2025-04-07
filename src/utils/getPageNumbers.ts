/**
 * @module getPageNumbers
 * @description
 * Utility module for calculating pagination numbers based on the total number of posts.
 *
 * @deprecated This module is deprecated. Please use the PaginationService.calculatePageNumbers method instead.
 *
 * @example
 * ```typescript
 * // DEPRECATED - Use PaginationService instead
 * import calculatePageNumbers from './utils/getPageNumbers';
 *
 * // RECOMMENDED
 * import { paginationService } from '@/services/content/PaginationService';
 * const pages = paginationService.calculatePageNumbers(25);
 * // Returns: [1, 2, 3]
 * ```
 */

import { paginationService } from "@/services/content/PaginationService";

/**
 * Calculates an array of sequential page numbers based on the total number of posts.
 *
 * @deprecated This function is deprecated. Please use PaginationService.calculatePageNumbers instead.
 *
 * @param numberOfPosts - The total number of posts to paginate
 * @returns Array of sequential page numbers starting from 1
 * @throws {Error} If numberOfPosts is negative
 *
 * @example
 * ```typescript
 * // DEPRECATED
 * calculatePageNumbers(25); // Returns: [1, 2, 3]
 *
 * // RECOMMENDED
 * paginationService.calculatePageNumbers(25); // Returns: [1, 2, 3]
 * ```
 */
const calculatePageNumbers = (numberOfPosts: number): number[] => {
  console.warn(
    "Warning: calculatePageNumbers is deprecated. Please use paginationService.calculatePageNumbers instead."
  );
  return paginationService.calculatePageNumbers(numberOfPosts);
};

export default calculatePageNumbers;
