/**
 * Edit post configuration options
 * Controls how users can suggest edits to content
 */
export interface EditPostConfig {
  /** Whether to enable the edit link */
  readonly enabled?: boolean;

  /** Base URL for edit links */
  readonly url?: URL["href"];

  /** Text displayed for the edit link */
  readonly text?: string;
}

/**
 * Main site configuration interface
 * Defines all configurable aspects of the site
 */
export interface SiteConfig {
  /** Production URL of the website */
  readonly website: string;

  /** Site author name */
  readonly author: string;

  /** Author profile URL */
  readonly profile: string;

  /** Site description for SEO and social sharing */
  readonly desc: string;

  /** Site title */
  readonly title: string;

  /** Default Open Graph image for social sharing */
  readonly ogImage?: string;

  /** Whether to enable light & dark mode toggle */
  readonly lightAndDarkMode: boolean;

  /** Number of posts to display on the index page */
  readonly postPerIndex: number;

  /** Number of posts to display per pagination page */
  readonly postPerPage: number;

  /** Buffer time in milliseconds for scheduled posts */
  readonly scheduledPostMargin: number;

  /** Whether to display the Archives menu and page */
  readonly showArchives?: boolean;

  /** Whether to enable search functionality */
  readonly showSearch?: boolean;

  /** Whether to show back button in post detail */
  readonly showBackButton?: boolean;

  /** Whether to enable dynamic Open Graph images */
  readonly dynamicOgImage?: boolean;

  /** HTML lang attribute for the site */
  readonly lang?: string;

  /** Local timezone */
  readonly timezone?: string;
}

export interface LocaleConfig {
  /** Primary language code */
  readonly lang: string;

  /** BCP 47 language tags for better SEO */
  readonly langTag: readonly string[];
}

export const SITE: SiteConfig = {
  website: "https://gesundes-leben.vision/",
  author: "kai-renner",
  profile: "https://gesundes-leben.vision/ueber-uns",
  desc: "Dein vertrauenswürdiger Ratgeber für Gesundheit, Ernährung und Wellness. Entdecke evidenzbasierte Artikel, praktische Tipps und Expertenwissen für ein gesünderes Leben.",
  title: "Gesundes Leben",
  ogImage: "gesundes-leben-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 6, // Optimized for better user engagement
  postPerPage: 12, // SEO-friendly pagination
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showSearch: true,
  showArchives: true,
  showBackButton: true,
  dynamicOgImage: false, // Disabled for performance - saves 2-3GB build memory
  lang: "de",
  timezone: "Europe/Berlin",
} as const;

export const LOCALE: Readonly<LocaleConfig> = {
  lang: "de", // Primary language
  langTag: ["de-DE"], // BCP 47 language tags for better SEO
} as const;

/**
 * Default health category used throughout the site
 * Used as fallback when no specific category is available
 */
export const DEFAULT_HEALTH_CATEGORY = "Gesundheit" as const;
