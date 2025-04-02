/**
 * Site Configuration
 *
 * This module contains the main site configuration settings and types.
 */

/**
 * Edit post configuration options
 * Controls how users can suggest edits to content
 */
export interface EditPostConfig {
  /** Base URL for edit links */
  readonly url?: URL["href"];

  /** Text displayed for the edit link */
  readonly text?: string;

  /** Whether to append the file path to the edit URL */
  readonly appendFilePath?: boolean;
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

  /** Configuration for post editing functionality */
  readonly editPost?: EditPostConfig;
}

/**
 * Site Configuration
 * Main configuration object for the site
 */
export const SITE: SiteConfig = {
  website: "https://gesundes-leben.vision/",
  author: "kai-renner",
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
  // Uncomment to enable edit post functionality
  // editPost: {
  //   url: "https://github.com/yourusername/your-repo/edit/main/",
  //   text: "Edit this post",
  //   appendFilePath: true,
  // },
};
