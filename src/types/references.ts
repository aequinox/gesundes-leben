import type { CollectionEntry } from "astro:content";

/**
 * Reference System Type Definitions
 * This module provides comprehensive type definitions for the academic reference system.
 */

/**
 * Base reference data interface that defines the core properties
 * @interface ReferenceData
 */
export interface ReferenceData {
  /** The complete title of the work */
  readonly title: string;
  /** List of authors */
  readonly authors: ReadonlyArray<string>;
  /** Publication year */
  readonly year: number;
  /** Journal or publication name */
  readonly journal?: string;
  /** Volume number */
  readonly volume?: number;
  /** Issue number */
  readonly issue?: number;
  /** Page range */
  readonly pages?: string;
  /** Digital Object Identifier */
  readonly doi?: string;
  /** PubMed ID */
  readonly pmid?: string;
  /** URL to the reference */
  readonly url?: string;
  /** Keywords for categorization and search */
  readonly keywords?: ReadonlyArray<string>;
  /** Abstract or summary */
  readonly abstract?: string;
}

/**
 * Complete Reference type using Astro's CollectionEntry
 * @type Reference
 */
export type Reference = CollectionEntry<"references">;

/**
 * Props interface for the References component
 * @interface ReferencesProps
 */
export interface ReferencesProps {
  /** Optional array of reference IDs to filter the display */
  readonly references?: ReadonlyArray<string>;
  /** Optional CSS class name */
  readonly class?: string;
}

/**
 * Interface for a collection of references
 * @interface ReferenceCollection
 */
export interface ReferenceCollection {
  /** Array of references in the collection */
  readonly references: ReadonlyArray<Reference>;
}

/**
 * Type guard to check if a value is a valid Reference
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid Reference
 */
export function isReference(value: unknown): value is Reference {
  if (!value || typeof value !== "object") return false;

  const ref = value as Partial<Reference>;

  return (
    typeof ref.id === "string" &&
    ref.collection === "references" &&
    typeof ref.data === "object" &&
    ref.data !== null &&
    typeof ref.data.title === "string" &&
    Array.isArray(ref.data.authors) &&
    typeof ref.data.year === "number"
  );
}

/**
 * Type guard to check if a value is valid reference data
 * @param value - The value to check
 * @returns boolean indicating if the value is valid reference data
 */
export function isReferenceData(value: unknown): value is ReferenceData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<ReferenceData>;

  return (
    typeof data.title === "string" &&
    Array.isArray(data.authors) &&
    typeof data.year === "number" &&
    (!data.journal || typeof data.journal === "string") &&
    (!data.volume || typeof data.volume === "number") &&
    (!data.issue || typeof data.issue === "number") &&
    (!data.pages || typeof data.pages === "string") &&
    (!data.doi || typeof data.doi === "string") &&
    (!data.pmid || typeof data.pmid === "string") &&
    (!data.url || typeof data.url === "string") &&
    (!data.keywords || Array.isArray(data.keywords)) &&
    (!data.abstract || typeof data.abstract === "string")
  );
}
