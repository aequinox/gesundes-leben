import { ConversionError } from "../errors.js";
import * as settings from "../settings.js";
import type {
  Post,
  FrontmatterGetter,
  BlogCategory,
  WordPressCategoryData,
} from "../types.js";

/**
 * WordPress to Healthy Life blog category mapping
 * Maps WordPress categories to valid blog categories
 */
const CATEGORY_MAPPING: Record<string, BlogCategory> = {
  // Direct mappings
  ernährung: "Ernährung",
  immunsystem: "Immunsystem",
  gesundheit: "Gesundheit",
  wellness: "Wellness",
  "mentale gesundheit": "Mentale Gesundheit",
  fitness: "Fitness",
  prävention: "Prävention",
  naturheilkunde: "Naturheilkunde",
  organsysteme: "Organsysteme",
  wissenschaftliches: "Wissenschaftliches",

  // English to German mappings
  nutrition: "Ernährung",
  health: "Gesundheit",
  "mental health": "Mentale Gesundheit",
  prevention: "Prävention",
  "natural medicine": "Naturheilkunde",
  organs: "Organsysteme",
  science: "Wissenschaftliches",

  // Common variations
  nahrung: "Ernährung",
  körper: "Organsysteme",
  medizin: "Wissenschaftliches",
};

/**
 * Valid blog categories from types.ts
 */
const VALID_CATEGORIES: BlogCategory[] = [
  "Ernährung",
  "Gesundheit",
  "Wellness",
  "Mentale Gesundheit",
  "Fitness",
  "Immunsystem",
  "Prävention",
  "Naturheilkunde",
  "Organsysteme",
  "Wissenschaftliches",
];

/**
 * Get array of mapped category names for Healthy Life blog
 * Maps WordPress categories to valid blog categories and filters out invalid ones
 * @throws {ConversionError} When category processing fails
 */
const categoriesGetter: FrontmatterGetter = (post: Post): BlogCategory[] => {
  if (!post.data.category) {
    return ["Gesundheit"]; // Default category if none found
  }

  try {
    const rawCategories = post.data.category
      .filter((category: WordPressCategoryData) => {
        if ("_" in category && "$" in category) {
          return category.$.domain === "category";
        }
        return category["@_domain"] === "category";
      })
      .map((category: WordPressCategoryData) => {
        if ("_" in category && "$" in category) {
          return decodeURIComponent(category._);
        }
        return decodeURIComponent(category["#text"]);
      })
      .filter(
        (category: string) => !settings.filter_categories.includes(category)
      );

    const mappedCategories: BlogCategory[] = [];

    for (const category of rawCategories) {
      const lowerCategory = category.toLowerCase();

      // Check direct mapping
      if (CATEGORY_MAPPING[lowerCategory]) {
        mappedCategories.push(CATEGORY_MAPPING[lowerCategory]);
      }
      // Check if it's already a valid category (case insensitive)
      else if (
        VALID_CATEGORIES.find(
          (valid: BlogCategory) => valid.toLowerCase() === lowerCategory
        )
      ) {
        const validCategory = VALID_CATEGORIES.find(
          (valid: BlogCategory) => valid.toLowerCase() === lowerCategory
        );
        if (validCategory) {
          mappedCategories.push(validCategory);
        }
      }
      // Check partial matches for compound categories
      else {
        let matched = false;
        for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
          if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
            mappedCategories.push(value);
            matched = true;
            break;
          }
        }

        // If no mapping found, try to match with valid categories partially
        if (!matched) {
          for (const validCat of VALID_CATEGORIES) {
            if (
              validCat.toLowerCase().includes(lowerCategory) ||
              lowerCategory.includes(validCat.toLowerCase())
            ) {
              mappedCategories.push(validCat);
              matched = true;
              break;
            }
          }
        }
      }
    }

    // Remove duplicates and ensure we have at least one category
    const uniqueCategories = [...new Set(mappedCategories)];
    return uniqueCategories.length > 0 ? uniqueCategories : ["Gesundheit"];
  } catch (error) {
    throw new ConversionError("Failed to process post categories", {
      originalError: error,
    });
  }
};

export default categoriesGetter;
