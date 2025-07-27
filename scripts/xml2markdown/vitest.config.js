import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/[.]**",
        "node_modules/**",
        "**/*.d.ts",
        "test.xml",
        "index.js",
        "CACHE_IMPLEMENTATION.md",
        "README.md",
        "**/*.test.js",
        "**/*.spec.js",
      ],
      include: ["src/**/*.js", "src/**/*.ts"],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@test-utils": resolve(__dirname, "test-utils"),
    },
  },
});
