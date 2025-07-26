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
 * Maps WordPress categories to valid Astro content collection categories
 * Based on actual categories found in XML: allgemein, ernaehrung, immunsystem, 
 * lesenswertes, lifestyle-psyche, mikronaehrstoffe, organsysteme, wissenschaftliches, wissenswertes
 */
const CATEGORY_MAPPING: Record<string, BlogCategory> = {
  // Direct mappings from WordPress XML (nicename format)
  allgemein: "Wissenswertes", // Map generic "Allgemein" to "Wissenswertes"
  ernaehrung: "Ernährung",
  immunsystem: "Immunsystem", 
  lesenswertes: "Lesenswertes",
  "lifestyle-psyche": "Lifestyle & Psyche", // WordPress uses dash, Astro uses ampersand
  mikronaehrstoffe: "Mikronährstoffe",
  organsysteme: "Organsysteme",
  wissenschaftliches: "Wissenschaftliches",
  wissenswertes: "Wissenswertes",

  // Direct mappings from WordPress XML (display name format with HTML entities)
  "Allgemein": "Wissenswertes",
  "ernährung": "Ernährung",
  "lifestyle & psyche": "Lifestyle & Psyche",
  "lifestyle &amp; psyche": "Lifestyle & Psyche", // Handle HTML entity
  "mikronährstoffe": "Mikronährstoffe",

  // Map non-matching categories to closest equivalents
  gesundheit: "Wissenswertes", // Map Gesundheit to Wissenswertes
  wellness: "Lifestyle & Psyche", // Map Wellness to Lifestyle & Psyche
  fitness: "Lifestyle & Psyche", // Map Fitness to Lifestyle & Psyche
  "mentale gesundheit": "Lifestyle & Psyche", // Map Mentale Gesundheit to Lifestyle & Psyche
  prävention: "Wissenswertes", // Map Prävention to Wissenswertes
  naturheilkunde: "Wissenschaftliches", // Map Naturheilkunde to Wissenschaftliches

  // English to German mappings
  nutrition: "Ernährung",
  health: "Wissenswertes",
  "mental health": "Lifestyle & Psyche",
  prevention: "Wissenswertes",
  "natural medicine": "Wissenschaftliches",
  organs: "Organsysteme",
  science: "Wissenschaftliches",
  micronutrients: "Mikronährstoffe",

  // Common variations
  nahrung: "Ernährung",
  körper: "Organsysteme",
  medizin: "Wissenschaftliches",
  vitamine: "Mikronährstoffe",
  mineralstoffe: "Mikronährstoffe",
};

/**
 * Valid blog categories from Astro content collection schema
 */
const VALID_CATEGORIES: BlogCategory[] = [
  "Ernährung",
  "Immunsystem",
  "Lesenswertes",
  "Lifestyle & Psyche",
  "Mikronährstoffe",
  "Organsysteme",
  "Wissenschaftliches",
  "Wissenswertes",
];

/**
 * Get array of mapped category names for Healthy Life blog
 * Maps WordPress categories to valid blog categories and filters out invalid ones
 * @throws {ConversionError} When category processing fails
 */
const categoriesGetter: FrontmatterGetter = (post: Post): BlogCategory[] => {
  if (!post.data.category) {
    return ["Wissenswertes"]; // Default category if none found
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
    return uniqueCategories.length > 0 ? uniqueCategories : ["Wissenswertes"];
  } catch (error) {
    throw new ConversionError("Failed to process post categories", {
      originalError: error,
    });
  }
};

export default categoriesGetter;
