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
  // Your deployed website url
  website: "https://gesundes-leben.vision/",
  author: "kai-renner",
  profile: "https://gesundes-leben.vision",
  // Your site description. Useful for SEO and social media sharing.
  desc: "Entdecke wertvolle Tipps und Einblicke für ein gesundes Leben. Von Ernährung bis mentale Gesundheit - dein Wegweiser zu mehr Wohlbefinden.",
  title: "Gesundes Leben",
  // Your default OG image for the site. Useful for social media sharing.
  // OG images can be an external image url or they can be placed under /public directory.
  ogImage: "astropaper-og.jpg",
  // Enable or disable light & dark mode for the website. If disabled, primary color scheme
  // will be used. This option is enabled by default.
  lightAndDarkMode: true,
  // The number of posts to be displayed at the home page under Recent section.
  postPerIndex: 4,
  // You can specify how many posts will be displayed in each posts page. (eg: if you set
  // SITE.postPerPage to 3, each page will only show 3 posts per page)
  postPerPage: 6,
  // In Production mode, posts with a future pubDatetime will not be visible.
  // However, if a post’s pubDatetime is within the next 15 minutes, it will
  // be visible. You can set scheduledPostMargin if you don’t like the default
  // 15 minutes margin.
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes in milliseconds
  // Determines whether to display the Archives menu (positioned between the About and Search menus) and its corresponding page on the site. This option is set to true by default.
  showArchives: true,
  // This option allows users to suggest changes to a blog post by providing an edit link under blog post titles. This feature can be disabled by removing it from the SITE config. You can also set appendFilePath to true to automatically append the file path of the post to the url, directing users to the specific post they wish to edit.
  // editPost: {
  //   // Edit post link configuration
  //   url?: URL["href"]; // Base URL for edits
  //   text?: string; // Edit link text
  //   appendFilePath?: boolean; // Add file path to URL
  // },
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
