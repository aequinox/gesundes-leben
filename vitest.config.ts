import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable experimental Astro Container API
    // container: true,
    // Set the test environment (e.g., jsdom, node)
    environment: 'node',
    // Specify the test files pattern
    // files: ['**/*.test.ts'],
    // Exclude files or directories from testing
    exclude: ['node_modules/**/*'],
  },
});
