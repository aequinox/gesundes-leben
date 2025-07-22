/**
 * @file integration-setup.ts
 * @description Integration test environment setup for Healthy Life Blog
 * 
 * This setup file configures the environment for integration tests that involve
 * real module interactions, API calls, and cross-component functionality.
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// =============================================================================
// Integration Test Environment Configuration
// =============================================================================

// Extended timeout for integration tests
const INTEGRATION_TIMEOUT = 15000;

// Configure longer timeouts for integration tests
beforeAll(() => {
  // Set up integration-specific configurations
  vi.setConfig({
    testTimeout: INTEGRATION_TIMEOUT,
    hookTimeout: 10000
  });
}, INTEGRATION_TIMEOUT);

// =============================================================================
// Database and File System Mocks for Integration Tests
// =============================================================================

// Mock file system operations for Astro content collections
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal();
  const typedActual = actual as any;
  return {
    ...typedActual,
    readFileSync: vi.fn().mockImplementation((path: string) => {
      // Mock reading of markdown files for integration tests
      if (path.includes('.mdx') || path.includes('.md')) {
        return `---
title: Test Content
author: test-author
pubDatetime: 2024-01-01
draft: false
---

# Test Content
This is integration test content.`;
      }
      return actual.readFileSync(path);
    }),
    existsSync: vi.fn().mockReturnValue(true)
  };
});

// =============================================================================
// Network and API Mocks for Integration Tests
// =============================================================================

// Mock fetch for external API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  // Reset fetch mock before each integration test
  mockFetch.mockReset();
  
  // Default successful response for health-related API calls
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      status: 'success',
      data: {
        healthData: 'mocked for integration tests'
      }
    }),
    text: () => Promise.resolve('Integration test response'),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });
});

// =============================================================================
// Health Blog Specific Integration Utilities
// =============================================================================

/**
 * Integration test utilities for health blog functionality
 */
export const integrationTestHelpers = {
  /**
   * Mock a complete blog post for integration testing
   */
  createMockBlogPost: (overrides: Partial<any> = {}) => ({
    id: 'integration-test-post',
    slug: 'integration-test-post',
    collection: 'blog',
    data: {
      title: 'Integration Test: Gesunde Ernährung',
      author: 'integration-test-author',
      pubDatetime: new Date('2024-01-01'),
      modDatetime: undefined,
      featured: false,
      draft: false,
      tags: ['Ernährung', 'Integration', 'Test'],
      categories: ['Ernährung'],
      description: 'Integration test post for health blog functionality',
      heroImage: {
        src: '/test-images/integration-test.jpg',
        alt: 'Integration Test Image'
      },
      keywords: ['integration', 'test', 'gesundheit'],
      group: 'pro',
      references: ['integration-test-ref'],
      ...overrides
    },
    body: `
# Integration Test Post

This is a test post for integration testing of health blog functionality.

## Health Information
- **Topic**: Nutrition Testing
- **Language**: German
- **Accuracy**: Validated for testing

## Content Features
- References to scientific studies
- German health terminology
- Structured health information
    `,
    render: vi.fn().mockResolvedValue({
      Content: () => '<div>Mocked rendered content</div>',
      remarkPluginFrontmatter: {
        readingTime: '5 min read'
      }
    })
  }),

  /**
   * Mock health blog author for integration tests
   */
  createMockAuthor: (overrides: Partial<any> = {}) => ({
    id: 'integration-test-author',
    collection: 'authors',
    data: {
      name: 'Dr. Integration Test',
      bio: 'Integration test author for health blog',
      expertise: ['Ernährung', 'Integration Testing'],
      qualifications: ['Dr. med.', 'Ernährungsmedizin'],
      ...overrides
    }
  }),

  /**
   * Mock health reference for integration tests
   */
  createMockReference: (overrides: Partial<any> = {}) => ({
    id: 'integration-test-ref',
    type: 'journal',
    title: 'Integration Testing in Health Blogs',
    authors: ['Test, A.', 'Integration, B.'],
    year: 2024,
    journal: 'Journal of Integration Testing',
    doi: '10.1000/integration.test',
    keywords: ['integration', 'testing', 'health'],
    ...overrides
  }),

  /**
   * Setup integration test environment for health content
   */
  setupHealthContentIntegration: () => {
    // Mock content collections for integration tests
    vi.mock('astro:content', () => ({
      getCollection: vi.fn().mockImplementation((collection: string) => {
        switch (collection) {
          case 'blog':
            return Promise.resolve([integrationTestHelpers.createMockBlogPost()]);
          case 'authors':
            return Promise.resolve([integrationTestHelpers.createMockAuthor()]);
          case 'references':
            return Promise.resolve([integrationTestHelpers.createMockReference()]);
          default:
            return Promise.resolve([]);
        }
      }),
      getEntry: vi.fn().mockImplementation((collection: string, id: string) => {
        switch (collection) {
          case 'blog':
            return Promise.resolve(integrationTestHelpers.createMockBlogPost({ id }));
          case 'authors':
            return Promise.resolve(integrationTestHelpers.createMockAuthor({ id }));
          default:
            return Promise.resolve(null);
        }
      })
    }));
  }
};

// =============================================================================
// Integration Test Cleanup
// =============================================================================

afterEach(() => {
  // Clear all mocks after each integration test
  vi.clearAllMocks();
});

afterAll(() => {
  // Restore all mocks after integration tests complete
  vi.restoreAllMocks();
});