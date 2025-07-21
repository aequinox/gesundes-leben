/**
 * @file browser-apis.ts
 * @description Comprehensive browser API mocks for testing
 * 
 * Provides realistic mocks for browser APIs commonly used in the health blog,
 * including localStorage, sessionStorage, IntersectionObserver, ResizeObserver,
 * and other modern web APIs.
 */

import { vi } from 'vitest';

/**
 * Mock localStorage with full API compatibility
 */
export const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  
  return {
    getItem: vi.fn((key: string) => store.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
    // Testing utilities
    _getStore: () => store,
    _reset: () => store.clear()
  };
};

/**
 * Mock sessionStorage (same interface as localStorage)
 */
export const createSessionStorageMock = createLocalStorageMock;

/**
 * Mock fetch API with health blog specific responses
 */
export const createFetchMock = () => {
  const responses = new Map<string, unknown>();
  
  const mockFetch = vi.fn(async (url: string | URL, options?: RequestInit) => {
    const urlString = url.toString();
    const method = options?.method || 'GET';
    const key = `${method}:${urlString}`;
    
    if (responses.has(key)) {
      const responseData = responses.get(key);
      return new Response(JSON.stringify(responseData), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Default health blog API responses
    if (urlString.includes('/api/nutrition')) {
      return new Response(JSON.stringify({
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 67,
        fiber: 25
      }), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (urlString.includes('/api/references')) {
      return new Response(JSON.stringify([
        {
          id: 'test-ref-1',
          title: 'Health Research Study',
          authors: ['Dr. Test', 'Prof. Example'],
          year: 2024
        }
      ]), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Default 404 response
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  });
  
  return {
    mockFetch,
    setResponse: (url: string, method: string, data: unknown) => {
      responses.set(`${method}:${url}`, data);
    },
    clearResponses: () => responses.clear(),
    _getResponses: () => responses
  };
};

/**
 * Setup essential browser API mocks for testing environment
 */
export const setupBrowserMocks = () => {
  const localStorage = createLocalStorageMock();
  const sessionStorage = createSessionStorageMock();
  const fetchMock = createFetchMock();
  
  // Apply mocks to global objects
  Object.defineProperty(window, 'localStorage', { value: localStorage });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorage });
  Object.defineProperty(global, 'fetch', { value: fetchMock.mockFetch });
  
  return {
    localStorage,
    sessionStorage,
    fetchMock,
    cleanup: () => {
      localStorage._reset();
      sessionStorage._reset();
      fetchMock.clearResponses();
    }
  };
};

export default setupBrowserMocks;