// Component test setup
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables for component tests
vi.mock('astro/env', () => ({
  NODE_ENV: 'test',
  DEV: false,
  PROD: false
}));

// Global setup for component tests
beforeEach(() => {
  // Clean up DOM after each test
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});