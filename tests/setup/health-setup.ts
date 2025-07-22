// Health test setup
import { vi } from 'vitest';

// Mock environment variables for health tests
vi.mock('astro/env', () => ({
  NODE_ENV: 'test',
  DEV: false,
  PROD: false
}));

// Mock console for health tests to capture output
const originalConsole = console;
beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
});