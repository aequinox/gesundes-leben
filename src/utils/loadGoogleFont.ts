/**
 * Downloads a dynamic font from Google Fonts for a given font family and specific characters.
 * @param font The font family to download.
 * @param text The characters to include in the font.
 * @param weight The weight of the font.
 * @returns The downloaded font as an ArrayBuffer.
 * @throws An error if the font cannot be downloaded.
 */
const loadGoogleFont = async (
  font: string,
  text: string,
  weight: number
): Promise<ArrayBuffer> => {
  const API = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;

  const css = await (
    await fetch(API, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) throw new Error("Failed to download dynamic font");

  const res = await fetch(resource[1]);

  if (!res.ok) {
    throw new Error("Failed to download dynamic font. Status: " + res.status);
  }

  return res.arrayBuffer();
};

/**
 * Font weight type matching satori's Weight type
 */
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Font style type matching satori's FontStyle type
 */
type FontStyle = "normal" | "italic";

/**
 * Loads multiple Google Fonts based on the specified text, returning their data and properties.
 *
 * @param text - The specific characters required in the fonts.
 * @returns A promise that resolves to an array of objects, each containing:
 *          - name: The name of the font.
 *          - data: The font data as an ArrayBuffer.
 *          - weight: The weight of the font.
 *          - style: The style of the font, such as "normal" or "italic".
 */

export const loadGoogleFonts = async (
  text: string
): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: Weight; style: FontStyle }>
> => {
  const fontsConfig: Array<{
    name: string;
    font: string;
    weight: Weight;
    style: FontStyle;
  }> = [
    {
      name: "Poppins",
      font: "Poppins",
      weight: 400 as Weight,
      style: "normal" as FontStyle,
    },
    {
      name: "Poppins",
      font: "Poppins",
      weight: 700 as Weight,
      style: "normal" as FontStyle,
    },
  ];

  const fonts = await Promise.all(
    fontsConfig.map(async ({ name, font, weight, style }) => {
      const data = await loadGoogleFont(font, text, weight);
      return { name, data, weight, style };
    })
  );

  return fonts;
};
