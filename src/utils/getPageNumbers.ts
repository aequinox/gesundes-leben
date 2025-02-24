/**
 * @module getPageNumbers
 * @description
 * Utility module for calculating pagination numbers based on the total number of posts.
 * Provides a simple and efficient way to generate page numbers for content pagination.
 *
 * @example
 * ```typescript
 * import calculatePageNumbers from './utils/getPageNumbers';
 *
 * // For 25 posts with 10 posts per page
 * const pages = calculatePageNumbers(25);
 * // Returns: [1, 2, 3]
 * ```
 */

import { SITE } from "@/config";

/**
 * Calculates an array of sequential page numbers based on the total number of posts.
 * Uses the SITE.postPerPage configuration to determine the number of pages needed.
 *
 * @param numberOfPosts - The total number of posts to paginate
 * @returns Array of sequential page numbers starting from 1
 * @throws {Error} If numberOfPosts is negative
 *
 * @example
 * ```typescript
 * // With SITE.postPerPage = 10
 * calculatePageNumbers(25); // Returns: [1, 2, 3]
 * calculatePageNumbers(8);  // Returns: [1]
 * calculatePageNumbers(0);  // Returns: []
 * ```
 */
const calculatePageNumbers = (numberOfPosts: number): number[] => {
  if (numberOfPosts < 0) {
    throw new Error("Number of posts cannot be negative");
  }

  const numberOfPages = Math.ceil(numberOfPosts / Number(SITE.postPerPage));

  // Create an array from 1 to numberOfPages
  return Array.from({ length: numberOfPages }, (_, index) => index + 1);
};

export default calculatePageNumbers;
