import { SITE } from "@/config";

/**
 * Calculates the number of pages needed for pagination.
 * @param numberOfPosts - The total number of posts.
 * @returns An array of page numbers.
 */
const calculatePageNumbers = (numberOfPosts: number): number[] => {
  const numberOfPages = Math.ceil(numberOfPosts / Number(SITE.postPerPage));
  return Array.from({ length: numberOfPages }, (_, i) => i + 1);
};

export default calculatePageNumbers;
