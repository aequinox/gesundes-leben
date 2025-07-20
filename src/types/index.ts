/**
 * @file src/types/index.ts
 * @description Centralized type definitions for the Healthy Life project
 *
 * This module serves as the single source of truth for all TypeScript types,
 * interfaces, and utility types used across the application. It combines
 * component types, utility types, and business logic types in one place.
 *
 * @example
 * ```typescript
 * import type {
 *   BaseComponentProps,
 *   ButtonProps,
 *   Post,
 *   ValidationResult
 * } from '@/types';
 * ```
 */

// === Core Content Types ===
export type { Post, Author, Tag, Category } from "@/utils/types";

export { CATEGORIES, GROUPS } from "@/utils/types";

// === Component Base Types ===
export type {
  SizeVariant,
  ShapeVariant,
  ColorVariant,
  LoadingState,
  BaseComponentProps,
  InteractiveComponentProps,
  FormElementProps,
  LayoutComponentProps,
  ContentComponentProps,
  NavigationComponentProps,
  MediaComponentProps,
  ImageMetadata,
  TypographyComponentProps,
  HTMLProps,
  PolymorphicComponentProps,
  AnimationProps,
  ThemeProps,
  ResponsiveProps,
  WithChildren,
  WithSlots,
} from "@/components/types/base";

// === Component-Specific Types ===
export type {
  ButtonType,
  ButtonVariant,
  ButtonProps,
} from "@/components/types/button";

export type { IconName } from "@/components/types/icon";

export type { NavigationLink } from "@/components/types/navigation";

export type {
  CSSClassValue,
  CSSClassesObject,
  CSSClasses,
} from "@/components/types/css";

// === UI Engine Types ===
// Note: These types are internal to their respective modules
// Individual components should import them directly when needed

// === Utility Types ===

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Validation result interface for form validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Performance metrics for component performance tracking
 */
export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateTime?: number;
  memoryUsage?: number;
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAudit {
  score: number;
  violations: {
    rule: string;
    severity: "error" | "warning" | "info";
    description: string;
    element?: string;
  }[];
  passes: string[];
}

/**
 * SEO metadata interface
 */
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalURL?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  structuredData?: Record<string, any>;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  required?: boolean;
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => ValidationResult;
  };
}

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    card: string;
    border: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

/**
 * Feature flag interface for conditional functionality
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

/**
 * Analytics event tracking
 */
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customProperties?: Record<string, any>;
}

/**
 * Search result interface
 */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "post" | "page" | "glossary" | "author";
  relevanceScore: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

/**
 * Error boundary context
 */
export interface ErrorBoundaryContext {
  error: Error;
  errorInfo: {
    componentStack: string;
  };
  retry: () => void;
  reset: () => void;
}

/**
 * Image optimization configuration
 */
export interface ImageOptimizationConfig {
  formats: ("webp" | "avif" | "jpeg" | "png")[];
  quality: number;
  progressive: boolean;
  responsive: boolean;
  lazy: boolean;
  placeholder: "blur" | "empty" | "color";
}

// === Advanced Utility Types ===

/**
 * Make certain properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make certain properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Deep partial type for nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract function parameters as tuple
 */
export type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Union to intersection type
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Strict object type (no additional properties)
 */
export type Exact<T> = {
  [K in keyof T]: T[K];
} & {
  [K in Exclude<keyof any, keyof T>]?: never;
};

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  NODE_ENV: "development" | "production" | "test";
  SITE_URL: string;
  BUILD_TIME: string;
  VERSION: string;
  ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
}

/**
 * Component props with runtime validation
 */
export interface ValidatedProps<T> {
  props: T;
  isValid: boolean;
  errors: ValidationResult;
}

/**
 * Generic event handler type
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>;

/**
 * Async data loading states
 */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

/**
 * Component factory configuration
 */
export interface ComponentFactory<T extends Record<string, any>> {
  defaultProps: Partial<T>;
  variants: Record<string, Partial<T>>;
  validation?: (props: T) => ValidationResult;
}

// === Type Guards ===

/**
 * Type guard for checking if value is defined
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

/**
 * Type guard for checking if value is a non-empty string
 */
export const isNonEmptyString = (value: any): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Type guard for checking if value is a valid URL
 */
export const isValidURL = (value: any): value is string => {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Type guard for checking if object has required properties
 */
export const hasRequiredProps = <T extends Record<string, any>>(
  obj: any,
  keys: (keyof T)[]
): obj is T => {
  return keys.every(key => key in obj && isDefined(obj[key]));
};

// === Constants ===

/**
 * Common breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: "475px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  modal: 20,
  overlay: 30,
  tooltip: 40,
  notification: 50,
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Common ARIA roles
 */
export const ARIA_ROLES = [
  "button",
  "link",
  "menuitem",
  "tab",
  "tabpanel",
  "dialog",
  "tooltip",
  "alert",
  "status",
  "banner",
  "navigation",
  "main",
  "complementary",
  "contentinfo",
] as const;

export type AriaRole = (typeof ARIA_ROLES)[number];
