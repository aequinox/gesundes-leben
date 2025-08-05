import { logger } from "@/utils/logger";

import { defaultLang, ui, type Languages, type TranslationKey } from "./ui";

/**
 * Type for supported languages in the application
 */
type SupportedLanguage = Languages;

/**
 * Configuration for showing default language in URL
 */
const showDefaultLang = false;

/**
 * Extracts the language code from the URL
 * @param url - The current URL object
 * @returns The language code if supported, otherwise returns the default language
 */
function getLangFromUrl(url: URL): SupportedLanguage {
  try {
    const [, lang] = url.pathname.split("/");
    return isValidLanguage(lang ?? "")
      ? (lang as SupportedLanguage)
      : defaultLang;
  } catch (error) {
    logger.error("Error extracting language from URL:", error);
    return defaultLang;
  }
}

/**
 * Gets a translation value from the UI translations object
 * @param obj - The translations object
 * @param key - The translation key
 * @returns The translation value or undefined
 */
function getTranslationValue(
  obj: (typeof ui)[SupportedLanguage],
  key: TranslationKey
): string | undefined {
  return obj[key];
}

/**
 * Creates a translation function for the specified language
 * @param lang - The language to use for translations
 * @returns A type-safe translation function with parameter interpolation support
 */
function useTranslations(lang: SupportedLanguage) {
  return function translate(
    key: TranslationKey,
    params?: Record<string, string | number>
  ): string {
    try {
      const langTranslations = ui[lang];
      const defaultTranslations = ui[defaultLang];

      let value =
        (langTranslations !== undefined
          ? getTranslationValue(langTranslations, key)
          : undefined) ??
        (defaultTranslations !== undefined
          ? getTranslationValue(defaultTranslations, key)
          : undefined);

      if (value === undefined) {
        logger.warn("Translation missing for key", key, "in language", lang);
        return key;
      }

      // Handle parameter interpolation
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          value = value.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(paramValue)
          );
        }
      }

      return value;
    } catch (error) {
      logger.error("Translation error for key", key, ":", error);
      return key;
    }
  };
}

/**
 * Creates a path translation function for the specified language
 * @param lang - The language to use for path translation
 * @returns A function that translates paths according to the language
 */
function useTranslatedPath(lang: SupportedLanguage) {
  return function translatePath(
    path: string,
    targetLang: SupportedLanguage = lang
  ): string {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    return !showDefaultLang && targetLang === defaultLang
      ? path
      : `/${targetLang}${path}`;
  };
}

/**
 * Validates if a given language code is supported
 * @param lang - The language code to validate
 * @returns boolean indicating if the language is supported
 */
function isValidLanguage(lang: string): lang is SupportedLanguage {
  return Object.keys(ui).includes(lang);
}

// Export all functions and types at the end of the file
export type { SupportedLanguage };
export {
  showDefaultLang,
  getLangFromUrl,
  useTranslations,
  useTranslatedPath,
  isValidLanguage,
};
