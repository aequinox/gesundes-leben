/**
 * @file SchemaBuilder.test.ts
 * @description Unit tests for SchemaBuilder utility functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/utils/logger";

import {
  buildArticleSchema,
  buildAuthorSchema,
  buildBreadcrumbSchema,
  buildImageSchema,
  buildMedicalAudienceSchema,
  buildOrganizationSchema,
  buildPublisherSchema,
  buildWebPageMainEntity,
  buildWebSiteReference,
  formatDate,
  mergeSchemas,
  resolveUrl,
  sanitizeText,
  stringifySchema,
  validateSeoLength,
  type ArticleSchemaOptions,
  type BreadcrumbItemData,
} from "../SchemaBuilder";

// Mock the logger
vi.mock("@/utils/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the config
vi.mock("@/config", () => ({
  SITE: {
    title: "Test Site",
    website: "https://example.com",
    author: "Test Author",
    ogImage: "/og-image.jpg",
  },
  LOCALE: {
    lang: "de",
    langTag: ["de-DE"],
  },
}));

// Mock i18n
vi.mock("@/config/i18n", () => ({
  getI18nStrings: () => ({
    regions: {
      germany: "Deutschland",
    },
    seo: {
      content: {
        healthCategory: "Gesundheit",
      },
      medical: {
        expertiseLevel: "Professional",
        disclaimerShort: "Medical disclaimer text",
      },
    },
  }),
}));

describe("SchemaBuilder - Core Utilities", () => {
  describe("formatDate", () => {
    it("should format Date object to ISO string", () => {
      const date = new Date("2025-01-01T12:00:00Z");
      expect(formatDate(date)).toBe("2025-01-01T12:00:00.000Z");
    });

    it("should format string date to ISO string", () => {
      const dateString = "2025-01-01";
      const result = formatDate(dateString);
      expect(result).toContain("2025-01-01");
    });

    it("should return undefined for undefined input", () => {
      expect(formatDate(undefined)).toBeUndefined();
    });

    it("should return undefined for invalid date", () => {
      expect(formatDate("invalid-date")).toBeUndefined();
    });
  });

  describe("sanitizeText", () => {
    it("should strip HTML tags", () => {
      const text = "<p>Hello <strong>World</strong></p>";
      expect(sanitizeText(text)).toBe("Hello World");
    });

    it("should escape special characters", () => {
      const text = "Test <>&\"' text";
      const result = sanitizeText(text);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).toContain("&amp;");
      expect(result).toContain("&quot;");
      expect(result).toContain("&#x27;");
    });

    it("should trim whitespace", () => {
      const text = "  Test text  ";
      expect(sanitizeText(text)).toBe("Test text");
    });

    it("should handle empty string", () => {
      expect(sanitizeText("")).toBe("");
    });
  });

  describe("resolveUrl", () => {
    it("should return absolute URL as is", () => {
      const url = "https://example.com/image.jpg";
      expect(resolveUrl(url)).toBe(url);
    });

    it("should resolve relative URL", () => {
      const path = "/image.jpg";
      const result = resolveUrl(path, "https://example.com");
      expect(result).toBe("https://example.com/image.jpg");
    });

    it("should return fallback for undefined path", () => {
      const result = resolveUrl(
        undefined,
        "https://example.com",
        "/default.jpg"
      );
      expect(result).toBe("https://example.com/default.jpg");
    });

    it("should use default fallback when not provided", () => {
      const result = resolveUrl(undefined, "https://example.com");
      expect(result).toContain("/og-default.jpg");
    });

    it("should return fallback for invalid URL", () => {
      const result = resolveUrl(
        "not a valid url",
        "https://example.com",
        "/default.jpg"
      );
      expect(result).toBe("https://example.com/default.jpg");
    });
  });

  describe("validateSeoLength", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should warn for title exceeding 60 characters", () => {
      const longTitle = "A".repeat(70);
      validateSeoLength(longTitle, "Valid description");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should warn for description exceeding 160 characters", () => {
      const longDesc = "A".repeat(170);
      validateSeoLength("Valid title", longDesc);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should info for description below 120 characters", () => {
      const shortDesc = "A".repeat(100);
      validateSeoLength("Valid title", shortDesc);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should not warn for valid lengths", () => {
      validateSeoLength("Valid title", "A".repeat(130));
      // Should have called info but not warn
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});

describe("SchemaBuilder - Schema Building Functions", () => {
  describe("buildImageSchema", () => {
    it("should build basic ImageObject", () => {
      const schema = buildImageSchema({ url: "https://example.com/image.jpg" });
      expect(schema).toEqual({
        "@type": "ImageObject",
        url: "https://example.com/image.jpg",
        width: 180,
        height: 180,
      });
    });

    it("should include optional properties", () => {
      const schema = buildImageSchema({
        url: "https://example.com/image.jpg",
        width: 1200,
        height: 630,
        caption: "Test caption",
        alt: "Test alt",
      });
      expect(schema).toEqual({
        "@type": "ImageObject",
        url: "https://example.com/image.jpg",
        width: 1200,
        height: 630,
        caption: "Test caption",
        description: "Test alt",
      });
    });
  });

  describe("buildOrganizationSchema", () => {
    it("should build basic Organization schema", () => {
      const schema = buildOrganizationSchema();
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("Test Site");
      expect(schema.url).toBe("https://example.com");
      expect(schema.logo).toBeDefined();
    });

    it("should include ID when requested", () => {
      const schema = buildOrganizationSchema({ includeId: true });
      expect(schema["@id"]).toBe("https://example.com#organization");
    });

    it("should include foundingYear", () => {
      const schema = buildOrganizationSchema({ foundingYear: 2024 });
      expect(schema.foundingDate).toBe("2024-01-01");
      expect(schema.foundingLocation).toBeDefined();
    });

    it("should include custom social URLs", () => {
      const schema = buildOrganizationSchema({
        socialUrls: ["https://twitter.com/test"],
      });
      expect(schema.sameAs).toContain("https://twitter.com/test");
    });
  });

  describe("buildPublisherSchema", () => {
    it("should build Publisher schema", () => {
      const schema = buildPublisherSchema();
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("Test Site");
      expect(schema.logo).toBeDefined();
    });

    it("should accept custom options", () => {
      const schema = buildPublisherSchema({
        name: "Custom Publisher",
        url: "https://custom.com",
      });
      expect(schema.name).toBe("Custom Publisher");
      expect(schema.url).toBe("https://custom.com");
    });
  });

  describe("buildAuthorSchema", () => {
    it("should build basic Author schema", () => {
      const schema = buildAuthorSchema({ name: "John Doe" });
      expect(schema["@type"]).toBe("Person");
      expect(schema.name).toBe("John Doe");
    });

    it("should include optional properties", () => {
      const schema = buildAuthorSchema({
        name: "John Doe",
        url: "https://example.com/author",
        expertise: "Health Professional",
      });
      expect(schema.url).toBe("https://example.com/author");
      expect(schema.expertise).toBe("Health Professional");
    });

    it("should use defaults when requested", () => {
      const schema = buildAuthorSchema({ name: "", useDefaults: true });
      expect(schema.name).toBe("Test Author");
      expect(schema.expertise).toBeDefined();
    });
  });

  describe("buildMedicalAudienceSchema", () => {
    it("should build basic MedicalAudience schema", () => {
      const schema = buildMedicalAudienceSchema();
      expect(schema["@type"]).toBe("MedicalAudience");
      expect(schema.audienceType).toBe("Patient");
      expect(schema.geographicArea).toBeDefined();
    });

    it("should accept custom audience type", () => {
      const schema = buildMedicalAudienceSchema({
        audienceType: "MedicalProfessional",
      });
      expect(schema.audienceType).toBe("MedicalProfessional");
    });

    it("should accept custom geographic area", () => {
      const schema = buildMedicalAudienceSchema({
        geographicArea: "Austria",
      });
      const geoArea = schema.geographicArea as { name: string };
      expect(geoArea.name).toBe("Austria");
    });
  });

  describe("buildWebPageMainEntity", () => {
    it("should build WebPage reference", () => {
      const schema = buildWebPageMainEntity("https://example.com/page");
      expect(schema).toEqual({
        "@type": "WebPage",
        "@id": "https://example.com/page",
      });
    });
  });

  describe("buildWebSiteReference", () => {
    it("should build WebSite reference", () => {
      const schema = buildWebSiteReference();
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.name).toBe("Test Site");
      expect(schema.url).toBe("https://example.com");
      expect(schema.publisher).toBeDefined();
    });

    it("should accept custom parameters", () => {
      const schema = buildWebSiteReference("Custom Site", "https://custom.com");
      expect(schema.name).toBe("Custom Site");
      expect(schema.url).toBe("https://custom.com");
    });
  });

  describe("buildArticleSchema", () => {
    const articleOptions: ArticleSchemaOptions = {
      headline: "Test Article",
      description: "Test description",
      url: "https://example.com/article",
      datePublished: new Date("2025-01-01"),
      author: { name: "John Doe" },
    };

    it("should build complete Article schema", () => {
      const schema = buildArticleSchema(articleOptions);
      expect(schema["@type"]).toEqual(["Article", "HealthTopicContent"]);
      expect(schema.headline).toBe("Test Article");
      expect(schema.author).toBeDefined();
      expect(schema.publisher).toBeDefined();
      expect(schema.mainEntityOfPage).toBeDefined();
    });

    it("should include optional properties", () => {
      const options: ArticleSchemaOptions = {
        ...articleOptions,
        dateModified: new Date("2025-01-15"),
        section: "Nutrition",
        tags: ["health", "wellness"],
        wordCount: 1000,
      };
      const schema = buildArticleSchema(options);
      expect(schema.dateModified).toBeDefined();
      expect(schema.articleSection).toBe("Nutrition");
      expect(schema.keywords).toBe("health, wellness");
      expect(schema.wordCount).toBe(1000);
    });

    it("should use default health category when section not provided", () => {
      const schema = buildArticleSchema(articleOptions);
      expect(schema.articleSection).toBe("Gesundheit");
    });
  });

  describe("buildBreadcrumbSchema", () => {
    it("should build BreadcrumbList schema", () => {
      const items: BreadcrumbItemData[] = [
        { name: "Home", url: "https://example.com", position: 1 },
        { name: "Blog", url: "https://example.com/blog", position: 2 },
        { name: "Article", position: 3 },
      ];
      const schema = buildBreadcrumbSchema(items);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement).toHaveLength(3);
    });

    it("should handle items without URL", () => {
      const items: BreadcrumbItemData[] = [
        { name: "Home", url: "https://example.com", position: 1 },
        { name: "Current", position: 2 },
      ];
      const schema = buildBreadcrumbSchema(items);
      const elements = schema.itemListElement as Array<{
        item?: string;
        name: string;
        position: number;
      }>;
      expect(elements[0].item).toBe("https://example.com");
      expect(elements[1].item).toBeUndefined();
    });
  });
});

describe("SchemaBuilder - Helper Functions", () => {
  describe("mergeSchemas", () => {
    it("should merge multiple schemas", () => {
      const schema1 = { "@type": "Article", name: "Test" };
      const schema2 = { description: "Test desc", url: "https://example.com" };
      const result = mergeSchemas(schema1, schema2);
      expect(result).toEqual({
        "@type": "Article",
        name: "Test",
        description: "Test desc",
        url: "https://example.com",
      });
    });

    it("should handle undefined schemas", () => {
      const schema1 = { name: "Test" };
      const result = mergeSchemas(schema1, undefined, {
        url: "https://example.com",
      });
      expect(result).toEqual({
        name: "Test",
        url: "https://example.com",
      });
    });

    it("should override with later schemas", () => {
      const schema1 = { name: "First" };
      const schema2 = { name: "Second" };
      const result = mergeSchemas(schema1, schema2);
      expect(result.name).toBe("Second");
    });
  });

  describe("stringifySchema", () => {
    it("should stringify valid schema", () => {
      const schema = { "@type": "Article", name: "Test" };
      const result = stringifySchema(schema);
      expect(result).toBe('{"@type":"Article","name":"Test"}');
    });

    it("should handle complex nested objects", () => {
      const schema = {
        "@type": "Article",
        author: {
          "@type": "Person",
          name: "John Doe",
        },
      };
      const result = stringifySchema(schema);
      expect(result).toContain('"@type":"Person"');
    });

    it("should return empty object for error", () => {
      // Create a circular reference
      const circular: any = { name: "test" };
      circular.self = circular;
      const result = stringifySchema(circular);
      expect(result).toBe("{}");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
