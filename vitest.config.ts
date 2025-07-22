import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

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
    
    projects: [
      // Unit Tests - Node.js environment for utilities
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'src/utils/**/*.test.{js,ts}',
            'src/utils/__tests__/**/*.test.{js,ts}'
          ],
          exclude: [
            'src/utils/**/*.integration.test.{js,ts}',
            'src/utils/**/*.component.test.{js,ts}',
            'src/utils/**/*.health.test.{js,ts}'
          ],
          setupFiles: ['./tests/setup/unit-setup.ts']
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
            '@/config': resolve(__dirname, 'src/config.ts'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/data': resolve(__dirname, 'src/data'),
            '@tests': resolve(__dirname, 'tests')
          }
        }
      },

      // Integration Tests - Happy DOM environment for component integration
      {
        test: {
          name: 'integration',
          environment: 'happy-dom',
          include: [
            'src/**/*.integration.test.{js,ts}',
            'tests/integration/**/*.test.{js,ts}'
          ],
          setupFiles: ['./tests/setup/integration-setup.ts']
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
            '@/config': resolve(__dirname, 'src/config.ts'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/data': resolve(__dirname, 'src/data'),
            '@tests': resolve(__dirname, 'tests')
          }
        }
      },

      // Component Tests - Happy DOM environment for UI components
      {
        test: {
          name: 'component',
          environment: 'happy-dom',
          include: [
            'src/**/*.component.test.{js,ts}',
            'tests/components/**/*.test.{js,ts}'
          ],
          setupFiles: ['./tests/setup/component-setup.ts']
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
            '@/config': resolve(__dirname, 'src/config.ts'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/data': resolve(__dirname, 'src/data'),
            '@tests': resolve(__dirname, 'tests')
          }
        }
      },

      // Health Tests - Node environment for system health checks
      {
        test: {
          name: 'health',
          environment: 'node',
          include: [
            'src/**/*.health.test.{js,ts}',
            'tests/health/**/*.test.{js,ts}'
          ],
          setupFiles: ['./tests/setup/health-setup.ts']
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
            '@/config': resolve(__dirname, 'src/config.ts'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/data': resolve(__dirname, 'src/data'),
            '@tests': resolve(__dirname, 'tests')
          }
        }
      },

      // Default - All other tests (backward compatibility)
      {
        test: {
          name: 'default',
          environment: 'happy-dom',
          include: [
            'tests/basic.test.ts',
            'src/**/*.test.{js,ts}',
            'tests/**/*.test.{js,ts}'
          ],
          exclude: [
            'src/utils/**/*.test.{js,ts}',
            'src/utils/__tests__/**/*.test.{js,ts}',
            'src/**/*.integration.test.{js,ts}',
            'src/**/*.component.test.{js,ts}',
            'src/**/*.health.test.{js,ts}'
          ]
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src'),
            '@/config': resolve(__dirname, 'src/config.ts'),
            '@/utils': resolve(__dirname, 'src/utils'),
            '@/types': resolve(__dirname, 'src/types'),
            '@/data': resolve(__dirname, 'src/data'),
            '@tests': resolve(__dirname, 'tests')
          }
        }
      }
    ]
  },

  define: {
    'import.meta.env.DEV': 'true',
    'import.meta.env.PROD': 'false'
  }
});