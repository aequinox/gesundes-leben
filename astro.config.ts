import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import robotsTxt from "astro-robots-txt";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";

import { SITE } from "./src/config";
import {
  getRobotPolicies,
  getSitemapConfig,
  seoConfig,
} from "./src/config/seo";
import { rehypePlugins } from "./src/plugins/rehypePlugins";
import { remarkPlugins } from "./src/plugins/remarkPlugins";
import { visualizer } from "rollup-plugin-visualizer";

// import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  // Output optimizations
  output: "static",
  trailingSlash: "always",
  // Build optimizations
  build: {
    format: "file",
    inlineStylesheets: "auto",
  },
  // Compression
  compressHTML: true,
  integrations: [
    robotsTxt({
      sitemap: seoConfig.sitemap.baseUrls,
      policy: getRobotPolicies(),
    }),
    sitemap({
      ...getSitemapConfig(),
      filter: page => {
        // Combine existing filter with new SEO config
        const showArchives = SITE.showArchives || !page.endsWith("/archives");
        return showArchives && getSitemapConfig().filter(page);
      },
    }),
    pagefind(),
    mdx(),
    icon({
      svgoOptions: {
        multipass: true,
      },
      include: {
        // Tabler icons collection
        tabler: ["*"],
      },
    }),
    // AstroPWA({
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.svg", "fonts/*.woff2"],
    //   workbox: {
    //     globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
    //     navigateFallback: "/404",
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "google-fonts-cache",
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200],
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "gstatic-fonts-cache",
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200],
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "image-cache",
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    //           },
    //         },
    //       },
    //     ],
    //   },
    //   manifest: {
    //     name: "Gesundes Leben - Gesundheit, Ernährung & Wellness",
    //     short_name: "Gesundes Leben",
    //     description:
    //       "Dein vertrauenswürdiger Ratgeber für Gesundheit, Ernährung und Wellness",
    //     theme_color: "#10b981",
    //     background_color: "#ffffff",
    //     display: "standalone",
    //     scope: "/",
    //     start_url: "/",
    //     orientation: "portrait-primary",
    //     icons: [
    //       {
    //         src: "/pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    // }),
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
    plugins: [
      tailwindcss(),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html",
      }),
    ],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    build: {
      rollupOptions: {
        output: {
          // Separate vendor chunks for better caching
          manualChunks: {
            vendor: ["astro"],
            utils: ["lodash.kebabcase", "slugify", "dayjs"],
            ui: ["@astrojs/mdx", "astro-icon"],
          },
        },
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable module preload polyfill for better loading
      modulePreload: {
        polyfill: true,
      },
      // Enable minification
      minify: "esbuild",
      // Enable tree shaking
      target: "es2022",
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
        variants: [
          {
            src: [
              "./src/assets/fonts/Poppins-400.woff2",
              "./src/assets/fonts/Poppins-400.woff",
            ],
            weight: "400",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/Poppins-600.woff2",
              "./src/assets/fonts/Poppins-600.woff",
            ],
            weight: "600",
            style: "normal",
          },
          {
            src: [
              "./src/assets/fonts/Poppins-800.woff2",
              "./src/assets/fonts/Poppins-800.woff",
            ],
            weight: "800",
            style: "normal",
          },
        ],
      },
    ],
    preserveScriptOrder: true,
  },
});
