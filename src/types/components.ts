import type { ImageMetadata } from "astro";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { HTMLAttributes } from "astro/types";

// CSS Classes Types
export type CSSClassValue = boolean | undefined;
export interface CSSClassesObject {
  container?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  [key: string]: string | undefined;
}
export type CSSClasses = CSSClassesObject;
// export type CSSClasses = string | CSSClassesObject;

// Widget Types
export const WIDGET_BACKGROUNDS = [
  "default",
  "alternate",
  "primary",
  "secondary",
  "dark",
] as const;
export type WidgetBackground = (typeof WIDGET_BACKGROUNDS)[number];

export interface Widget {
  /** Unique identifier */
  id?: string;
  /** Whether to use dark mode styling */
  isDark?: boolean;
  /** Background style */
  bg?: WidgetBackground;
  /** Additional CSS classes */
  classes?: CSSClasses;
}

// Post Types
export interface Post {
  /** A unique ID number that identifies a post. */
  id: string;
  /** A post's unique slug – part of the post's URL based on its name */
  slug: string;
  /** The full URL path to the post */
  permalink: string;
  /** The date when the post was first published */
  publishDate: Date;
  /** The date when the post was last modified */
  updateDate?: Date;
  /** The title of the post */
  title: string;
  /** Optional summary of post content */
  excerpt?: string;
  /** Featured image for the post */
  image?: ImageMetadata | string;
  /** The primary category the post belongs to */
  category?: Taxonomy;
  /** Tags associated with the post */
  tags?: Taxonomy[];
  /** The author of the post */
  author?: string;
  /** Additional metadata for SEO and social sharing */
  metadata?: MetaData;
  /** Whether the post is in draft status */
  draft?: boolean;
  /** The post's content as an Astro component */
  Content?: AstroComponentFactory;
  /** The post's content as a string */
  content?: string;
  /** Estimated reading time in minutes */
  readingTime?: number;
}

export interface Taxonomy {
  /** URL-friendly identifier */
  slug: string;
  /** Display name */
  title: string;
}

// Metadata Types
export interface MetaData {
  /** Page title for SEO */
  title?: string;
  /** Whether to ignore the site's title template */
  ignoreTitleTemplate?: boolean;
  /** Canonical URL */
  canonical?: string;
  /** Robot directives */
  robots?: MetaDataRobots;
  /** Meta description */
  description?: string;
  /** Open Graph metadata */
  openGraph?: MetaDataOpenGraph;
  /** Twitter metadata */
  twitter?: MetaDataTwitter;
}

export interface MetaDataRobots {
  index?: boolean;
  follow?: boolean;
}

export interface MetaDataImage {
  /** Image URL */
  url: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
}

export interface MetaDataOpenGraph {
  /** Page URL */
  url?: string;
  /** Site name */
  siteName?: string;
  /** Open Graph images */
  images?: Array<MetaDataImage>;
  /** Content locale */
  locale?: string;
  /** Open Graph type */
  type?: string;
}

export interface MetaDataTwitter {
  /** Twitter handle */
  handle?: string;
  /** Twitter site */
  site?: string;
  /** Twitter card type */
  cardType?: string;
}

// Media Types
export type ImageSource = string | ImageMetadata;

export interface Image {
  /** Image source URL or metadata */
  src: ImageSource;
  /** Alt text for accessibility */
  alt: string;
}

export interface Video {
  /** Video source URL */
  src: string;
  /** Video MIME type */
  type?: string;
}

// Component Types
export interface Headline {
  /** Main title text */
  title: string;
  /** Secondary subtitle text */
  subtitle?: string;
  /** Small text above the title */
  tagline?: string;
  /** Additional CSS classes */
  classes?: CSSClasses;
}

export interface Social {
  /** Icon identifier */
  icon: string;
  /** Link URL */
  href: string;
}

export interface TeamMember {
  /** Member's name */
  name: string;
  /** Member's job title */
  job: string;
  /** Member's photo */
  image?: Image;
  /** Social media links */
  socials?: Array<Social>;
  /** Brief description */
  description?: string;
  /** Additional CSS classes */
  classes?: CSSClasses;
}

export interface Stat {
  /** Numerical or text value */
  amount: number | string;
  /** Label for the stat */
  title: string;
  /** Optional icon identifier */
  icon?: string;
}

export interface Item {
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Icon identifier */
  icon?: string;
  /** Additional CSS classes */
  classes?: CSSClasses;
  /** Call to action button */
  callToAction?: CallToAction;
  /** Associated image */
  image?: Image;
}

export interface Price {
  /** Plan name */
  title: string;
  /** Short description */
  subtitle?: string;
  /** Detailed description */
  description?: string;
  /** Price amount */
  price: number | string;
  /** Billing period */
  period?: string;
  /** Feature list */
  items?: Array<Item>;
  /** Call to action button */
  callToAction?: CallToAction;
  /** Whether to show a ribbon */
  hasRibbon?: boolean;
  /** Ribbon text */
  ribbonTitle?: string;
}

export interface Testimonial {
  /** Testimonial title */
  title: string;
  /** Testimonial content */
  testimonial: string;
  /** Author name */
  name: string;
  /** Author job title */
  job?: string;
  /** Author photo */
  image?: ImageSource;
}

export interface Textarea {
  /** Input label */
  label: string;
  /** Field name */
  name: string;
  /** Placeholder text */
  placeholder?: string;
  /** Number of rows */
  rows?: number;
}

export interface Disclaimer {
  /** Disclaimer text */
  label: string;
}

// Call to Action Types
export const CALL_TO_ACTION_VARIANTS = [
  "default",
  "accented",
  "muted",
  "link",
] as const;
export type CallToActionVariant = (typeof CALL_TO_ACTION_VARIANTS)[number];

export const BUTTON_TYPES = ["button", "submit", "reset"] as const;
export type ButtonType = (typeof BUTTON_TYPES)[number];

export interface CallToAction extends HTMLAttributes<"a"> {
  /** Visual style variant */
  variant?: CallToActionVariant;
  /** Button text */
  text?: string;
  /** Icon identifier */
  icon?: string;
  /** Additional CSS classes */
  class?: string;
  /** HTML button type */
  type?: ButtonType;
}

// Grid Types
export interface ItemGrid {
  /** Grid items */
  items: Array<Item>;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  defaultIcon?: string;
  /** Additional CSS classes */
  classes?: CSSClasses;
}

export interface Collapse {
  /** Expanded state icon */
  iconUp: string;
  /** Collapsed state icon */
  iconDown: string;
  /** Collapsible items */
  items: Array<Item>;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  classes?: CSSClasses;
}

// Section Types
export interface Hero
  extends Omit<Headline, "classes">,
    Omit<Widget, "isDark" | "classes"> {
  /** Main content */
  content?: string;
  /** Call to action buttons */
  actions?: string | CallToAction[];
  /** Hero image */
  image?: ImageSource;
}

export interface Team extends Omit<Headline, "classes">, Widget {
  /** Team members */
  team: Array<TeamMember>;
}

export interface Stats extends Omit<Headline, "classes">, Widget {
  /** Statistics to display */
  stats: Array<Stat>;
}

export interface Pricing extends Omit<Headline, "classes">, Widget {
  /** Pricing plans */
  prices: Array<Price>;
}

export interface Testimonials extends Omit<Headline, "classes">, Widget {
  /** Customer testimonials */
  testimonials: Array<Testimonial>;
  /** Call to action button */
  callToAction?: CallToAction;
}

export interface Brands extends Omit<Headline, "classes">, Widget {
  /** Icon identifiers */
  icons?: Array<string>;
  /** Brand images */
  images?: Array<Image>;
}

export interface Features extends Omit<Headline, "classes">, Widget {
  /** Feature image */
  image?: ImageSource;
  /** Feature video */
  video?: Video;
  /** Feature items */
  items?: Array<Item>;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  defaultIcon?: string;
  /** Primary call to action */
  callToAction1?: CallToAction;
  /** Secondary call to action */
  callToAction2?: CallToAction;
  /** Whether to reverse layout */
  isReversed?: boolean;
  /** Whether content comes before */
  isBeforeContent?: boolean;
  /** Whether content comes after */
  isAfterContent?: boolean;
}

export interface Faqs extends Omit<Headline, "classes">, Widget {
  /** Expanded state icon */
  iconUp: string;
  /** Collapsed state icon */
  iconDown: string;
  /** FAQ items */
  items: Array<Item>;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
}

export interface Steps extends Omit<Headline, "classes">, Widget {
  /** Step items */
  items: Array<{
    title: string;
    description?: string;
    icon?: string;
    classes?: CSSClasses;
  }>;
  /** Call to action */
  callToAction?: string | CallToAction;
  /** Associated image */
  image?: ImageSource;
  /** Whether to reverse layout */
  isReversed?: boolean;
}

// export interface Content extends Omit<Headline, "classes">, Widget {
export interface Content extends Headline, Widget {
  /** Main content */
  content?: string;
  /** Content image */
  image?: ImageSource;
  /** Content items */
  items?: Array<Item>;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Whether to reverse layout */
  isReversed?: boolean;
  /** Whether content comes after */
  isAfterContent?: boolean;
  /** Call to action */
  callToAction?: CallToAction;
}
// export interface Content extends Omit<Headline, "classes">, Widget {
//   /** Main content */
//   content?: string;
//   /** Content image */
//   image?: ImageSource;
//   /** Content items */
//   items?: Array<Item>;
//   /** Number of columns */
//   columns?: 1 | 2 | 3 | 4;
//   /** Whether to reverse layout */
//   isReversed?: boolean;
//   /** Whether content comes after */
//   isAfterContent?: boolean;
//   /** Call to action */
//   callToAction?: CallToAction;
// }
