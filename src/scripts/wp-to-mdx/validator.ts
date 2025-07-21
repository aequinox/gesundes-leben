import { z } from "zod";
import { CATEGORIES, GROUPS } from "@/utils/types";
import { logger } from "./logger";
import type { AstroBlogPost, ConversionError } from "./types";

export class ContentValidator {
  private errors: ConversionError[] = [];

  /**
   * Validate Astro blog post against the content.config.ts schema
   */
  validatePost(post: AstroBlogPost): boolean {
    const errors = this.validatePostSchema(post);
    
    if (errors.length > 0) {
      errors.forEach(error => {
        const conversionError: ConversionError = {
          type: "validate",
          message: error,
          postId: post.id,
          postTitle: post.title,
        };
        this.errors.push(conversionError);
      });
      
      logger.error(`Validation failed for post "${post.title}": ${errors.join(", ")}`);
      return false;
    }

    logger.debug(`Validation passed for post: ${post.title}`);
    return true;
  }

  /**
   * Validate against the Astro blog schema
   */
  private validatePostSchema(post: AstroBlogPost): string[] {
    const errors: string[] = [];

    try {
      // Create the schema matching content.config.ts
      const blogSchema = z.object({
        id: z.string().optional(),
        title: z.string(),
        author: z.string(),
        description: z.string().min(10, "Description must be at least 10 characters"),
        pubDatetime: z.date(),
        modDatetime: z.date().optional(),
        keywords: z.array(z.string()).default([""]),
        featured: z.boolean().optional(),
        draft: z.boolean().default(false),
        tags: z.array(z.string()).default(["others"]),
        categories: z.array(z.enum(CATEGORIES as any)),
        group: z.enum(GROUPS as any),
        heroImage: z.object({
          src: z.string(),
          alt: z.string().default("Featured Image"),
        }),
        ogImage: z.string().optional(),
        canonicalURL: z.string().optional(),
        timezone: z.string().optional(),
        readingTime: z.number().positive().optional(),
        references: z.array(z.string()).default([]),
      });

      // Prepare data for validation
      const validationData = {
        id: post.id,
        title: post.title,
        author: post.author,
        description: post.description,
        pubDatetime: post.pubDatetime,
        modDatetime: post.modDatetime,
        keywords: post.keywords,
        featured: post.featured,
        draft: post.draft,
        tags: post.tags,
        categories: post.categories,
        group: post.group,
        heroImage: post.heroImage,
        ogImage: post.ogImage,
        canonicalURL: post.canonicalURL,
        timezone: post.timezone,
        readingTime: post.readingTime,
        references: post.references,
      };

      // Validate against schema
      blogSchema.parse(validationData);

    } catch (zodError) {
      if (zodError instanceof z.ZodError) {
        zodError.errors.forEach(err => {
          const path = err.path.join(".");
          const message = `${path}: ${err.message}`;
          errors.push(message);
        });
      } else {
        errors.push(`Validation error: ${zodError}`);
      }
    }

    // Additional custom validations
    errors.push(...this.validateCustomRules(post));

    return errors;
  }

  /**
   * Additional custom validation rules
   */
  private validateCustomRules(post: AstroBlogPost): string[] {
    const errors: string[] = [];

    // Title validation
    if (!post.title.trim()) {
      errors.push("Title cannot be empty");
    }
    if (post.title.length > 200) {
      errors.push("Title is too long (max 200 characters)");
    }

    // Description validation
    if (post.description.length > 300) {
      errors.push("Description is too long (max 300 characters)");
    }

    // Author validation - check against known authors
    const validAuthors = ["kai-renner", "sandra-pfeiffer"];
    if (!validAuthors.includes(post.author)) {
      errors.push(`Invalid author: ${post.author}. Valid authors: ${validAuthors.join(", ")}`);
    }

    // Categories validation - ensure they exist in CATEGORIES
    const invalidCategories = post.categories.filter(cat => 
      !CATEGORIES.includes(cat as any)
    );
    if (invalidCategories.length > 0) {
      errors.push(`Invalid categories: ${invalidCategories.join(", ")}`);
    }

    // Group validation
    if (!GROUPS.includes(post.group as any)) {
      errors.push(`Invalid group: ${post.group}. Valid groups: ${GROUPS.join(", ")}`);
    }

    // Tags validation
    if (post.tags.some(tag => tag.length > 50)) {
      errors.push("Some tags are too long (max 50 characters)");
    }

    // Hero image validation
    if (!post.heroImage.src) {
      errors.push("Hero image src is required");
    }
    if (post.heroImage.src && !post.heroImage.src.startsWith("./images/")) {
      // Only warn for local images
      if (!post.heroImage.src.startsWith("http")) {
        errors.push("Hero image src should start with './images/' for local images");
      }
    }

    // Keywords validation
    if (post.keywords.length > 20) {
      errors.push("Too many keywords (max 20)");
    }

    // References validation
    if (post.references.length > 50) {
      errors.push("Too many references (max 50)");
    }

    // Content validation
    if (!post.content.trim()) {
      errors.push("Content cannot be empty");
    }
    if (post.content.length < 100) {
      errors.push("Content is too short (min 100 characters)");
    }

    // Date validation
    const now = new Date();
    if (post.pubDatetime > now) {
      // Only warn for future dates
      logger.warn(`Post "${post.title}" has future publication date`);
    }

    if (post.modDatetime && post.modDatetime < post.pubDatetime) {
      errors.push("Modified date cannot be before publication date");
    }

    // Slug validation
    if (!post.slug) {
      errors.push("Slug is required");
    } else {
      const validSlugPattern = /^[a-z0-9-]+$/;
      if (!validSlugPattern.test(post.slug)) {
        errors.push("Slug contains invalid characters (only lowercase letters, numbers, and hyphens allowed)");
      }
    }

    // Folder path validation
    if (!post.folderPath) {
      errors.push("Folder path is required");
    } else {
      const validPathPattern = /^\d{4}-\d{2}-\d{2}-.+$/;
      if (!validPathPattern.test(post.folderPath)) {
        errors.push("Folder path should follow format: YYYY-MM-DD-slug");
      }
    }

    return errors;
  }

  /**
   * Validate MDX content syntax
   */
  validateMDXContent(content: string, postTitle: string): boolean {
    const errors: string[] = [];

    try {
      // Basic MDX syntax validation
      
      // Check for unclosed code blocks
      const codeBlockMatches = content.match(/```/g);
      if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
        errors.push("Unclosed code block found");
      }

      // Check for malformed links
      const linkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
      let linkMatch;
      while ((linkMatch = linkPattern.exec(content)) !== null) {
        const [, linkText, linkUrl] = linkMatch;
        if (!linkText.trim()) {
          errors.push("Empty link text found");
        }
        if (!linkUrl.trim()) {
          errors.push("Empty link URL found");
        }
      }

      // Check for malformed images
      const imagePattern = /!\[([^\]]*)\]\(([^)]*)\)/g;
      let imageMatch;
      while ((imageMatch = imagePattern.exec(content)) !== null) {
        const [, altText, imageUrl] = imageMatch;
        if (!imageUrl.trim()) {
          errors.push("Empty image URL found");
        }
      }

      // Check for HTML tags that might cause issues
      const problematicTags = /<(script|iframe|embed|object|style)/gi;
      if (problematicTags.test(content)) {
        logger.warn(`Post "${postTitle}" contains potentially problematic HTML tags`);
      }

      // Check for German language content (basic check)
      const germanChars = /[äöüßÄÖÜ]/;
      if (!germanChars.test(content)) {
        logger.warn(`Post "${postTitle}" might not contain German content`);
      }

    } catch (error) {
      errors.push(`MDX validation error: ${error}`);
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        const conversionError: ConversionError = {
          type: "validate",
          message: error,
          postTitle: postTitle,
        };
        this.errors.push(conversionError);
      });
      
      logger.error(`MDX validation failed for post "${postTitle}": ${errors.join(", ")}`);
      return false;
    }

    return true;
  }

  /**
   * Validate file structure
   */
  validateFileStructure(post: AstroBlogPost): boolean {
    const errors: string[] = [];

    // Check folder structure
    if (!post.folderPath.match(/^\d{4}-\d{2}-\d{2}-.+$/)) {
      errors.push("Invalid folder structure. Should be: YYYY-MM-DD-slug");
    }

    // Check image references
    const imageRefs = post.content.match(/!\[.*?\]\((.*?)\)/g) || [];
    const localImages = imageRefs.filter(ref => ref.includes("./images/"));
    
    localImages.forEach(imageRef => {
      const match = imageRef.match(/!\[.*?\]\(\.(\/images\/.*?)\)/);
      if (match) {
        const imagePath = match[1];
        const filename = imagePath.split("/").pop();
        if (!post.images.includes(filename || "")) {
          errors.push(`Referenced image not found in images array: ${filename}`);
        }
      }
    });

    // Check hero image
    if (post.heroImage.src.startsWith("./images/")) {
      const heroFilename = post.heroImage.src.replace("./images/", "");
      if (!post.images.includes(heroFilename)) {
        errors.push(`Hero image not found in images array: ${heroFilename}`);
      }
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        const conversionError: ConversionError = {
          type: "validate",
          message: error,
          postId: post.id,
          postTitle: post.title,
        };
        this.errors.push(conversionError);
      });
      
      logger.error(`File structure validation failed for post "${post.title}": ${errors.join(", ")}`);
      return false;
    }

    return true;
  }

  /**
   * Validate batch of posts for consistency
   */
  validateBatch(posts: AstroBlogPost[]): boolean {
    const errors: string[] = [];

    // Check for duplicate IDs
    const ids = posts.map(p => p.id).filter(Boolean);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate post IDs found: ${duplicateIds.join(", ")}`);
    }

    // Check for duplicate slugs
    const slugs = posts.map(p => p.slug).filter(Boolean);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicateSlugs.length > 0) {
      errors.push(`Duplicate post slugs found: ${duplicateSlugs.join(", ")}`);
    }

    // Check for duplicate folder paths
    const folderPaths = posts.map(p => p.folderPath).filter(Boolean);
    const duplicatePaths = folderPaths.filter((path, index) => folderPaths.indexOf(path) !== index);
    if (duplicatePaths.length > 0) {
      errors.push(`Duplicate folder paths found: ${duplicatePaths.join(", ")}`);
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        const conversionError: ConversionError = {
          type: "validate",
          message: error,
        };
        this.errors.push(conversionError);
      });
      
      logger.error(`Batch validation failed: ${errors.join(", ")}`);
      return false;
    }

    logger.info(`Batch validation passed for ${posts.length} posts`);
    return true;
  }

  /**
   * Get validation errors
   */
  getErrors(): ConversionError[] {
    return this.errors;
  }

  /**
   * Clear validation errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByPost: Record<string, number>;
  } {
    const totalErrors = this.errors.length;
    const errorsByType: Record<string, number> = {};
    const errorsByPost: Record<string, number> = {};

    this.errors.forEach(error => {
      // Count by type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;

      // Count by post
      const postKey = error.postTitle || error.postId || "Unknown";
      errorsByPost[postKey] = (errorsByPost[postKey] || 0) + 1;
    });

    return {
      totalErrors,
      errorsByType,
      errorsByPost,
    };
  }
}