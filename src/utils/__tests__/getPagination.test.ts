import { describe, expect, test, vi } from "vitest";
import generatePagination from "../getPagination";
import type { PaginationProps } from "../getPagination";

// Mock SITE config
vi.mock("@/config", () => ({
  SITE: {
    postPerPage: 3,
  },
}));

describe("generatePagination", () => {
  // Helper to create mock posts
  const createMockPosts = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `post-${i + 1}`,
      title: `Post ${i + 1}`,
    }));

  test("handles first page correctly", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 1,
    };

    const result = generatePagination(props);

    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(1);
    expect(result.paginatedPosts).toHaveLength(3);
    expect(result.paginatedPosts[0].id).toBe("post-1");
  });

  test("handles last page correctly", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 2,
    };

    const result = generatePagination(props);

    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(2);
    expect(result.paginatedPosts).toHaveLength(2);
    expect(result.paginatedPosts[0].id).toBe("post-4");
  });

  test("handles isIndex flag", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 2,
      isIndex: true,
    };

    const result = generatePagination(props);

    expect(result.currentPage).toBe(1);
    expect(result.paginatedPosts).toHaveLength(3);
    expect(result.paginatedPosts[0].id).toBe("post-1");
  });

  test("handles string page numbers", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: "2",
    };

    const result = generatePagination(props);

    expect(result.currentPage).toBe(2);
    expect(result.paginatedPosts).toHaveLength(2);
  });

  test("handles invalid page numbers", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 999,
    };

    const result = generatePagination(props);

    expect(result.currentPage).toBe(2); // Clamps to max page
    expect(result.paginatedPosts).toHaveLength(2);
  });

  test("handles negative page numbers", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: -1,
    };

    const result = generatePagination(props);

    expect(result.currentPage).toBe(1); // Clamps to min page
    expect(result.paginatedPosts).toHaveLength(3);
  });

  test("handles empty posts array", () => {
    const props: PaginationProps<{ id: string }> = {
      posts: [],
      page: 1,
    };

    const result = generatePagination(props);

    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
    expect(result.paginatedPosts).toHaveLength(0);
  });

  test("handles exact multiple of posts per page", () => {
    const posts = createMockPosts(6);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 2,
    };

    const result = generatePagination(props);

    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(2);
    expect(result.paginatedPosts).toHaveLength(3);
  });

  test("handles non-numeric page string", () => {
    const posts = createMockPosts(5);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: "invalid",
    };

    const result = generatePagination(props);

    expect(result.currentPage).toBe(1); // Falls back to first page
    expect(result.paginatedPosts).toHaveLength(3);
  });

  test("handles single page of posts", () => {
    const posts = createMockPosts(2);
    const props: PaginationProps<(typeof posts)[0]> = {
      posts,
      page: 1,
    };

    const result = generatePagination(props);

    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.paginatedPosts).toHaveLength(2);
  });
});
