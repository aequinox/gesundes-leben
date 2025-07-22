// Integration test setup
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables for integration tests
vi.mock('astro/env', () => ({
  NODE_ENV: 'test',
  DEV: false,
  PROD: false
}));

// Global setup for integration tests
beforeEach(() => {
  // Clean up DOM after each test
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});