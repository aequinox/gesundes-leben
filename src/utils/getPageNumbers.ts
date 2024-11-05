import { SITE } from "@/config";

/**
 * Calculates the number of pages needed for pagination.
 * @param numberOfPosts - The total number of posts.
 * @returns An array of page numbers.
 * @throws {Error} If numberOfPosts is negative.
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
