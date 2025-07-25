import { ConversionError } from "../errors.js";
import type { Post, WordPressCategoryData, WordPressCategoryAlt } from "../types.js";

/**
 * Type guard to check if category uses alternative format
 */
function isAltFormat(category: WordPressCategoryData): category is WordPressCategoryAlt {
  return '_' in category && '$' in category;
}

/**
 * Get array of decoded tag names
 * Filters category data to only include post_tag domain
 */
export default (post: Post): string[] => {
  if (!post.data.category) {
    return [];
  }

  try {
    return post.data.category
      .filter((category: WordPressCategoryData) => {
        if (isAltFormat(category)) {
          return category.$.domain === "post_tag";
        }
        return category["@_domain"] === "post_tag";
      })
      .map((category: WordPressCategoryData) => {
        if (isAltFormat(category)) {
          return decodeURIComponent(category._);
        }
        return decodeURIComponent(category["#text"]);
      });
  } catch (error) {
    throw new ConversionError(
      "Failed to process post tags",
      error as Record<string, unknown>
    );
  }
};
