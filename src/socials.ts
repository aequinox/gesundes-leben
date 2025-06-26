/**
 * Social Media Configuration
 *
 * Modern TypeScript configuration for social media platforms with enhanced type safety
 * and better integration with the design system.
 */
import { SITE } from "@/config";

/**
 * Available social media platforms
 * Extensible enum-like type for type safety
 */
export type SocialPlatform =
  | "Facebook"
  | "Github"
  | "Instagram"
  | "LinkedIn"
  | "Mail"
  | "Pinterest"
  | "Telegram"
  | "WhatsApp"
  | "X"
  | "YouTube"
  | "Discord"
  | "TikTok"
  | "Snapchat"
  | "Reddit"
  | "Mastodon";

/**
 * Color variants for social platforms
 * Maps to Tailwind color palette for consistency
 */

/**
 * Social media platform configuration
 */
export interface SocialObject {
  readonly name: SocialPlatform;
  readonly href: string;
  readonly active: boolean;
  readonly linkTitle: string;
  readonly icon: string;
}

/**
 * Social media platform configurations
 */
export const SOCIALS: readonly SocialObject[] = [
  {
    name: "Github",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Github`,
    icon: "tabler:brand-github",
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/username",
    linkTitle: `${SITE.title} on X`,
    icon: "tabler:brand-x",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/username/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: "tabler:brand-linkedin",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "tabler:mail",
    active: true,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/username",
    linkTitle: `${SITE.title} on Instagram`,
    icon: "tabler:brand-instagram",
    active: false,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@username",
    linkTitle: `${SITE.title} on YouTube`,
    icon: "tabler:brand-youtube",
    active: false,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/username",
    linkTitle: `${SITE.title} on Facebook`,
    icon: "tabler:brand-facebook",
    active: false,
  },
] as const;

/**
 * Share link configurations for content sharing
 * Optimized for common sharing platforms
 */
export const SHARE_LINKS: readonly SocialObject[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: "Share via WhatsApp",
    icon: "tabler:brand-whatsapp",
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: "Share on X",
    icon: "tabler:brand-x",
    active: true,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: "Share on Facebook",
    icon: "tabler:brand-facebook",
    active: true,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: "Share via Telegram",
    icon: "tabler:brand-telegram",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: "Share on LinkedIn",
    icon: "tabler:brand-linkedin",
    active: true,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: "Share on Pinterest",
    icon: "tabler:brand-pinterest",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:?subject=Check%20this%20out&body=",
    linkTitle: "Share via email",
    icon: "tabler:mail",
    active: true,
  },
] as const;
