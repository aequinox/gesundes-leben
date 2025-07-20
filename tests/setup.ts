/**
 * @file setup.ts
 * @description Global test setup for Bun test runner
 * Provides common utilities, mocks, and configuration for all tests
 * 
 * This setup file is specifically designed for Bun's test runner,
 * not Vitest or Jest. It uses Bun's native test utilities and APIs.
 */

import { expect } from "bun:test";

// Global test utilities for Bun
declare global {
  interface CustomMatchers<R = unknown> {
    toBeAccessible(): R;
    toHaveValidMarkup(): R;
  }
}

// Mock browser APIs for testing
const mockIntersectionObserver = () => ({
  observe: () => {},
  disconnect: () => {},
  unobserve: () => {},
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Mock ResizeObserver
const mockResizeObserver = () => ({
  observe: () => {},
  disconnect: () => {},
  unobserve: () => {},
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: mockResizeObserver,
});

// Mock matchMedia for responsive design tests
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Performance testing utilities
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => Promise<void>) => {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    return end - start;
  },
  
  expectFastRender: (time: number, threshold = 16) => {
    if (time > threshold) {
      throw new Error(`Render took ${time}ms, expected < ${threshold}ms`);
    }
  }
};

// Accessibility testing helpers
export const a11yHelpers = {
  checkAriaLabels: (element: Element) => {
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach(el => {
      const hasLabel = el.getAttribute('aria-label') || 
                      el.getAttribute('aria-labelledby') ||
                      el.getAttribute('title') ||
                      el.textContent?.trim();
      
      if (!hasLabel) {
        throw new Error(`Interactive element missing accessible label: ${el.tagName}`);
      }
    });
  },
  
  checkHeadingHierarchy: (element: Element) => {
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level > previousLevel + 1) {
        throw new Error(`Heading hierarchy skip detected: ${heading.tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    });
  }
};

// Custom matchers for Bun test runner
expect.extend({
  toBeAccessible(received: unknown) {
    const element = received as Element;
    try {
      a11yHelpers.checkAriaLabels(element);
      a11yHelpers.checkHeadingHierarchy(element);
      return {
        message: () => 'Element passed accessibility checks',
        pass: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        message: () => `Element failed accessibility check: ${errorMessage}`,
        pass: false,
      };
    }
  },
  
  toHaveValidMarkup(received: unknown) {
    const element = received as Element;
    const hasValidStructure = element.children.length > 0 || element.textContent?.trim();
    return {
      message: () => hasValidStructure 
        ? 'Element has valid markup structure'
        : 'Element appears to be empty or malformed',
      pass: !!hasValidStructure,
    };
  },
});

// eslint-disable-next-line no-console
console.log('🧪 Test setup completed - Bun test environment ready');