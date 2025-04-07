import { SITE } from "@/config";
import satori from "satori";
import loadGoogleFonts, { type FontOptions } from "../loadGoogleFont";

// Get colors from the site's theme
const COLORS = {
  light: {
    background: "#fefbfb", // --color-fill
    text: "#1b1b1b", // --color-text-base
    accent: "#3b5bdb", // --color-accent
    card: "#ffffff", // --color-card
    cardMuted: "#f5f5f5", // --color-card-muted
    border: "#e5e7eb", // --color-border
  },
  dark: {
    background: "#1c1b22", // --color-fill
    text: "#f2f2f2", // --color-text-base
    accent: "#ffa94d", // --color-accent
    card: "#2d2b37", // --color-card
    cardMuted: "#3d3a4a", // --color-card-muted
    border: "#4d4a5a", // --color-border
  },
};

export default async (
  options: { width?: number; height?: number; background?: string } = {}
) => {
  const width = options.width || 1200;
  const height = options.height || 630;
  const background = options.background || COLORS.light.background;
  const accent = COLORS.light.accent;

  return satori(
    <div
      style={{
        background,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Montserrat",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${COLORS.light.background} 0%, ${COLORS.light.cardMuted} 100%)`,
          opacity: 0.8,
        }}
      />

      {/* Accent color bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: accent,
        }}
      />

      {/* Main content card with modern glass effect */}
      <div
        style={{
          position: "relative",
          background: `rgba(255, 255, 255, 0.85)`,
          backdropFilter: "blur(8px)",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${COLORS.light.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          width: "90%",
          height: "80%",
          overflow: "hidden",
        }}
      >
        {/* Logo/Brand section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            textAlign: "center",
            gap: "24px",
          }}
        >
          {/* Site title */}
          <h1
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: COLORS.light.text,
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            {SITE.title}
          </h1>

          {/* Decorative line */}
          <div
            style={{
              width: "120px",
              height: "4px",
              background: accent,
              borderRadius: "2px",
              margin: "0 auto",
            }}
          />

          {/* Site description */}
          <p
            style={{
              fontSize: 28,
              color: COLORS.light.text,
              opacity: 0.9,
              maxWidth: "80%",
              margin: "16px auto 0",
              lineHeight: 1.4,
            }}
          >
            {SITE.desc}
          </p>
        </div>

        {/* Footer with website URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            borderTop: `1px solid ${COLORS.light.border}`,
            paddingTop: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* Website icon */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {new URL(SITE.website).hostname.charAt(0).toUpperCase()}
            </div>

            {/* Website URL */}
            <span
              style={{
                fontSize: 20,
                fontWeight: "medium",
                color: accent,
              }}
            >
              {new URL(SITE.website).hostname}
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width,
      height,
      embedFont: true,
      fonts: await (async () => {
        try {
          return (await loadGoogleFonts(
            SITE.title + SITE.desc + SITE.website
          )) as FontOptions[];
        } catch (error) {
          // Fallback to system fonts if Google Fonts fail
          // Create an empty ArrayBuffer as fallback font data
          return [
            {
              name: "Arial",
              data: new ArrayBuffer(0),
              weight: 400,
              style: "normal",
            },
          ] as FontOptions[];
        }
      })(),
    }
  );
};
