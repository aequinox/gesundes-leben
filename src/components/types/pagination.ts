/**
 * Pagination related type definitions.
 * @module pagination
 */
import type { CollectionEntry } from "astro:content";

/** Base pagination interface for any collection */
export interface Pagination<
  T = CollectionEntry<"blog"> | CollectionEntry<"glossary">,
> {
  /** Total number of pages */
  readonly totalPages: number;
  /** Current page number (1-based) */
  readonly currentPage: number;
  /** Items for current page */
  readonly paginatedPosts: T[];
}

/** Pagination options */
export interface PaginationOptions {
  /** Number of items per page */
  readonly pageSize: number;
  /** Current page number */
  readonly currentPage: number;
  /** Whether to show all pages in navigation */
  readonly showAllPages?: boolean;
  /** Maximum number of visible page links */
  readonly maxVisiblePages?: number;
  /** Whether to show previous/next buttons */
  readonly showNavigation?: boolean;
  /** Whether to show first/last buttons */
  readonly showEndButtons?: boolean;
}

/** Page info */
export interface PageInfo {
  /** Page number */
  readonly pageNum: number;
  /** Whether it's the current page */
  readonly isCurrent: boolean;
  /** Whether it's a disabled state */
  readonly isDisabled?: boolean;
  /** Page URL */
  readonly url?: string;
}

/** Pagination result */
export interface PaginationResult<T> {
  /** Items for current page */
  readonly items: T[];
  /** Pagination metadata */
  readonly metadata: {
    /** Current page number */
    readonly currentPage: number;
    /** Total number of pages */
    readonly totalPages: number;
    /** Items per page */
    readonly pageSize: number;
    /** Total number of items */
    readonly totalItems: number;
    /** Whether there's a previous page */
    readonly hasPrevPage: boolean;
    /** Whether there's a next page */
    readonly hasNextPage: boolean;
    /** Previous page number */
    readonly prevPage?: number;
    /** Next page number */
    readonly nextPage?: number;
    /** First item index (0-based) */
    readonly startIndex: number;
    /** Last item index (0-based) */
    readonly endIndex: number;
  };
}

/** Sort direction */
export const enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

/** Pagination display mode */
export const enum PaginationDisplayMode {
  Numbers = "numbers",
  Bullets = "bullets",
  Minimal = "minimal",
}

/** Pagination position */
export const enum PaginationPosition {
  Top = "top",
  Bottom = "bottom",
  Both = "both",
}

/** Props interface for pagination components */
export interface PaginationProps<
  T = CollectionEntry<"blog"> | CollectionEntry<"glossary">,
> {
  /** Page title */
  readonly title?: string;
  /** Total number of pages */
  readonly totalPages: number;
  /** Current page number */
  readonly currentPage: number;
  /** Paginated items */
  readonly paginatedPosts: T[];
  /** Display mode */
  readonly displayMode?: PaginationDisplayMode;
  /** Position */
  readonly position?: PaginationPosition;
  /** Additional CSS classes */
  readonly class?: string;
}
