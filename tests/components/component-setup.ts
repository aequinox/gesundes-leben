/**
 * @file component-setup.ts
 * @description Component test environment setup for Healthy Life Blog
 * 
 * This setup file configures the DOM environment for component testing,
 * including Astro component rendering, accessibility testing, and UI interactions.
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { setupBrowserMocks } from '../mocks/browser-apis';
import { setupAstroMocks } from '../mocks/astro-mocks';

// =============================================================================
// Component Test Environment Configuration
// =============================================================================

// Global test environment variables
let browserMocks: ReturnType<typeof setupBrowserMocks>;
let astroMocks: ReturnType<typeof setupAstroMocks>;

// Extended DOM operations setup
beforeAll(() => {
  // Setup comprehensive mocking environment
  browserMocks = setupBrowserMocks();
  astroMocks = setupAstroMocks();
  
  // Enhance DOM with additional properties for component testing
  Object.defineProperty(window, 'getComputedStyle', {
    value: (element: Element) => ({
      getPropertyValue: (prop: string) => {
        // Mock common CSS properties for component tests
        const mockStyles: Record<string, string> = {
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          transform: 'none',
          transition: 'none'
        };
        return mockStyles[prop] || '';
      }
    })
  });

  // Mock Image constructor for responsive image components
  global.Image = class MockImage {
    src = '';
    alt = '';
    width = 0;
    height = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor() {
      // Simulate immediate load for tests
      setTimeout(() => {
        if (this.onload) {
          this.onload();
        }
      }, 0);
    }
  } as any;
});

// =============================================================================
// Astro Component Testing Utilities
// =============================================================================

/**
 * Mock Astro runtime for component testing
 */
export const mockAstroRuntime = {
  /**
   * Mock Astro.props for component tests
   */
  createMockAstroProps: <T extends Record<string, any>>(props: T) => ({
    ...props,
    // Add common Astro props
    class: props.class || '',
    'data-testid': props['data-testid'] || 'astro-component'
  }),

  /**
   * Mock Astro.slots for component tests
   */
  createMockAstroSlots: (slots: Record<string, string> = {}) => ({
    default: slots.default || '<p>Default slot content</p>',
    ...slots,
    // Slot utility methods
    has: (name: string) => name in slots || name === 'default',
    render: (name: string) => slots[name] || slots.default || ''
  }),

  /**
   * Mock Astro.request for server-side component tests
   */
  createMockAstroRequest: (overrides: Partial<Request> = {}) => ({
    url: 'http://localhost:3000/',
    method: 'GET',
    headers: new Headers(),
    ...overrides
  } as Request)
};

// =============================================================================
// Health Blog Component Test Utilities
// =============================================================================

/**
 * Component test utilities specific to health blog functionality
 */
export const componentTestHelpers = {
  /**
   * Create a mock health article for component testing
   */
  createMockHealthArticle: (overrides: Partial<any> = {}) => ({
    title: 'Component Test: Gesunde Ernährung',
    author: 'Dr. Component Test',
    pubDatetime: new Date('2024-01-01'),
    description: 'Test article for component testing',
    heroImage: {
      src: '/test-images/component-test.jpg',
      alt: 'Component Test Image'
    },
    tags: ['Ernährung', 'Component', 'Test'],
    categories: ['Ernährung'],
    readingTime: '5 min read',
    content: `
      <h1>Component Test Article</h1>
      <p>This is a test article for component testing.</p>
      <div class="health-info">
        <strong>Health Topic:</strong> Nutrition
      </div>
    `,
    ...overrides
  }),

  /**
   * Mock navigation data for component tests
   */
  createMockNavigation: () => ([
    { text: 'Home', href: '/', icon: 'home' },
    { text: 'Blog', href: '/posts', icon: 'blog' },
    { text: 'Glossar', href: '/glossary', icon: 'glossary' },
    { text: 'Über uns', href: '/about', icon: 'info' }
  ]),

  /**
   * Create mock health data for components
   */
  createMockHealthData: (type: 'nutrition' | 'exercise' | 'mental-health' = 'nutrition') => {
    const mockData = {
      nutrition: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 67,
        fiber: 25
      },
      exercise: {
        type: 'Cardio',
        duration: 30,
        intensity: 'moderate',
        caloriesBurned: 300
      },
      'mental-health': {
        stressLevel: 3,
        moodRating: 7,
        sleepHours: 8,
        mindfulnessMinutes: 15
      }
    };
    return mockData[type];
  },

  /**
   * Accessibility testing helpers for health components
   */
  accessibilityHelpers: {
    /**
     * Check if health information is properly labeled
     */
    checkHealthInfoAccessibility: (element: Element) => {
      // Check for proper ARIA labels on health data
      const healthElements = element.querySelectorAll('[data-health-info]');
      healthElements.forEach(el => {
        const hasLabel = el.getAttribute('aria-label') || 
                        el.getAttribute('aria-labelledby') ||
                        el.textContent;
        if (!hasLabel) {
          throw new Error(`Health info element missing accessibility label: ${el.tagName}`);
        }
      });
    },

    /**
     * Verify proper heading structure for health content
     */
    checkHealthContentStructure: (element: Element) => {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (level > previousLevel + 1) {
          throw new Error(`Heading hierarchy skip detected: ${heading.tagName} after h${previousLevel}`);
        }
        previousLevel = level;
      });
    },

    /**
     * Check color contrast for health warnings and important info
     */
    checkHealthWarningContrast: (element: Element) => {
      const warnings = element.querySelectorAll('.warning, .alert, .health-warning');
      warnings.forEach(warning => {
        // Mock contrast checking (in real scenario, use contrast calculation)
        const hasHighContrast = warning.classList.contains('high-contrast') ||
                               warning.getAttribute('data-contrast') === 'high';
        if (!hasHighContrast) {
          console.warn('Health warning may not have sufficient contrast');
        }
      });
    }
  },

  /**
   * Performance testing for health components
   */
  performanceHelpers: {
    /**
     * Measure component render time
     */
    measureRenderTime: async (renderFn: () => Promise<Element>) => {
      const start = performance.now();
      const element = await renderFn();
      const end = performance.now();
      return {
        element,
        renderTime: end - start,
        isPerformant: (end - start) < 100 // Should render in under 100ms
      };
    },

    /**
     * Check for memory leaks in component cleanup
     */
    checkMemoryLeaks: (component: any) => {
      // Mock memory leak detection
      const hasListeners = component._listeners && component._listeners.length > 0;
      const hasTimers = component._timers && component._timers.length > 0;
      
      if (hasListeners || hasTimers) {
        console.warn('Potential memory leak detected in component cleanup');
      }
    }
  }
};

// =============================================================================
// Component Test Setup and Cleanup
// =============================================================================

beforeEach(() => {
  // Clear DOM before each component test
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset viewport for component tests
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768
  });
  
  // Mock common health blog globals
  (window as any).healthBlog = {
    config: {
      locale: 'de-DE',
      theme: 'light',
      features: {
        darkMode: true,
        search: true,
        accessibility: true
      }
    }
  };
});

afterEach(() => {
  // Clean up component test environment
  vi.clearAllMocks();
  
  // Clean up mock environments
  if (browserMocks) browserMocks.cleanup();
  if (astroMocks) astroMocks.cleanup();
  
  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Clean up global state
  delete (window as any).healthBlog;
});

afterAll(() => {
  // Restore all mocks after component tests
  vi.restoreAllMocks();
  
  // Final cleanup of mock environments
  if (browserMocks) browserMocks.cleanup();
  if (astroMocks) astroMocks.cleanup();
});