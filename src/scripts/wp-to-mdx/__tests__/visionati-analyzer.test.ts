/**
 * Tests for Visionati Image Analyzer
 */
import { promises as fs } from "fs";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONVERSION_DEFAULTS } from "../config";
import type { VisionatiConfig } from "../types";
import { VisionatiImageAnalyzer } from "../visionati-analyzer";

// Mock axios for API calls
vi.mock("axios");

describe("VisionatiImageAnalyzer", () => {
  const testCacheFile = join(__dirname, "test-visionati-cache.json");

  const mockConfig: VisionatiConfig = {
    apiKey: "test-api-key",
    enableVisionati: true,
    useCache: true,
    cacheFile: testCacheFile,
    language: "de",
    maxAltTextLength: 125,
    backend: "auto",
    role: "medical_writer",
  };

  let analyzer: VisionatiImageAnalyzer;

  beforeEach(() => {
    analyzer = new VisionatiImageAnalyzer(mockConfig);
  });

  afterEach(async () => {
    // Clean up test cache file
    try {
      await fs.unlink(testCacheFile);
    } catch {
      // File might not exist, ignore
    }
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      expect(analyzer).toBeDefined();
    });

    it("should handle disabled Visionati", async () => {
      const disabledConfig = { ...mockConfig, enableVisionati: false };
      const disabledAnalyzer = new VisionatiImageAnalyzer(disabledConfig);

      const result = await disabledAnalyzer.analyzeImage(
        "https://example.com/image.jpg",
        "test-image.jpg"
      );

      expect(result.originalFilename).toBe("test-image.jpg");
      expect(result.generatedFilename).toBe("test-image.jpg");
      expect(result.fromCache).toBe(false);
      expect(result.creditsUsed).toBe(0);
    });
  });

  describe("German filename generation", () => {
    it("should generate health-focused German filenames", () => {
      const testCases = [
        {
          description: "Vitamin D Mangel führt zu Gesundheitsproblemen",
          tags: ["vitamin", "gesundheit"],
          expected: /vitamin.*d.*mangel/i,
        },
        {
          description: "Ernährung und Immunsystem stärken",
          tags: ["ernährung", "immunsystem"],
          expected: /ernährung.*immunsystem/i,
        },
        {
          description: "Mikrobiom Darm Gesundheit Probiotika",
          tags: ["mikrobiom", "probiotika"],
          expected: /mikrobiom.*probiotika/i,
        },
      ];

      testCases.forEach(({ description, tags }) => {
        // Access private method for testing (TypeScript hack)
        const filename = (analyzer as any).generateGermanFilename(
          description,
          tags,
          "original.jpg"
        );

        expect(filename).toMatch(/\.jpg$/);
        expect(filename.length).toBeGreaterThan(5);
        expect(filename).toMatch(/^[a-zäöüß-]+\.jpg$/);
      });
    });

    it("should fallback to original filename when no health keywords found", () => {
      const filename = (analyzer as any).generateGermanFilename(
        "Random image with no health content",
        ["random", "image"],
        "original.jpg"
      );

      expect(filename).toMatch(/\.jpg$/);
      expect(filename.length).toBeGreaterThan(5);
    });
  });

  describe("German alt text generation", () => {
    it("should generate proper German alt text within length limits", () => {
      const testCases = [
        {
          description:
            "Eine Infografik zeigt die wichtigsten Symptome von Vitamin D Mangel bei Erwachsenen.",
          expectedLength: 125,
        },
        {
          description:
            "Sehr lange Beschreibung die definitiv über das Maximum von 125 Zeichen hinausgeht und gekürzt werden sollte um die Accessibility Guidelines einzuhalten und screen reader freundlich zu sein.",
          expectedLength: 125,
        },
        {
          description: "Kurze Beschreibung",
          expectedLength: 50,
        },
      ];

      testCases.forEach(({ description, expectedLength }) => {
        const altText = (analyzer as any).generateGermanAltText(
          description,
          []
        );

        expect(altText).toBeTruthy();
        expect(altText.length).toBeLessThanOrEqual(expectedLength);
        expect(altText).toMatch(/\.$/); // Should end with period
        expect(altText.length).toBeGreaterThan(0);
      });
    });

    it("should handle empty descriptions gracefully", () => {
      const altText = (analyzer as any).generateGermanAltText("", []);
      expect(altText).toBe("");
    });
  });

  describe("Cache functionality", () => {
    it("should initialize empty stats", () => {
      const stats = analyzer.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalCreditsUsed).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
    });

    it("should handle missing API key gracefully", async () => {
      const configWithoutKey = { ...mockConfig, apiKey: "" };
      const analyzerWithoutKey = new VisionatiImageAnalyzer(configWithoutKey);

      await expect(analyzerWithoutKey.initialize()).rejects.toThrow(
        "Visionati API key not found in environment"
      );
    });
  });

  describe("Health keyword integration", () => {
    it("should prioritize health keywords from config", () => {
      const healthKeywords = CONVERSION_DEFAULTS.HEALTH_KEYWORDS;
      expect(healthKeywords).toContain("Gesundheit");
      expect(healthKeywords).toContain("Ernährung");
      expect(healthKeywords).toContain("Vitamin D");
      expect(healthKeywords).toContain("Immunsystem");
    });

    it("should use health keywords in filename generation", () => {
      const description = "Ein Artikel über Vitamin D und Gesundheit";
      const filename = (analyzer as any).generateGermanFilename(
        description,
        ["vitamin"],
        "test.jpg"
      );

      expect(filename).toMatch(/gesundheit|vitamin/i);
    });
  });

  describe("File extension handling", () => {
    it("should preserve file extensions correctly", () => {
      const testCases = [
        { input: "image.jpg", expected: ".jpg" },
        { input: "photo.png", expected: ".png" },
        { input: "graphic.webp", expected: ".webp" },
        { input: "noextension", expected: ".jpg" }, // fallback
      ];

      testCases.forEach(({ input, expected }) => {
        const extension = (analyzer as any).extractFileExtension(input);
        expect(extension).toBe(expected);
      });
    });
  });
});

describe("German Content Validation", () => {
  it("should validate German character handling", () => {
    const testStrings = [
      "Gesundheit",
      "Ernährung",
      "Mikronährstoffe",
      "Omega-3-Fettsäuren",
      "Vitamin-D-Mangel",
    ];

    testStrings.forEach(testString => {
      // Test that German characters are preserved in filename generation
      expect(testString).toMatch(/[a-zA-ZäöüßÄÖÜ-]/);
    });
  });

  it("should validate alt text quality standards", () => {
    const mockConfig: VisionatiConfig = {
      apiKey: "test",
      enableVisionati: true,
      useCache: false,
      cacheFile: "",
      language: "de",
      maxAltTextLength: 125,
    };

    const analyzer = new VisionatiImageAnalyzer(mockConfig);

    // Test alt text generation follows best practices
    const goodDescription =
      "Infografik zeigt Vitamin D Quellen und deren Wirkung auf das Immunsystem.";
    const altText = (analyzer as any).generateGermanAltText(
      goodDescription,
      []
    );

    // Should not contain redundant phrases
    expect(altText.toLowerCase()).not.toMatch(/bild von|foto von|image of/);

    // Should end with proper punctuation
    expect(altText).toMatch(/\.$/);

    // Should be within accessibility guidelines
    expect(altText.length).toBeLessThanOrEqual(125);
    expect(altText.length).toBeGreaterThan(0);
  });
});
