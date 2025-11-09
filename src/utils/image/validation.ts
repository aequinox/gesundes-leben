/**
 * Image Component Validation
 *
 * Validation schemas and utilities for Image component props.
 * Extracted from Image.astro for better maintainability and reusability.
 *
 * @module utils/image/validation
 */

import { commonRules, urlValidator } from "@/utils/propValidation";
import type { ValidationSchema } from "@/utils/propValidation";

/**
 * Validation schema for Image component props
 */
export const imageValidationSchema: ValidationSchema = {
  src: {
    required: true,
    validator: (value: unknown) => {
      // Allow strings (URLs or relative paths)
      if (typeof value === "string") {
        if (value.length === 0) {
          return "src cannot be an empty string";
        }
        return value.startsWith("http") ? urlValidator(value) : true;
      }

      // Allow image objects (imported assets and SVG imports)
      if (typeof value === "object" && value !== null) {
        return true;
      }

      // Allow undefined/null to be caught by required validation
      if (value === undefined || value === null) {
        return "src is required";
      }

      return `Invalid src type: expected string or object, got ${typeof value}`;
    },
  },
  alt: {
    ...commonRules.requiredString,
    message: "Alt text is required for accessibility",
  },
  title: commonRules.optionalString,
  aspectRatio: {
    type: "string" as const,
    oneOf: ["auto", "square", "video", "portrait", "ultrawide"],
  },
  loading: { type: "string" as const, oneOf: ["lazy", "eager"] },
  style: {
    type: "string" as const,
    oneOf: ["default", "polaroid", "bordered", "floating", "glass"],
  },
  effect: {
    type: "string" as const,
    oneOf: ["none", "zoom", "parallax", "tilt"],
  },
  filter: {
    type: "string" as const,
    oneOf: ["none", "blur", "grayscale", "sepia", "duotone"],
  },
  position: {
    type: "string" as const,
    oneOf: ["left", "right", "center", "full"],
  },
  quality: { type: "number" as const, min: 1, max: 100 },
  invert: commonRules.optionalBoolean,
  priority: commonRules.optionalBoolean,
};
