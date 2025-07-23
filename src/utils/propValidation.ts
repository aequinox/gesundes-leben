/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file propValidation.ts
 * @description Runtime prop validation utilities for Astro components
 *
 * Provides type-safe validation helpers that work at runtime to ensure
 * component props meet expected criteria. Follows Astro best practices
 * for server-side rendering and client-side interactivity.
 *
 * @example
 * ```typescript
 * import { validateProps, createValidator } from '@/utils/propValidation';
 *
 * // In component frontmatter
 * const validation = validateProps(Astro.props, {
 *   title: { required: true, type: 'string', minLength: 1 },
 *   size: { type: 'string', oneOf: ['sm', 'md', 'lg'] }
 * });
 *
 * if (!validation.isValid) {
 *   throw new Error(`Invalid props: ${validation.errors.join(', ')}`);
 * }
 * ```
 */
import type { ButtonVariant } from "@/components/types/button";
import {
  type ColorVariant,
  type SizeVariant,
  type ValidationResult,
  isDefined,
  isNonEmptyString,
  isValidURL,
} from "@/types";

import { logger } from "./logger";

// === Core Validation Types ===

/**
 * Validation rule configuration for a single property
 */
export interface PropValidationRule {
  /** Whether the property is required */
  required?: boolean;
  /** Expected type(s) */
  type?: "string" | "number" | "boolean" | "object" | "array" | "function";
  /** For strings: minimum length */
  minLength?: number;
  /** For strings: maximum length */
  maxLength?: number;
  /** For numbers: minimum value */
  min?: number;
  /** For numbers: maximum value */
  max?: number;
  /** Valid enum values */
  oneOf?: readonly string[] | string[];
  /** Custom validation function */
  validator?: (value: any) => boolean | string;
  /** Default value if not provided */
  defaultValue?: any;
  /** Error message override */
  message?: string;
}

/**
 * Validation schema for a component's props
 */
export type PropValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: PropValidationRule;
};

/**
 * Validation context for error reporting
 */
export interface ValidationContext {
  componentName?: string;
  propPath?: string;
  strict?: boolean;
  throwOnError?: boolean;
}

// === Core Validation Functions ===

/**
 * Validates a single property value against a rule
 */
export function validateProp(
  value: any,
  rule: PropValidationRule,
  propName: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if required
  if (rule.required && !isDefined(value)) {
    errors.push(`${propName} is required`);
    return { isValid: false, errors, warnings };
  }

  // Skip validation if not required and value is undefined/null
  if (!rule.required && !isDefined(value)) {
    return { isValid: true, errors: [], warnings };
  }

  // Type validation
  if (rule.type && !validateType(value, rule.type)) {
    errors.push(
      `${propName} must be of type ${rule.type}, got ${typeof value}`
    );
  }

  // String validations
  if (rule.type === "string" && typeof value === "string") {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(
        `${propName} must be at least ${rule.minLength} characters long`
      );
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(
        `${propName} must be no more than ${rule.maxLength} characters long`
      );
    }
  }

  // Number validations
  if (rule.type === "number" && typeof value === "number") {
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`${propName} must be at least ${rule.min}`);
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.push(`${propName} must be no more than ${rule.max}`);
    }
  }

  // Enum validation
  if (rule.oneOf && !rule.oneOf.includes(value)) {
    errors.push(`${propName} must be one of: ${rule.oneOf.join(", ")}`);
  }

  // Custom validation
  if (rule.validator) {
    const result = rule.validator(value);
    if (result === false) {
      errors.push(rule.message || `${propName} failed custom validation`);
    } else if (typeof result === "string") {
      errors.push(result);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an object against a schema
 */
export function validateProps<T extends Record<string, any>>(
  props: T,
  schema: PropValidationSchema<T>,
  context: ValidationContext = {}
): ValidationResult & { validatedProps: T } {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const validatedProps = { ...props };

  // Apply defaults and validate each property
  for (const [propName, rule] of Object.entries(schema)) {
    if (!rule) {
      continue;
    }

    const propValue = props[propName];

    // Apply default value
    if (!isDefined(propValue) && isDefined(rule.defaultValue)) {
      (validatedProps as any)[propName] = rule.defaultValue;
    }

    const validation = validateProp(validatedProps[propName], rule, propName);

    allErrors.push(...validation.errors);
    if (validation.warnings) {
      allWarnings.push(...validation.warnings);
    }
  }

  const isValid = allErrors.length === 0;

  // Log validation results in development
  if (import.meta.env.DEV && !isValid) {
    const componentName = context.componentName || "Unknown Component";
    logger.warn(
      "Prop validation failed for",
      componentName,
      ":",
      JSON.stringify({
        errors: allErrors,
        warnings: allWarnings,
        props,
      })
    );
  }

  // Throw in strict mode
  if (context.throwOnError && !isValid) {
    throw new Error(`Prop validation failed: ${allErrors.join(", ")}`);
  }

  return {
    isValid,
    errors: allErrors,
    warnings: allWarnings,
    validatedProps,
  };
}

/**
 * Type validation helper
 */
function validateType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    case "array":
      return Array.isArray(value);
    case "function":
      return typeof value === "function";
    default:
      return false;
  }
}

// === Component-Specific Validators ===

/**
 * Base component props validation schema
 */
export const baseComponentSchema: PropValidationSchema<Record<string, any>> = {
  class: { type: "string" },
  id: { type: "string" },
  disabled: { type: "boolean" },
  loading: {
    oneOf: ["true", "false", "idle", "loading", "success", "error"] as const,
  },
  ariaLabel: { type: "string" },
  "data-testid": { type: "string" },
};

/**
 * Size variant validation
 */
export const sizeVariantValidator = (value: any): boolean => {
  const validSizes: SizeVariant[] = ["xs", "sm", "md", "lg", "xl"];
  return validSizes.includes(value);
};

/**
 * Color variant validation
 */
export const colorVariantValidator = (value: any): boolean => {
  const validColors: ColorVariant[] = [
    "primary",
    "secondary",
    "accent",
    "muted",
    "success",
    "warning",
    "error",
  ];
  return validColors.includes(value);
};

/**
 * Button variant validation
 */
export const buttonVariantValidator = (value: any): boolean => {
  const validVariants: ButtonVariant[] = [
    "default",
    "accent",
    "outline",
    "ghost",
    "subtle",
    "text",
    "link",
    "icon",
  ];
  return validVariants.includes(value);
};

/**
 * URL validation helper
 */
export const urlValidator = (value: any): boolean | string => {
  if (!isNonEmptyString(value)) {
    return "URL must be a non-empty string";
  }

  if (!isValidURL(value)) {
    return "Invalid URL format";
  }

  return true;
};

/**
 * Email validation helper
 */
export const emailValidator = (value: any): boolean | string => {
  if (!isNonEmptyString(value)) {
    return "Email must be a non-empty string";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Invalid email format";
  }

  return true;
};

/**
 * Accessible name validation (for interactive elements)
 */
export const accessibleNameValidator = (props: any): boolean | string => {
  const hasAriaLabel = isNonEmptyString(props["aria-label"]);
  const hasAriaLabelledBy = isNonEmptyString(props["aria-labelledby"]);
  const hasTitle = isNonEmptyString(props.title);
  const hasTextContent =
    isNonEmptyString(props.children) || isNonEmptyString(props.text);

  if (!hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasTextContent) {
    return "Interactive element must have an accessible name (aria-label, aria-labelledby, title, or text content)";
  }

  return true;
};

// === Factory Functions ===

/**
 * Creates a validation function for a specific component
 */
export function createValidator<T extends Record<string, any>>(
  schema: PropValidationSchema<T>,
  context: ValidationContext = {}
) {
  return (props: T): ValidationResult & { validatedProps: T } => {
    return validateProps(props, schema, context);
  };
}

/**
 * Creates a strict validator that throws on validation errors
 */
export function createStrictValidator<T extends Record<string, any>>(
  schema: PropValidationSchema<T>,
  componentName: string
) {
  return createValidator(schema, {
    componentName,
    strict: true,
    throwOnError: true,
  });
}

/**
 * HOC-style validator for component props
 */
export function withValidation<T extends Record<string, any>>(
  schema: PropValidationSchema<T>,
  componentName?: string
) {
  return (props: T): T => {
    const validation = validateProps(props, schema, {
      componentName,
      strict: import.meta.env.DEV,
    });

    if (!validation.isValid && import.meta.env.DEV) {
      logger.error(
        "Invalid props for",
        componentName || "component",
        ":",
        JSON.stringify(validation.errors)
      );
    }

    return validation.validatedProps;
  };
}

// === Common Validation Schemas ===

/**
 * Common validation rules that can be reused
 */
export const commonRules = {
  requiredString: { required: true, type: "string" as const, minLength: 1 },
  optionalString: { type: "string" as const },
  requiredNumber: { required: true, type: "number" as const },
  positiveNumber: { type: "number" as const, min: 0 },
  requiredBoolean: { required: true, type: "boolean" as const },
  optionalBoolean: { type: "boolean" as const },
  sizeVariant: { type: "string" as const, validator: sizeVariantValidator },
  colorVariant: { type: "string" as const, validator: colorVariantValidator },
  buttonVariant: { type: "string" as const, validator: buttonVariantValidator },
  url: { type: "string" as const, validator: urlValidator },
  email: { type: "string" as const, validator: emailValidator },
} as const;

// === Development Helpers ===

/**
 * Dev-only prop inspection utility
 */
export function inspectProps(
  props: Record<string, any>,
  componentName: string
): void {
  if (!import.meta.env.DEV) {
    return;
  }

  logger.debug(
    "Props for",
    componentName,
    ":",
    JSON.stringify({
      props,
      propCount: Object.keys(props).length,
      hasChildren: "children" in props,
      hasSlots: "slots" in props,
    })
  );
}

/**
 * Performance monitoring for prop validation
 */
export function measureValidation<T extends Record<string, any>>(
  props: T,
  schema: PropValidationSchema<T>,
  componentName: string
): ValidationResult & { validatedProps: T; duration: number } {
  const start = performance.now();
  const result = validateProps(props, schema, { componentName });
  const end = performance.now();
  const duration = end - start;

  if (duration > 5 && import.meta.env.DEV) {
    logger.warn(
      "Slow prop validation for",
      componentName,
      ":",
      `${duration.toFixed(2)}ms`
    );
  }

  return { ...result, duration };
}

/**
 * Generate TypeScript interface from validation schema (dev helper)
 */
export function generateInterface(
  schema: PropValidationSchema<any>,
  interfaceName: string
): string {
  if (!import.meta.env.DEV) {
    return "";
  }

  let interfaceStr = `interface ${interfaceName} {\n`;

  for (const [propName, rule] of Object.entries(schema)) {
    if (!rule) {
      continue;
    }

    const optional = rule.required ? "" : "?";
    const type = rule.type || "any";
    interfaceStr += `  ${propName}${optional}: ${type};\n`;
  }

  interfaceStr += "}";
  return interfaceStr;
}
