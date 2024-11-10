import defaultTheme from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";
import { addIconSelectors } from "@iconify/tailwind";

const config: Config = {
  darkMode: ["selector", "[data-theme='dark']"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,svg,ts,tsx,vue}"],
  theme: {
    // fill: {
    //   current: "currentColor",
    //   transparent: "transparent",
    //   skin: {
    //     accent: "oklch(var(--color-accent) / <alpha-value>)",
    //   },
    // },
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px", // Small devices (phones)
      md: "768px", // Medium devices (tablets)
      lg: "1024px", // Large devices (small desktops)
      xl: "1280px", // Extra Large devices (desktops)
      "2xl": "1440px", // Extra Extra Large devices (large desktops)
      "3xl": "1600px", // 3XL devices
      "4xl": "1920px", // 4K devices
      "5xl": "2160px", // Ultra-wide devices
      "6xl": "2560px", // Maximum resolution for this config
    },
    extend: {
      // keyframes: {
      //   jump: {
      //     "0%, 100%": { transform: "translate-y-0" },
      //     "50%": { transform: "translate-y-6" },
      //   },
      // },
      // animation: {
      //   // Bounces 5 times 1s equals 5 seconds
      //   "bounce-short": "bounce 1s ease-in-out 5",
      //   jump: "jump 1s ease-in-out 6",
      // },
      colors: {
        pro: "oklch(var(--color-pro) / <alpha-value>)",
        contra: "oklch(var(--color-contra) / <alpha-value>)",
        "question-time": "oklch(var(--color-question-time) / <alpha-value>)",
        skin: {
          base: "oklch(var(--color-fill) / <alpha-value>)",
          muted: "oklch(var(--color-muted) / <alpha-value>)",
          fill: "oklch(var(--color-fill) / <alpha-value>)",
          accent: "oklch(var(--color-accent) / <alpha-value>)",
          inverted: "oklch(var(--color-text-base) / <alpha-value>)",
          card: "oklch(var(--color-card) / <alpha-value>)",
          "card-muted": "oklch(var(--color-card-muted) / <alpha-value>)",
        },
        primary: "oklch(var(--color-accent) / <alpha-value>)",
        secondary: "oklch(var(--color-text-base) / <alpha-value>)",
        tertiary: "oklch(var(--color-card-muted) / <alpha-value>)",
      },
      textColor: {
        skin: {
          base: "oklch(var(--color-text-base) / <alpha-value>)",
          muted: "oklch(var(--color-muted) / <alpha-value>)",
          accent: "oklch(var(--color-accent) / <alpha-value>)",
          inverted: "oklch(var(--color-fill) / <alpha-value>)",
        },
      },
      backgroundColor: {
        skin: {
          fill: "oklch(var(--color-fill) / <alpha-value>)",
          accent: "oklch(var(--color-accent) / <alpha-value>)",
          inverted: "oklch(var(--color-text-base) / <alpha-value>)",
          card: "oklch(var(--color-card) / <alpha-value>)",
          "card-muted": "oklch(var(--color-card-muted) / <alpha-value>)",
        },
      },
      outlineColor: {
        skin: {
          fill: "oklch(var(--color-accent) / <alpha-value>)",
        },
      },
      borderColor: {
        skin: {
          line: "oklch(var(--color-border) / <alpha-value>)",
          fill: "oklch(var(--color-text-base) / <alpha-value>)",
          accent: "oklch(var(--color-accent) / <alpha-value>)",
        },
      },
      fill: {
        skin: {
          base: "oklch(var(--color-text-base) / <alpha-value>)",
          accent: "oklch(var(--color-accent) / <alpha-value>)",
        },
        transparent: "transparent",
      },
      fontFamily: {
        sans: ["Montserrat Variable", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", "monospace", ...defaultTheme.fontFamily.mono],
      },
      lineHeight: {
        tight: "1.25",
        tighter: "0.75",
      },
      // listStyleImage: {
      //   checkmark: "url('/assets/check.svg')",
      // },
      maxWidth: {
        // 'content': '64rem', // max-w-5xl	max-width: 64rem; /* 1024px */
        // 'content': '72rem', // max-w-6xl	max-width: 72rem; /* 1152px */
        content: "200ch", // max-w-7xl	max-width: 80rem; /* 1280px */
      },
      transitionTimingFunction: {
        "in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              color: false,
            },
            code: {
              color: false,
            },
          },
          blockquote: {
            quotes: "none",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Iconify plugin, requires writing list of icon sets to load
    addIconSelectors(["tabler"]),
  ],
};

export default config;
