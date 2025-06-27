/**
 * @module base
 * @description
 * Base interfaces and types for consistent component props across the application.
 * Provides reusable type definitions for common component patterns.
 *
 * @example
 * ```typescript
 * import type { BaseComponentProps, SizeVariant } from './base';
 *
 * export interface MyComponentProps extends BaseComponentProps {
 *   size?: SizeVariant;
 *   variant?: 'primary' | 'secondary';
 * }
 * ```
 */

// Common size variants used across components
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl";

// Common shape variants
export type ShapeVariant = "square" | "rounded" | "pill" | "circle";

// Common color variants based on design system
export type ColorVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "muted"
  | "success"
  | "warning"
  | "error";

// Loading states
export type LoadingState = boolean | "idle" | "loading" | "success" | "error";

/**
 * Base props that most components should extend
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  class?: string;

  /** Unique identifier */
  id?: string;

  /** Whether the component is disabled */
  disabled?: boolean;

  /** Loading state */
  loading?: LoadingState;

  /** Accessible label for screen readers */
  ariaLabel?: string;

  /** Additional data attributes */
  "data-testid"?: string;
}

/**
 * Base props for interactive components (buttons, links, etc.)
 */
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Click handler */
  onclick?: string;

  /** Whether the element is focusable */
  tabindex?: number;

  /** ARIA role override */
  role?: string;

  /** ARIA expanded state */
  "aria-expanded"?: boolean | "true" | "false";

  /** ARIA controls relationship */
  "aria-controls"?: string;

  /** ARIA described by relationship */
  "aria-describedby"?: string;
}

/**
 * Base props for form elements
 */
export interface FormElementProps extends InteractiveComponentProps {
  /** Form element name */
  name?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Whether the field is readonly */
  readonly?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Field value */
  value?: string | number;

  /** Default value */
  defaultValue?: string | number;

  /** ARIA invalid state */
  "aria-invalid"?: boolean | "true" | "false";

  /** ARIA required state */
  "aria-required"?: boolean | "true" | "false";
}

/**
 * Base props for layout components
 */
export interface LayoutComponentProps extends BaseComponentProps {
  /** Layout variant */
  layout?: "stack" | "cluster" | "sidebar" | "center" | "grid";

  /** Spacing between elements */
  gap?: SizeVariant | "none";

  /** Padding around the component */
  padding?: SizeVariant | "none";

  /** Whether to take full width */
  fullWidth?: boolean;

  /** Whether to take full height */
  fullHeight?: boolean;
}

/**
 * Base props for content components (cards, articles, etc.)
 */
export interface ContentComponentProps extends BaseComponentProps {
  /** Content title */
  title?: string;

  /** Content description */
  description?: string;

  /** Whether to show the title */
  showTitle?: boolean;

  /** Whether to show the description */
  showDescription?: boolean;

  /** Content variant */
  variant?: "default" | "outlined" | "filled" | "ghost";
}

/**
 * Base props for navigational components
 */
export interface NavigationComponentProps extends InteractiveComponentProps {
  /** Link href */
  href?: string;

  /** Whether to open in new tab */
  newTab?: boolean;

  /** Whether the link is active/current */
  active?: boolean;

  /** Download attribute for links */
  download?: string;

  /** Relationship attribute for links */
  rel?: string;
}

/**
 * Base props for media components (images, videos, etc.)
 */
export interface MediaComponentProps
  extends Omit<BaseComponentProps, "loading"> {
  /** Media source URL or ImageMetadata */
  src: string | ImageMetadata;

  /** Alternative text */
  alt: string;

  /** Loading strategy */
  loading?: "lazy" | "eager";

  /** Object fit behavior */
  objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";

  /** Object position */
  objectPosition?: "center" | "top" | "bottom" | "left" | "right" | string;

  /** Media width */
  width?: number;

  /** Media height */
  height?: number;

  /** Aspect ratio */
  aspectRatio?: string;
}

/**
 * ImageMetadata interface for imported images
 */
export interface ImageMetadata {
  src: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Base props for text components
 */
export interface TypographyComponentProps extends BaseComponentProps {
  /** Text size variant */
  size?: SizeVariant;

  /** Font weight */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";

  /** Text alignment */
  align?: "left" | "center" | "right" | "justify";

  /** Text color variant */
  color?: ColorVariant | "inherit";

  /** Whether to truncate long text */
  truncate?: boolean | number;

  /** Text transform */
  transform?: "uppercase" | "lowercase" | "capitalize" | "none";
}

/**
 * Utility type for extracting HTML attributes for specific elements
 */
export type HTMLProps = Record<string, any> & BaseComponentProps;

/**
 * Props for components that can render as different HTML elements
 */
export interface PolymorphicComponentProps<
  T extends keyof HTMLElementTagNameMap = "div",
> extends BaseComponentProps {
  /** The HTML element to render as */
  as?: T;
}

/**
 * Animation and transition related props
 */
export interface AnimationProps {
  /** Animation duration */
  duration?: "fast" | "normal" | "slow" | number;

  /** Animation delay */
  delay?: number;

  /** Animation easing */
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

  /** Whether to respect motion preferences */
  respectMotion?: boolean;
}

/**
 * Theme and styling related props
 */
export interface ThemeProps {
  /** Theme variant */
  theme?: "light" | "dark" | "auto";

  /** Color scheme override */
  colorScheme?: "light" | "dark";

  /** High contrast mode */
  highContrast?: boolean;
}

/**
 * Responsive behavior props
 */
export interface ResponsiveProps {
  /** Responsive behavior configuration */
  responsive?: {
    sm?: Partial<BaseComponentProps>;
    md?: Partial<BaseComponentProps>;
    lg?: Partial<BaseComponentProps>;
    xl?: Partial<BaseComponentProps>;
  };
}

/**
 * Utility type for components with children
 */
export interface WithChildren {
  children?: HTMLElement | string | number | boolean | null | undefined;
}

/**
 * Utility type for components with slots (Astro-specific)
 */
export interface WithSlots {
  slots?: Record<string, unknown>;
}
