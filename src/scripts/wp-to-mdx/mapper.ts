import { v4 as uuidv4 } from "uuid";

import {
  CONVERSION_DEFAULTS,
  DEFAULT_CATEGORY_MAPPING,
  DEFAULT_AUTHOR_MAPPING,
} from "./config";
import { ErrorFactory, ConversionErrorCollector } from "./errors";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type {
  WordPressPost,
  AstroBlogPost,
  CategoryMapping,
  AuthorMapping,
  ConversionConfig,
} from "./types";

import { CATEGORIES, GROUPS } from "@/utils/types";

export class SchemaMapper {
  private config: ConversionConfig;
  private categoryMapping: CategoryMapping;
  private authorMapping: AuthorMapping;
  private errorCollector = new ConversionErrorCollector();

  constructor(config: ConversionConfig) {
    this.config = config;
    this.categoryMapping = this.createCategoryMapping();
    this.authorMapping = this.createAuthorMapping();
  }

  /**
   * Convert WordPress post to Astro blog post format
   */
  mapWordPressToAstro(
    wpPost: WordPressPost,
    mdxContent: string,
    imageFiles: string[] = []
  ): AstroBlogPost {
    try {
      logger.debug(`Mapping WordPress post: ${wpPost.title}`);

      const slug = this.generateSlug(wpPost);
      const folderPath = this.generateFolderPath(wpPost);
      const heroImage = this.mapHeroImage(wpPost, imageFiles);

      const astroBlogPost: AstroBlogPost = {
        id: wpPost.id || uuidv4(),
        title: wpPost.title.trim(),
        author: this.mapAuthor(wpPost.author),
        description: this.generateDescription(wpPost, mdxContent),
        pubDatetime: wpPost.pubDate,
        modDatetime: wpPost.modifiedDate,
        keywords: this.extractKeywords(wpPost, mdxContent),
        featured: this.determineFeatured(wpPost),
        draft: wpPost.status !== "publish",
        tags: this.cleanTags(wpPost.tags),
        categories: this.mapCategories(wpPost.categories),
        group: this.determineGroup(wpPost) as "pro" | "kontra" | "fragezeiten",
        heroImage: heroImage,
        ogImage: heroImage.src,
        canonicalURL: this.generateCanonicalURL(wpPost),
        references: this.extractReferences(wpPost),
        content: mdxContent,
        slug: slug,
        folderPath: folderPath,
        images: imageFiles,
      };

      logger.info(`Successfully mapped post: ${wpPost.title}`);
      return astroBlogPost;
    } catch (error) {
      logger.error(`Failed to map WordPress post ${wpPost.title}: ${error}`);
      throw new Error(`Schema mapping failed for post: ${wpPost.title}`);
    }
  }

  /**
   * Create category mapping with defaults and user overrides
   */
  private createCategoryMapping(): CategoryMapping {
    return {
      ...DEFAULT_CATEGORY_MAPPING,
      ...this.config.categoryMapping,
    };
  }

  /**
   * Create author mapping with defaults and user overrides
   */
  private createAuthorMapping(): AuthorMapping {
    return {
      ...DEFAULT_AUTHOR_MAPPING,
      ...this.config.authorMapping,
    };
  }

  /**
   * Generate URL-safe slug from WordPress post
   */
  private generateSlug(wpPost: WordPressPost): string {
    // Use WordPress slug if available, otherwise generate from title
    if (wpPost.slug && wpPost.slug.trim()) {
      return wpPost.slug.trim();
    }

    return slugify(wpPost.title);
  }

  /**
   * Generate folder path following Astro blog structure
   */
  private generateFolderPath(wpPost: WordPressPost): string {
    const date = wpPost.pubDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const slug = this.generateSlug(wpPost);

    return `${year}-${month}-${day}-${slug}`;
  }

  /**
   * Map WordPress author to Astro author reference
   */
  private mapAuthor(wpAuthor: string): string {
    const normalizedAuthor = wpAuthor.toLowerCase().trim();
    return this.authorMapping[normalizedAuthor] || "kai-renner"; // default fallback
  }

  /**
   * Map WordPress categories to Astro categories
   */
  private mapCategories(wpCategories: string[]): string[] {
    const astroCategories = new Set<string>();

    for (const wpCategory of wpCategories) {
      const normalized = wpCategory.toLowerCase().trim();
      const mapped = this.categoryMapping[normalized];

      if (mapped) {
        mapped.forEach(cat => astroCategories.add(cat));
      } else {
        // Try to find partial matches
        const partialMatch = this.findPartialCategoryMatch(normalized);
        if (partialMatch) {
          partialMatch.forEach(cat => astroCategories.add(cat));
        } else {
          // Default fallback
          astroCategories.add("Wissenswertes");
        }
      }
    }

    // Ensure we have at least one category
    if (astroCategories.size === 0) {
      astroCategories.add("Wissenswertes");
    }

    return Array.from(astroCategories);
  }

  /**
   * Find partial category matches
   */
  private findPartialCategoryMatch(category: string): string[] | null {
    for (const [key, value] of Object.entries(this.categoryMapping)) {
      if (category.includes(key) || key.includes(category)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Determine post group based on WordPress categories and content
   */
  private determineGroup(
    wpPost: WordPressPost
  ): "pro" | "kontra" | "fragezeichen" {
    // Check custom WordPress taxonomy "beitragsart"
    const categories = wpPost.categories.map(cat => cat.toLowerCase());

    if (categories.includes("pro")) {return "pro";}
    if (categories.includes("kontra")) {return "kontra";}
    if (categories.includes("fragezeichen")) {return "fragezeichen";}

    // Analyze content sentiment or topic
    const title = wpPost.title.toLowerCase();
    const content = wpPost.content.toLowerCase();

    // Use keywords from configuration
    const kontraKeywords = CONVERSION_DEFAULTS.KONTRA_KEYWORDS;
    const proKeywords = CONVERSION_DEFAULTS.PRO_KEYWORDS;
    const frageKeywords = CONVERSION_DEFAULTS.FRAGE_KEYWORDS;

    const titleAndExcerpt = title + " " + wpPost.excerpt.toLowerCase();

    if (this.containsKeywords(titleAndExcerpt, kontraKeywords)) {
      return "kontra";
    } else if (this.containsKeywords(titleAndExcerpt, proKeywords)) {
      return "pro";
    } else if (this.containsKeywords(titleAndExcerpt, frageKeywords)) {
      return "fragezeichen";
    }

    // Default fallback
    return "pro";
  }

  /**
   * Check if text contains any of the given keywords
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Clean and normalize tags
   */
  private cleanTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .filter(tag => tag.length < 50) // Remove overly long tags
      .slice(0, 20); // Limit to reasonable number
  }

  /**
   * Map hero image from WordPress
   */
  private mapHeroImage(
    wpPost: WordPressPost,
    imageFiles: string[]
  ): { src: string; alt: string } {
    // Try to find featured image
    if (wpPost.featuredImageUrl && imageFiles.length > 0) {
      const filename = this.extractFilenameFromUrl(wpPost.featuredImageUrl);
      const matchingImage = imageFiles.find(img => img.includes(filename));

      if (matchingImage) {
        return {
          src: `./images/${matchingImage}`,
          alt: wpPost.title || "Featured Image",
        };
      }
    }

    // Fallback to first image in content
    if (imageFiles.length > 0) {
      return {
        src: `./images/${imageFiles[0]}`,
        alt: wpPost.title || "Featured Image",
      };
    }

    // Default fallback - you might want to use a placeholder image
    return {
      src: "./images/placeholder.jpg",
      alt: wpPost.title || "Article Image",
    };
  }

  /**
   * Generate description from WordPress post
   */
  private generateDescription(
    wpPost: WordPressPost,
    mdxContent: string
  ): string {
    // Use WordPress excerpt if available
    if (wpPost.excerpt && wpPost.excerpt.trim().length > 10) {
      let desc = wpPost.excerpt.trim();
      if (desc.length > 160) {
        desc = desc.substring(0, 157) + "...";
      }
      return desc;
    }

    // Use WordPress SEO description from RankMath if available
    const rankMathDesc = wpPost.customFields["rank_math_description"];
    if (rankMathDesc && rankMathDesc.trim().length > 10) {
      return rankMathDesc.trim();
    }

    // Generate from content
    let text = mdxContent.replace(/[#*_`\[\]]/g, "");
    text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    text = text.replace(/\s+/g, " ").trim();

    if (text.length > 160) {
      text = text.substring(0, 157) + "...";
    }

    return text || "Ein Artikel über Gesundheit und Wohlbefinden.";
  }

  /**
   * Extract keywords from WordPress post
   */
  private extractKeywords(wpPost: WordPressPost, mdxContent: string): string[] {
    const keywords = new Set<string>();

    // Add WordPress tags as keywords
    wpPost.tags.forEach(tag => keywords.add(tag));

    // Add RankMath focus keywords if available
    const focusKeywords = wpPost.customFields["rank_math_focus_keyword"];
    if (focusKeywords) {
      focusKeywords.split(",").forEach((keyword: string) => {
        const clean = keyword.trim();
        if (clean) {keywords.add(clean);}
      });
    }

    // Add health-related German keywords found in content
    const healthKeywords = CONVERSION_DEFAULTS.HEALTH_KEYWORDS;

    const contentLower = (
      wpPost.title +
      " " +
      wpPost.content +
      " " +
      mdxContent
    ).toLowerCase();

    for (const keyword of healthKeywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        keywords.add(keyword);
      }
    }

    return Array.from(keywords).slice(0, CONVERSION_DEFAULTS.MAX_KEYWORDS);
  }

  /**
   * Determine if post should be featured
   */
  private determineFeatured(wpPost: WordPressPost): boolean {
    // Check WordPress custom fields for featured status
    const isFeatured =
      wpPost.customFields["_featured_post"] === "1" ||
      wpPost.customFields["is_featured"] === "true";

    if (isFeatured) {return true;}

    // Feature recent high-quality posts (heuristic)
    const isRecent =
      wpPost.pubDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const isLongContent = wpPost.content.length > 3000;
    const hasGoodSeoScore =
      parseInt(wpPost.customFields["rank_math_seo_score"]) > 80;

    return isRecent && isLongContent && hasGoodSeoScore;
  }

  /**
   * Generate canonical URL
   */
  private generateCanonicalURL(wpPost: WordPressPost): string | undefined {
    // If we're migrating from WordPress, we might want to preserve the original URL
    // or set up redirects. For now, we'll omit this to use Astro's default behavior.
    return undefined;
  }

  /**
   * Extract scientific references from content
   */
  private extractReferences(wpPost: WordPressPost): string[] {
    // This is a placeholder - you could implement citation extraction
    // from the WordPress content if you have a specific format
    return [];
  }

  /**
   * Extract filename from URL
   */
  private extractFilenameFromUrl(url: string): string {
    try {
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1] || "";
    } catch {
      return "";
    }
  }

  /**
   * Validate mapped Astro post against schema requirements
   */
  validateMappedPost(post: AstroBlogPost): string[] {
    const errors: string[] = [];

    // Required fields validation
    if (!post.title.trim()) {errors.push("Title is required");}
    if (!post.description.trim()) {errors.push("Description is required");}
    if (!post.author.trim()) {errors.push("Author is required");}
    if (!post.pubDatetime) {errors.push("Publication date is required");}
    if (!post.categories.length)
      {errors.push("At least one category is required");}
    if (!post.heroImage?.src) {errors.push("Hero image is required");}

    // Categories validation
    const validCategories = post.categories.filter(cat =>
      CATEGORIES.includes(cat as any)
    );
    if (validCategories.length !== post.categories.length) {
      errors.push(
        `Invalid categories found. Valid categories: ${CATEGORIES.join(", ")}`
      );
    }

    // Group validation
    if (!GROUPS.includes(post.group as any)) {
      errors.push(
        `Invalid group: ${post.group}. Valid groups: ${GROUPS.join(", ")}`
      );
    }

    // Author validation (basic check)
    if (!["kai-renner", "sandra-pfeiffer"].includes(post.author)) {
      errors.push(`Unknown author: ${post.author}`);
    }

    return errors;
  }

  /**
   * Get mapping errors
   */
  getErrors(): ConversionErrorCollector {
    return this.errorCollector;
  }

  /**
   * Clear mapping errors
   */
  clearErrors(): void {
    this.errorCollector.clear();
  }
}
