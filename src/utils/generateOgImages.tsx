import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

interface OgImageDimensions {
  width: number;
  height: number;
}

type OgImageFitMode =
  | { mode: "original" }
  | { mode: "width"; value: number }
  | { mode: "height"; value: number }
  | { mode: "zoom"; value: number };

interface OgImageFont {
  loadSystemFonts: boolean;
  fontFiles?: string[];
  defaultFontFamily?: string;
}

export interface OgImageOptions extends Partial<OgImageDimensions> {
  fitTo?: OgImageFitMode;
  background?: string;
  font?: Partial<OgImageFont>;
}

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
 * Converts SVG string to PNG buffer with optimized performance and error handling
 * @param svg - SVG string to convert
 * @param options - Conversion options
 * @returns PNG buffer
 * @throws {Error} If SVG conversion fails
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
 * Validates image dimensions are within acceptable ranges
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @throws {Error} If dimensions are invalid
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
 * Generates OpenGraph image for a blog post with improved error handling and validation
 * @param post - Blog post entry
 * @param options - Image generation options
 * @returns PNG buffer
 * @throws {Error} If image generation fails
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
 * Generates OpenGraph image for the site
 * @param options - Image generation options
 * @returns PNG buffer
 * @throws {Error} If image generation fails
 */
export async function generateOgImageForSite(
  options: OgImageOptions = {}
): Promise<Buffer> {
  try {
    validateImageDimensions(options.width, options.height);
    const svg = await siteOgImage();
    return svgBufferToPngBuffer(svg, options);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate site OG image: ${errorMessage}`);
  }
}
