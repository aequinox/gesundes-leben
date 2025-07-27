/**
 * @file componentFactory.ts
 * @description Component factory utilities for creating reusable, type-safe Astro components
 *
 * Provides factory functions and interfaces for building consistent components
 * that follow the project's design system and SOLID principles.
 *
 * @example
 * ```typescript
 * import { createButtonVariants, createCardConfig } from '@/utils/componentFactory';
 *
 * // Create button variants
 * const buttonVariants = createButtonVariants({
 *   primary: { variant: 'accent', size: 'md' },
 *   secondary: { variant: 'outline', size: 'md' },
 *   small: { variant: 'default', size: 'sm' }
 * });
 *
 * // Use in component
 * const primaryButton = buttonVariants.primary;
 * ```
 */
import type { ColorVariant, SizeVariant, ValidationResult } from "@/types";
import { logger } from "@/utils/logger";

import { validateProps, type PropValidationSchema } from "./propValidation";

// === Generic Component Interfaces ===

/**
 * Base interface for all interactive components
 */
export interface InteractiveComponent extends Record<string, unknown> {
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler (for client-side components) */
  onclick?: string;
  /** Keyboard handler (for client-side components) */
  onkeydown?: string;
}

/**
 * Base interface for components with variants
 */
export interface VariantComponent<T extends string = string>
  extends Record<string, unknown> {
  /** Visual variant */
  variant?: T;
  /** Size variant */
  size?: SizeVariant;
  /** Color variant */
  color?: ColorVariant;
}

/**
 * Base interface for layout components
 */
export interface LayoutComponent extends Record<string, unknown> {
  /** Layout orientation */
  orientation?: "horizontal" | "vertical";
  /** Gap between elements */
  gap?: SizeVariant | "none";
  /** Alignment */
  align?: "start" | "center" | "end" | "stretch";
  /** Justification */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

/**
 * Base interface for content components
 */
export interface ContentComponent extends Record<string, unknown> {
  /** Content title */
  title?: string;
  /** Content description */
  description?: string;
  /** Content metadata */
  metadata?: Record<string, unknown>;
}

// === Component Factory Types ===

/**
 * Configuration for component variants
 */
export interface ComponentVariantConfig<T extends Record<string, unknown>> {
  defaultProps: Partial<T>;
  variants: Record<string, Partial<T>>;
  validation?: PropValidationSchema<T>;
}

/**
 * Component factory result
 */
export interface ComponentFactory<T extends Record<string, unknown>> {
  /** Get props for a specific variant */
  getVariant: (name: string, overrides?: Partial<T>) => T;
  /** Validate props */
  validate: (props: T) => ValidationResult & { validatedProps: T };
  /** Get all available variant names */
  getVariantNames: () => string[];
  /** Get default props */
  getDefaultProps: () => Partial<T>;
}

// === Factory Functions ===

/**
 * Create a component factory with variants and validation
 */
export function createComponentFactory<T extends Record<string, unknown>>(
  config: ComponentVariantConfig<T>
): ComponentFactory<T> {
  const { defaultProps, variants, validation } = config;

  return {
    getVariant: (name: string, overrides: Partial<T> = {}) => {
      const variantProps = variants[name] || {};
      return {
        ...defaultProps,
        ...variantProps,
        ...overrides,
      } as T;
    },

    validate: (props: T) => {
      if (validation) {
        return validateProps(props, validation);
      }
      return {
        isValid: true,
        errors: [],
        warnings: [],
        validatedProps: props,
      };
    },

    getVariantNames: () => Object.keys(variants),

    getDefaultProps: () => defaultProps,
  };
}

/**
 * Create button component variants
 */
export function createButtonVariants<T extends Record<string, unknown>>(
  customVariants: Record<string, Partial<T>> = {}
) {
  const defaultButtonVariants = {
    primary: {
      variant: "accent" as const,
      size: "md" as const,
      color: "primary" as const,
    },
    secondary: {
      variant: "outline" as const,
      size: "md" as const,
      color: "secondary" as const,
    },
    ghost: {
      variant: "ghost" as const,
      size: "md" as const,
      color: "muted" as const,
    },
    small: {
      variant: "default" as const,
      size: "sm" as const,
    },
    large: {
      variant: "accent" as const,
      size: "lg" as const,
    },
    iconOnly: {
      variant: "icon" as const,
      size: "md" as const,
    },
    ...customVariants,
  };

  return createComponentFactory<T>({
    defaultProps: {
      disabled: false,
      loading: false,
      variant: "default",
      size: "md",
    } as unknown as Partial<T>,
    variants: defaultButtonVariants as unknown as Record<string, Partial<T>>,
  });
}

/**
 * Create badge component variants
 */
export function createBadgeVariants<T extends Record<string, unknown>>(
  customVariants: Record<string, Partial<T>> = {}
) {
  const defaultBadgeVariants = {
    default: {
      variant: "default" as const,
      size: "sm" as const,
    },
    success: {
      variant: "success" as const,
      size: "sm" as const,
      color: "success" as const,
    },
    warning: {
      variant: "warning" as const,
      size: "sm" as const,
      color: "warning" as const,
    },
    error: {
      variant: "error" as const,
      size: "sm" as const,
      color: "error" as const,
    },
    info: {
      variant: "info" as const,
      size: "sm" as const,
      color: "accent" as const,
    },
    large: {
      variant: "default" as const,
      size: "lg" as const,
    },
    ...customVariants,
  };

  return createComponentFactory<T>({
    defaultProps: {
      variant: "default",
      size: "sm",
    } as unknown as Partial<T>,
    variants: defaultBadgeVariants as unknown as Record<string, Partial<T>>,
  });
}

/**
 * Create card component variants
 */
export function createCardVariants<T extends Record<string, unknown>>(
  customVariants: Record<string, Partial<T>> = {}
) {
  const defaultCardVariants = {
    default: {
      variant: "default" as const,
      size: "md" as const,
    },
    feature: {
      variant: "feature" as const,
      size: "lg" as const,
    },
    compact: {
      variant: "compact" as const,
      size: "sm" as const,
    },
    hero: {
      variant: "hero" as const,
      size: "xl" as const,
    },
    outlined: {
      variant: "outlined" as const,
      size: "md" as const,
    },
    elevated: {
      variant: "elevated" as const,
      size: "md" as const,
    },
    ...customVariants,
  };

  return createComponentFactory<T>({
    defaultProps: {
      variant: "default",
      size: "md",
    } as unknown as Partial<T>,
    variants: defaultCardVariants as unknown as Record<string, Partial<T>>,
  });
}

/**
 * Create layout component variants
 */
export function createLayoutVariants<T extends Record<string, unknown>>(
  customVariants: Record<string, Partial<T>> = {}
) {
  const defaultLayoutVariants = {
    stack: {
      orientation: "vertical" as const,
      gap: "md" as const,
      align: "stretch" as const,
    },
    row: {
      orientation: "horizontal" as const,
      gap: "md" as const,
      align: "center" as const,
    },
    grid: {
      gap: "lg" as const,
      align: "start" as const,
    },
    centered: {
      align: "center" as const,
      justify: "center" as const,
    },
    spaceBetween: {
      orientation: "horizontal" as const,
      justify: "between" as const,
      align: "center" as const,
    },
    ...customVariants,
  };

  return createComponentFactory<T>({
    defaultProps: {
      orientation: "vertical",
      gap: "md",
      align: "start",
      justify: "start",
    } as unknown as Partial<T>,
    variants: defaultLayoutVariants as unknown as Record<string, Partial<T>>,
  });
}

// === Component Composition Utilities ===

/**
 * Compose multiple component configurations
 */
export function composeComponents<T extends Record<string, unknown>>(
  ...configs: Partial<ComponentVariantConfig<T>>[]
): ComponentVariantConfig<T> {
  const composed: ComponentVariantConfig<T> = {
    defaultProps: {},
    variants: {},
  };

  for (const config of configs) {
    // Merge default props
    if (config.defaultProps) {
      Object.assign(composed.defaultProps, config.defaultProps);
    }

    // Merge variants
    if (config.variants) {
      Object.assign(composed.variants, config.variants);
    }

    // Use the last validation schema
    if (config.validation) {
      composed.validation = config.validation;
    }
  }

  return composed;
}

/**
 * Create a responsive component variant
 */
export function createResponsiveVariant<T extends Record<string, unknown>>(
  baseProps: Partial<T>,
  breakpoints: {
    sm?: Partial<T>;
    md?: Partial<T>;
    lg?: Partial<T>;
    xl?: Partial<T>;
  }
): Partial<T> {
  // This would be implemented based on your responsive system
  // For now, return the base props merged with largest applicable breakpoint
  const responsive = { ...baseProps };

  // In a real implementation, you'd merge breakpoint-specific props
  // based on current viewport or build-time optimization
  Object.assign(responsive, breakpoints.lg || breakpoints.md || breakpoints.sm);

  return responsive;
}

/**
 * Create theme-aware component variants
 */
export function createThemeVariants<T extends Record<string, unknown>>(
  lightTheme: Partial<T>,
  darkTheme: Partial<T>
): {
  light: Partial<T>;
  dark: Partial<T>;
  auto: Partial<T>;
} {
  return {
    light: lightTheme,
    dark: darkTheme,
    auto: lightTheme, // Default to light, would be dynamic in real implementation
  };
}

// === Higher-Order Component Utilities ===

/**
 * Create a component with automatic validation
 */
export function withValidation<T extends Record<string, unknown>>(
  factory: ComponentFactory<T>,
  componentName: string
) {
  return {
    ...factory,
    getVariant: (name: string, overrides: Partial<T> = {}) => {
      const props = factory.getVariant(name, overrides);
      const validation = factory.validate(props);

      if (!validation.isValid && import.meta.env.DEV) {
        logger.warn(
          `Invalid props for ${componentName} variant "${name}":`,
          validation.errors
        );
      }

      return validation.validatedProps;
    },
  };
}

/**
 * Create a component with performance monitoring
 */
export function withPerformanceMonitoring<T extends Record<string, unknown>>(
  factory: ComponentFactory<T>,
  componentName: string
) {
  return {
    ...factory,
    getVariant: (name: string, overrides: Partial<T> = {}) => {
      const start = performance.now();
      const props = factory.getVariant(name, overrides);
      const end = performance.now();

      if (end - start > 5 && import.meta.env.DEV) {
        logger.warn(
          `Slow variant generation for ${componentName}.${name}: ${end - start}ms`
        );
      }

      return props;
    },
  };
}

// === Export Prebuilt Factories ===

/**
 * Pre-configured button factory
 */
export const buttonFactory = createButtonVariants();

/**
 * Pre-configured badge factory
 */
export const badgeFactory = createBadgeVariants();

/**
 * Pre-configured card factory
 */
export const cardFactory = createCardVariants();

/**
 * Pre-configured layout factory
 */
export const layoutFactory = createLayoutVariants();
