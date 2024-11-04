import { SITE } from "@/config";


interface GetPaginationProps<T> {
  posts: T[];
  page: string | number;
  isIndex?: boolean;
}

export interface Pagination<T> {
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
}: GetPaginationProps<T>): Pagination<T> => {
  const totalPages = Math.ceil(posts.length / SITE.postPerPage);
  const currentPage = isIndex ? 1 : Number(page) || 1; // Default to page 1 if page is invalid

  const startPost = (currentPage - 1) * SITE.postPerPage;
  const paginatedPosts = posts.slice(startPost, startPost + SITE.postPerPage);

  return {
    totalPages,
    currentPage,
    paginatedPosts,
  };
};

export default generatePagination;
