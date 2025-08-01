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
import type { ColorVariant, SizeVariant } from "@/types";

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
 * Configuration for creating component variants
 */
export interface ComponentVariantConfig {
  /** Component name for debugging */
  name: string;
  /** Base CSS classes */
  baseClasses: string;
  /** Variant configurations */
  variants: Record<string, Record<string, string>>;
  /** Default variant selections */
  defaultVariants?: Record<string, string>;
  /** Compound variants for combinations */
  compoundVariants?: Array<{
    [key: string]: string;
    className: string;
  }>;
}

// === Factory Functions ===

/**
 * Create a component factory function that generates class names
 */
export function createComponentFactory(
  config: ComponentVariantConfig
): (props: Record<string, unknown>) => { className: string } {
  const {
    name: _name,
    baseClasses,
    variants,
    defaultVariants = {},
    compoundVariants = [],
  } = config;

  return (props: Record<string, unknown>) => {
    let className = baseClasses;

    // Apply variant classes
    for (const [variantName, variantOptions] of Object.entries(variants)) {
      const selectedOption =
        (props[variantName] as string) || defaultVariants[variantName];
      if (selectedOption && variantOptions[selectedOption]) {
        className += ` ${variantOptions[selectedOption]}`;
      }
    }

    // Apply compound variants
    for (const compound of compoundVariants) {
      const { className: compoundClassName, ...conditions } = compound;
      const matches = Object.entries(conditions).every(
        ([key, value]) => props[key] === value
      );
      if (matches) {
        className += ` ${compoundClassName}`;
      }
    }

    return { className: className.trim() };
  };
}

/**
 * Create button component variants
 */
export function createButtonVariants(
  customVariants: Record<string, Record<string, string>> = {}
) {
  return {
    size: {
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-outline",
    },
    ...customVariants,
  };
}

/**
 * Create badge component variants
 */
export function createBadgeVariants(
  customVariants: Record<string, Record<string, string>> = {}
) {
  return {
    size: {
      sm: "badge-sm",
      md: "badge-md",
    },
    variant: {
      default: "badge-default",
      primary: "badge-primary",
      success: "badge-success",
    },
    ...customVariants,
  };
}

/**
 * Create card component variants
 */
export function createCardVariants(
  customVariants: Record<string, Record<string, string>> = {}
) {
  return {
    padding: {
      none: "p-0",
      sm: "p-2",
      lg: "p-6",
    },
    shadow: {
      sm: "shadow-sm",
      lg: "shadow-lg",
    },
    variant: {
      default: "card-default",
      feature: "card-feature",
    },
    ...customVariants,
  };
}

/**
 * Create layout component variants
 */
export function createLayoutVariants(
  customVariants: Record<string, Record<string, string>> = {}
) {
  return {
    container: {
      none: "container-none",
      sm: "container-sm",
      lg: "container-lg",
    },
    spacing: {
      none: "space-0",
      md: "space-4",
    },
    direction: {
      row: "flex-row",
      col: "flex-col",
    },
    ...customVariants,
  };
}

// === Component Composition Utilities ===

/**
 * Compose multiple component configurations
 */
export function composeComponents(
  ...configs: Partial<ComponentVariantConfig>[]
): ComponentVariantConfig {
  const composed: ComponentVariantConfig = {
    name: "ComposedComponent",
    baseClasses: "",
    variants: {},
  };

  for (const config of configs) {
    // Merge base classes
    if (config.baseClasses) {
      composed.baseClasses += ` ${config.baseClasses}`;
    }

    // Merge variants
    if (config.variants) {
      Object.assign(composed.variants, config.variants);
    }

    // Use the last name if provided
    if (config.name) {
      composed.name = config.name;
    }
  }

  composed.baseClasses = composed.baseClasses.trim();
  return composed;
}

/**
 * Create a responsive component variant
 */
export function createResponsiveVariant(
  baseVariants: Record<string, Record<string, string>>
) {
  const responsive: Record<string, Record<string, string>> = {
    ...baseVariants,
  };

  // Add responsive variants for each base variant
  for (const [variantName, options] of Object.entries(baseVariants)) {
    for (const [optionName, className] of Object.entries(options)) {
      responsive[variantName] = {
        ...responsive[variantName],
        [`md:${optionName}`]: `md:${className}`,
        [`lg:${optionName}`]: `lg:${className}`,
      };
    }
  }

  return responsive;
}

/**
 * Create theme-aware component variants
 */
export function createThemeVariants(
  baseVariants: Record<string, Record<string, string>>
) {
  const themed: Record<string, Record<string, string>> = {};

  for (const [variantName, options] of Object.entries(baseVariants)) {
    themed[variantName] = {};
    for (const [optionName, className] of Object.entries(options)) {
      themed[variantName][optionName] = `${className} dark:text-blue-400`;
    }
  }

  return themed;
}

// === Higher-Order Component Utilities ===

/**
 * Create a component with performance monitoring
 */
export function withPerformanceMonitoring(
  factory: (props: Record<string, unknown>) => { className: string },
  componentName: string
) {
  return (props: Record<string, unknown>) => {
    if (typeof performance !== "undefined") {
      performance.mark(`${componentName}-start`);
      const result = factory(props);
      performance.mark(`${componentName}-end`);
      performance.measure(
        componentName,
        `${componentName}-start`,
        `${componentName}-end`
      );
      return result;
    }
    return factory(props);
  };
}

// === Export Prebuilt Factories ===

/**
 * Pre-configured button factory
 */
export const buttonFactory = createComponentFactory({
  name: "Button",
  baseClasses: "btn",
  variants: createButtonVariants(),
  defaultVariants: { size: "md", variant: "primary" },
});

/**
 * Pre-configured badge factory
 */
export const badgeFactory = createComponentFactory({
  name: "Badge",
  baseClasses: "badge",
  variants: createBadgeVariants(),
  defaultVariants: { size: "sm", variant: "default" },
});

/**
 * Pre-configured card factory
 */
export const cardFactory = createComponentFactory({
  name: "Card",
  baseClasses: "card",
  variants: createCardVariants(),
  defaultVariants: { padding: "sm", shadow: "sm" },
});

/**
 * Pre-configured layout factory
 */
export const layoutFactory = createComponentFactory({
  name: "Layout",
  baseClasses: "layout",
  variants: createLayoutVariants(),
  defaultVariants: { container: "sm", direction: "row" },
});
