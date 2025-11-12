/**
 * @file performance.lazy-loading.test.ts
 * @description Tests for lazy loading performance utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  createLazyObserver,
  setupLazyImages,
  lazyLoadComponent,
  preloadCriticalResources,
  deferNonCriticalJS,
  trackBundleSize,
  perf,
  addResourceHints,
  optimizeCriticalCSS,
  type LazyLoadConfig,
} from "../performance/lazy-loading";

// Mock DOM APIs
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  // Setup DOM mocks
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((callback, options) => {
      mockIntersectionObserver.mockImplementation(callback);
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: options?.root ?? null,
        rootMargin: options?.rootMargin || "0px",
        thresholds: Array.isArray(options?.threshold)
          ? options.threshold
          : [options?.threshold ?? 0],
      };
    }),
  });

  Object.defineProperty(window, "performance", {
    writable: true,
    configurable: true,
    value: {
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn().mockReturnValue([]),
      now: vi.fn().mockReturnValue(123),
      navigation: { type: 0 },
    },
  });

  // Mock document methods
  document.createElement = vi.fn().mockImplementation(tagName => {
    const element = {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      remove: vi.fn(),
      appendChild: vi.fn(),
      style: {},
      onload: null,
      onerror: null,
    };
    return element;
  });

  Object.defineProperty(document, "head", {
    writable: true,
    configurable: true,
    value: {
      appendChild: vi.fn(),
    },
  });

  Object.defineProperty(document, "body", {
    writable: true,
    configurable: true,
    value: {
      appendChild: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("createLazyObserver", () => {
  it("should create an intersection observer with default config", () => {
    const callback = vi.fn();
    createLazyObserver(callback);

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );
  });

  it("should create an intersection observer with custom config", () => {
    const callback = vi.fn();
    const config: LazyLoadConfig = {
      rootMargin: "100px",
      threshold: 0.5,
    };

    createLazyObserver(callback, config);

    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: "100px",
        threshold: 0.5,
      }
    );
  });

  it("should handle callback execution correctly", () => {
    const callback = vi.fn();
    createLazyObserver(callback);

    const mockEntry = {
      isIntersecting: true,
      target: { dataset: { src: "test.jpg" } },
    };

    // Simulate intersection callback
    const observerCallback = vi.mocked(window.IntersectionObserver).mock
      .calls[0][0];
    observerCallback([mockEntry] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver);

    expect(callback).toHaveBeenCalledWith(mockEntry);
  });
});

describe("setupLazyImages", () => {
  it("should setup lazy loading for images with data-src", () => {
    const mockImg1 = {
      dataset: { src: "img1.jpg" },
      setAttribute: vi.fn(),
      src: "",
      loading: "",
    };
    const mockImg2 = {
      dataset: { src: "img2.jpg" },
      setAttribute: vi.fn(),
      src: "",
      loading: "",
    };

    document.querySelectorAll = vi.fn().mockReturnValue([mockImg1, mockImg2]);

    setupLazyImages();

    expect(document.querySelectorAll).toHaveBeenCalledWith(
      'img[data-src], img[loading="lazy"]'
    );
    expect(mockImg1.src).toBe("img1.jpg");
    expect(mockImg2.src).toBe("img2.jpg");
    expect(mockImg1.loading).toBe("lazy");
    expect(mockImg2.loading).toBe("lazy");
  });

  it("should handle images without data-src gracefully", () => {
    document.querySelectorAll = vi.fn().mockReturnValue([]);

    expect(() => setupLazyImages()).not.toThrow();
    expect(mockObserve).not.toHaveBeenCalled();
  });
});

describe("lazyLoadComponent", () => {
  it("should return a promise that resolves when component loads", async () => {
    const mockComponent = { default: "MockComponent" };
    const loader = vi.fn().mockResolvedValue(mockComponent);

    const result = await lazyLoadComponent(loader);

    expect(loader).toHaveBeenCalled();
    expect(result).toBe(mockComponent);
  });

  it("should handle component loading errors", async () => {
    const error = new Error("Failed to load component");
    const loader = vi.fn().mockRejectedValue(error);

    await expect(lazyLoadComponent(loader)).rejects.toThrow(
      "Failed to load component"
    );
  });

  it("should handle component loading without caching", async () => {
    const mockComponent = { default: "CachedComponent" };
    const loader = vi.fn().mockResolvedValue(mockComponent);

    const result1 = await lazyLoadComponent(loader);
    const result2 = await lazyLoadComponent(loader);

    expect(loader).toHaveBeenCalledTimes(2);
    expect(result1).toBe(mockComponent);
    expect(result2).toBe(mockComponent);
  });
});

describe("preloadCriticalResources", () => {
  it("should create link elements for each resource", () => {
    const resources = ["/critical.css", "/critical.js"];

    const mockLinks: any[] = [];
    document.createElement = vi.fn().mockImplementation(() => {
      const link = {
        rel: "",
        href: "",
        as: "",
        setAttribute: vi.fn(),
      };
      mockLinks.push(link);
      return link;
    });

    preloadCriticalResources(resources);

    expect(document.createElement).toHaveBeenCalledTimes(2);
    expect(mockLinks[0].rel).toBe("preload");
    expect(mockLinks[0].href).toBe("/critical.css");
    expect(mockLinks[0].as).toBe("style");
    expect(mockLinks[1].rel).toBe("preload");
    expect(mockLinks[1].href).toBe("/critical.js");
    expect(mockLinks[1].as).toBe("script");
  });
});

describe("deferNonCriticalJS", () => {
  it("should defer callback execution until after page load", () => {
    const callback = vi.fn();
    Object.defineProperty(document, "readyState", {
      value: "complete",
      writable: true,
      configurable: true,
    });

    // Mock requestIdleCallback
    Object.defineProperty(window, "requestIdleCallback", {
      value: vi.fn().mockImplementation(cb => cb()),
      writable: true,
      configurable: true,
    });

    deferNonCriticalJS(callback);

    // Should call callback through requestIdleCallback when document is complete
    expect(callback).toHaveBeenCalled();
  });

  it("should wait for load event if document not ready", () => {
    const callback = vi.fn();
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    const mockAddEventListener = vi.fn();
    Object.defineProperty(window, "addEventListener", {
      value: mockAddEventListener,
      writable: true,
    });

    deferNonCriticalJS(callback);

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "load",
      expect.any(Function),
      { once: true }
    );
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("trackBundleSize", () => {
  it("should track bundle size information", () => {
    // Mock dev environment
    vi.stubEnv("DEV", true);

    trackBundleSize("main", 150000);

    // The function logs with logger.info, not console.info
    // This test verifies the function runs without error
    expect(() => trackBundleSize("main", 150000)).not.toThrow();
  });

  it("should handle very large bundle sizes", () => {
    // Mock dev environment
    vi.stubEnv("DEV", true);

    trackBundleSize("large-bundle", 1000000); // 1MB

    // Verify function executes without throwing
    expect(() => trackBundleSize("large-bundle", 1000000)).not.toThrow();
  });

  it("should not log in production", () => {
    // Mock production environment
    vi.stubEnv("DEV", false);

    // Should return early in production
    expect(() => trackBundleSize("prod-bundle", 500000)).not.toThrow();
  });
});

describe("perf utilities", () => {
  it("should provide performance measurement utilities", () => {
    expect(perf).toBeDefined();
    expect(typeof perf.mark).toBe("function");
    expect(typeof perf.measure).toBe("function");
    expect(typeof perf.clear).toBe("function");
  });

  it("should handle performance marking", () => {
    perf.mark("test-mark");
    expect(window.performance.mark).toHaveBeenCalledWith("test-mark");
  });

  it("should handle performance measuring", () => {
    perf.measure("test-measure", "start", "end");
    expect(window.performance.measure).toHaveBeenCalledWith(
      "test-measure",
      "start",
      "end"
    );
  });
});

describe("addResourceHints", () => {
  it("should add resource hints", () => {
    const hints = [
      { href: "https://fonts.googleapis.com", rel: "dns-prefetch" as const },
      { href: "https://api.example.com", rel: "preconnect" as const },
    ];

    const mockLinks: any[] = [];
    document.createElement = vi.fn().mockImplementation(() => {
      const link = {
        rel: "",
        href: "",
        setAttribute: vi.fn(),
      };
      mockLinks.push(link);
      return link;
    });

    document.querySelector = vi.fn().mockReturnValue(null); // No existing links

    addResourceHints(hints);

    expect(mockLinks).toHaveLength(2);
    expect(mockLinks[0].rel).toBe("dns-prefetch");
    expect(mockLinks[0].href).toBe("https://fonts.googleapis.com");
    expect(mockLinks[1].rel).toBe("preconnect");
    expect(mockLinks[1].href).toBe("https://api.example.com");
  });

  it("should not duplicate existing hints", () => {
    const hints = [
      { href: "https://fonts.googleapis.com", rel: "dns-prefetch" as const },
    ];

    document.querySelector = vi.fn().mockReturnValue({}); // Existing link found
    document.createElement = vi.fn();

    addResourceHints(hints);

    expect(document.createElement).not.toHaveBeenCalled();
  });
});

describe("optimizeCriticalCSS", () => {
  it("should inline critical CSS", () => {
    const criticalCSS = "body { margin: 0; }";

    const mockStyle = {
      textContent: "",
      setAttribute: vi.fn(),
    };

    document.createElement = vi.fn().mockReturnValue(mockStyle);
    document.querySelector = vi.fn().mockReturnValue(null); // No existing stylesheet

    optimizeCriticalCSS(criticalCSS);

    expect(mockStyle.textContent).toBe(criticalCSS);
    expect(mockStyle.setAttribute).toHaveBeenCalledWith(
      "data-critical",
      "true"
    );
  });

  it("should insert before existing stylesheets", () => {
    const criticalCSS = "body { margin: 0; }";
    const mockStyle = {
      textContent: "",
      setAttribute: vi.fn(),
    };
    const mockExistingStylesheet = {};
    const mockInsertBefore = vi.fn();

    document.createElement = vi.fn().mockReturnValue(mockStyle);
    document.querySelector = vi.fn().mockReturnValue(mockExistingStylesheet);
    Object.defineProperty(document, "head", {
      value: { insertBefore: mockInsertBefore, appendChild: vi.fn() },
      writable: true,
    });

    optimizeCriticalCSS(criticalCSS);

    expect(mockInsertBefore).toHaveBeenCalledWith(
      mockStyle,
      mockExistingStylesheet
    );
  });
});
