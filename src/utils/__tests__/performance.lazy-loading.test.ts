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
    value: vi.fn().mockImplementation(callback => {
      mockIntersectionObserver.mockImplementation(callback);
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
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
        root: null,
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
        root: null,
        rootMargin: "100px",
        threshold: 0.5,
      }
    );
  });

  it("should handle callback execution correctly", () => {
    const callback = vi.fn();
    createLazyObserver(callback);

    const mockEntries = [
      { isIntersecting: true, target: { dataset: { src: "test.jpg" } } },
    ];

    // Simulate intersection callback
    const observerCallback = vi.mocked(window.IntersectionObserver).mock
      .calls[0][0];
    observerCallback(mockEntries as any, {} as any);

    expect(callback).toHaveBeenCalledWith(mockEntries, expect.any(Object));
  });
});

describe("setupLazyImages", () => {
  it("should setup lazy loading for images with data-src", () => {
    const mockImg1 = {
      dataset: { src: "img1.jpg" },
      setAttribute: vi.fn(),
      src: "",
    };
    const mockImg2 = {
      dataset: { src: "img2.jpg" },
      setAttribute: vi.fn(),
      src: "",
    };

    document.querySelectorAll = vi.fn().mockReturnValue([mockImg1, mockImg2]);

    setupLazyImages();

    expect(document.querySelectorAll).toHaveBeenCalledWith("img[data-src]");
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenCalledWith(mockImg1);
    expect(mockObserve).toHaveBeenCalledWith(mockImg2);
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
    expect(result).toBe("MockComponent");
  });

  it("should handle component loading errors", async () => {
    const error = new Error("Failed to load component");
    const loader = vi.fn().mockRejectedValue(error);

    await expect(lazyLoadComponent(loader)).rejects.toThrow(
      "Failed to load component"
    );
  });

  it("should cache loaded components", async () => {
    const mockComponent = { default: "CachedComponent" };
    const loader = vi.fn().mockResolvedValue(mockComponent);

    const result1 = await lazyLoadComponent(loader, "test-component");
    const result2 = await lazyLoadComponent(loader, "test-component");

    expect(loader).toHaveBeenCalledTimes(1);
    expect(result1).toBe("CachedComponent");
    expect(result2).toBe("CachedComponent");
  });
});

describe("preloadCriticalResources", () => {
  it("should create link elements for each resource", () => {
    const resources = [
      { href: "/critical.css", as: "style" },
      { href: "/critical.js", as: "script" },
    ];

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
    expect(mockLinks[1].href).toBe("/critical.js");
    expect(mockLinks[1].as).toBe("script");
  });
});

describe("deferNonCriticalJS", () => {
  it("should defer script loading until after page load", () => {
    const scripts = ["/non-critical1.js", "/non-critical2.js"];

    const mockScripts: any[] = [];
    document.createElement = vi.fn().mockImplementation(() => {
      const script = {
        src: "",
        async: false,
        defer: false,
      };
      mockScripts.push(script);
      return script;
    });

    deferNonCriticalJS(scripts);

    expect(document.createElement).toHaveBeenCalledTimes(2);
    expect(mockScripts[0].src).toBe("/non-critical1.js");
    expect(mockScripts[0].async).toBe(true);
    expect(mockScripts[1].src).toBe("/non-critical2.js");
    expect(mockScripts[1].async).toBe(true);
  });
});

describe("trackBundleSize", () => {
  it("should log bundle size information", () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    trackBundleSize("main", 150000);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Bundle main: 146.48 KB (150000 bytes)"
    );

    consoleSpy.mockRestore();
  });

  it("should handle very large bundle sizes", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    trackBundleSize("large-bundle", 2000000); // 2MB

    expect(consoleSpy).toHaveBeenCalledWith(
      "Large bundle detected - large-bundle: 1.91 MB (2000000 bytes)"
    );

    consoleSpy.mockRestore();
  });
});

describe("perf utilities", () => {
  it("should provide performance measurement utilities", () => {
    expect(perf).toBeDefined();
    expect(typeof perf.mark).toBe("function");
    expect(typeof perf.measure).toBe("function");
    expect(typeof perf.getEntries).toBe("function");
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
  it("should add DNS prefetch hints", () => {
    const urls = ["https://fonts.googleapis.com", "https://api.example.com"];

    const mockLinks: any[] = [];
    document.createElement = vi.fn().mockImplementation(() => {
      const link = {
        rel: "",
        href: "",
      };
      mockLinks.push(link);
      return link;
    });

    addResourceHints(urls, "dns-prefetch");

    expect(mockLinks).toHaveLength(2);
    expect(mockLinks[0].rel).toBe("dns-prefetch");
    expect(mockLinks[0].href).toBe("https://fonts.googleapis.com");
    expect(mockLinks[1].rel).toBe("dns-prefetch");
    expect(mockLinks[1].href).toBe("https://api.example.com");
  });

  it("should add preconnect hints", () => {
    const urls = ["https://fonts.gstatic.com"];

    const mockLink = { rel: "", href: "" };
    document.createElement = vi.fn().mockReturnValue(mockLink);

    addResourceHints(urls, "preconnect");

    expect(mockLink.rel).toBe("preconnect");
    expect(mockLink.href).toBe("https://fonts.gstatic.com");
  });
});

describe("optimizeCriticalCSS", () => {
  it("should inline critical CSS and defer non-critical", () => {
    const criticalCSS = "body { margin: 0; }";
    const nonCriticalHref = "/non-critical.css";

    const mockStyle = { textContent: "" };
    const mockLink = { rel: "", href: "", media: "", onload: null };

    document.createElement = vi
      .fn()
      .mockReturnValueOnce(mockStyle)
      .mockReturnValueOnce(mockLink);

    optimizeCriticalCSS(criticalCSS, nonCriticalHref);

    expect(mockStyle.textContent).toBe(criticalCSS);
    expect(mockLink.rel).toBe("stylesheet");
    expect(mockLink.href).toBe(nonCriticalHref);
    expect(mockLink.media).toBe("print");
    expect(typeof mockLink.onload).toBe("function");
  });
});
