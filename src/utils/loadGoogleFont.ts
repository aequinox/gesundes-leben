/**
 * @module loadGoogleFont
 * @description
 * Utility module for loading Google Fonts for use in OpenGraph images.
 * Handles font loading, subsetting, and caching for optimal performance.
 * Supports multiple font weights and styles with proper error handling.
 *
 * @example
 * ```typescript
 * import loadGoogleFonts from './utils/loadGoogleFont';
 *
 * const fonts = await loadGoogleFonts('Hello World');
 * // Returns array of font options with ArrayBuffer data
 * ```
 */

import type { FontStyle, FontWeight } from "satori";

/**
 * Configuration options for loaded fonts.
 * Used to specify font properties and data for rendering.
 *
 * @property name - Font family name for reference
 * @property data - Font data as ArrayBuffer
 * @property weight - Font weight (100-900)
 * @property style - Font style (normal, italic)
 */
export interface FontOptions {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: FontStyle;
}

/**
 * Configuration for a specific font variant.
 * Used to specify how a font should be loaded from Google Fonts.
 *
 * @property name - Font family name for reference
 * @property font - Google Fonts family string (e.g., 'IBM+Plex+Mono:wght@700')
 * @property weight - Font weight to load
 * @property style - Font style to load
 */
interface FontConfig {
  name: string;
  font: string;
  weight: FontWeight;
  style: FontStyle;
}

/**
 * Google Fonts API endpoint for font loading.
 * @internal
 */
const GOOGLE_FONTS_API = "https://fonts.googleapis.com/css2";

/**
 * Default user agent for font loading requests.
 * Required for proper font file URL extraction.
 * @internal
 */
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

/**
 * Loads a single Google Font and returns its data.
 * Handles font subsetting based on provided text.
 *
 * @param font - Font family name or identifier
 * @param text - Text to subset the font with
 * @returns Promise resolving to font data as ArrayBuffer
 * @throws {Error} If font loading or subsetting fails
 *
 * @example
 * ```typescript
 * const fontData = await loadGoogleFont('IBM+Plex+Mono', 'Hello');
 * ```
 */
async function loadGoogleFont(
  font: string,
  text: string
): Promise<ArrayBuffer> {
  try {
    const API = `${GOOGLE_FONTS_API}?family=${font}&text=${encodeURIComponent(text)}`;

    const css = await fetch(API, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
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
 * Default font configurations for common use cases.
 * Provides regular and bold weights of IBM Plex Mono.
 * @internal
 */
const DEFAULT_FONTS: FontConfig[] = [
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

/**
 * Loads multiple Google Fonts with proper error handling.
 * Supports custom font configurations and text subsetting.
 *
 * @param text - Text to subset the fonts with
 * @param configs - Optional custom font configurations
 * @returns Promise resolving to array of font options
 * @throws {Error} If any font fails to load
 *
 * @example
 * ```typescript
 * // Using default fonts
 * const defaultFonts = await loadGoogleFonts('Hello World');
 *
 * // Using custom configurations
 * const customFonts = await loadGoogleFonts('Hello', [{
 *   name: 'Roboto',
 *   font: 'Roboto:wght@300',
 *   weight: 300,
 *   style: 'normal'
 * }]);
 * ```
 */
async function loadGoogleFonts(
  text: string,
  configs: FontConfig[] = DEFAULT_FONTS
): Promise<FontOptions[]> {
  try {
    const fonts = await Promise.all(
      configs.map(async ({ name, font, weight, style }) => {
        const data = await loadGoogleFont(font, text);
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
 * Validates font configuration object.
 * Ensures all required properties are present and of correct type.
 *
 * @param config - Font configuration to validate
 * @throws {Error} If configuration is invalid
 *
 * @example
 * ```typescript
 * const config = {
 *   name: 'Roboto',
 *   font: 'Roboto',
 *   weight: 400,
 *   style: 'normal'
 * };
 * validateFontConfig(config); // Throws if invalid
 * ```
 */
export function validateFontConfig(config: FontConfig): void {
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

export { loadGoogleFont };
export type { FontConfig };
export default loadGoogleFonts;
