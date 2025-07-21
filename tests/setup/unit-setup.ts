/**
 * @file unit-setup.ts
 * @description Unit test environment setup for Node.js environment
 * 
 * This setup file configures the Node.js environment for fast, isolated unit tests
 * without DOM dependencies. Optimized for testing pure functions and utilities.
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// =============================================================================
// Node.js Environment Configuration for Unit Tests
// =============================================================================

beforeAll(() => {
  // Configure Node.js environment for unit testing
  process.env.NODE_ENV = 'test';
  
  // Mock common Node.js globals that might be used in utilities
  global.performance = global.performance || {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  };
});

// =============================================================================
// Mock Web APIs for Unit Tests (without DOM)
// =============================================================================

// Mock fetch for unit tests that might use it
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers()
  })
);

// Mock URL for unit tests
global.URL = class MockURL {
  constructor(public href: string, base?: string) {
    if (base) {
      this.href = new URL(href, base).href;
    }
  }
  
  get origin() { return this.href.split('/').slice(0, 3).join('/'); }
  get pathname() { return this.href.split('/').slice(3).join('/').split('?')[0] || '/'; }
  get search() { 
    const parts = this.href.split('?');
    return parts.length > 1 ? '?' + parts[1].split('#')[0] : '';
  }
  get hash() {
    const parts = this.href.split('#');
    return parts.length > 1 ? '#' + parts[1] : '';
  }
} as any;

// Mock Headers for unit tests
global.Headers = class MockHeaders {
  private headers = new Map<string, string>();
  
  constructor(init?: Record<string, string>) {
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }
  
  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }
  
  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }
  
  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }
} as any;

// =============================================================================
// Health Blog Specific Unit Test Utilities
// =============================================================================

/**
 * Unit test utilities for health blog functionality (Node.js environment)
 */
export const unitTestHelpers = {
  /**
   * Create mock health data for unit testing
   */
  createMockHealthData: (type: 'nutrition' | 'reference' | 'content' = 'nutrition') => {
    const mockData = {
      nutrition: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 67,
        fiber: 25,
        source: 'Unit Test Data'
      },
      reference: {
        id: 'unit-test-ref',
        type: 'journal',
        title: 'Unit Test Reference',
        authors: ['Test, U.', 'Unit, T.'],
        year: 2024,
        doi: '10.1000/unit.test',
        credible: true
      },
      content: {
        title: 'Unit Test Content',
        content: 'This is unit test content for health blog testing.',
        language: 'de-DE',
        healthTopic: 'Ernährung',
        validated: true
      }
    };
    
    return mockData[type];
  },

  /**
   * Mock German health terminology for unit tests
   */
  mockGermanHealthTerms: {
    'Ernährung': 'nutrition',
    'Gesundheit': 'health',
    'Vitamin': 'vitamin',
    'Mineralstoffe': 'minerals',
    'Ballaststoffe': 'fiber',
    'Antioxidantien': 'antioxidants'
  },

  /**
   * Validate health calculation accuracy for unit tests
   */
  validateHealthCalculation: (
    input: Record<string, number>,
    expected: Record<string, number>,
    tolerance: number = 0.1
  ): boolean => {
    return Object.entries(expected).every(([key, expectedValue]) => {
      const actualValue = input[key];
      if (actualValue === undefined) return false;
      
      const difference = Math.abs(actualValue - expectedValue);
      const percentDifference = difference / expectedValue;
      
      return percentDifference <= tolerance;
    });
  },

  /**
   * Mock scientific reference validation for unit tests
   */
  validateReference: (reference: any): { valid: boolean; score: number } => {
    let score = 1.0;
    
    if (!reference.doi && !reference.url) score -= 0.3;
    if (!reference.authors || reference.authors.length === 0) score -= 0.3;
    if (!reference.year || reference.year < 2000) score -= 0.2;
    if (!reference.title) score -= 0.2;
    
    return {
      valid: score >= 0.7,
      score: Math.max(0, score)
    };
  }
};

// =============================================================================
// Configuration Mocks for Unit Tests
// =============================================================================

// Mock Astro configuration for unit tests
vi.mock('@/config', () => {
  const config = {
    SITE: {
      title: 'Unit Test Health Blog',
      desc: 'Health blog for unit testing',
      author: 'Unit Test Author',
      website: 'https://unittest.example.com',
      scheduledPostMargin: 0
    },
    LOCALE: {
      lang: 'de',
      langTag: ['de-DE', 'de']
    }
  };
  return config;
});

// Mock Astro content collections for unit tests
vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockImplementation((collection: string) => {
    const mockCollections: Record<string, any[]> = {
      blog: [unitTestHelpers.createMockHealthData('content')],
      authors: [{ id: 'unit-test-author', name: 'Unit Test Author' }],
      references: [unitTestHelpers.createMockHealthData('reference')]
    };
    
    return Promise.resolve(mockCollections[collection] || []);
  }),
  getEntry: vi.fn().mockImplementation((collection: string, id: string) => {
    return Promise.resolve({
      id,
      collection,
      data: unitTestHelpers.createMockHealthData()
    });
  })
}));

// =============================================================================
// Unit Test Cleanup
// =============================================================================

beforeEach(() => {
  // Clear all mocks before each unit test for isolation
  vi.clearAllMocks();
});

afterEach(() => {
  // Ensure clean state after each unit test
  vi.clearAllTimers();
});

afterAll(() => {
  // Restore all mocks after all unit tests
  vi.restoreAllMocks();
});