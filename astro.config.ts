import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import react from "@astrojs/react";
// import remarkToc from "remark-toc";

import { SITE } from "./src/config";
import { remarkPlugins } from "./src/utils/remarkPlugins";
import pagefind from "astro-pagefind";
// import { rehypePlugins } from "./src/utils/rehypePlugins";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  markdown: {
    // remarkPlugins: [remarkReadingTime],
    remarkPlugins: remarkPlugins,
    // rehypePlugins: rehypePlugins,
    // shikiConfig: {
    //   // For more themes, visit https://shiki.style/themes
    //   themes: {
    //     light: "min-light",
    //     dark: "night-owl",
    //   },
    //   wrap: true,
    // },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(/*{ remarkPlugins: [remarkToc],}*/),
    sitemap(),
    icon({
      include: {
        tabler: ["*"],
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
    react(),
    pagefind(),
  ],

  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
