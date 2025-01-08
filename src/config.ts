/**
 * Site Configuration and Types
 * This module contains all global configuration settings and type definitions
 * for the Astro blog theme.
 */

// Import social media icon definitions
import type socialIcons from "./assets/socialIcons";

// Type Definitions
export type SocialPlatform = keyof typeof socialIcons;

/**
 * Social media link configuration
 * @property name - Platform name (must match socialIcons keys)
 * @property href - URL to social media profile
 * @property active - Whether to display the social link
 * @property linkTitle - Accessible title for the link
 */
export interface SocialObject {
  readonly name: SocialPlatform;
  readonly href: string;
  readonly active: boolean;
  readonly linkTitle: string;
}

export type SocialObjects = readonly SocialObject[];

/**
 * Main site configuration type
 * Defines all configurable aspects of the site
 */
type Site = {
  website: string; // Production URL
  author: string; // Site author name
  profile: string; // Author profile URL
  desc: string; // Site description
  title: string; // Site title
  ogImage?: string; // Default Open Graph image
  lightAndDarkMode: boolean; // Theme toggle support
  postPerIndex: number; // Posts on index page
  postPerPage: number; // Posts per pagination page
  scheduledPostMargin: number; // Buffer time for scheduled posts
  showArchives?: boolean; // Show archives section
  showSearch?: boolean; // Enable search functionality
  editPost?: {
    // Edit post link configuration
    url?: URL["href"]; // Base URL for edits
    text?: string; // Edit link text
    appendFilePath?: boolean; // Add file path to URL
  };
};

/**
 * Site Configuration
 * Main configuration object for the site
 */
export const SITE: Site = {
  website: "https://gesundes-leben.vision/",
  author: "Kai Renner",
  profile: "https://gesundes-leben.vision",
  desc: "Entdecke wertvolle Tipps und Einblicke für ein gesundes Leben. Von Ernährung bis mentale Gesundheit - dein Wegweiser zu mehr Wohlbefinden.",
  title: "Gesundes Leben",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes in milliseconds
  showArchives: true,
  showSearch: true,
};

/**
 * Locale Configuration
 * Defines language settings for the site
 */
export const LOCALE = {
  lang: "de", // Primary language
  langTag: ["de-DE"], // BCP 47 language tags for better SEO
} as const;

/**
 * Logo Configuration
 * Settings for the site logo
 */
export const LOGO_IMAGE = {
  enable: false, // Whether to show logo
  svg: true, // Use SVG format
  width: 216, // Logo width
  height: 46, // Logo height
};

/**
 * Social Media Links
 * Configuration for social media presence
 * Note: Only keep active:true for platforms you actually use
 */
export const SOCIALS: SocialObjects = [
  // Active social platforms
  {
    name: "Facebook",
    href: "https://github.com/satnaing/astro-paper", // TODO: Update with actual Facebook page
    linkTitle: `${SITE.title} auf Facebook`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://github.com/satnaing/astro-paper", // TODO: Update with actual Instagram profile
    linkTitle: `${SITE.title} auf Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/satnaing/astro-paper", // TODO: Update with actual LinkedIn profile
    linkTitle: `${SITE.title} auf LinkedIn`,
    active: true,
  },
  // Email configuration
  {
    name: "Mail",
    href: "mailto:kontakt@gesundes-leben.vision", // TODO: Update with actual email address
    linkTitle: `E-Mail an ${SITE.title} senden`,
    active: true,
  },
  // Inactive social platforms - consider removing unused ones
  {
    name: "Github",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} auf Github`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} auf Twitter`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} auf YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} auf WhatsApp`,
    active: false,
  },
];
