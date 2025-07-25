import { ConversionError } from "../errors.js";
import type { Post, WordPressCategoryData, WordPressCategoryAlt } from "../types.js";

/**
 * Type guard to check if category uses alternative format
 */
function isAltFormat(category: WordPressCategoryData): category is WordPressCategoryAlt {
  return '_' in category && '$' in category;
}

/**
 * Determine group classification for Healthy Life blog posts
 * Maps WordPress taxonomy or categories to blog groups: "pro", "kontra", "fragezeiten"
 */
export default (post: Post): string => {
  try {
    // First check for existing taxonomy mapping
    if (post.data.category) {
      const taxonomies = post.data.category
        .filter((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return category.$.domain === "taxonomy";
          }
          return category["@_domain"] === "taxonomy";
        })
        .map((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return decodeURIComponent(category._).toLowerCase();
          }
          return decodeURIComponent(category["#text"]).toLowerCase();
        });

      // Direct taxonomy mapping
      if (taxonomies.includes("pro")) {
        return "pro";
      }
      if (taxonomies.includes("kontra")) {
        return "kontra";
      }
      if (taxonomies.includes("fragezeiten")) {
        return "fragezeiten";
      }
    }

    // Check WordPress custom fields for group assignment
    if (post.data.postmeta) {
      const groupMeta = post.data.postmeta.find(
        (meta) =>
          meta.meta_key[0] === "group" || meta.meta_key[0] === "_group"
      );
      if (groupMeta && groupMeta.meta_value[0]) {
        const metaGroup = groupMeta.meta_value[0].toLowerCase();
        if (["pro", "kontra", "fragezeiten"].includes(metaGroup)) {
          return metaGroup;
        }
      }
    }

    // Fallback: analyze categories for content hints
    if (post.data.category) {
      const categories = post.data.category
        .filter((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return category.$.domain === "category";
          }
          return category["@_domain"] === "category";
        })
        .map((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return decodeURIComponent(category._).toLowerCase();
          }
          return decodeURIComponent(category["#text"]).toLowerCase();
        });

      // Categories that suggest "pro" (positive health content)
      const proCategories = [
        "ernährung",
        "immunsystem",
        "mikronährstoffe",
        "lifestyle",
        "wissenswertes",
      ];
      if (
        categories.some((cat: string) =>
          proCategories.some((proCat: string) => cat.includes(proCat))
        )
      ) {
        return "pro";
      }

      // Categories that might suggest questions or investigations
      const frageCategories = ["wissenschaftliches", "lesenswertes"];
      if (
        categories.some((cat: string) =>
          frageCategories.some((frageCat: string) => cat.includes(frageCat))
        )
      ) {
        return "fragezeiten";
      }
    }

    // Check post title for indicators
    if (post.data.title && post.data.title[0]) {
      const title = post.data.title[0].toLowerCase();

      // Question indicators
      if (
        title.includes("?") ||
        title.includes("warum") ||
        title.includes("wie") ||
        title.includes("frage")
      ) {
        return "fragezeiten";
      }

      // Negative health content indicators
      if (
        title.includes("gefahr") ||
        title.includes("risiko") ||
        title.includes("problem") ||
        title.includes("warnung")
      ) {
        return "kontra";
      }
    }

    // Default to 'pro' for positive health content
    return "pro";
  } catch (error) {
    throw new ConversionError(
      "Failed to determine post group",
      error as Record<string, unknown>
    );
  }
};
