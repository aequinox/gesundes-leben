/**
 * @file index.ts
 * @description Simplified SEO component exports
 *
 * Centralized exports for the essential SEO components needed
 * for the German health blog.
 */

// Note: Astro components cannot be imported in TypeScript compilation
// These exports are available at runtime in Astro environments

// Types
export type {
  SEOMetadata,
  HealthArticleProps,
  BreadcrumbProps,
  MetaTag,
} from "./types";

// Utilities
export { isNonEmptyString, isValidURL } from "./types";
