/**
 * Social Media Configuration
 *
 * This module contains types and configuration for social media platforms
 * used throughout the site.
 */

import type socialIcons from "../assets/socialIcons";
import { SITE_TITLE } from "./constants";

/**
 * Represents available social media platforms
 * Must match keys in socialIcons import
 */
export type SocialPlatform = keyof typeof socialIcons;

/**
 * Social media link configuration
 *
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

/**
 * Collection of social media objects
 * Marked as readonly to prevent modification after definition
 */
export type SocialObjects = readonly SocialObject[];

/**
 * Social Media Links
 * Configuration for social media presence
 *
 * Note: Only keep active:true for platforms you actually use
 */
export const SOCIALS: SocialObjects = [
  // Active social platforms
  {
    name: "Facebook",
    href: "https://www.facebook.com/gesundheit.in.tuebingen/", // TODO: Update with actual Facebook page
    linkTitle: `${SITE_TITLE} auf Facebook`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/gesundheitintuebingen", // TODO: Update with actual Instagram profile
    linkTitle: `${SITE_TITLE} auf Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://de.linkedin.com/in/kai-renner-0a6b1a17a", // TODO: Update with actual LinkedIn profile
    linkTitle: `${SITE_TITLE} auf LinkedIn`,
    active: true,
  },
  // Email configuration
  {
    name: "Mail",
    href: "mailto:kontakt@gesundes-leben.vision",
    linkTitle: `E-Mail an ${SITE_TITLE} senden`,
    active: true,
  },
  // Inactive social platforms - consider removing unused ones
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE_TITLE} auf Twitter`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE_TITLE} auf YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE_TITLE} auf WhatsApp`,
    active: false,
  },
];
