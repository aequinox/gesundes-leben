/**
 * @file types.ts
 * @description Simplified TypeScript interfaces for SEO components
 *
 * Essential SEO types focused on what the German health blog actually needs.
 */
import type { SupportedLanguage } from "@/config/i18n";

/**
 * SEO metadata interface for the main SEO component
 */
export interface SEOMetadata {
  /** Page title (recommended: 50-60 characters) */
  title?: string;

  /** Meta description (recommended: 120-160 characters) */
  description?: string;

  /** Keywords array for meta tags */
  keywords?: string[];

  /** Canonical URL for duplicate content handling */
  canonicalURL?: string;

  /** Open Graph image URL or path */
  ogImage?: string;

  /** Twitter card type */
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";

  /** Language for content */
  language?: SupportedLanguage;

  /** Whether to index this page */
  noIndex?: boolean;

  /** Whether to follow links on this page */
  noFollow?: boolean;

  /** Custom structured data */
  structuredData?: Record<string, unknown>;
}

/**
 * Custom meta tag interface
 */
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  httpEquiv?: string;
}

/**
 * Health article schema properties
 */
export interface HealthArticleProps {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  author: {
    name: string;
    expertise?: string;
  };
  healthCategory: string;
  medicalAudience?: "Patient" | "MedicalAudience";
}

/**
 * Breadcrumb schema properties
 */
export interface BreadcrumbProps {
  currentPage: string;
  category?: string;
  isHealthContent?: boolean;
}

/**
 * Utility type guards
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
