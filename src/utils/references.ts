/**
 * Reference System Utilities
 * This module provides utility functions for working with references.
 * @module references
 */

import type {
  Reference,
  Author,
  ReferenceCollection,
} from "../types/references";

/**
 * Formats authors for citation display
 * @param authors - Array of authors
 * @returns Formatted author string
 */
export function formatAuthors(authors: ReadonlyArray<string | Author>): string {
  const authorNames = authors.map(author => {
    if (typeof author === "string") return author;
    return author.name;
  });

  if (authorNames.length === 0) return "";
  if (authorNames.length === 1) return authorNames[0];
  if (authorNames.length === 2)
    return `${authorNames[0]} and ${authorNames[1]}`;

  return `${authorNames[0]} et al.`;
}

/**
 * Formats a reference for citation
 * @param reference - Reference object
 * @returns Formatted citation string
 */
export function formatCitation(reference: Reference): string {
  const authors = formatAuthors(reference.authors);
  const year = reference.year;
  const title = reference.title;
  const journal = reference.journal;
  const volume = reference.volume ? `${reference.volume}` : "";
  const issue = reference.issue ? `(${reference.issue})` : "";
  const pages = reference.pages ? `: ${reference.pages}` : "";

  return `${authors} (${year}). ${title}. ${journal}${volume}${issue}${pages}.`;
}

/**
 * Sorts references by specified criteria
 * @param references - Array of references to sort
 * @param sortBy - Sort criterion
 * @param sortOrder - Sort direction
 * @returns Sorted array of references
 */
export function sortReferences(
  references: ReadonlyArray<Reference>,
  sortBy: "year" | "author" | "title" = "year",
  sortOrder: "asc" | "desc" = "desc"
): ReadonlyArray<Reference> {
  const sorted = [...references].sort((a, b) => {
    switch (sortBy) {
      case "year":
        return a.year - b.year;
      case "author":
        return formatAuthors(a.authors).localeCompare(formatAuthors(b.authors));
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return sortOrder === "desc" ? sorted.reverse() : sorted;
}

/**
 * Filters references by keywords
 * @param references - Array of references to filter
 * @param keywords - Array of keywords to match
 * @returns Filtered array of references
 */
export function filterByKeywords(
  references: ReadonlyArray<Reference>,
  keywords: ReadonlyArray<string>
): ReadonlyArray<Reference> {
  if (!keywords.length) return references;

  const normalizedKeywords = keywords.map(k => k.toLowerCase());

  return references.filter(ref =>
    ref.keywords?.some(k => normalizedKeywords.includes(k.toLowerCase()))
  );
}

/**
 * Gets a reference by its slug
 * @param references - Array of references to search
 * @param slug - Slug to find
 * @returns Reference object or undefined if not found
 */
export function getReferenceBySlug(
  references: ReadonlyArray<Reference>,
  slug: string
): Reference | undefined {
  return references.find(ref => ref.slug === slug);
}

/**
 * Groups references by year
 * @param references - Array of references to group
 * @returns Object with years as keys and arrays of references as values
 */
export function groupByYear(
  references: ReadonlyArray<Reference>
): Record<number, ReadonlyArray<Reference>> {
  return references.reduce(
    (groups, ref) => {
      const year = ref.year;
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year] = [...groups[year], ref];
      return groups;
    },
    {} as Record<number, Reference[]>
  );
}

/**
 * Validates a reference object against the Reference interface
 * @param reference - Reference object to validate
 * @returns Array of validation error messages, empty if valid
 */
export function validateReference(reference: unknown): string[] {
  const errors: string[] = [];

  if (!reference || typeof reference !== "object") {
    return ["Reference must be an object"];
  }

  const ref = reference as Partial<Reference>;

  if (!ref.title || typeof ref.title !== "string") {
    errors.push("Title is required and must be a string");
  }

  if (!Array.isArray(ref.authors) || ref.authors.length === 0) {
    errors.push("Authors must be a non-empty array");
  }

  if (
    typeof ref.year !== "number" ||
    ref.year < 1000 ||
    ref.year > new Date().getFullYear()
  ) {
    errors.push("Year must be a valid year");
  }

  if (!ref.journal || typeof ref.journal !== "string") {
    errors.push("Journal is required and must be a string");
  }

  if (!ref.slug || typeof ref.slug !== "string") {
    errors.push("Slug is required and must be a string");
  }

  if (ref.url && !isValidUrl(ref.url)) {
    errors.push("URL must be a valid URL string");
  }

  return errors;
}

/**
 * Checks if a string is a valid URL
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
