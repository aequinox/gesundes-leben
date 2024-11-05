import type { FontStyle, FontWeight } from "satori";

export interface FontOptions {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: FontStyle;
}

interface FontConfig {
  name: string;
  font: string;
  weight: FontWeight;
  style: FontStyle;
}

const GOOGLE_FONTS_API = 'https://fonts.googleapis.com/css2';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';

/**
 * Loads a Google Font and returns its data
 * @param font - Font family name
 * @param text - Text to subset the font with
 * @returns Font data as ArrayBuffer
 * @throws {Error} If font loading fails
 */
async function loadGoogleFont(
  font: string,
  text: string
): Promise<ArrayBuffer> {
  try {
    const API = `${GOOGLE_FONTS_API}?family=${font}&text=${encodeURIComponent(text)}`;

    const css = await fetch(API, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch font CSS: ${res.status} ${res.statusText}`);
      }
      return res.text();
    });

    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
    if (!resource) {
      throw new Error('Failed to extract font URL from CSS');
    }

    const res = await fetch(resource[1]);
    if (!res.ok) {
      throw new Error(`Failed to fetch font file: ${res.status} ${res.statusText}`);
    }

    return await res.arrayBuffer();
  } catch (error) {
    throw new Error(`Failed to load Google Font: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Default font configurations
 */
const DEFAULT_FONTS: FontConfig[] = [
  {
    name: "IBM Plex Mono",
    font: "IBM+Plex+Mono",
    weight: 400,
    style: "normal"
  },
  {
    name: "IBM Plex Mono",
    font: "IBM+Plex+Mono:wght@700",
    weight: 700,
    style: "normal"
  }
];

/**
 * Loads multiple Google Fonts
 * @param text - Text to subset the fonts with
 * @param configs - Optional custom font configurations
 * @returns Array of font options
 * @throws {Error} If any font fails to load
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
    throw new Error(`Failed to load Google Fonts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates font configuration
 * @param config - Font configuration to validate
 * @throws {Error} If configuration is invalid
 */
export function validateFontConfig(config: FontConfig): void {
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Font name is required and must be a string');
  }
  if (!config.font || typeof config.font !== 'string') {
    throw new Error('Font family is required and must be a string');
  }
  if (!config.weight || typeof config.weight !== 'number') {
    throw new Error('Font weight is required and must be a number');
  }
  if (!config.style || typeof config.style !== 'string') {
    throw new Error('Font style is required and must be a string');
  }
}

export { loadGoogleFont };
export type { FontConfig };
export default loadGoogleFonts;
