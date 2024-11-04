export const GROUPS = ["pro", "kontra", "fragezeiten"] as const;
export const CATEGORIES = [
  // 'Alle',
  "Ernährung",
  "Immunsystem",
  "Lesenswertes",
  "Lifestyle & Psyche",
  "Mikronährstoffe",
  "Organsysteme",
  "Wissenschaftliches",
  "Wissenswertes",
] as const;

export type Category = (typeof CATEGORIES)[number];
