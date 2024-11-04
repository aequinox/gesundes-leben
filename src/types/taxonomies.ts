export const GROUP_NAMES = ["pro", "kontra", "fragezeiten"] as const;
export type GroupName = (typeof GROUP_NAMES)[number];

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
export type CategoryName = (typeof CATEGORY_NAMES)[number];

export interface BaseTaxonomy {
  readonly slug: string;
  readonly name: string;
  readonly description?: string;
}

export interface Group extends BaseTaxonomy {
  readonly name: GroupName;
}

export interface Category extends BaseTaxonomy {
  readonly name: CategoryName;
}

export interface Tag extends BaseTaxonomy {
  readonly category?: CategoryName;
}

export interface TaxonomyConfig {
  readonly groups: readonly Group[];
  readonly categories: readonly Category[];
  readonly tags: readonly Tag[];
}
