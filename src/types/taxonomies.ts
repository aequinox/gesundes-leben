/**
 * Taxonomy related type definitions.
 * @module taxonomies
 */

/** Available group names */
export const GROUP_NAMES = ["pro", "kontra", "fragezeiten"] as const;

/** Group name type */
export type GroupName = (typeof GROUP_NAMES)[number];

/** Available category names */
export const CATEGORY_NAMES = [
  "Ernährung",
  "Immunsystem",
  "Lesenswertes",
  "Lifestyle & Psyche",
  "Mikronährstoffe",
  "Organsysteme",
  "Wissenschaftliches",
  "Wissenswertes",
] as const;

/** Category name type */
export type CategoryName = (typeof CATEGORY_NAMES)[number];

/** Base taxonomy interface */
export interface BaseTaxonomy {
  /** Unique identifier */
  readonly slug: string;
  /** Display name */
  readonly name: string;
  /** Optional description */
  readonly description?: string;
}

/** Group taxonomy */
export interface Group extends Omit<BaseTaxonomy, "name"> {
  /** Group name (from predefined list) */
  readonly name: GroupName;
}

/** Category taxonomy */
export interface Category extends Omit<BaseTaxonomy, "name"> {
  /** Category name (from predefined list) */
  readonly name: CategoryName;
}

/** Tag taxonomy */
export interface Tag extends BaseTaxonomy {
  /** Optional parent category */
  readonly category?: CategoryName;
}

/** Complete taxonomy configuration */
export interface TaxonomyConfig {
  /** Available groups */
  readonly groups: readonly Group[];
  /** Available categories */
  readonly categories: readonly Category[];
  /** Available tags */
  readonly tags: readonly Tag[];
}
