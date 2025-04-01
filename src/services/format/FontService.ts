/**
 * @module FontService
 * @description
 * Service for loading and managing fonts.
 * Provides functionality for loading Google Fonts and other font operations.
 */

import type { FontStyle, FontWeight } from "satori";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Configuration options for loaded fonts
 */
export interface FontOptions {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: FontStyle;
}

/**
 * Configuration for a specific font variant
 */
export interface FontConfig {
  name: string;
  font: string;
  weight: FontWeight;
  style: FontStyle;
}

/**
 * Interface for font service operations
 */
export interface IFontService {
  /**
   * Load a single Google Font
   */
  loadGoogleFont(font: string, text: string): Promise<ArrayBuffer>;

  /**
   * Load multiple Google Fonts
   */
  loadGoogleFonts(text: string, configs?: FontConfig[]): Promise<FontOptions[]>;

  /**
   * Validate font configuration
   */
  validateFontConfig(config: FontConfig): void;
}

/**
 * Implementation of the font service
 */
export class FontService implements IFontService {
  private readonly GOOGLE_FONTS_API = "https://fonts.googleapis.com/css2";

  private readonly DEFAULT_USER_AGENT =
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

  private readonly DEFAULT_FONTS: FontConfig[] = [
    {
      name: "IBM Plex Mono",
      font: "IBM+Plex+Mono",
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      font: "IBM+Plex+Mono:wght@700",
      weight: 700,
      style: "normal",
    },
  ];

  constructor(private config: IConfigService = configService) {}

  /**
   * Load a single Google Font
   */
  async loadGoogleFont(font: string, text: string): Promise<ArrayBuffer> {
    try {
      const API = `${this.GOOGLE_FONTS_API}?family=${font}&text=${encodeURIComponent(text)}`;

      const css = await fetch(API, {
        headers: {
          "User-Agent": this.DEFAULT_USER_AGENT,
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch font CSS: ${res.status} ${res.statusText}`
          );
        }
        return res.text();
      });

      const resource = css.match(
        /src: url\((.+)\) format\('(opentype|truetype)'\)/
      );
      if (!resource) {
        throw new Error("Failed to extract font URL from CSS");
      }

      const res = await fetch(resource[1]);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch font file: ${res.status} ${res.statusText}`
        );
      }

      return await res.arrayBuffer();
    } catch (error) {
      throw new Error(
        `Failed to load Google Font: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Load multiple Google Fonts
   */
  async loadGoogleFonts(
    text: string,
    configs: FontConfig[] = this.DEFAULT_FONTS
  ): Promise<FontOptions[]> {
    try {
      const fonts = await Promise.all(
        configs.map(async ({ name, font, weight, style }) => {
          const data = await this.loadGoogleFont(font, text);
          return { name, data, weight, style };
        })
      );

      return fonts;
    } catch (error) {
      throw new Error(
        `Failed to load Google Fonts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Validate font configuration
   */
  validateFontConfig(config: FontConfig): void {
    if (!config.name || typeof config.name !== "string") {
      throw new Error("Font name is required and must be a string");
    }
    if (!config.font || typeof config.font !== "string") {
      throw new Error("Font family is required and must be a string");
    }
    if (!config.weight || typeof config.weight !== "number") {
      throw new Error("Font weight is required and must be a number");
    }
    if (!config.style || typeof config.style !== "string") {
      throw new Error("Font style is required and must be a string");
    }
  }
}

// Export singleton instance for convenience
export const fontService = new FontService();
