import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

export interface OgImageOptions {
  width?: number;
  height?: number;
  fitTo?: {
    mode: 'original';
  } | {
    mode: 'width' | 'height';
    value: number;
  };
  background?: string;
  font?: {
    loadSystemFonts: boolean;
    fontFiles?: string[];
    defaultFontFamily?: string;
  };
}

const DEFAULT_OPTIONS: Required<OgImageOptions> = {
  width: 1200,
  height: 630,
  fitTo: {
    mode: 'width',
    value: 1200
  },
  background: '#ffffff',
  font: {
    loadSystemFonts: true,
    fontFiles: [],
    defaultFontFamily: 'Arial'
  }
};

/**
 * Converts SVG string to PNG buffer
 * @param svg - SVG string to convert
 * @param options - Conversion options
 * @returns PNG buffer
 * @throws {Error} If SVG conversion fails
 */
function svgBufferToPngBuffer(svg: string, options: Partial<OgImageOptions> = {}): Buffer {
  try {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      font: {
        ...DEFAULT_OPTIONS.font,
        ...options.font
      }
    };

    const resvg = new Resvg(svg, {
      background: mergedOptions.background,
      fitTo: mergedOptions.fitTo,
      font: {
        loadSystemFonts: mergedOptions.font.loadSystemFonts,
        fontFiles: mergedOptions.font.fontFiles,
        defaultFontFamily: mergedOptions.font.defaultFontFamily,
      }
    });

    return resvg.render().asPng();
  } catch (error) {
    throw new Error(`Failed to convert SVG to PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates OpenGraph image for a blog post
 * @param post - Blog post entry
 * @param options - Image generation options
 * @returns PNG buffer
 * @throws {Error} If image generation fails
 */
export async function generateOgImageForPost(
  post: CollectionEntry<"blog">,
  options: Partial<OgImageOptions> = {}
): Promise<Buffer> {
  try {
    validateImageDimensions(options.width, options.height);
    const svg = await postOgImage(post);
    return svgBufferToPngBuffer(svg, options);
  } catch (error) {
    throw new Error(`Failed to generate post OG image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates OpenGraph image for the site
 * @param options - Image generation options
 * @returns PNG buffer
 * @throws {Error} If image generation fails
 */
export async function generateOgImageForSite(
  options: Partial<OgImageOptions> = {}
): Promise<Buffer> {
  try {
    validateImageDimensions(options.width, options.height);
    const svg = await siteOgImage();
    return svgBufferToPngBuffer(svg, options);
  } catch (error) {
    throw new Error(`Failed to generate site OG image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates image dimensions
 * @param width - Image width
 * @param height - Image height
 * @throws {Error} If dimensions are invalid
 */
export function validateImageDimensions(width?: number, height?: number): void {
  if (width && (width < 200 || width > 2000)) {
    throw new Error('Width must be between 200 and 2000 pixels');
  }
  if (height && (height < 200 || height > 2000)) {
    throw new Error('Height must be between 200 and 2000 pixels');
  }
}

/**
 * Creates OpenGraph image options with validation
 * @param options - Partial options to merge with defaults
 * @returns Complete validated options
 * @throws {Error} If options are invalid
 */
export function createOgImageOptions(options: Partial<OgImageOptions> = {}): Required<OgImageOptions> {
  validateImageDimensions(options.width, options.height);
  
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    font: {
      ...DEFAULT_OPTIONS.font,
      ...options.font
    }
  };
}
