import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import compress from "@playform/compress";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import robotsTxt from "astro-robots-txt";
// import AstroPWA from "@vite-pwa/astro";
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
    format: "directory",
    inlineStylesheets: "auto",
  },
  // Compression
  compressHTML: true,
  // Prefetch configuration for faster page transitions
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  // Optimize script loading
  scopedStyleStrategy: "where",
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
        // Only include actually used icons (verified via codebase search)
        tabler: [
          "alert-circle",
          "alert-triangle",
          "apple",
          "archive",
          "armchair",
          "arrow-right",
          "arrows-right-left",
          "article",
          "bell",
          "book",
          "book-2",
          "bookmark",
          "brain",
          "brand-facebook",
          "brand-github",
          "brand-instagram",
          "brand-linkedin",
          "brand-pinterest",
          "brand-tailwind",
          "brand-telegram",
          "brand-whatsapp",
          "brand-x",
          "brand-youtube",
          "bulb",
          "calendar",
          "check",
          "chevron-down",
          "chevron-left",
          "chevron-right",
          "chevron-up",
          "circle-check",
          "clock",
          "cloud",
          "components",
          "download",
          "edit",
          "external-link",
          "eye",
          "face-id-error",
          "file-text",
          "filter",
          "filter-off",
          "flask",
          "folder",
          "hash",
          "heart",
          "heartbeat",
          "home",
          "info-circle",
          "link",
          "list-check",
          "loader",
          "loader-2",
          "mail",
          "menu",
          "microscope",
          "minus",
          "moon",
          "pill",
          "plus",
          "question-mark",
          "refresh",
          "rocket",
          "rss",
          "salad",
          "search",
          "search-off",
          "settings",
          "share",
          "shield",
          "shield-check",
          "shield-star",
          "star",
          "star-off",
          "sun",
          "tags",
          "thumb-down",
          "thumb-up",
          "user",
          "vitamins",
          "wifi-off",
          "x",
        ],
      },
    }),
    compress({
      CSS: true,
      HTML: {
        "html-minifier-terser": {
          removeAttributeQuotes: false,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          keepClosingSlash: true,
        },
      },
      Image: false, // Astro's built-in image optimization handles this
      JavaScript: true,
      SVG: true,
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
          manualChunks: id => {
            // Core framework
            if (id.includes("node_modules/astro")) {
              return "vendor-astro";
            }
            // UI libraries
            if (id.includes("@astrojs/mdx") || id.includes("astro-icon")) {
              return "vendor-ui";
            }
            // Utilities
            if (
              id.includes("lodash.kebabcase") ||
              id.includes("slugify") ||
              id.includes("dayjs")
            ) {
              return "vendor-utils";
            }
            // Content processing
            if (
              id.includes("remark-") ||
              id.includes("rehype-") ||
              id.includes("mdast-") ||
              id.includes("hast-")
            ) {
              return "vendor-markdown";
            }
            // All other node_modules
            if (id.includes("node_modules")) {
              return "vendor-other";
            }
            return undefined;
          },
          // Optimize output filenames for better caching
          entryFileNames: "chunks/[name].[hash].js",
          chunkFileNames: "chunks/[name].[hash].js",
          assetFileNames: "assets/[name].[hash][extname]",
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
      // Enable minification with optimizations
      minify: "esbuild",
      // Enable tree shaking
      target: "es2022",
      // Additional optimizations
      reportCompressedSize: false, // Faster builds
      sourcemap: false, // Smaller output in production
    },
    // Performance optimizations
    server: {
      warmup: {
        clientFiles: [
          "./src/components/**/*.astro",
          "./src/layouts/**/*.astro",
          "./src/pages/**/*.astro",
        ],
      },
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
      640, // Mobile
      768, // Tablet
      1024, // Desktop
      1280, // Large desktop
      1920, // Full HD
      2560, // 2K/4K
    ],
  },
  experimental: {
    // Fonts are now handled via custom @font-face declarations in src/styles/fonts.css
    // This allows us to use font-display: swap for better FCP performance
    // fonts: [], // Disabled in favor of custom font loading
    preserveScriptOrder: true,
  },
});
