/**
 * @module designSystem
 * @description
 * Centralized design system utilities for consistent styling across components.
 * Provides shared CSS class builders, design tokens, and styling utilities.
 *
 * @example
 * ```typescript
 * import { focusStyles, shadowStyles, buttonBaseClasses } from './designSystem';
 *
 * const buttonClasses = [
 *   ...buttonBaseClasses,
 *   ...focusStyles.ring,
 *   ...shadowStyles.elevation.medium
 * ].join(' ');
 * ```
 */

// Design tokens
export const DESIGN_TOKENS = {
  // Spacing scale
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Border radius scale
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },

  // Animation durations
  animation: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;

// Common focus styles
export const focusStyles = {
  // Standard focus ring
  ring: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-accent",
    "focus-visible:ring-offset-2",
  ] as string[],

  // Focus ring with background offset
  ringWithOffset: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-accent",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
  ] as string[],

  // Custom OKLCH focus outline
  oklchOutline: [
    "focus-visible:[outline:2px_solid_oklch(var(--color-accent))]",
    "focus-visible:[outline-offset:2px]",
  ] as string[],

  // Focus without outline (for custom implementations)
  noOutline: ["focus-visible:outline-none"] as string[],
};

// Shadow system
export const shadowStyles = {
  elevation: {
    none: [],
    low: ["shadow-[var(--shadow-elevation-low)]"],
    medium: ["shadow-[var(--shadow-elevation-medium)]"],
    high: ["shadow-[var(--shadow-elevation-high)]"],
  },

  surface: ["shadow-[var(--shadow-surface)]"],
  ambient: ["shadow-[var(--shadow-ambient)]"],
  inner: ["shadow-[var(--shadow-inner)]"],

  // Colored shadows for specific use cases
  colored: {
    pro: ["shadow-[var(--shadow-pro)]"],
    contra: ["shadow-[var(--shadow-contra)]"],
    questionTime: ["shadow-[var(--shadow-question-time)]"],
  },

  // Hover shadow transitions
  hoverTransitions: {
    elevate: [
      "hover:shadow-[var(--shadow-elevation-medium)]",
      "transition-shadow",
      "duration-300",
      "ease-out",
    ],
    subtle: [
      "hover:shadow-[var(--shadow-surface)]",
      "transition-shadow",
      "duration-200",
      "ease-out",
    ],
  },
} as const;

// Animation and transition utilities
export const animationStyles = {
  // Standard transitions
  transitions: {
    all: ["transition-all", "duration-300", "ease-out"],
    colors: ["transition-colors", "duration-200", "ease-out"],
    transform: ["transition-transform", "duration-300", "ease-out"],
    opacity: ["transition-opacity", "duration-200", "ease-out"],
    shadow: ["transition-shadow", "duration-300", "ease-out"],
  },

  // Common hover effects
  hover: {
    lift: ["hover:translate-y-[-1px]", "active:translate-y-0"],
    scale: ["hover:scale-105", "active:scale-100"],
    fade: ["hover:opacity-80"],
  },

  // Loading and disabled states
  states: {
    loading: ["cursor-wait", "pointer-events-none"],
    disabled: [
      "cursor-not-allowed",
      "opacity-50",
      "hover:translate-y-0",
      "pointer-events-none",
    ],
  },

  // Motion reduction
  motionSafe: [
    "motion-reduce:transform-none",
    "motion-reduce:transition-none",
  ] as string[],
};

// Button base classes
export const buttonBaseClasses = [
  // Layout & positioning
  "relative",
  "inline-flex",
  "items-center",
  "justify-center",
  "gap-2",

  // Typography
  "font-medium",
  "text-center",
  "no-underline",

  // Interaction
  "cursor-pointer",
  "select-none",

  // Accessibility
  "forced-colors:border",
  "forced-colors:border-[ButtonText]",
] as const;

// Form input base classes
export const inputBaseClasses = [
  // Layout
  "block",
  "w-full",

  // Typography
  "text-sm",
  "font-normal",

  // Styling
  "bg-background",
  "border",
  "border-border",
  "rounded-lg",
  "px-3",
  "py-2",

  // States
  "placeholder:text-muted",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  "disabled:bg-card-muted",
] as const;

// Card base classes
export const cardBaseClasses = [
  // Layout
  "relative",
  "overflow-hidden",

  // Styling
  "bg-card",
  "border",
  "border-border",
  "rounded-lg",

  // Interaction
  "transition-all",
  "duration-300",
  "ease-out",
] as const;

// Link base classes
export const linkBaseClasses = [
  // Styling
  "text-accent",
  "no-underline",

  // Interaction
  "transition-colors",
  "duration-200",
  "ease-out",
  "hover:text-accent/80",

  // States
  "visited:text-accent",
] as const;

// Screen reader utilities
export const screenReaderStyles = {
  only: ["sr-only"],

  focusable: [
    "sr-only",
    "focus:not-sr-only",
    "focus:absolute",
    "focus:left-1",
    "focus:top-1",
    "focus:z-50",
    "focus:bg-background",
    "focus:px-2",
    "focus:py-1",
    "focus:text-sm",
    "focus:border",
    "focus:border-accent",
    "focus:rounded",
  ],
} as const;

// Icon utilities
export const iconStyles = {
  sizes: {
    xs: ["size-3"],
    sm: ["size-4"],
    md: ["size-5"],
    lg: ["size-6"],
    xl: ["size-8"],
  },

  common: ["flex-shrink-0", "select-none"],

  decorative: ["aria-hidden"],
} as const;

// Utility functions for combining classes
export function cn(
  ...classes: (string | string[] | undefined | null | false)[]
): string {
  return classes.flat().filter(Boolean).join(" ");
}

export function combineClasses(
  ...classSets: (readonly string[] | string[])[]
): string[] {
  return classSets.flat();
}

// Responsive utility builder
export function responsive(
  base: string[],
  variants: Partial<Record<keyof typeof DESIGN_TOKENS.breakpoints, string[]>>
): string[] {
  const result = [...base];

  Object.entries(variants).forEach(([breakpoint, classes]) => {
    if (classes) {
      result.push(...classes.map(cls => `${breakpoint}:${cls}`));
    }
  });

  return result;
}

// Size variant builder for consistent component sizing
export function createSizeVariants<T extends string>(
  variants: Record<T, string[]>
): Record<T, readonly string[]> {
  return variants as Record<T, readonly string[]>;
}

// Color variant builder for consistent theming
export function createColorVariants<T extends string>(
  variants: Record<T, string[]>
): Record<T, readonly string[]> {
  return variants as Record<T, readonly string[]>;
}
