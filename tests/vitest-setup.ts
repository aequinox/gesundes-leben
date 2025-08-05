/* eslint-disable import/exports-last */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Import health matchers for all tests
import './matchers/health-matchers';

// =============================================================================
// Global Test Environment Setup for Healthy Life Blog
// =============================================================================

// Global mocks for Web APIs
global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => [])
}));

global.ResizeObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => [])
}));

// Mock matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo for smooth scrolling tests
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn()
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16) as unknown as number);
global.cancelAnimationFrame = vi.fn();

// Performance API mock for health blog performance testing
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

// Mock URL constructor for health blog routing tests  
const OriginalURL = globalThis.URL;
global.URL = class URL extends OriginalURL {
  constructor(url: string, base?: string) {
    super(url, base);
  }
} as unknown as typeof URL;

// Mock history API for navigation testing
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: null
  }
});

// Mock localStorage for health blog preferences
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock fetch for API testing
global.fetch = vi.fn();

// Astro content collection mocks for health blog
vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockResolvedValue([]),
  getEntry: vi.fn().mockResolvedValue(null),
  render: vi.fn().mockResolvedValue({
    Content: () => null,
    remarkPluginFrontmatter: {}
  })
}));

// Mock Astro globals
vi.mock('astro:assets', () => ({
  Image: vi.fn(),
  Picture: vi.fn(),
  getImage: vi.fn()
}));

// Health blog specific mocks
vi.mock('@/config', () => ({
  SITE: {
    title: 'Healthy Life Test',
    desc: 'Test description',
    author: 'Test Author',
    website: 'https://test.example.com',
    scheduledPostMargin: 0
  },
  LOCALE: {
    lang: 'de',
    langTag: ['de-DE']
  }
}));

// Mock i18n utilities for German language support
vi.mock('@/i18n/utils', () => ({
  getLangFromUrl: vi.fn(() => 'de'),
  useTranslations: vi.fn(() => (key: string) => key)
}));

// =============================================================================
// Custom Test Utilities for Health Blog
// =============================================================================

/**
 * Helper to create mock health blog posts
 */
export const createMockPost = (overrides = {}) => ({
  id: 'test-post',
  slug: 'test-post',
  body: 'Test content',
  collection: 'blog',
  data: {
    title: 'Test Health Post',
    author: 'test-author',
    pubDatetime: new Date('2024-01-01'),
    categories: ['Ernährung'],
    tags: ['test', 'health'],
    featured: false,
    draft: false,
    heroImage: {
      src: '/test-image.jpg',
      alt: 'Test image'
    },
    ...overrides
  }
});

/**
 * Helper to create mock author data
 */
export const createMockAuthor = (overrides = {}) => ({
  id: 'test-author',
  slug: 'test-author',
  collection: 'authors',
  data: {
    name: 'Test Author',
    email: 'test@example.com',
    bio: 'Test bio',
    ...overrides
  }
});

/**
 * Helper to create mock German content for language testing
 */
export const createMockGermanContent = () => ({
  title: 'Gesunde Ernährung',
  content: 'Dies ist ein Test für deutsche Inhalte mit Umlauten: äöüß',
  tags: ['Ernährung', 'Gesundheit', 'Lifestyle']
});

// =============================================================================
// Test Environment Configuration
// =============================================================================

// Set test-specific environment variables
process.env.NODE_ENV = 'test';

// Configure console for test environment
 
const originalConsoleError = console.error;
 
console.error = (...args) => {
  // Suppress specific warnings that are expected in tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render') ||
     message.includes('Warning: render') ||
     message.includes('act()'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// =============================================================================
// Cleanup and Setup Hooks
// =============================================================================

// Global test setup
beforeAll(() => {
  // Any global setup that needs to run once before all tests
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset window location
  delete (window as unknown as { location?: Location }).location;
  (window as any).location = {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  } as unknown as Location;
});

// Global test cleanup
afterAll(() => {
  // Any global cleanup that needs to run once after all tests
  vi.restoreAllMocks();
});