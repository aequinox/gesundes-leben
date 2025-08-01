import { defineConfig } from 'vitest/config';
import path from 'path';

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
    environment: 'happy-dom'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/config': path.resolve(__dirname, './src/config.ts'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@tests': path.resolve(__dirname, './tests')
    }
  },

  define: {
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false',
    'import.meta.env.MODE': '"test"'
  },

  // Handle Astro's virtual modules
  plugins: [
    {
      name: 'astro-content-mock',
      resolveId(id) {
        if (id === 'astro:content') {
          return id;
        }
        return null;
      },
      load(id) {
        if (id === 'astro:content') {
          return `
            export const getCollection = () => Promise.resolve([]);
            export const getEntry = () => Promise.resolve(null);
            export const render = () => Promise.resolve({ Content: () => null, remarkPluginFrontmatter: {} });
          `;
        }
        return null;
      },
    },
  ]
});