/**
 * Component type definitions for the UI system.
 * @module components
 */

import type { ImageMetadata } from "astro";
import type { HTMLAttributes } from "astro/types";

// CSS Types
/** CSS class value type */
export type CSSClassValue = boolean | undefined;

/** CSS classes object structure */
export interface CSSClassesObject extends Record<string, string | undefined> {
  container?: string;
  title?: string;
  subtitle?: string;
  content?: string;
}

/** CSS classes type */
export type CSSClasses = CSSClassesObject;

// Widget Types
/** Available widget background styles */
export const WIDGET_BACKGROUNDS = [
  "default",
  "alternate",
  "primary",
  "secondary",
  "dark",
] as const;

/** Widget background type */
export type WidgetBackground = (typeof WIDGET_BACKGROUNDS)[number];

/** Base widget properties */
export interface Widget {
  /** Unique identifier */
  readonly id?: string;
  /** Dark mode flag */
  readonly isDark?: boolean;
  /** Background style */
  readonly bg?: WidgetBackground;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

// Media Types
/** Valid image source types */
export type ImageSource = string | ImageMetadata;

/** Image configuration */
export interface Image {
  /** Image source URL or metadata */
  readonly src: ImageSource;
  /** Alt text for accessibility */
  readonly alt: string;
  /** Optional width */
  readonly width?: number;
  /** Optional height */
  readonly height?: number;
  /** Optional loading strategy */
  readonly loading?: "lazy" | "eager";
}

/** Video configuration */
export interface Video {
  /** Video source URL */
  readonly src: string;
  /** Video MIME type */
  readonly type?: string;
  /** Autoplay flag */
  readonly autoplay?: boolean;
  /** Loop flag */
  readonly loop?: boolean;
  /** Muted flag */
  readonly muted?: boolean;
  /** Controls flag */
  readonly controls?: boolean;
}

// Component Types
/** Headline component properties */
export interface Headline {
  /** Main title text */
  readonly title: string;
  /** Secondary subtitle text */
  readonly subtitle?: string;
  /** Small text above the title */
  readonly tagline?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

/** Social media link configuration */
export interface Social {
  /** Icon identifier */
  readonly icon: string;
  /** Link URL */
  readonly href: string;
  /** Link label */
  readonly label?: string;
  /** Open in new tab flag */
  readonly newTab?: boolean;
}

/** Team member configuration */
export interface TeamMember {
  /** Member's name */
  readonly name: string;
  /** Member's job title */
  readonly job: string;
  /** Member's photo */
  readonly image?: Image;
  /** Social media links */
  readonly socials?: readonly Social[];
  /** Brief description */
  readonly description?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

/** Statistics item configuration */
export interface Stat {
  /** Numerical or text value */
  readonly amount: number | string;
  /** Label for the stat */
  readonly title: string;
  /** Optional icon identifier */
  readonly icon?: string;
  /** Optional prefix */
  readonly prefix?: string;
  /** Optional suffix */
  readonly suffix?: string;
}

/** Generic item configuration */
export interface Item {
  /** Item title */
  readonly title: string;
  /** Item description */
  readonly description?: string;
  /** Icon identifier */
  readonly icon?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
  /** Call to action button */
  readonly callToAction?: CallToAction;
  /** Associated image */
  readonly image?: Image;
}

/** Price plan configuration */
export interface Price {
  /** Plan name */
  readonly title: string;
  /** Short description */
  readonly subtitle?: string;
  /** Detailed description */
  readonly description?: string;
  /** Price amount */
  readonly price: number | string;
  /** Billing period */
  readonly period?: string;
  /** Feature list */
  readonly items?: readonly Item[];
  /** Call to action button */
  readonly callToAction?: CallToAction;
  /** Whether to show a ribbon */
  readonly hasRibbon?: boolean;
  /** Ribbon text */
  readonly ribbonTitle?: string;
}

/** Testimonial configuration */
export interface Testimonial {
  /** Testimonial title */
  readonly title: string;
  /** Testimonial content */
  readonly testimonial: string;
  /** Author name */
  readonly name: string;
  /** Author job title */
  readonly job?: string;
  /** Author photo */
  readonly image?: ImageSource;
  /** Rating (1-5) */
  readonly rating?: 1 | 2 | 3 | 4 | 5;
}

/** Form textarea configuration */
export interface Textarea extends HTMLAttributes<"textarea"> {
  /** Input label */
  readonly label: string;
  /** Field name */
  readonly name: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Number of rows */
  readonly rows?: number;
  /** Required flag */
  readonly required?: boolean;
}

/** Disclaimer configuration */
export interface Disclaimer {
  /** Disclaimer text */
  readonly label: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

// Call to Action Types
/** Available call to action variants */
export const CALL_TO_ACTION_VARIANTS = [
  "default",
  "accented",
  "muted",
  "link",
] as const;

/** Call to action variant type */
export type CallToActionVariant = (typeof CALL_TO_ACTION_VARIANTS)[number];

/** Available button types */
export const BUTTON_TYPES = ["button", "submit", "reset"] as const;

/** Button type */
export type ButtonType = (typeof BUTTON_TYPES)[number];

/** Call to action configuration */
export interface CallToAction extends HTMLAttributes<"a"> {
  /** Visual style variant */
  readonly variant?: CallToActionVariant;
  /** Button text */
  readonly text?: string;
  /** Icon identifier */
  readonly icon?: string;
  /** Additional CSS classes */
  readonly class?: string;
  /** HTML button type */
  readonly type?: ButtonType;
  /** Open in new tab flag */
  readonly newTab?: boolean;
}

// Grid Types
/** Item grid configuration */
export interface ItemGrid {
  /** Grid items */
  readonly items: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  readonly defaultIcon?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

/** Collapse configuration */
export interface Collapse {
  /** Expanded state icon */
  readonly iconUp: string;
  /** Collapsed state icon */
  readonly iconDown: string;
  /** Collapsible items */
  readonly items: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}

// Section Types
/** Hero section configuration */
export interface Hero
  extends Omit<Headline, "classes">,
    Omit<Widget, "isDark" | "classes"> {
  /** Main content */
  readonly content?: string;
  /** Call to action buttons */
  readonly actions?: string | readonly CallToAction[];
  /** Hero image */
  readonly image?: ImageSource;
}

/** Team section configuration */
export interface Team extends Omit<Headline, "classes">, Widget {
  /** Team members */
  readonly team: readonly TeamMember[];
}

/** Stats section configuration */
export interface Stats extends Omit<Headline, "classes">, Widget {
  /** Statistics to display */
  readonly stats: readonly Stat[];
}

/** Pricing section configuration */
export interface Pricing extends Omit<Headline, "classes">, Widget {
  /** Pricing plans */
  readonly prices: readonly Price[];
}

/** Testimonials section configuration */
export interface Testimonials extends Omit<Headline, "classes">, Widget {
  /** Customer testimonials */
  readonly testimonials: readonly Testimonial[];
  /** Call to action button */
  readonly callToAction?: CallToAction;
}

/** Brands section configuration */
export interface Brands extends Omit<Headline, "classes">, Widget {
  /** Icon identifiers */
  readonly icons?: readonly string[];
  /** Brand images */
  readonly images?: readonly Image[];
}

/** Features section configuration */
export interface Features extends Omit<Headline, "classes">, Widget {
  /** Feature image */
  readonly image?: ImageSource;
  /** Feature video */
  readonly video?: Video;
  /** Feature items */
  readonly items?: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  readonly defaultIcon?: string;
  /** Primary call to action */
  readonly callToAction1?: CallToAction;
  /** Secondary call to action */
  readonly callToAction2?: CallToAction;
  /** Whether to reverse layout */
  readonly isReversed?: boolean;
  /** Whether content comes before */
  readonly isBeforeContent?: boolean;
  /** Whether content comes after */
  readonly isAfterContent?: boolean;
}

/** FAQs section configuration */
export interface Faqs extends Omit<Headline, "classes">, Widget {
  /** Expanded state icon */
  readonly iconUp: string;
  /** Collapsed state icon */
  readonly iconDown: string;
  /** FAQ items */
  readonly items: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
}

/** Steps section configuration */
export interface Steps extends Omit<Headline, "classes">, Widget {
  /** Step items */
  readonly items: readonly {
    readonly title: string;
    readonly description?: string;
    readonly icon?: string;
    readonly classes?: CSSClasses;
  }[];
  /** Call to action */
  readonly callToAction?: string | CallToAction;
  /** Associated image */
  readonly image?: ImageSource;
  /** Whether to reverse layout */
  readonly isReversed?: boolean;
}

/** Content section configuration */
export interface Content extends Headline, Widget {
  /** Main content */
  readonly content?: string;
  /** Content image */
  readonly image?: ImageSource;
  /** Content items */
  readonly items?: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Whether to reverse layout */
  readonly isReversed?: boolean;
  /** Whether content comes after */
  readonly isAfterContent?: boolean;
  /** Call to action */
  readonly callToAction?: CallToAction;
}
