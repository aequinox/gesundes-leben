import type { CollectionEntry } from "astro:content";

export type Pagination<T = CollectionEntry<"blog">> = {
  totalPages: number;
  currentPage: number;
  paginatedPosts: T[];
};
