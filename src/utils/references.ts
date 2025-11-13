import { existsSync } from "node:fs";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

import { parse, stringify } from "yaml";

import { withAsyncErrorHandling } from "@/utils/error-handling/shared";
import { logger } from "@/utils/logger";
import {
  withCache,
  CacheKeys,
  invalidateReferenceCache,
} from "@/utils/referenceCache";

// Conditional import for Astro context
let getCollection:
  | ((name: string) => Promise<Array<{ id: string; data: ReferenceData }>>)
  | null = null;
try {
  const astroModule = await import("astro:content");
  getCollection = astroModule.getCollection;
} catch {
  // Running outside Astro context, will use fallback
}

// Types based on the content schema
export type ReferenceType = "journal" | "website" | "book" | "report" | "other";

export interface ReferenceData {
  type: ReferenceType;
  title: string;
  authors: string[];
  year: number;
  // Journal-specific fields
  journal?: string;
  volume?: number;
  issue?: number | string;
  pages?: string;
  doi?: string;
  // Book-specific fields
  publisher?: string;
  location?: string;
  edition?: string;
  isbn?: string;
  // Common fields
  url?: string;
  pmid?: string;
  keywords?: string[];
  abstract?: string;
}

export interface Reference extends ReferenceData {
  id: string;
}

/**
 * Standard field order for reference YAML files
 * Ensures consistent formatting across all reference files
 */
const REFERENCE_FIELD_ORDER = [
  "type",
  "title",
  "authors",
  "year",
  "journal",
  "volume",
  "issue",
  "pages",
  "doi",
  "publisher",
  "location",
  "edition",
  "isbn",
  "url",
  "pmid",
  "keywords",
  "abstract",
] as const;

/**
 * Type for valid reference field names
 */
type ReferenceFieldName = (typeof REFERENCE_FIELD_ORDER)[number];

/**
 * Type guard to check if a string is a valid reference field name
 */
function isReferenceFieldName(value: string): value is ReferenceFieldName {
  return (REFERENCE_FIELD_ORDER as readonly string[]).includes(value);
}

/**
 * Creates a sorting comparator function for reference YAML fields
 * @returns Comparator function for sorting object keys
 */
function createReferenceFieldComparator(): (a: string, b: string) => number {
  return (a: string, b: string): number => {
    const aIndex = isReferenceFieldName(a)
      ? REFERENCE_FIELD_ORDER.indexOf(a)
      : -1;
    const bIndex = isReferenceFieldName(b)
      ? REFERENCE_FIELD_ORDER.indexOf(b)
      : -1;
    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }
    if (aIndex === -1) {
      return 1;
    }
    if (bIndex === -1) {
      return -1;
    }
    return aIndex - bIndex;
  };
}

/**
 * Sorts object keys according to reference field order
 * @param data - Object to sort
 * @returns New object with sorted keys
 */
function sortReferenceKeys(data: ReferenceData): ReferenceData {
  const comparator = createReferenceFieldComparator();
  const sortedKeys = Object.keys(data).sort(comparator);
  const sortedData: Record<string, unknown> = {};

  for (const key of sortedKeys) {
    sortedData[key] = data[key as keyof ReferenceData];
  }

  return sortedData as unknown as ReferenceData;
}

/**
 * Fallback function to read references directly from YAML files
 */
async function readReferencesFromFiles(): Promise<Reference[]> {
  return withAsyncErrorHandling(
    async () => {
      const referencesDir = join(process.cwd(), "src/data/references");

      if (!existsSync(referencesDir)) {
        logger.warn("References directory not found:", referencesDir);
        return [];
      }

      const { readdir } = await import("node:fs/promises");
      const files = await readdir(referencesDir);
      const yamlFiles = files.filter(
        file => file.endsWith(".yaml") || file.endsWith(".yml")
      );

      const referencePromises = yamlFiles.map(async (file: string) => {
        const filePath = join(referencesDir, file);
        try {
          const content = await readFile(filePath, "utf8");
          const data = parse(content) as ReferenceData;
          const id = file.replace(/\.(yaml|yml)$/, "");

          return {
            id,
            ...data,
          };
        } catch (error) {
          logger.warn(`Failed to read reference file ${file}:`, error);
          return null;
        }
      });

      const references = (await Promise.all(referencePromises)).filter(
        Boolean
      ) as Reference[];

      return references;
    },
    "readReferencesFromFiles",
    []
  );
}

/**
 * Get all references from the collection (cached)
 */
export async function getAllReferences(): Promise<Reference[]> {
  return withCache(CacheKeys.allReferences(), async () => {
    return withAsyncErrorHandling(
      async () => {
        // Try Astro's getCollection first
        if (getCollection !== null) {
          const referencesCollection = await getCollection("references");
          return referencesCollection.map(entry => ({
            id: entry.id,
            ...entry.data,
          }));
        } else {
          // Fallback to reading files directly
          return await readReferencesFromFiles();
        }
      },
      "getAllReferences",
      [],
      {
        // Custom error handler to try fallback method
        onError: _error => {
          if (getCollection !== null) {
            logger.info("Trying fallback method...");
            void readReferencesFromFiles();
          }
        },
      }
    );
  });
}

/**
 * Get references by IDs (cached)
 */
export async function getReferencesByIds(ids: string[]): Promise<Reference[]> {
  return withCache(CacheKeys.referencesByIds(ids), async () => {
    const allReferences = await getAllReferences();
    const referencesMap = new Map(allReferences.map(ref => [ref.id, ref]));

    return ids
      .map(id => referencesMap.get(id))
      .filter((ref): ref is Reference => ref !== undefined);
  });
}

/**
 * Get a single reference by ID
 */
export async function getReferenceById(id: string): Promise<Reference | null> {
  const references = await getReferencesByIds([id]);
  return references[0] ?? null;
}

/**
 * Search references by various criteria
 */
export interface ReferenceSearchOptions {
  title?: string;
  authors?: string[];
  year?: number;
  type?: ReferenceType;
  keywords?: string[];
  journal?: string;
  doi?: string;
  limit?: number;
}

export async function searchReferences(
  options: ReferenceSearchOptions
): Promise<Reference[]> {
  const allReferences = await getAllReferences();

  let filtered = allReferences.filter(ref => {
    if (options.type !== undefined && ref.type !== options.type) {
      return false;
    }
    if (options.year !== undefined && ref.year !== options.year) {
      return false;
    }
    if (options.journal !== undefined && ref.journal !== options.journal) {
      return false;
    }
    if (options.doi !== undefined && ref.doi !== options.doi) {
      return false;
    }

    if (options.title !== undefined) {
      const titleMatch = ref.title
        .toLowerCase()
        .includes(options.title.toLowerCase());
      if (!titleMatch) {
        return false;
      }
    }

    if (options.authors !== undefined && options.authors.length > 0) {
      const authorMatch = options.authors.some(searchAuthor =>
        ref.authors.some(refAuthor =>
          refAuthor.toLowerCase().includes(searchAuthor.toLowerCase())
        )
      );
      if (!authorMatch) {
        return false;
      }
    }

    if (options.keywords !== undefined && options.keywords.length > 0) {
      if (ref.keywords === undefined || ref.keywords.length === 0) {
        return false;
      }
      const keywordMatch = options.keywords.some(searchKeyword =>
        ref.keywords!.some(refKeyword =>
          refKeyword.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      );
      if (!keywordMatch) {
        return false;
      }
    }

    return true;
  });

  if (options.limit !== undefined && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Get references grouped by type
 */
export async function getReferencesByType(): Promise<
  Record<ReferenceType, Reference[]>
> {
  const allReferences = await getAllReferences();

  return {
    journal: allReferences.filter(ref => ref.type === "journal"),
    website: allReferences.filter(ref => ref.type === "website"),
    book: allReferences.filter(ref => ref.type === "book"),
    report: allReferences.filter(ref => ref.type === "report"),
    other: allReferences.filter(ref => ref.type === "other"),
  };
}

/**
 * Get reference statistics (cached)
 */
export interface ReferenceStats {
  total: number;
  byType: Record<ReferenceType, number>;
  averageYear: number;
  mostRecentYear: number;
  oldestYear: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  topAuthors: Array<{ author: string; count: number }>;
}

export async function getReferenceStats(): Promise<ReferenceStats> {
  return withCache(CacheKeys.referenceStats(), async () => {
    const allReferences = await getAllReferences();

    const byType = {
      journal: allReferences.filter(ref => ref.type === "journal").length,
      website: allReferences.filter(ref => ref.type === "website").length,
      book: allReferences.filter(ref => ref.type === "book").length,
      report: allReferences.filter(ref => ref.type === "report").length,
      other: allReferences.filter(ref => ref.type === "other").length,
    };

    const years = allReferences.map(ref => ref.year);
    const averageYear = Math.round(
      years.reduce((sum, year) => sum + year, 0) / years.length
    );
    const mostRecentYear = Math.max(...years);
    const oldestYear = Math.min(...years);

    // Count keywords
    const keywordCounts = new Map<string, number>();
    allReferences.forEach(ref => {
      if (ref.keywords !== undefined) {
        ref.keywords.forEach(keyword => {
          keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
        });
      }
    });

    const topKeywords = Array.from(keywordCounts.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count authors
    const authorCounts = new Map<string, number>();
    allReferences.forEach(ref => {
      ref.authors.forEach(author => {
        authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
      });
    });

    const topAuthors = Array.from(authorCounts.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: allReferences.length,
      byType,
      averageYear,
      mostRecentYear,
      oldestYear,
      topKeywords,
      topAuthors,
    };
  });
}

/**
 * Create a new reference file
 */
export async function createReference(
  id: string,
  data: ReferenceData
): Promise<void> {
  const filePath = join(process.cwd(), "src/data/references", `${id}.yaml`);

  if (existsSync(filePath)) {
    throw new Error(`Reference with ID '${id}' already exists`);
  }

  // Ensure directory exists
  await mkdir(dirname(filePath), { recursive: true });

  // Sort keys and create YAML content
  const sortedData = sortReferenceKeys(data);
  const yamlContent = stringify(sortedData);

  await writeFile(filePath, yamlContent, "utf8");
  await invalidateReferenceCache();
  logger.info(`Created reference: ${id}`);
}

/**
 * Update an existing reference file
 */
export async function updateReference(
  id: string,
  data: Partial<ReferenceData>
): Promise<void> {
  const filePath = join(process.cwd(), "src/data/references", `${id}.yaml`);

  if (!existsSync(filePath)) {
    throw new Error(`Reference with ID '${id}' does not exist`);
  }

  // Read existing file
  const existingContent = await readFile(filePath, "utf8");
  const existingData = parse(existingContent) as ReferenceData;

  // Merge data
  const updatedData = { ...existingData, ...data };

  // Sort keys and create YAML content
  const sortedData = sortReferenceKeys(updatedData);
  const yamlContent = stringify(sortedData);

  await writeFile(filePath, yamlContent, "utf8");
  await invalidateReferenceCache();
  logger.info(`Updated reference: ${id}`);
}

/**
 * Delete a reference file
 */
export async function deleteReference(id: string): Promise<void> {
  const filePath = join(process.cwd(), "src/data/references", `${id}.yaml`);

  if (!existsSync(filePath)) {
    throw new Error(`Reference with ID '${id}' does not exist`);
  }

  const { unlink } = await import("node:fs/promises");
  await unlink(filePath);
  await invalidateReferenceCache();
  logger.info(`Deleted reference: ${id}`);
}

/**
 * Generate a unique ID from reference data
 */
export function generateReferenceId(data: ReferenceData): string {
  const year = data.year;
  const firstAuthor =
    data.authors[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const titleWords = data.title
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 3)
    .join("-");

  return `${year}-${firstAuthor}-${titleWords}`;
}

/**
 * Validate reference data
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function validateReferenceData(
  data: Partial<ReferenceData>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (data.type === undefined) {
    errors.push({ field: "type", message: "Type is required" });
  } else if (
    !["journal", "website", "book", "report", "other"].includes(data.type)
  ) {
    errors.push({
      field: "type",
      message:
        "Type must be 'journal', 'website', 'book', 'report', or 'other'",
    });
  }

  if (data.title === undefined || data.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Title is required and cannot be empty",
    });
  }

  if (data.authors === undefined || data.authors.length === 0) {
    errors.push({
      field: "authors",
      message: "At least one author is required",
    });
  }

  if (data.year === undefined) {
    errors.push({ field: "year", message: "Year is required" });
  } else if (data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.push({
      field: "year",
      message: "Year must be between 1900 and next year",
    });
  }

  // Type-specific validation
  if (data.type === "journal" && data.journal === undefined) {
    errors.push({
      field: "journal",
      message: "Journal name is required for journal articles",
    });
  }

  if (data.type === "book" && data.publisher === undefined) {
    errors.push({
      field: "publisher",
      message: "Publisher is required for books",
    });
  }

  // URL validation
  if (data.url !== undefined) {
    try {
      new URL(data.url);
    } catch {
      errors.push({ field: "url", message: "URL must be a valid URL" });
    }
  }

  // DOI validation
  if (data.doi !== undefined && !data.doi.match(/^10\.\d{4,}\/.+/)) {
    errors.push({
      field: "doi",
      message: "DOI must start with '10.' followed by publisher and suffix",
    });
  }

  return errors;
}

/**
 * Find duplicate references based on title, authors, and year
 */
export async function findDuplicateReferences(): Promise<
  Array<{ references: Reference[]; reason: string }>
> {
  const allReferences = await getAllReferences();
  const duplicates: Array<{ references: Reference[]; reason: string }> = [];

  // Group by title similarity
  const titleGroups = new Map<string, Reference[]>();
  allReferences.forEach(ref => {
    const normalizedTitle = ref.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
    if (!titleGroups.has(normalizedTitle)) {
      titleGroups.set(normalizedTitle, []);
    }
    titleGroups.get(normalizedTitle)!.push(ref);
  });

  titleGroups.forEach((refs, title) => {
    if (refs.length > 1) {
      duplicates.push({
        references: refs,
        reason: `Similar titles: "${title}"`,
      });
    }
  });

  // Group by DOI
  const doiGroups = new Map<string, Reference[]>();
  allReferences
    .filter(ref => ref.doi !== undefined)
    .forEach(ref => {
      const doi = ref.doi!.toLowerCase();
      if (!doiGroups.has(doi)) {
        doiGroups.set(doi, []);
      }
      doiGroups.get(doi)!.push(ref);
    });

  doiGroups.forEach((refs, doi) => {
    if (refs.length > 1) {
      duplicates.push({
        references: refs,
        reason: `Same DOI: ${doi}`,
      });
    }
  });

  return duplicates;
}
