import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/vitest-setup.ts'],
    
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
            'src/utils/__tests__/**/*.test.{js,ts}'
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