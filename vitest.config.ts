import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment for DOM testing - using happy-dom for better performance
    environment: 'happy-dom',
    
    // Enable global test APIs (describe, it, expect)
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/vitest-setup.ts'],
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/',
      'dist/',
      '.astro/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.*'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/types/',
        'src/**/*.astro', // Exclude Astro files from coverage
        'scripts/',
        'public/',
        '.astro/'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Reporter configuration
    reporter: ['verbose', 'html'],
    
    // Pool options for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  },
  
  // Path resolution to match existing project structure
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // Define global variables for test environment
  define: {
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false'
  }
});