import { SITE } from "@/config";

/**
 * Properties required for pagination generation
 */
export interface PaginationProps<T> {
  posts: T[];
  page: string | number;
  isIndex?: boolean;
  postsPerPage?: number; // Optional parameter to override default posts per page
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
   * @param numberOfPosts Total number of posts
   * @param postsPerPage Optional override for posts per page
   */
  calculatePageNumbers(numberOfPosts: number, postsPerPage?: number): number[];
}

export const generatePagination = <T extends { id: string | number }>({
  posts,
  page,
  isIndex = false,
  postsPerPage,
}: PaginationProps<T>): PaginationResult<T> => {
  // Use provided postsPerPage if available, otherwise use config value
  const itemsPerPage = postsPerPage || SITE.postPerPage;
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const currentPage = isIndex ? 1 : Number(page) || 1;

  // Ensure currentPage is within valid range
  const validatedPage = Math.max(1, Math.min(currentPage, totalPages));

  const startPost = (validatedPage - 1) * itemsPerPage;
  const endPost = startPost + itemsPerPage;
  const paginatedPosts = posts.slice(startPost, endPost);

  return {
    totalPages,
    currentPage: validatedPage,
    paginatedPosts,
  };
};

/**
 * Calculate page numbers based on total number of posts
 * @param numberOfPosts Total number of posts
 * @param postsPerPage Optional override for posts per page
 */
export const calculatePageNumbers = (
  numberOfPosts: number,
  postsPerPage?: number
): number[] => {
  if (numberOfPosts < 0) {
    throw new Error("Number of posts cannot be negative");
  }

  // Use provided postsPerPage if available, otherwise use config value
  const itemsPerPage = postsPerPage || SITE.postPerPage;
  const numberOfPages = Math.ceil(numberOfPosts / itemsPerPage);

  // Create an array from 1 to numberOfPages
  return Array.from({ length: numberOfPages }, (_, index) => index + 1);
};
