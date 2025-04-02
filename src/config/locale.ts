/**
 * Locale Configuration
 *
 * This module defines language settings for the site.
 */

/**
 * Locale configuration interface
 * Defines language settings for the site
 */
export interface LocaleConfig {
  /** Primary language code */
  readonly lang: string;

  /** BCP 47 language tags for better SEO */
  readonly langTag: readonly string[];
}

/**
 * Locale Configuration
 * Defines language settings for the site
 */
export const LOCALE: Readonly<LocaleConfig> = {
  lang: "de", // Primary language
  langTag: ["de-DE"], // BCP 47 language tags for better SEO
} as const;
