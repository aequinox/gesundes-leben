import { SITE } from "@/config";

export interface PaginationProps<T> {
  posts: T[];
  page: string | number;
  isIndex?: boolean;
}

export interface PaginationResult<T> {
  totalPages: number;
  currentPage: number;
  paginatedPosts: T[];
}

/**
 * Generates pagination metadata and paginated posts.
 * @param props - Pagination properties.
 * @returns Pagination metadata and paginated posts.
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
