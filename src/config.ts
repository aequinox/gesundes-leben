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
  profile: "https://satnaing.dev/",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "Gesundes Leben",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showSearch: true,
  showArchives: true,
  showBackButton: true, // show back button in post detail
  dynamicOgImage: true,
  lang: "de", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Berlin", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;

export const LOCALE: Readonly<LocaleConfig> = {
  lang: "de", // Primary language
  langTag: ["de-DE"], // BCP 47 language tags for better SEO
} as const;
