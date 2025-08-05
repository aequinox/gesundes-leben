import { describe, it, expect } from "vitest";

import {
  t,
  getTranslation,
  getCategoryTranslation,
  getI18nStrings,
  type SupportedLanguage,
} from "../i18n";

describe("i18n Configuration", () => {
  describe("getI18nStrings", () => {
    it("should return German strings by default", () => {
      const strings = getI18nStrings();
      expect(strings.seo.medical.disclaimer).toContain("Diese Informationen");
      expect(strings.seo.navigation.home).toBe("Startseite");
    });

    it("should return German strings when explicitly requested", () => {
      const strings = getI18nStrings("de");
      expect(strings.seo.navigation.about).toBe("Über uns");
      expect(strings.seo.navigation.blog).toBe("Blog");
    });

    it("should fallback to German for unsupported languages", () => {
      const strings = getI18nStrings("fr" as SupportedLanguage);
      expect(strings.seo.navigation.home).toBe("Startseite");
    });
  });

  describe("t function", () => {
    it("should translate navigation keys correctly", () => {
      expect(t("seo.navigation.home")).toBe("Startseite");
      expect(t("seo.navigation.blog")).toBe("Blog");
      expect(t("seo.navigation.about")).toBe("Über uns");
    });

    it("should translate category keys correctly", () => {
      expect(t("seo.content.healthCategory")).toBe("Gesundheit");
      expect(t("seo.content.nutritionCategory")).toBe("Ernährung");
      expect(t("seo.content.fitnessCategory")).toBe("Fitness");
    });

    it("should handle nested keys with fallback", () => {
      const result = t("seo.medical.disclaimer", {
        fallback: "Default disclaimer",
      });
      expect(result).toContain("Diese Informationen");
    });

    it("should return fallback for missing keys", () => {
      const result = t("nonexistent.key", {
        fallback: "Fallback value",
      });
      expect(result).toBe("Fallback value");
    });

    it("should interpolate values correctly", () => {
      // Test with references summary that has interpolation
      const result = t("references.summary", {
        values: {
          count: 5,
          journals: 2,
          books: 1,
          websites: 1,
          reports: 0,
          others: 1,
        },
      });
      expect(result).toContain("5");
    });
  });

  describe("getTranslation function", () => {
    it("should return translated string for valid key", () => {
      const result = getTranslation("seo.navigation.home");
      expect(result).toBe("Startseite");
    });

    it("should use fallback when key not found", () => {
      const result = getTranslation("invalid.key", "de", "Default text");
      expect(result).toBe("Default text");
    });

    it("should work with different languages", () => {
      const deResult = getTranslation("seo.navigation.home", "de");
      expect(deResult).toBe("Startseite");
    });
  });

  describe("getCategoryTranslation function", () => {
    it("should translate known categories", () => {
      expect(getCategoryTranslation("health")).toBe("Gesundheit");
      expect(getCategoryTranslation("nutrition")).toBe("Ernährung");
      expect(getCategoryTranslation("fitness")).toBe("Fitness");
    });

    it("should handle unknown categories gracefully", () => {
      const result = getCategoryTranslation("unknown-category");
      expect(result).toBe("Allgemein"); // Should return general category if not found
    });

    it("should be case-insensitive", () => {
      expect(getCategoryTranslation("Health")).toBe("Gesundheit"); // Case insensitive
    });
  });

  describe("Language Support", () => {
    it("should have all required navigation keys", () => {
      const strings = getI18nStrings("de");
      expect(strings.seo.navigation).toHaveProperty("home");
      expect(strings.seo.navigation).toHaveProperty("blog");
      expect(strings.seo.navigation).toHaveProperty("about");
      expect(strings.seo.navigation).toHaveProperty("search");
      expect(strings.seo.navigation).toHaveProperty("glossary");
    });

    it("should have all required category translations", () => {
      const strings = getI18nStrings("de");
      expect(strings.seo.content).toHaveProperty("healthCategory");
      expect(strings.seo.content).toHaveProperty("nutritionCategory");
      expect(strings.seo.content).toHaveProperty("fitnessCategory");
      expect(strings.seo.content).toHaveProperty("wellnessCategory");
      expect(strings.seo.content).toHaveProperty("lifestyleCategory");
    });

    it("should have medical disclaimer content", () => {
      const strings = getI18nStrings("de");
      expect(strings.seo.medical.disclaimer).toBeDefined();
      expect(strings.seo.medical.disclaimer).toContain("Diese Informationen");
      expect(strings.seo.medical.complianceNote).toBeDefined();
    });
  });
});
