/**
 * Image Component Constants
 *
 * Centralized constants for image processing and styling.
 * Extracted from Image.astro for better maintainability and reusability.
 *
 * @module utils/image/constants
 */

/**
 * Default responsive image widths based on position
 */
export const IMAGE_WIDTHS = {
  left: [400, 600, 800],
  right: [400, 600, 800],
  center: [600, 800, 1200],
  full: [800, 1200, 1600, 2000],
} as const;

/**
 * Aspect ratio numeric values
 */
export const ASPECT_RATIOS = {
  square: 1,
  video: 9 / 16,
  portrait: 4 / 3,
  ultrawide: 9 / 21,
} as const;

/**
 * Default sizes attribute for responsive images based on position
 */
export const DEFAULT_SIZES = {
  left: "(max-width: 768px) 100vw, 40vw",
  right: "(max-width: 768px) 100vw, 40vw",
  center: "(max-width: 768px) 100vw, 70vw",
  full: "100vw",
} as const;

/**
 * Map filter values to CSS classes
 */
export const FILTER_CLASSES = {
  none: "",
  blur: "image-filter-blur",
  grayscale: "image-filter-grayscale",
  sepia: "image-filter-sepia",
  duotone: "image-filter-duotone",
} as const;

/**
 * Map rounded values to CSS classes
 */
export const ROUNDED_CLASSES = {
  true: "rounded",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
  false: "",
} as const;

/**
 * Position to character mapping for legacy title-based positioning
 */
export const POSITION_CHAR_MAP = {
  ">": "right",
  "<": "left",
  "|": "center",
  _: "full",
} as const;

/**
 * Default image formats optimized for performance
 */
export const DEFAULT_FORMATS = ["avif", "webp"] as const;

/**
 * Default image quality (0-100)
 */
export const DEFAULT_QUALITY = 80;

/**
 * Default pixel densities for responsive images
 */
export const DEFAULT_DENSITIES = [1, 2] as const;

/**
 * Animation direction mapping based on position
 */
export const ANIMATION_DIRECTIONS = {
  left: "fade-right",
  right: "fade-left",
  center: "fade-up",
  full: "fade-up",
} as const;

/**
 * Default dimensions for remote images when not specified
 */
export const DEFAULT_REMOTE_DIMENSIONS = {
  width: 800,
  height: 600,
} as const;
