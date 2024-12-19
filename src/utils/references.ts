/**
 * Reference System Utilities
 * This module provides comprehensive utility functions for working with academic references.
 * It includes functionality for formatting citations, sorting, filtering, and validation
 * according to academic standards.
 *
 * @module references
 * @author Your Team
 * @version 1.0.0
 */

import type { Reference } from "@/utils/content/types";

/**
 * Author interface for citation formatting
 */
export interface Author {
  name: string;
}

// Constants for validation and formatting
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1000;
const DOI_PATTERN = /^10\.\d{4,}\/\S+$/;
const PAGE_PATTERN = /^\d+(-\d+)?$/;
const PMID_PATTERN = /^\d+$/;

/**
 * Citation styles enumeration
 * Defines supported citation format styles
 */
export enum CitationStyle {
  APA = "apa",
  MLA = "mla",
  HARVARD = "harvard",
}

/**
 * Formats authors for citation display according to academic standards
 *
 * @param authors - Array of authors (can be strings or Author objects)
 * @param style - Citation style to use (defaults to APA)
 * @returns Formatted author string according to the specified style
 * @throws {Error} If authors array is invalid
 */
export function formatAuthors(
  authors: ReadonlyArray<string | Author>,
  style: CitationStyle = CitationStyle.APA
): string {
  if (!Array.isArray(authors)) {
    throw new Error("Authors must be provided as an array");
  }

  const authorNames = authors.map(author => {
    if (typeof author === "string") return author;
    return author.name;
  });

  if (authorNames.length === 0) return "";
  if (authorNames.length === 1) return authorNames[0];

  switch (style) {
    case CitationStyle.MLA:
      return authorNames.length === 2
        ? `${authorNames[0]} and ${authorNames[1]}`
        : `${authorNames[0]} et al.`;
    case CitationStyle.HARVARD:
      return authorNames.length === 2
        ? `${authorNames[0]} & ${authorNames[1]}`
        : `${authorNames[0]} et al.`;
    case CitationStyle.APA:
    default:
      return authorNames.length === 2
        ? `${authorNames[0]} & ${authorNames[1]}`
        : `${authorNames[0]} et al.`;
  }
}

/**
 * Formats a reference for citation according to specified style
 *
 * @param reference - Reference object containing citation details
 * @param style - Citation style to use (defaults to APA)
 * @returns Formatted citation string according to academic standards
 * @throws {Error} If reference object is invalid
 */
export function formatCitation(
  reference: Reference,
  style: CitationStyle = CitationStyle.APA
): string {
  // Validate required fields
  if (
    !reference?.data?.title ||
    !reference?.data?.authors ||
    !reference?.data?.year
  ) {
    throw new Error("Reference must include title, authors, and year");
  }

  const authors = formatAuthors(reference.data.authors, style);
  const { year, title, journal, volume, issue, pages, doi } = reference.data;

  // Format components based on citation style
  switch (style) {
    case CitationStyle.MLA:
      return `${authors}. "${title}." ${journal}${volume ? ` ${volume}` : ""}${
        issue ? `.${issue}` : ""
      }${pages ? ` (${pages})` : ""} (${year}).${doi ? ` DOI: ${doi}` : ""}`;

    case CitationStyle.HARVARD:
      return `${authors} ${year}, '${title}', ${journal}${
        volume ? `, vol. ${volume}` : ""
      }${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}.${
        doi ? ` DOI: ${doi}` : ""
      }`;

    case CitationStyle.APA:
    default:
      return `${authors} (${year}). ${title}. ${journal}${
        volume ? ` ${volume}` : ""
      }${issue ? `(${issue})` : ""}${pages ? `: ${pages}` : ""}.${
        doi ? ` DOI: ${doi}` : ""
      }`;
  }
}

/**
 * Sort criteria for reference sorting
 */
export enum SortCriterion {
  YEAR = "year",
  AUTHOR = "author",
  TITLE = "title",
  JOURNAL = "journal",
}

/**
 * Sort order for reference sorting
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Sorts an array of references based on specified criteria
 *
 * @param references - Array of references to sort
 * @param sortBy - Sort criterion (defaults to year)
 * @param sortOrder - Sort direction (defaults to descending)
 * @returns Sorted array of references
 * @throws {Error} If references array is invalid
 */
export function sortReferences(
  references: ReadonlyArray<Reference>,
  sortBy: SortCriterion = SortCriterion.YEAR,
  sortOrder: SortOrder = SortOrder.DESC
): ReadonlyArray<Reference> {
  if (!Array.isArray(references)) {
    throw new Error("References must be provided as an array");
  }

  const sorted = [...references].sort((a, b) => {
    switch (sortBy) {
      case SortCriterion.YEAR:
        return a.data.year - b.data.year;
      case SortCriterion.AUTHOR:
        return formatAuthors(a.data.authors).localeCompare(
          formatAuthors(b.data.authors)
        );
      case SortCriterion.TITLE:
        return a.data.title.localeCompare(b.data.title);
      case SortCriterion.JOURNAL:
        return (a.data.journal || "").localeCompare(b.data.journal || "");
      default:
        return 0;
    }
  });

  return sortOrder === SortOrder.DESC ? sorted.reverse() : sorted;
}

/**
 * Filter options for reference filtering
 */
export interface FilterOptions {
  keywords?: ReadonlyArray<string>;
  yearRange?: { start: number; end: number };
  authors?: ReadonlyArray<string>;
  journals?: ReadonlyArray<string>;
}

/**
 * Filters references based on multiple criteria
 *
 * @param references - Array of references to filter
 * @param options - Filter options including keywords, year range, authors, and journals
 * @returns Filtered array of references matching all specified criteria
 * @throws {Error} If references array or filter options are invalid
 */
export function filterReferences(
  references: ReadonlyArray<Reference>,
  options: FilterOptions
): ReadonlyArray<Reference> {
  if (!Array.isArray(references)) {
    throw new Error("References must be provided as an array");
  }

  return references.filter(ref => {
    // Filter by keywords if specified
    if (options.keywords?.length) {
      const normalizedKeywords = options.keywords.map((k: string) =>
        k.toLowerCase()
      );
      if (
        !ref.data.keywords?.some((k: string) =>
          normalizedKeywords.includes(k.toLowerCase())
        )
      ) {
        return false;
      }
    }

    // Filter by year range if specified
    if (options.yearRange) {
      const { start, end } = options.yearRange;
      if (ref.data.year < start || ref.data.year > end) {
        return false;
      }
    }

    // Filter by authors if specified
    if (options.authors?.length) {
      const refAuthors = formatAuthors(ref.data.authors).toLowerCase();
      if (
        !options.authors.some((author: string) =>
          refAuthors.includes(author.toLowerCase())
        )
      ) {
        return false;
      }
    }

    // Filter by journals if specified
    if (options.journals?.length && ref.data.journal) {
      if (
        !options.journals.some((journal: string) =>
          ref.data.journal?.toLowerCase().includes(journal.toLowerCase())
        )
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Gets a reference by its unique identifier (slug)
 *
 * @param references - Array of references to search
 * @param slug - Unique identifier to find
 * @returns Reference object or undefined if not found
 * @throws {Error} If references array or slug is invalid
 */
export function getReferenceBySlug(
  references: ReadonlyArray<Reference>,
  slug: string
): Reference | undefined {
  if (!Array.isArray(references)) {
    throw new Error("References must be provided as an array");
  }
  if (!slug || typeof slug !== "string") {
    throw new Error("Slug must be a non-empty string");
  }

  return references.find(ref => ref.id === slug);
}

/**
 * Group by options for reference grouping
 */
export enum GroupBy {
  YEAR = "year",
  JOURNAL = "journal",
  AUTHOR = "author",
}

/**
 * Groups references by specified criterion
 *
 * @param references - Array of references to group
 * @param groupBy - Criterion to group by (defaults to year)
 * @returns Record with group keys and arrays of references as values
 * @throws {Error} If references array is invalid
 */
export function groupReferences(
  references: ReadonlyArray<Reference>,
  groupBy: GroupBy = GroupBy.YEAR
): Record<string | number, ReadonlyArray<Reference>> {
  if (!Array.isArray(references)) {
    throw new Error("References must be provided as an array");
  }

  return references.reduce(
    (groups, ref) => {
      let key: string | number;

      switch (groupBy) {
        case GroupBy.JOURNAL:
          key = ref.data.journal || "Unknown Journal";
          break;
        case GroupBy.AUTHOR:
          key = formatAuthors(ref.data.authors);
          break;
        case GroupBy.YEAR:
        default:
          key = ref.data.year;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key] = [...groups[key], ref];
      return groups;
    },
    {} as Record<string | number, Reference[]>
  );
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a reference object against the schema defined in config.ts
 *
 * @param reference - Reference object to validate
 * @returns Validation result containing boolean status and array of error messages
 */
export function validateReference(reference: unknown): ValidationResult {
  const errors: string[] = [];

  if (!reference || typeof reference !== "object") {
    return {
      isValid: false,
      errors: ["Reference must be an object"],
    };
  }

  const ref = reference as Partial<Reference>;

  // Required field validations
  const data = (ref as Reference)?.data;

  if (!data || typeof data !== "object") {
    errors.push("Reference must have a data object");
    return { isValid: false, errors };
  }

  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required and must be a string");
  }

  if (!Array.isArray(data.authors) || data.authors.length === 0) {
    errors.push("Authors must be a non-empty array");
  }

  if (
    typeof data.year !== "number" ||
    data.year < MIN_YEAR ||
    data.year > CURRENT_YEAR
  ) {
    errors.push(
      `Year must be a valid year between ${MIN_YEAR} and ${CURRENT_YEAR}`
    );
  }

  if (!ref.id || typeof ref.id !== "string") {
    errors.push("ID is required and must be a string");
  }

  // Optional field validations
  if (data.journal && typeof data.journal !== "string") {
    errors.push("Journal must be a string when provided");
  }

  if (data.volume && (!Number.isInteger(data.volume) || data.volume <= 0)) {
    errors.push("Volume must be a positive integer when provided");
  }

  if (data.issue && (!Number.isInteger(data.issue) || data.issue <= 0)) {
    errors.push("Issue must be a positive integer when provided");
  }

  if (data.pages && !PAGE_PATTERN.test(data.pages)) {
    errors.push("Pages must be in format '1-10' or '5' when provided");
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.push("URL must be a valid URL string when provided");
  }

  if (data.doi && !DOI_PATTERN.test(data.doi)) {
    errors.push(
      "DOI must be in valid format (e.g., 10.1234/abc123) when provided"
    );
  }

  if (data.pmid && !PMID_PATTERN.test(data.pmid)) {
    errors.push("PMID must be a valid number when provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a string is a valid URL
 *
 * @param url - String to check
 * @returns Boolean indicating if string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Exports all available citation styles
 */
export const CITATION_STYLES = Object.values(CitationStyle);

/**
 * Exports all available sort criteria
 */
export const SORT_CRITERIA = Object.values(SortCriterion);

/**
 * Exports all available group by options
 */
export const GROUP_OPTIONS = Object.values(GroupBy);
