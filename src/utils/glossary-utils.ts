/**
 * Glossary Utilities
 *
 * Helper functions for working with glossary terms, including
 * auto-linking, term lookup, and category management.
 */

import { getCollection, type CollectionEntry } from "astro:content";

export interface GlossaryTerm {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  synonyms: string[];
  keywords: string[];
}

/**
 * Get all glossary entries sorted alphabetically
 */
export async function getAllGlossaryTerms(): Promise<
  CollectionEntry<"glossary">[]
> {
  const entries = await getCollection("glossary");
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

/**
 * Get glossary terms grouped by category
 */
export async function getGlossaryByCategory(): Promise<
  Record<string, CollectionEntry<"glossary">[]>
> {
  const entries = await getAllGlossaryTerms();
  return entries.reduce(
    (acc, entry) => {
      const category = entry.data.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entry);
      return acc;
    },
    {} as Record<string, CollectionEntry<"glossary">[]>
  );
}

/**
 * Get glossary terms grouped by first letter
 */
export async function getGlossaryByLetter(): Promise<
  Record<string, CollectionEntry<"glossary">[]>
> {
  const entries = await getAllGlossaryTerms();
  return entries.reduce(
    (acc, entry) => {
      const firstLetter = entry.data.title.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(entry);
      return acc;
    },
    {} as Record<string, CollectionEntry<"glossary">[]>
  );
}

/**
 * Create a searchable term map for auto-linking
 * Includes main titles, synonyms, and keywords
 */
export async function createGlossaryTermMap(): Promise<
  Map<string, GlossaryTerm>
> {
  const entries = await getAllGlossaryTerms();
  const termMap = new Map<string, GlossaryTerm>();

  entries.forEach(entry => {
    const term: GlossaryTerm = {
      id: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      category: entry.data.category || "general",
      difficulty: entry.data.difficulty || "beginner",
      synonyms: entry.data.synonyms || [],
      keywords: entry.data.keywords || [],
    };

    // Add main title
    termMap.set(entry.data.title.toLowerCase(), term);

    // Add synonyms
    if (entry.data.synonyms) {
      entry.data.synonyms.forEach(synonym => {
        termMap.set(synonym.toLowerCase(), term);
      });
    }
  });

  return termMap;
}

/**
 * Find glossary term by title or synonym
 */
export async function findGlossaryTerm(
  searchTerm: string
): Promise<GlossaryTerm | undefined> {
  const termMap = await createGlossaryTermMap();
  return termMap.get(searchTerm.toLowerCase());
}

/**
 * Get related glossary terms for a given term
 */
export async function getRelatedTerms(
  termId: string,
  limit: number = 3
): Promise<CollectionEntry<"glossary">[]> {
  const allEntries = await getAllGlossaryTerms();
  const currentTerm = allEntries.find(e => e.id === termId);

  if (!currentTerm) return [];

  // Find related terms based on relatedTerms field or same category
  const related = allEntries.filter(
    entry =>
      entry.id !== termId &&
      (currentTerm.data.relatedTerms?.includes(entry.id) ||
        entry.data.relatedTerms?.includes(termId) ||
        entry.data.category === currentTerm.data.category)
  );

  return related.slice(0, limit);
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<
  Record<string, number>
> {
  const entries = await getAllGlossaryTerms();
  return entries.reduce(
    (acc, entry) => {
      const category = entry.data.category || "general";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Search glossary terms by query
 */
export async function searchGlossary(
  query: string,
  options: {
    category?: string;
    difficulty?: string;
    limit?: number;
  } = {}
): Promise<CollectionEntry<"glossary">[]> {
  const entries = await getAllGlossaryTerms();
  const lowerQuery = query.toLowerCase();

  let results = entries.filter(entry => {
    const matchesQuery =
      entry.data.title.toLowerCase().includes(lowerQuery) ||
      entry.data.description?.toLowerCase().includes(lowerQuery) ||
      entry.data.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) ||
      entry.data.synonyms?.some(s => s.toLowerCase().includes(lowerQuery));

    const matchesCategory =
      !options.category || entry.data.category === options.category;

    const matchesDifficulty =
      !options.difficulty || entry.data.difficulty === options.difficulty;

    return matchesQuery && matchesCategory && matchesDifficulty;
  });

  if (options.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Category configuration for consistent styling
 */
export const GLOSSARY_CATEGORIES = {
  medical: {
    icon: "🏥",
    label: "Medizin",
    color: "red",
    description: "Medizinische und klinische Begriffe",
  },
  nutrition: {
    icon: "🥗",
    label: "Ernährung",
    color: "green",
    description: "Ernährung und Nahrungsergänzung",
  },
  wellness: {
    icon: "🧘",
    label: "Wellness",
    color: "blue",
    description: "Wellness und Gesundheitsförderung",
  },
  psychology: {
    icon: "🧠",
    label: "Psychologie",
    color: "purple",
    description: "Psychologische und mentale Gesundheit",
  },
  anatomy: {
    icon: "🫀",
    label: "Anatomie",
    color: "orange",
    description: "Anatomische Strukturen und Funktionen",
  },
  general: {
    icon: "📚",
    label: "Allgemein",
    color: "gray",
    description: "Allgemeine Gesundheitsbegriffe",
  },
} as const;

/**
 * Difficulty level configuration
 */
export const DIFFICULTY_LEVELS = {
  beginner: {
    label: "Einsteiger",
    stars: "★",
    color: "green",
  },
  intermediate: {
    label: "Fortgeschritten",
    stars: "★★",
    color: "yellow",
  },
  advanced: {
    label: "Expert",
    stars: "★★★",
    color: "red",
  },
} as const;
