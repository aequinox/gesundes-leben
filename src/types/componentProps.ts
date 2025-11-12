/**
 * @module componentProps
 * @description
 * Shared component props interfaces for consistent component APIs.
 * These interfaces build on top of base types to provide reusable prop patterns
 * that reduce duplication across components.
 *
 * @example
 * ```typescript
 * import type { SizeVariantProps, ColorVariantProps } from '@/types/componentProps';
 *
 * export interface MyComponentProps extends SizeVariantProps, ColorVariantProps {
 *   title: string;
 * }
 * ```
 */

import type {
  SizeVariant,
  ShapeVariant,
  ColorVariant,
  BaseComponentProps,
  InteractiveComponentProps,
} from "./index";

/**
 * Props interface for components that support size variants
 */
export interface SizeVariantProps {
  /** Size variant of the component */
  size?: SizeVariant;
}

/**
 * Props interface for components that support shape variants
 */
export interface ShapeVariantProps {
  /** Shape variant of the component */
  shape?: ShapeVariant;
}

/**
 * Props interface for components that support color/style variants
 */
export interface ColorVariantProps {
  /** Color/style variant of the component */
  variant?: ColorVariant;
}

/**
 * Props interface for accessibility-focused components
 * Extends with commonly needed ARIA attributes
 */
export interface AccessibilityProps {
  /** Accessible label for screen readers */
  ariaLabel?: string;

  /** ID of element that describes this component */
  ariaDescribedBy?: string;

  /** ID of element that labels this component */
  ariaLabelledBy?: string;

  /** Current state for expandable components */
  ariaExpanded?: boolean | "true" | "false";

  /** ID of element controlled by this component */
  ariaControls?: string;

  /** Whether the component is currently selected */
  ariaSelected?: boolean | "true" | "false";

  /** Whether the component is in an error state */
  ariaInvalid?: boolean | "true" | "false";

  /** Whether the component is required */
  ariaRequired?: boolean | "true" | "false";

  /** Whether the component is currently pressed (for toggle buttons) */
  ariaPressed?: boolean | "true" | "false";

  /** Current value for components with a range */
  ariaValueNow?: number;

  /** Minimum value for range components */
  ariaValueMin?: number;

  /** Maximum value for range components */
  ariaValueMax?: number;

  /** Text description of current value */
  ariaValueText?: string;

  /** Whether the component is hidden from screen readers */
  ariaHidden?: boolean | "true" | "false";

  /** Whether the component is currently in a loading state */
  ariaBusy?: boolean | "true" | "false";

  /** Whether the component contains live region updates */
  ariaLive?: "off" | "polite" | "assertive";

  /** Hint text shown in form fields */
  ariaPlaceholder?: string;
}

/**
 * Props interface for components with animation support
 * Compatible with AOS (Animate On Scroll) library
 */
export interface AnimationProps {
  /** Animation type (e.g., 'fade-up', 'zoom-in') */
  animationType?: string;

  /** Animation delay in milliseconds */
  animationDelay?: number;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  /** Whether to animate only once */
  animationOnce?: boolean;

  /** Animation anchor placement */
  animationAnchor?: string;

  /** Offset from original trigger point */
  animationOffset?: number;
}

/**
 * Props interface for image loading strategies
 */
export interface ImageLoadingProps {
  /** Image loading strategy */
  loading?: "eager" | "lazy";

  /** Image decoding hint */
  decoding?: "async" | "sync" | "auto";

  /** Image fetch priority */
  fetchpriority?: "high" | "low" | "auto";
}

/**
 * Props interface for components that can be outlined/bordered
 */
export interface OutlinedProps {
  /** Whether the component should be outlined */
  outlined?: boolean;

  /** Border width variant */
  borderWidth?: "thin" | "normal" | "thick";
}

/**
 * Props interface for interactive/clickable components
 */
export interface ClickableProps {
  /** Click handler function */
  onClick?: () => void;

  /** Click handler as string (for Astro components) */
  onclick?: string;

  /** Whether the component is currently active */
  active?: boolean;

  /** Whether the component is currently pressed */
  pressed?: boolean;
}

/**
 * Props interface for components with icon support
 */
export interface IconProps {
  /** Icon name/identifier */
  icon?: string;

  /** Position of the icon relative to content */
  iconPosition?: "start" | "end" | "top" | "bottom";

  /** Size of the icon */
  iconSize?: SizeVariant;

  /** Whether to only show icon (hide text) */
  iconOnly?: boolean;

  /** Accessible label for icon-only components */
  iconLabel?: string;
}

/**
 * Props interface for components with responsive behavior
 */
export interface ResponsiveProps {
  /** Hide on mobile devices */
  hiddenMobile?: boolean;

  /** Hide on tablet devices */
  hiddenTablet?: boolean;

  /** Hide on desktop devices */
  hiddenDesktop?: boolean;

  /** Show only on mobile devices */
  mobileOnly?: boolean;

  /** Show only on tablet devices */
  tabletOnly?: boolean;

  /** Show only on desktop devices */
  desktopOnly?: boolean;
}

/**
 * Props interface for components with theming support
 */
export interface ThemeProps {
  /** Color scheme variant */
  colorScheme?: "light" | "dark" | "auto";

  /** Theme variant */
  theme?: string;
}

/**
 * Props interface for card-like components
 * Combines multiple common prop patterns
 */
export interface CardProps
  extends BaseComponentProps,
    SizeVariantProps,
    ColorVariantProps,
    AnimationProps {
  /** Whether to show shadow */
  withShadow?: boolean;

  /** Whether to show border */
  withBorder?: boolean;

  /** Whether the card is hoverable/interactive */
  hoverable?: boolean;

  /** Whether the card is clickable */
  clickable?: boolean;

  /** Padding variant */
  padding?: SizeVariant | "none";
}

/**
 * Props interface for button-like components
 * Combines interactive and visual prop patterns
 */
export interface ButtonProps
  extends InteractiveComponentProps,
    SizeVariantProps,
    ColorVariantProps,
    IconProps,
    ClickableProps {
  /** Button type attribute */
  type?: "button" | "submit" | "reset";

  /** Whether the button is in loading state */
  loading?: boolean;

  /** Text to show when loading */
  loadingText?: string;

  /** Whether button takes full width */
  fullWidth?: boolean;

  /** Target URL for link buttons */
  href?: string;

  /** Link target attribute */
  target?: "_self" | "_blank" | "_parent" | "_top";

  /** Link rel attribute */
  rel?: string;
}

/**
 * Props interface for badge-like components
 * Minimal props for small informational components
 */
export interface BadgeProps
  extends BaseComponentProps,
    SizeVariantProps,
    ShapeVariantProps,
    OutlinedProps {
  /** Text content of the badge */
  text?: string;

  /** Badge color variant */
  variant?: ColorVariant | "default" | "neutral";

  /** Whether to show a dot indicator */
  dot?: boolean;

  /** Whether the badge is interactive */
  interactive?: boolean;
}

/**
 * Props interface for media components (images, videos, etc.)
 */
export interface MediaProps
  extends BaseComponentProps,
    ImageLoadingProps,
    AnimationProps {
  /** Source URL */
  src: string;

  /** Alternative text */
  alt?: string;

  /** Width */
  width?: number | string;

  /** Height */
  height?: number | string;

  /** Aspect ratio */
  aspectRatio?: string;

  /** Object fit CSS property */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";

  /** Object position CSS property */
  objectPosition?: string;
}

/**
 * Props interface for list/collection components
 */
export interface ListProps extends BaseComponentProps {
  /** List items */
  items: unknown[];

  /** Whether the list is empty */
  empty?: boolean;

  /** Message to show when list is empty */
  emptyMessage?: string;

  /** Whether to show loading state */
  loading?: boolean;

  /** Maximum number of items to show */
  maxItems?: number;
}

/**
 * Props interface for pagination components
 */
export interface PaginationProps extends BaseComponentProps {
  /** Current page number (1-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Base URL for page links */
  baseUrl?: string;

  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;

  /** Whether to show prev/next buttons */
  showPrevNext?: boolean;

  /** Number of page buttons to show on each side of current */
  siblingCount?: number;
}

/**
 * Props interface for modal/dialog components
 */
export interface ModalProps
  extends BaseComponentProps,
    AccessibilityProps,
    AnimationProps {
  /** Whether the modal is open */
  open?: boolean;

  /** Modal title */
  title?: string;

  /** Whether to show close button */
  closable?: boolean;

  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;

  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;

  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /** Close handler */
  onClose?: () => void;
}

/**
 * Props interface for form field components
 */
export interface FormFieldProps
  extends BaseComponentProps,
    AccessibilityProps,
    SizeVariantProps {
  /** Field label */
  label?: string;

  /** Field name attribute */
  name: string;

  /** Whether the field is required */
  required?: boolean;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Whether the field is readonly */
  readonly?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /** Help text */
  helpText?: string;

  /** Error message */
  error?: string;

  /** Whether to show the label */
  showLabel?: boolean;

  /** Field value */
  value?: string | number;

  /** Default value */
  defaultValue?: string | number;
}

/**
 * Helper type to make certain props required
 * Usage: WithRequired<MyProps, 'id' | 'name'>
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Helper type to make certain props optional
 * Usage: WithOptional<MyProps, 'id' | 'name'>
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Helper type to merge multiple prop interfaces
 * Usage: MergeProps<BaseProps, SizeProps, ColorProps>
 */
export type MergeProps<T, U> = Omit<T, keyof U> & U;

/**
 * Helper type for components that can be polymorphic (render as different elements)
 * Usage: PolymorphicProps<'button' | 'a', MyProps>
 */
export type PolymorphicProps<T extends string, P = object> = P & {
  as?: T;
};
