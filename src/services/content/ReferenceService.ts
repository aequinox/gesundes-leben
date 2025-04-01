/**
 * @module ReferenceService
 * @description
 * Service for managing academic references.
 * Provides functionality for formatting citations, sorting, filtering,
 * and validation according to academic standards.
 */

import type { Reference } from "@/utils/content/types";
import { handleAsync } from "@/core/errors/handleAsync";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Author interface for citation formatting
 */
export interface Author {
  name: string;
}

/**
 * Citation styles enumeration
 */
export enum CitationStyle {
  APA = "apa",
  MLA = "mla",
  HARVARD = "harvard",
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
 * Filter options for reference filtering
 */
export interface FilterOptions {
  keywords?: ReadonlyArray<string>;
  yearRange?: { start: number; end: number };
  authors?: ReadonlyArray<string>;
  journals?: ReadonlyArray<string>;
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
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Interface for reference service operations
 */
export interface IReferenceService {
  /**
   * Format authors for citation display
   */
  formatAuthors(
    authors: ReadonlyArray<string | Author>,
    style?: CitationStyle
  ): string;

  /**
   * Format a reference for citation
   */
  formatCitation(reference: Reference, style?: CitationStyle): string;

  /**
   * Sort references based on criteria
   */
  sortReferences(
    references: ReadonlyArray<Reference>,
    sortBy?: SortCriterion,
    sortOrder?: SortOrder
  ): ReadonlyArray<Reference>;

  /**
   * Filter references based on criteria
   */
  filterReferences(
    references: ReadonlyArray<Reference>,
    options: FilterOptions
  ): ReadonlyArray<Reference>;

  /**
   * Get a reference by its slug
   */
  getReferenceBySlug(
    references: ReadonlyArray<Reference>,
    slug: string
  ): Promise<Reference | undefined>;

  /**
   * Group references by criterion
   */
  groupReferences(
    references: ReadonlyArray<Reference>,
    groupBy?: GroupBy
  ): Promise<Record<string | number, ReadonlyArray<Reference>>>;

  /**
   * Validate a reference object
   */
  validateReference(reference: unknown): Promise<ValidationResult>;
}

/**
 * Implementation of the reference service
 */
export class ReferenceService implements IReferenceService {
  // Constants for validation and formatting
  private readonly CURRENT_YEAR = new Date().getFullYear();
  private readonly MIN_YEAR = 1000;
  private readonly DOI_PATTERN = /^10\.\d{4,}\/\S+$/;
  private readonly PAGE_PATTERN = /^\d+(-\d+)?$/;
  private readonly PMID_PATTERN = /^\d+$/;

  constructor(private config: IConfigService = configService) {}

  /**
   * Format authors for citation display
   */
  formatAuthors(
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
   * Format a reference for citation
   */
  formatCitation(
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

    const authors = this.formatAuthors(reference.data.authors, style);
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
   * Sort references based on criteria
   */
  sortReferences(
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
          return this.formatAuthors(a.data.authors).localeCompare(
            this.formatAuthors(b.data.authors)
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
   * Filter references based on criteria
   */
  filterReferences(
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
        const refAuthors = this.formatAuthors(ref.data.authors).toLowerCase();
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
   * Get a reference by its slug
   */
  async getReferenceBySlug(
    references: ReadonlyArray<Reference>,
    slug: string
  ): Promise<Reference | undefined> {
    return handleAsync(async () => {
      if (!Array.isArray(references)) {
        throw new Error("References must be provided as an array");
      }
      if (!slug || typeof slug !== "string") {
        throw new Error("Slug must be a non-empty string");
      }

      return references.find(ref => ref.id === slug);
    });
  }

  /**
   * Group references by criterion
   */
  async groupReferences(
    references: ReadonlyArray<Reference>,
    groupBy: GroupBy = GroupBy.YEAR
  ): Promise<Record<string | number, ReadonlyArray<Reference>>> {
    return handleAsync(async () => {
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
              key = this.formatAuthors(ref.data.authors);
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
    });
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate a reference object
   */
  async validateReference(reference: unknown): Promise<ValidationResult> {
    return handleAsync(async () => {
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
        data.year < this.MIN_YEAR ||
        data.year > this.CURRENT_YEAR
      ) {
        errors.push(
          `Year must be a valid year between ${this.MIN_YEAR} and ${this.CURRENT_YEAR}`
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

      if (data.pages && !this.PAGE_PATTERN.test(data.pages)) {
        errors.push("Pages must be in format '1-10' or '5' when provided");
      }

      if (data.url && !this.isValidUrl(data.url)) {
        errors.push("URL must be a valid URL string when provided");
      }

      if (data.doi && !this.DOI_PATTERN.test(data.doi)) {
        errors.push(
          "DOI must be in valid format (e.g., 10.1234/abc123) when provided"
        );
      }

      if (data.pmid && !this.PMID_PATTERN.test(data.pmid)) {
        errors.push("PMID must be a valid number when provided");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    });
  }

  /**
   * Get all available citation styles
   */
  get CITATION_STYLES(): CitationStyle[] {
    return Object.values(CitationStyle);
  }

  /**
   * Get all available sort criteria
   */
  get SORT_CRITERIA(): SortCriterion[] {
    return Object.values(SortCriterion);
  }

  /**
   * Get all available group by options
   */
  get GROUP_OPTIONS(): GroupBy[] {
    return Object.values(GroupBy);
  }
}

// Export singleton instance for convenience
export const referenceService = new ReferenceService();
