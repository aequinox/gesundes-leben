import { SITE } from "./src/config";
import { rehypePlugins } from "./src/plugins/rehypePlugins";
import { remarkPlugins } from "./src/plugins/remarkPlugins";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";

// import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
    pagefind(),
    mdx(),
    icon({
      include: {
        // Tabler icons collection
        tabler: ["*"],
      },
    }),
  ],
  markdown: {
    remarkPlugins,
    rehypePlugins,
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    // Set the endpoint to use for image optimization in dev and SSR.
    // The entrypoint property can be set to undefined to use the
    // default image endpoint.
    endpoint: { route: "/_image", entrypoint: undefined },
    // Set which image service is used for Astro’s assets support.
    // The value should be an object with an entrypoint for the image
    // service to use and optionally, a config object to pass to the service.
    // The service entrypoint can be either one of the included services,
    // or a third-party package.
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: { format: "webp" },
    },
    // The default layout type for responsive images.
    // Can be overridden by the layout prop on the image component.
    //  - constrained - The image will scale to fit the container,
    //    maintaining its aspect ratio, but will not exceed the
    //    specified dimensions.
    //  - fixed - The image will maintain its original dimensions.
    //  - full-width - The image will scale to fit the container,
    //    maintaining its aspect ratio.
    layout: "constrained",
    // The object-fit CSS property value for responsive images.
    // Can be overridden by the fit prop on the image component.
    // Requires a value for layout to be set.
    objectFit: "cover",
    // The default object-position CSS property value for
    // responsive images. Can be overridden by the position prop
    // on the image component. Requires a value for layout to be set.
    objectPosition: "center",
    breakpoints: [
      640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480,
      5120, 6016,
    ],
  },
  experimental: {
    fonts: [
      // {
      //   name: "Roboto",
      //   provider: fontProviders.bunny(),
      //   cssVariable: "--font-roboto",
      //   weights: [400, 900],
      //   styles: ["normal"],
      //   subsets: ["latin"],
      //   fallbacks: ["sans-serif"],
      // },
      {
        name: "Poppins",
        provider: "local",
        cssVariable: "--font-body",
        // Weight and style are not specified so Astro
        // will try to infer them for each variant
        variants: [
          {
            src: [
              "./src/assets/fonts/Poppins-400.woff2",
              "./src/assets/fonts/Poppins-400.woff",
            ],
          },
          {
            src: [
              "./src/assets/fonts/Poppins-600.woff2",
              "./src/assets/fonts/Poppins-600.woff",
            ],
          },
          {
            src: [
              "./src/assets/fonts/Poppins-800.woff2",
              "./src/assets/fonts/Poppins-800.woff",
            ],
          },
        ],
      },
    ],
    preserveScriptOrder: true,
  },
});
