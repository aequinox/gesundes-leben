import { logger } from "@/utils/logger";

import { type Languages, type TranslationKey, defaultLang, ui } from "./ui";

/**
 * Type for supported languages in the application
 */
export type SupportedLanguage = Languages;

/**
 * Configuration for showing default language in URL
 */
export const showDefaultLang = false;

/**
 * Extracts the language code from the URL
 * @param url - The current URL object
 * @returns The language code if supported, otherwise returns the default language
 */
export function getLangFromUrl(url: URL): SupportedLanguage {
  try {
    const [, lang] = url.pathname.split("/");
    return isValidLanguage(lang) ? lang : defaultLang;
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
 * @returns A type-safe translation function
 */
export function useTranslations(lang: SupportedLanguage) {
  return function translate(key: TranslationKey): string {
    try {
      const value =
        getTranslationValue(ui[lang], key) ??
        getTranslationValue(ui[defaultLang], key);

      if (value === undefined) {
        logger.warn("Translation missing for key", key, "in language", lang);
        return key;
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
export function useTranslatedPath(lang: SupportedLanguage) {
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
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return Object.keys(ui).includes(lang);
}
