import { defineConfig } from "astro/config";

// Core integrations
import mdx from "@astrojs/mdx"; // Enables MDX support
import sitemap from "@astrojs/sitemap"; // Generates XML sitemap
import tailwind from "@astrojs/tailwind"; // Adds Tailwind CSS support
import icon from "astro-icon"; // Icon management
import react from "@astrojs/react"; // React component support
import pagefind from "astro-pagefind"; // Static search functionality

// Project configuration and plugins
import { SITE } from "./src/config";
import { remarkPlugins } from "./src/utils/remarkPlugins";

// Uncomment to enable table of contents generation
// import remarkToc from "remark-toc";

// Uncomment to enable rehype plugins for HTML transformation
// import { rehypePlugins } from "./src/utils/rehypePlugins";

/**
 * Astro Configuration
 * @see https://docs.astro.build/en/reference/configuration-reference/
 */
export default defineConfig({
  // Site URL for sitemap and canonical URLs
  site: SITE.website,

  // Markdown/MDX configuration
  markdown: {
    remarkPlugins: remarkPlugins,
    // Uncomment to add reading time estimation
    // remarkPlugins: [remarkReadingTime],

    // Uncomment to enable rehype plugins for HTML transformation
    // rehypePlugins: rehypePlugins,

    // Uncomment to customize syntax highlighting
    // shikiConfig: {
    //   themes: {
    //     light: "min-light",
    //     dark: "night-owl",
    //   },
    //   wrap: true, // Enables word wrap in code blocks
    // },
  },

  // Integrated tools and frameworks
  integrations: [
    // Tailwind CSS configuration
    tailwind({
      applyBaseStyles: false, // Disable default styles for custom configuration
    }),

    // MDX support (uncomment remarkToc for table of contents)
    mdx(/*{ remarkPlugins: [remarkToc],}*/),

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
  ],

  // Vite configuration
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"], // Exclude specific dependencies from optimization
      include: ["react-compiler-runtime"], // Include react-compiler-runtime for optimization
    },
  },

  // CSS scoping strategy
  scopedStyleStrategy: "where", // Uses :where() for more flexible CSS specificity
});
