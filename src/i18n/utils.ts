import { ui, defaultLang, showDefaultLang } from "./ui";

/**
 * Type for supported languages in the application
 */
export type SupportedLanguage = keyof typeof ui;

/**
 * Helper type to convert nested object structure to dot notation
 */
type DotPrefix<T extends string, K extends string> = `${T}.${K}`;

/**
 * Helper type to create dot notation paths from nested object
 */
type DotNestedKeys<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? DotPrefix<K, DotNestedKeys<T[K]>> | K
    : K;
}[keyof T & string];

/**
 * Type for translation keys using dot notation
 */
export type TranslationKey = DotNestedKeys<(typeof ui)[typeof defaultLang]>;

/**
 * Extracts the language code from the URL
 * @param url - The current URL object
 * @returns The language code if supported, otherwise returns the default language
 */
export function getLangFromUrl(url: URL): SupportedLanguage {
  try {
    const [, lang] = url.pathname.split("/");
    return lang in ui ? (lang as SupportedLanguage) : defaultLang;
  } catch (error) {
    console.error("Error extracting language from URL:", error);
    return defaultLang;
  }
}

/**
 * Gets a nested value from an object using a dot-notation path
 * @param obj - The object to traverse
 * @param path - The dot-notation path
 * @returns The value at the path or undefined
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) as
    | string
    | undefined;
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
        getNestedValue(ui[lang], key) ?? getNestedValue(ui[defaultLang], key);
      if (value === undefined) {
        console.warn(
          `Translation missing for key "${key}" in language "${lang}"`
        );
        return key;
      }
      return value;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
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
  return lang in ui;
}
