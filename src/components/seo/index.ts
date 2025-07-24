/**
 * @file index.ts
 * @description Simplified SEO component exports
 *
 * Centralized exports for the essential SEO components needed
 * for the German health blog.
 */

// Main SEO Component - commented out to avoid TypeScript errors in --noEmit mode
// export { default as SEO } from "./SEO.astro";

// Schema Components - commented out to avoid TypeScript errors in --noEmit mode
// export { default as BreadcrumbSchema } from "./BreadcrumbSchema.astro";
// export { default as HealthArticleSchema } from "./HealthArticleSchema.astro";
// export { default as WebsiteSchema } from "./WebsiteSchema.astro";

// Types
export type {
  SEOMetadata,
  HealthArticleProps,
  BreadcrumbProps,
  MetaTag,
} from "./types";

// Utilities
export { isNonEmptyString, isValidURL } from "./types";
