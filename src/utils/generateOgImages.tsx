/**
 * @module generateOgImages
 * @description
 * Utility module for generating OpenGraph images for blog posts and site content.
 * Provides functionality to create social media preview images with customizable
 * dimensions, backgrounds, and font settings.
 *
 * @example
 * ```typescript
 * import { generateOgImageForPost } from './utils/generateOgImages';
 *
 * const image = await generateOgImageForPost(post, {
 *   width: 1200,
 *   height: 630,
 *   background: '#ffffff'
 * });
 * ```
 */

import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

/**
 * Defines the dimensions for OpenGraph images.
 * These dimensions should follow social media platform recommendations.
 *
 * @property width - Image width in pixels (recommended: 1200)
 * @property height - Image height in pixels (recommended: 630)
 */
interface OgImageDimensions {
  width: number;
  height: number;
}

/**
 * Defines how the image should be fitted within its container.
 * Provides multiple modes for controlling image scaling and positioning.
 *
 * @property mode - The fitting mode to use ('original', 'width', 'height', or 'zoom')
 * @property value - The numeric value associated with the mode (if applicable)
 */
type OgImageFitMode =
  | { mode: "original" }
  | { mode: "width"; value: number }
  | { mode: "height"; value: number }
  | { mode: "zoom"; value: number };

/**
 * Configuration for font loading and usage in OpenGraph images.
 * Controls font loading behavior and default font settings.
 *
 * @property loadSystemFonts - Whether to load system fonts
 * @property fontFiles - Optional array of custom font file paths
 * @property defaultFontFamily - Default fallback font family
 */
interface OgImageFont {
  loadSystemFonts: boolean;
  fontFiles?: string[];
  defaultFontFamily?: string;
}

/**
 * Comprehensive options for OpenGraph image generation.
 * Extends basic dimensions with additional customization options.
 *
 * @extends Partial<OgImageDimensions>
 * @property fitTo - How the image should be fitted
 * @property background - Background color in CSS format
 * @property font - Font configuration options
 */
export interface OgImageOptions extends Partial<OgImageDimensions> {
  fitTo?: OgImageFitMode;
  background?: string;
  font?: Partial<OgImageFont>;
}

/**
 * Default options for OpenGraph image generation.
 * Provides sensible defaults that work well for most social media platforms.
 *
 * @constant
 */
const DEFAULT_OPTIONS = {
  width: 1200,
  height: 630,
  fitTo: {
    mode: "width" as const,
    value: 1200,
  },
  background: "#ffffff",
  font: {
    loadSystemFonts: true,
    fontFiles: [] as string[],
    defaultFontFamily: "Arial",
  },
} as const;

/**
 * Converts an SVG string to a PNG buffer with optimized performance and error handling.
 * Uses resvg for high-quality SVG rendering.
 *
 * @param svg - SVG string to convert
 * @param options - Conversion options for customizing output
 * @returns PNG buffer of the converted image
 * @throws {Error} If SVG conversion fails or input is invalid
 *
 * @example
 * ```typescript
 * const pngBuffer = await svgBufferToPngBuffer(svgString, {
 *   width: 1200,
 *   height: 630,
 *   background: '#ffffff'
 * });
 * ```
 */
function svgBufferToPngBuffer(
  svg: string,
  options: OgImageOptions = {}
): Buffer {
  if (!svg) {
    throw new Error("SVG input is required");
  }

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    font: {
      ...DEFAULT_OPTIONS.font,
      ...options.font,
    },
  };

  try {
    const resvg = new Resvg(svg, {
      background: mergedOptions.background,
      fitTo: mergedOptions.fitTo,
      font: mergedOptions.font,
    });

    return resvg.render().asPng();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to convert SVG to PNG: ${errorMessage}`);
  }
}

/**
 * Validates that image dimensions are within acceptable ranges.
 * Ensures generated images meet minimum quality standards and maximum size limits.
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @throws {Error} If dimensions are outside acceptable ranges (200-2048 pixels)
 *
 * @internal
 */
function validateImageDimensions(width?: number, height?: number): void {
  const MIN_DIMENSION = 200;
  const MAX_DIMENSION = 2048;

  if (width && (width < MIN_DIMENSION || width > MAX_DIMENSION)) {
    throw new Error(
      `Width must be between ${MIN_DIMENSION} and ${MAX_DIMENSION} pixels`
    );
  }

  if (height && (height < MIN_DIMENSION || height > MAX_DIMENSION)) {
    throw new Error(
      `Height must be between ${MIN_DIMENSION} and ${MAX_DIMENSION} pixels`
    );
  }
}

/**
 * Generates an OpenGraph image for a blog post with improved error handling and validation.
 * Creates a social media preview image using the post's metadata.
 *
 * @param post - Blog post entry containing metadata for the image
 * @param options - Image generation options for customization
 * @returns Promise resolving to PNG buffer of the generated image
 * @throws {Error} If post data is invalid or image generation fails
 *
 * @example
 * ```typescript
 * const postImage = await generateOgImageForPost(blogPost, {
 *   width: 1200,
 *   height: 630,
 *   background: '#f8f9fa'
 * });
 * ```
 */
export async function generateOgImageForPost(
  post: CollectionEntry<"blog">,
  options: OgImageOptions = {}
): Promise<Buffer> {
  if (!post) {
    throw new Error("Post data is required");
  }

  try {
    validateImageDimensions(options.width, options.height);
    const svg = await postOgImage(post);
    return svgBufferToPngBuffer(svg, options);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate post OG image: ${errorMessage}`);
  }
}

/**
 * Generates an OpenGraph image for the site's social media presence.
 * Creates a branded preview image using site-wide settings.
 *
 * @param options - Image generation options for customization
 * @returns Promise resolving to PNG buffer of the generated image
 * @throws {Error} If image generation fails or options are invalid
 *
 * @example
 * ```typescript
 * const siteImage = await generateOgImageForSite({
 *   width: 1200,
 *   height: 630,
 *   background: '#ffffff',
 *   font: {
 *     loadSystemFonts: true,
 *     defaultFontFamily: 'Arial'
 *   }
 * });
 * ```
 */
export async function generateOgImageForSite(
  options: OgImageOptions = {}
): Promise<Buffer> {
  try {
    validateImageDimensions(options.width, options.height);

    // Pass relevant options to template
    const svg = await siteOgImage({
      width: options.width,
      height: options.height,
      background: options.background,
    });

    // Handle fit modes
    const fitOptions = { ...options };
    if (options.fitTo) {
      switch (options.fitTo.mode) {
        case "original":
          delete fitOptions.fitTo;
          break;
        case "width":
        case "height":
        case "zoom":
          // These modes are already handled by resvg
          break;
      }
    }

    // Handle font options
    if (options.font) {
      fitOptions.font = {
        ...DEFAULT_OPTIONS.font,
        ...options.font,
        fontFiles: [
          ...(DEFAULT_OPTIONS.font.fontFiles || []),
          ...(options.font.fontFiles || []),
        ],
      };
    }

    return svgBufferToPngBuffer(svg, fitOptions);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate site OG image: ${errorMessage}`);
  }
}
