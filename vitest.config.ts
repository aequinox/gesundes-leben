import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/node_modules/**',
        '**/.{cache,git,hg,svn,tsbuildinfo,eslintcache}/**',
        'public/**',
        'scripts/**',
        'tests/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    include: [
      'src/**/*.test.{js,ts}',
      'tests/**/*.test.{js,ts}'
    ],
    environment: 'happy-dom',
    
    resolve: {
      alias: {
        '@': './src',
        '@/config': './src/config.ts',
        '@/utils': './src/utils',
        '@/types': './src/types',
        '@/data': './src/data',
        '@tests': './tests'
      }
    }
  },

  define: {
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false'
  }
});