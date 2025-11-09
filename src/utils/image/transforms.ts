/**
 * Image Component Transforms
 *
 * Utility functions for image transformations and processing.
 * Extracted from Image.astro for better maintainability and testability.
 *
 * @module utils/image/transforms
 */

import type { ImageMetadata } from "astro";

import {
  ASPECT_RATIOS,
  FILTER_CLASSES,
  POSITION_CHAR_MAP,
  ROUNDED_CLASSES,
} from "./constants";

/**
 * Position type
 */
export type Position = "left" | "right" | "center" | "full";

/**
 * Filter type
 */
export type Filter = "none" | "blur" | "grayscale" | "sepia" | "duotone";

/**
 * Rounded type
 */
export type Rounded = boolean | "sm" | "md" | "lg" | "full";

/**
 * Aspect ratio type
 */
export type AspectRatio =
  | "auto"
  | "square"
  | "video"
  | "portrait"
  | "ultrawide";

/**
 * Result of parsing image title for legacy position/invert controls
 */
export interface ParsedTitle {
  position: Position;
  title: string;
  invert: boolean;
}

/**
 * Parse image title for position and invert controls (legacy support)
 *
 * @param title - Original title string
 * @param defaultPosition - Default position if none specified in title
 * @returns Parsed title with position and invert flag
 *
 * @example
 * ```typescript
 * parseImageTitle("!>My Image", "center")
 * // Returns: { position: "right", title: "My Image", invert: true }
 *
 * parseImageTitle("<Left Image", "center")
 * // Returns: { position: "left", title: "Left Image", invert: false }
 * ```
 */
export function parseImageTitle(
  title: string | undefined,
  defaultPosition: Position = "center"
): ParsedTitle {
  if (!title) {
    return { position: defaultPosition, title: "", invert: false };
  }

  let finalTitle = title;
  let shouldInvert = false;
  let finalPosition = defaultPosition;

  // Check for invert prefix first (can be combined with position)
  if (title.charAt(0) === "!") {
    shouldInvert = true;
    finalTitle = title.slice(1);

    // Check if there's a position control character after the invert
    if (finalTitle.length > 0) {
      const positionChar = finalTitle.charAt(0);
      if (positionChar in POSITION_CHAR_MAP) {
        finalPosition = POSITION_CHAR_MAP[
          positionChar as keyof typeof POSITION_CHAR_MAP
        ] as Position;
        finalTitle = finalTitle.slice(1);
      }
    }
  } else {
    // No invert prefix, check for position control characters
    const controlChar = title.charAt(0);
    if (controlChar in POSITION_CHAR_MAP) {
      finalPosition = POSITION_CHAR_MAP[
        controlChar as keyof typeof POSITION_CHAR_MAP
      ] as Position;
      finalTitle = title.slice(1);
    }
  }

  return {
    position: finalPosition,
    title: finalTitle,
    invert: shouldInvert,
  };
}

/**
 * Calculate image dimensions based on aspect ratio
 *
 * @param width - Original width
 * @param height - Original height
 * @param aspectRatio - Desired aspect ratio
 * @returns New dimensions { width, height }
 */
export function calculateDimensions(
  width: number,
  height: number,
  aspectRatio: AspectRatio
): { width: number; height: number } {
  if (aspectRatio === "auto" || !width || !height) {
    return { width, height };
  }

  let newHeight = height;

  if (aspectRatio === "square") {
    newHeight = width;
  } else if (aspectRatio in ASPECT_RATIOS) {
    newHeight = Math.round(
      width * ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS]
    );
  }

  return { width, height: newHeight };
}

/**
 * Extract dimensions from ImageMetadata and apply aspect ratio
 *
 * @param imgMetadata - Image metadata object
 * @param aspectRatio - Desired aspect ratio
 * @param widthOverride - Optional width override
 * @param heightOverride - Optional height override
 * @returns Calculated dimensions
 */
export function extractDimensions(
  imgMetadata: ImageMetadata,
  aspectRatio: AspectRatio = "auto",
  widthOverride?: number,
  heightOverride?: number
): { width: number; height: number } {
  const baseWidth = widthOverride ?? imgMetadata.width;
  const baseHeight = heightOverride ?? imgMetadata.height;

  return calculateDimensions(baseWidth, baseHeight, aspectRatio);
}

/**
 * Get CSS filter class for a given filter type
 *
 * @param filter - Filter type
 * @returns CSS class name
 */
export function getFilterClass(filter: Filter): string {
  return FILTER_CLASSES[filter];
}

/**
 * Get CSS rounded class for a given rounded value
 *
 * @param rounded - Rounded value (boolean or size string)
 * @returns CSS class name
 */
export function getRoundedClass(rounded: Rounded): string {
  if (typeof rounded === "boolean") {
    return ROUNDED_CLASSES[String(rounded) as "true" | "false"];
  }
  return ROUNDED_CLASSES[rounded];
}

/**
 * SVG import interface
 */
export interface SvgImport {
  src: string;
  [key: string]: unknown;
}

/**
 * Type guard for SVG imports
 *
 * @param value - Value to check
 * @returns True if value is an SVG import object
 */
export function isSvgImport(value: unknown): value is SvgImport {
  return (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    typeof (value as SvgImport).src === "string" &&
    (value as SvgImport).src.endsWith(".svg")
  );
}

/**
 * Extract string source from image source prop
 *
 * @param srcProp - Image source (string, SVG import, or ImageMetadata)
 * @returns String source or empty string
 */
export function extractStringSource(
  srcProp: string | ImageMetadata | SvgImport
): string {
  if (typeof srcProp === "string") {
    return srcProp;
  }

  if (isSvgImport(srcProp)) {
    return srcProp.src;
  }

  return "";
}
