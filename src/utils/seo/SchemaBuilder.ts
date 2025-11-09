/**
 * @file SchemaBuilder.ts
 * @description Shared utilities for building Schema.org structured data
 *
 * Consolidates common schema generation logic used across:
 * - SEO.astro
 * - HealthArticleSchema.astro
 * - WebsiteSchema.astro
 * - BreadcrumbSchema.astro
 *
 * Benefits:
 * - Eliminates ~150-200 lines of duplication
 * - Ensures consistent schema formatting
 * - Centralized validation and error handling
 * - Single source of truth for organization/author data
 */

import { LOCALE, SITE } from "@/config";
import { getI18nStrings } from "@/config/i18n";
import { isValidURL } from "@/types";
import { logger } from "@/utils/logger";

// ============================================================================
// Type Definitions
// ============================================================================

export interface ImageSchemaOptions {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
  alt?: string;
}

export interface AuthorSchemaOptions {
  name: string;
  url?: string;
  expertise?: string;
  useDefaults?: boolean;
}

export interface OrganizationSchemaOptions {
  name?: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  foundingYear?: number;
  socialUrls?: string[];
  includeId?: boolean;
}

export interface MedicalAudienceSchemaOptions {
  audienceType?: "Patient" | "MedicalProfessional" | "Caregiver";
  geographicArea?: string;
  language?: "de" | "en";
}

export interface PublisherSchemaOptions {
  name?: string;
  url?: string;
  logoUrl?: string;
}

// ============================================================================
// Core Utility Functions
// ============================================================================

/**
 * Format a Date object to ISO 8601 string for schema.org
 * @param date - Date to format
 * @returns ISO 8601 formatted string
 */
export function formatDate(
  date: Date | string | undefined
): string | undefined {
  if (!date) {
    return undefined;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toISOString();
  } catch (error) {
    logger.warn(`SchemaBuilder: Invalid date format: ${date}`);
    return undefined;
  }
}

/**
 * Sanitize text for use in meta tags and structured data
 * Strips HTML tags and escapes special characters
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[<>'"&]/g, match => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return entities[match] || match;
    })
    .trim();
}

/**
 * Resolve a relative or absolute URL to a full URL
 * @param path - Image path (relative or absolute)
 * @param baseUrl - Base URL for resolution (defaults to SITE.website)
 * @param fallback - Fallback URL if resolution fails
 * @returns Resolved absolute URL
 */
export function resolveUrl(
  path: string | undefined,
  baseUrl: string = SITE.website,
  fallback: string = "/og-default.jpg"
): string {
  if (!path) {
    return new URL(fallback, baseUrl).href;
  }

  try {
    // If already absolute URL, return as is
    if (isValidURL(path)) {
      return path;
    }

    // Resolve relative URLs
    return new URL(path, baseUrl).href;
  } catch (error) {
    logger.warn(`SchemaBuilder: Invalid URL: ${path}, using fallback`);
    return new URL(fallback, baseUrl).href;
  }
}

/**
 * Validate SEO text length and log warnings
 * @param title - SEO title
 * @param description - SEO description
 */
export function validateSeoLength(title: string, description: string): void {
  if (title.length > 60) {
    logger.warn(
      `SEO: Title exceeds 60 characters (${title.length}): "${title}"`
    );
  }

  if (description.length > 160) {
    logger.warn(
      `SEO: Description exceeds 160 characters (${description.length})`
    );
  }

  if (description.length < 120) {
    logger.info(
      "SEO: Description could be longer for better SEO (recommended: 120-160 chars)"
    );
  }
}

// ============================================================================
// Schema Building Functions
// ============================================================================

/**
 * Build an ImageObject schema
 * @param options - Image schema options
 * @returns ImageObject structured data
 */
export function buildImageSchema(
  options: ImageSchemaOptions
): Record<string, unknown> {
  const { url, width = 180, height = 180, caption, alt } = options;

  return {
    "@type": "ImageObject",
    url,
    width,
    height,
    ...(caption && { caption }),
    ...(alt && { description: alt }),
  };
}

/**
 * Build an Organization schema with common site information
 * @param options - Organization schema options
 * @returns Organization structured data
 */
export function buildOrganizationSchema(
  options: OrganizationSchemaOptions = {}
): Record<string, unknown> {
  const {
    name = SITE.title,
    url = SITE.website,
    logoUrl,
    description,
    foundingYear,
    socialUrls = [],
    includeId = false,
  } = options;

  const i18n = getI18nStrings(LOCALE.lang as "de" | "en");
  const resolvedLogoUrl = resolveUrl(logoUrl || "/logo.png", url);

  const schema: Record<string, unknown> = {
    "@type": "Organization",
    name,
    url,
    logo: buildImageSchema({
      url: resolvedLogoUrl,
      width: 180,
      height: 180,
      caption: `${name} Logo`,
    }),
  };

  if (includeId) {
    schema["@id"] = `${url}#organization`;
  }

  if (description) {
    schema.description = description;
  }

  if (foundingYear) {
    schema.foundingDate = `${foundingYear}-01-01`;
    schema.foundingLocation = {
      "@type": "Country",
      name: i18n.regions.germany,
    };
  }

  // Social media profiles
  const defaultSocials = [
    "https://www.facebook.com/gesundesleben",
    "https://www.instagram.com/gesundesleben",
  ];

  schema.sameAs = [...defaultSocials, ...socialUrls].filter(Boolean);

  return schema;
}

/**
 * Build a Publisher schema (simplified Organization)
 * @param options - Publisher schema options
 * @returns Publisher structured data
 */
export function buildPublisherSchema(
  options: PublisherSchemaOptions = {}
): Record<string, unknown> {
  const { name = SITE.title, url = SITE.website, logoUrl } = options;

  const resolvedLogoUrl = resolveUrl(logoUrl || "/logo.png", url);

  return {
    "@type": "Organization",
    name,
    url,
    logo: buildImageSchema({
      url: resolvedLogoUrl,
      width: 180,
      height: 180,
    }),
  };
}

/**
 * Build an Author (Person) schema
 * @param options - Author schema options
 * @returns Person structured data
 */
export function buildAuthorSchema(
  options: AuthorSchemaOptions
): Record<string, unknown> {
  const { name, url, expertise, useDefaults = false } = options;

  const i18n = getI18nStrings(LOCALE.lang as "de" | "en");

  const schema: Record<string, unknown> = {
    "@type": "Person",
    name: name || (useDefaults ? SITE.author : "Unknown Author"),
  };

  if (url) {
    schema.url = url;
  }

  if (expertise) {
    schema.expertise = expertise;
  } else if (useDefaults) {
    schema.expertise = i18n.seo.medical.expertiseLevel;
  }

  return schema;
}

/**
 * Build a MedicalAudience schema for health content
 * @param options - Medical audience options
 * @returns MedicalAudience structured data
 */
export function buildMedicalAudienceSchema(
  options: MedicalAudienceSchemaOptions = {}
): Record<string, unknown> {
  const { audienceType = "Patient", geographicArea, language = "de" } = options;

  const i18n = getI18nStrings(language);

  const schema: Record<string, unknown> = {
    "@type": "MedicalAudience",
    audienceType,
  };

  if (geographicArea) {
    schema.geographicArea = {
      "@type": "Country",
      name: geographicArea,
    };
  } else {
    schema.geographicArea = {
      "@type": "Country",
      name: i18n.regions.germany,
    };
  }

  return schema;
}

/**
 * Build a WebPage mainEntity reference
 * @param url - Page URL
 * @returns WebPage structured data
 */
export function buildWebPageMainEntity(url: string): Record<string, unknown> {
  return {
    "@type": "WebPage",
    "@id": url,
  };
}

/**
 * Build a WebSite isPartOf reference
 * @param name - Site name (defaults to SITE.title)
 * @param url - Site URL (defaults to SITE.website)
 * @returns WebSite structured data
 */
export function buildWebSiteReference(
  name: string = SITE.title,
  url: string = SITE.website
): Record<string, unknown> {
  return {
    "@type": "WebSite",
    name,
    url,
    publisher: {
      "@type": "Organization",
      name,
    },
  };
}

/**
 * Build article-specific structured data properties
 * @param options - Article options
 * @returns Article structured data
 */
export interface ArticleSchemaOptions {
  headline: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  author: AuthorSchemaOptions;
  section?: string;
  tags?: string[];
  wordCount?: number;
  image?: string;
}

export function buildArticleSchema(
  options: ArticleSchemaOptions
): Record<string, unknown> {
  const {
    headline,
    description,
    url,
    datePublished,
    dateModified,
    author,
    section,
    tags = [],
    wordCount,
    image,
  } = options;

  const i18n = getI18nStrings(LOCALE.lang as "de" | "en");
  const imageUrl = resolveUrl(image || SITE.ogImage);

  const schema: Record<string, unknown> = {
    "@type": ["Article", "HealthTopicContent"],
    headline,
    description,
    url,
    datePublished: formatDate(datePublished),
    author: buildAuthorSchema({ ...author, useDefaults: true }),
    publisher: buildPublisherSchema(),
    mainEntityOfPage: buildWebPageMainEntity(url),
    isPartOf: buildWebSiteReference(),
    image: imageUrl,
    inLanguage: LOCALE.langTag[0],
  };

  if (dateModified) {
    schema.dateModified = formatDate(dateModified);
  }

  if (section) {
    schema.articleSection = section;
  } else {
    schema.articleSection = i18n.seo.content.healthCategory;
  }

  if (tags.length > 0) {
    schema.keywords = tags.join(", ");
  }

  if (wordCount) {
    schema.wordCount = wordCount;
  }

  // Health-specific properties
  schema.genre = "Health and Wellness";
  schema.medicalAudience = buildMedicalAudienceSchema();
  schema.disclaimer = i18n.seo.medical.disclaimerShort;

  return schema;
}

/**
 * Build BreadcrumbList structured data
 * @param items - Breadcrumb items
 * @returns BreadcrumbList structured data
 */
export interface BreadcrumbItemData {
  name: string;
  url?: string;
  position: number;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItemData[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(item => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create base structured data with common properties
 * @param options - Base schema options
 * @returns Base structured data object
 */
export interface BaseSchemaOptions {
  name: string;
  description: string;
  url: string;
  image?: string;
}

export function buildBaseSchema(
  options: BaseSchemaOptions
): Record<string, unknown> {
  const { name, description, url, image } = options;

  return {
    "@context": "https://schema.org",
    "@language": LOCALE.lang,
    name: sanitizeText(name),
    description: sanitizeText(description),
    url,
    image: resolveUrl(image || SITE.ogImage),
    inLanguage: LOCALE.langTag[0],
  };
}

/**
 * Merge multiple schema objects, handling special cases
 * @param schemas - Schema objects to merge
 * @returns Merged schema object
 */
export function mergeSchemas(
  ...schemas: Array<Record<string, unknown> | undefined>
): Record<string, unknown> {
  return schemas.reduce((acc, schema) => {
    if (!schema) {
      return acc;
    }
    return { ...acc, ...schema };
  }, {});
}

/**
 * Generate a complete structured data script tag content
 * This is a helper for consistent JSON-LD generation
 * @param data - Structured data object
 * @returns Stringified JSON-LD data
 */
export function stringifySchema(data: Record<string, unknown>): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.error("SchemaBuilder: Failed to stringify schema", error);
    return "{}";
  }
}
