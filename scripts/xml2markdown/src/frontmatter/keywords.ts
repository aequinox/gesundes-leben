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
 * Extract keywords from post tags and categories for Healthy Life blog
 * WordPress meta keywords or fallback to tags
 */
export default (post: Post): string[] => {
  try {
    const keywords: string[] = [];

    // First try to get keywords from WordPress meta
    if (post.data.postmeta) {
      const keywordsMeta = post.data.postmeta.find(
        meta =>
          meta.meta_key[0] === "_yoast_wpseo_focuskw" ||
          meta.meta_key[0] === "keywords"
      );
      if (keywordsMeta?.meta_value?.[0]) {
        const metaKeywords = keywordsMeta.meta_value[0]
          .split(",")
          .map((keyword: string) => keyword.trim())
          .filter((keyword: string) => keyword.length > 0);
        keywords.push(...metaKeywords);
      }
    }

    // If no meta keywords found, extract from tags
    if (keywords.length === 0 && post.data.category) {
      const tags = post.data.category
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
        })
        .filter((tag: string) => tag && tag.length > 0);

      keywords.push(...tags);
    }

    // If still no keywords, use categories as fallback
    if (keywords.length === 0 && post.data.category) {
      const categories = post.data.category
        .filter((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return category.$.domain === "category";
          }
          return category["@_domain"] === "category";
        })
        .map((category: WordPressCategoryData) => {
          if (isAltFormat(category)) {
            return decodeURIComponent(category._);
          }
          return decodeURIComponent(category["#text"]);
        })
        .filter(
          (cat: string) =>
            cat &&
            cat.length > 0 &&
            !["uncategorized", "Uncategorized", "Unkategorisiert"].includes(cat)
        );

      keywords.push(...categories);
    }

    // Remove duplicates and return max 10 keywords
    return [...new Set(keywords)].slice(0, 10);
  } catch (error) {
    throw new ConversionError(
      "Failed to process post keywords",
      error as Record<string, unknown>
    );
  }
};
