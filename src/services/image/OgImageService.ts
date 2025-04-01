/**
 * @module OgImageService
 * @description
 * Service for generating OpenGraph images for blog posts and site content.
 * Provides functionality to create social media preview images with customizable
 * dimensions, backgrounds, and font settings.
 */

import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import postOgImage from "@/utils/og-templates/post";
import siteOgImage from "@/utils/og-templates/site";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Defines the dimensions for OpenGraph images
 */
export interface OgImageDimensions {
  width: number;
  height: number;
}

/**
 * Defines how the image should be fitted within its container
 */
export type OgImageFitMode =
  | { mode: "original" }
  | { mode: "width"; value: number }
  | { mode: "height"; value: number }
  | { mode: "zoom"; value: number };

/**
 * Configuration for font loading and usage in OpenGraph images
 */
export interface OgImageFont {
  loadSystemFonts: boolean;
  fontFiles?: string[];
  defaultFontFamily?: string;
}

/**
 * Comprehensive options for OpenGraph image generation
 */
export interface OgImageOptions extends Partial<OgImageDimensions> {
  fitTo?: OgImageFitMode;
  background?: string;
  font?: Partial<OgImageFont>;
}

/**
 * Interface for OG image service operations
 */
export interface IOgImageService {
  /**
   * Generate an OpenGraph image for a blog post
   */
  generatePostImage(
    post: CollectionEntry<"blog">,
    options?: OgImageOptions
  ): Promise<Buffer>;

  /**
   * Generate an OpenGraph image for the site
   */
  generateSiteImage(options?: OgImageOptions): Promise<Buffer>;
}

/**
 * Implementation of the OG image service
 */
export class OgImageService implements IOgImageService {
  private readonly DEFAULT_OPTIONS = {
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

  constructor(private config: IConfigService = configService) {}

  /**
   * Validates that image dimensions are within acceptable ranges
   */
  private validateImageDimensions(width?: number, height?: number): void {
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
   * Converts an SVG string to a PNG buffer
   */
  private svgBufferToPngBuffer(
    svg: string,
    options: OgImageOptions = {}
  ): Buffer {
    if (!svg) {
      throw new Error("SVG input is required");
    }

    const mergedOptions = {
      ...this.DEFAULT_OPTIONS,
      ...options,
      font: {
        ...this.DEFAULT_OPTIONS.font,
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
   * Generate an OpenGraph image for a blog post
   */
  async generatePostImage(
    post: CollectionEntry<"blog">,
    options: OgImageOptions = {}
  ): Promise<Buffer> {
    if (!post) {
      throw new Error("Post data is required");
    }

    try {
      this.validateImageDimensions(options.width, options.height);
      const svg = await postOgImage(post);
      return this.svgBufferToPngBuffer(svg, options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to generate post OG image: ${errorMessage}`);
    }
  }

  /**
   * Generate an OpenGraph image for the site
   */
  async generateSiteImage(options: OgImageOptions = {}): Promise<Buffer> {
    try {
      this.validateImageDimensions(options.width, options.height);

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
          ...this.DEFAULT_OPTIONS.font,
          ...options.font,
          fontFiles: [
            ...(this.DEFAULT_OPTIONS.font.fontFiles || []),
            ...(options.font.fontFiles || []),
          ],
        };
      }

      return this.svgBufferToPngBuffer(svg, fitOptions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to generate site OG image: ${errorMessage}`);
    }
  }
}

// Export singleton instance for convenience
export const ogImageService = new OgImageService();
