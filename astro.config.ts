import { defineConfig } from "astro/config";
import type { AstroUserConfig } from "astro";

// Core integrations
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import react from "@astrojs/react";
import pagefind from "astro-pagefind";

// Project configuration
import { SITE } from "./src/config";
import { remarkPlugins } from "./src/utils/remarkPlugins";
import { rehypePlugins } from "./src/utils/rehypePlugins";

/**
 * Markdown/MDX Configuration
 * Defines how markdown content is processed
 */
const markdownConfig: AstroUserConfig["markdown"] = {
  remarkPlugins,
  rehypePlugins,
  shikiConfig: {
    themes: {
      light: "min-light",
      dark: "night-owl",
    },
    wrap: true, // Enables word wrap in code blocks
  },
};

/**
 * Integrations Configuration
 * Setup for all Astro integrations
 */
const integrationsConfig: NonNullable<AstroUserConfig["integrations"]> = [
  // Tailwind CSS configuration
  tailwind({
    applyBaseStyles: false, // Disable default styles for custom configuration
  }),

  // MDX support
  mdx(),

  // XML sitemap generation
  sitemap(),

  // Icon system configuration
  icon({
    include: {
      // Tabler icons collection
      tabler: ["*"], // Include all Tabler icons

      // Flat color icons selection
      "flat-color-icons": [
        "template",
        "gallery",
        "approval",
        "document",
        "advertising",
        "currency-exchange",
        "voice-presentation",
        "business-contact",
        "database",
      ],
    },
  }),

  // React components support
  react(),

  // Static search functionality
  pagefind(),
];

/**
 * Vite Configuration
 * Customizes the underlying Vite bundler
 */
const viteConfig: AstroUserConfig["vite"] = {
  optimizeDeps: {
    exclude: ["@resvg/resvg-js"], // Exclude specific dependencies from optimization
    include: ["react-compiler-runtime"], // Include react-compiler-runtime for optimization
  },
};

/**
 * Astro Configuration
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */
export default defineConfig({
  // Site URL for sitemap and canonical URLs
  site: SITE.website,

  // Markdown/MDX configuration
  markdown: markdownConfig,

  // Integrated tools and frameworks
  integrations: integrationsConfig,

  // Vite configuration
  vite: viteConfig,

  // CSS scoping strategy
  scopedStyleStrategy: "where", // Uses :where() for more flexible CSS specificity
});
