/**
 * Reference system type definitions.
 * @module references
 */

/** Reference author information */
export interface ReferenceAuthor {
  /** Full author name */
  readonly name: string;
  /** Optional affiliation */
  readonly affiliation?: string;
}

/** Base reference interface */
export interface Reference {
  /** Reference title */
  readonly title: string;
  /** List of authors */
  readonly authors: readonly string[];
  /** Publication year */
  readonly year: number;
  /** Journal or publication name */
  readonly journal: string;
  /** Volume number */
  readonly volume?: number;
  /** Issue number */
  readonly issue?: number;
  /** Page range */
  readonly pages?: string;
  /** DOI or URL */
  readonly url?: string;
  /** Unique shortcode for referencing */
  readonly shortcode: string;
}

/** Props for References component */
export interface ReferencesProps {
  /** Optional list of reference shortcodes to filter */
  readonly references?: readonly string[];
  /** Optional CSS class */
  readonly class?: string;
}

/** Reference collection entry */
export interface ReferenceEntry {
  /** Reference data */
  readonly data: readonly Reference[];
}
