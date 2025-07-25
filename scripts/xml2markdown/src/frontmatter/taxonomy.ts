import { ConversionError } from "../errors.js";
import type {
  Post,
  WordPressCategoryData,
  WordPressCategoryAlt,
} from "../types.js";

/**
 * Type guard to check if category uses alternative format
 */
function isAltFormat(
  category: WordPressCategoryData
): category is WordPressCategoryAlt {
  return "_" in category && "$" in category;
}

/**
 * Get array of decoded taxonomy terms
 * Filters category data to only include beitragsart domain
 * Uses nicename attribute instead of name
 */
export default (post: Post): string[] => {
  if (!post.data.category) {
    return [];
  }

  try {
    return post.data.category
      .filter((category: WordPressCategoryData) => {
        if (isAltFormat(category)) {
          return category.$.domain === "beitragsart";
        }
        return category["@_domain"] === "beitragsart";
      })
      .map((category: WordPressCategoryData) => {
        if (isAltFormat(category)) {
          return decodeURIComponent(category.$.nicename || category._);
        }
        return decodeURIComponent(category["@_nicename"]);
      });
  } catch (error) {
    throw new ConversionError(
      "Failed to process post taxonomy",
      error as Record<string, unknown>
    );
  }
};
