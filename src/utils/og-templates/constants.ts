/**
 * @file constants.ts
 * @description Centralized constants for OG image generation
 */

/**
 * Standard OG image dimensions
 */
export const OG_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const;

/**
 * Color palette for OG image templates
 */
export const OG_COLORS = {
  light: {
    background: "#ffffff",
    backgroundGradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    text: "#1a1a1a",
    textSecondary: "#555555",
    accent: "#3b5bdb",
    card: "#ffffff",
    cardMuted: "#f5f5f5",
    border: "#e5e7eb",
    shadow: "rgba(0, 0, 0, 0.08)",
    glassShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    glassBackground: "rgba(255, 255, 255, 0.95)",
  },
  dark: {
    background: "#1c1b22",
    backgroundGradient: "linear-gradient(135deg, #1c1b22 0%, #2d2b37 100%)",
    text: "#f2f2f2",
    textSecondary: "#b0b0b0",
    accent: "#ffa94d",
    card: "#2d2b37",
    cardMuted: "#3d3a4a",
    border: "#4d4a5a",
    shadow: "rgba(0, 0, 0, 0.2)",
  },
  // Site template specific colors
  site: {
    background: "#fefbfb",
    shadowBackground: "#ecebeb",
    border: "#000",
  },
  // Type-specific colors with enhanced vibrance for 2025 design trends
  types: {
    pro: {
      primary: "#4CAF50",
      secondary: "#E8F5E9",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
      text: "#ffffff",
    },
    kontra: {
      primary: "#F44336",
      secondary: "#FFEBEE",
      gradient: "linear-gradient(135deg, #F44336 0%, #C62828 100%)",
      text: "#ffffff",
    },
    fragezeiten: {
      primary: "#FFC107",
      secondary: "#FFF8E1",
      gradient: "linear-gradient(135deg, #FFC107 0%, #FFA000 100%)",
      text: "#ffffff",
    },
  },
} as const;

/**
 * Typography settings for OG images
 */
export const OG_TYPOGRAPHY = {
  fontFamily: "Poppins",
  sizes: {
    title: {
      site: 72,
      post: 52,
    },
    subtitle: 28,
    author: 18,
    authorLabel: 12,
    category: 14,
    badge: 16,
    branding: 20,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

/**
 * Layout and spacing constants
 */
export const OG_LAYOUT = {
  borderRadius: "4px",
  borderWidth: "4px",
  margin: {
    outer: "2rem",
    inner: "20px",
    shadow: "2.5rem",
  },
  padding: {
    card: "48px",
    badge: "8px 16px",
    largeBadge: "12px 24px",
    branding: "12px 24px",
  },
  shadows: {
    card: "0 4px 15px rgba(0, 0, 0, 0.15)",
    branding: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  opacity: {
    shadowLayer: 0.9,
    backgroundBlur: 0.6,
    decorativeHigh: 0.2,
    decorativeLow: 0.1,
  },
} as const;

/**
 * Animation and filter effects
 */
export const OG_EFFECTS = {
  blur: {
    backdrop: "blur(20px)",
    decorative: "blur(15px)",
    decorativeLight: "blur(5px)",
  },
  gradients: {
    decorative: (color: string) =>
      `radial-gradient(circle at 70% 30%, ${color}80 0%, transparent 50%)`,
  },
} as const;
