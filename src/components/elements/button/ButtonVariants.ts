/**
 * Button Variants Configuration
 *
 * Centralized styling configuration for button variants.
 * Separates visual styling from component logic.
 *
 * Single Responsibility: Button variant styling definitions
 */
import { shadowStyles } from "@/utils/ui/designSystem";

export type ButtonVariant =
  | "default" // Primary solid button
  | "accent" // Accent colored button
  | "outline" // Outlined button
  | "ghost" // Transparent with hover effect
  | "subtle" // Subtle background
  | "text" // Text only
  | "link" // Behaves like a link
  | "icon"; // Icon-focused button

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonShape = "default" | "rounded" | "pill" | "circle" | "square";

// Variant-specific styles using project's color system
export const variantClasses: Record<ButtonVariant, string[]> = {
  default: [
    "bg-foreground",
    "text-background",
    "border",
    "border-transparent",
    "hover:bg-foreground/90",
    ...shadowStyles.elevation.low,
    ...shadowStyles.hoverTransitions.elevate,
  ],
  accent: [
    "bg-accent",
    "text-background",
    "border",
    "border-transparent",
    "hover:bg-accent/90",
    ...shadowStyles.elevation.low,
    ...shadowStyles.hoverTransitions.elevate,
  ],
  outline: [
    "bg-transparent",
    "text-accent",
    "border",
    "border-accent/30",
    "hover:border-accent",
    "hover:bg-accent/5",
  ],
  ghost: [
    "bg-transparent",
    "text-foreground",
    "border",
    "border-transparent",
    "hover:bg-card/50",
  ],
  subtle: [
    "bg-card",
    "text-foreground",
    "border",
    "border-transparent",
    "hover:bg-card-muted",
    ...shadowStyles.surface,
  ],
  text: [
    "bg-transparent",
    "text-accent",
    "border-0",
    "hover:text-accent/80",
    "hover:underline",
    "shadow-none",
    "hover:shadow-none",
  ],
  link: [
    "bg-transparent",
    "text-accent",
    "border-0",
    "hover:text-accent/80",
    "hover:underline",
    "shadow-none",
    "hover:shadow-none",
    "p-0",
    "min-h-auto",
  ],
  icon: [
    "bg-transparent",
    "text-foreground",
    "border",
    "border-transparent",
    "hover:bg-card/50",
    "p-2",
    "aspect-square",
  ],
};

// Size-specific styles
export const sizeClasses: Record<ButtonSize, string[]> = {
  xs: ["min-h-6", "px-2", "py-1", "text-xs", "rounded"],
  sm: ["min-h-8", "px-3", "py-1.5", "text-sm", "rounded-md"],
  md: ["min-h-10", "px-4", "py-2", "text-sm", "rounded-lg"],
  lg: ["min-h-12", "px-6", "py-3", "text-base", "rounded-lg"],
  xl: ["min-h-14", "px-8", "py-4", "text-lg", "rounded-xl"],
};

// Shape-specific styles
export const shapeClasses: Record<ButtonShape, string[]> = {
  default: [], // Uses size-specific rounding
  rounded: ["rounded-lg"],
  pill: ["rounded-full"],
  circle: ["rounded-full", "aspect-square", "p-0"],
  square: ["rounded-none", "aspect-square"],
};

// State-specific classes
export const stateClasses = {
  disabled: [
    "cursor-not-allowed",
    "opacity-50",
    "hover:translate-y-0",
    "pointer-events-none",
  ],
  loading: ["cursor-wait", "pointer-events-none"],
  fullWidth: ["w-full"],
};

// Icon-specific classes
export const iconClasses = {
  start: ["mr-2"],
  end: ["ml-2"],
  only: [], // No margin when icon is alone
};
