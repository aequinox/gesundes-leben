import { vi } from "vitest";

/**
 * Mock file system operations
 */
export const mockFs = {
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  mkdirSync: vi.fn(),
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
  },
};

/**
 * Mock axios instance
 */
export const mockAxios = {
  default: vi.fn(),
  create: vi.fn(() => mockAxios),
  get: vi.fn(),
  post: vi.fn(),
};

/**
 * Mock logger
 */
export const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
};

/**
 * Create a mock XML logger
 */
export const createMockXmlLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});

/**
 * Create a mock cache service
 */
export const createMockCacheService = () => ({
  enabled: true,
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  clear: vi.fn(),
  save: vi.fn(),
  load: vi.fn(),
  prune: vi.fn(),
  getStats: vi.fn(() => ({
    enabled: true,
    totalEntries: 0,
    validEntries: 0,
    expiredEntries: 0,
    totalCreditsSaved: 0,
    cacheFile: ".test-cache.json",
    cacheSizeBytes: 0,
    cacheSizeKB: 0,
    ttlDays: 30,
  })),
});

/**
 * Create a mock Visionati service
 */
export const createMockVisionatiService = () => ({
  generateAltText: vi.fn(),
  generateAltTexts: vi.fn(),
  getStats: vi.fn(() => ({
    activeRequests: 0,
    queuedRequests: 0,
    memoryCachedResponses: 0,
    persistentCacheHits: 0,
    persistentCacheMisses: 0,
    cacheHitRate: "0%",
    configuration: {
      backend: "claude",
      language: "de",
      maxConcurrent: 5,
      timeout: 30000,
      persistentCache: "enabled",
    },
  })),
  reset: vi.fn(),
});

/**
 * Sample test data
 */
export const testData = {
  sampleImageUrl: "https://example.com/test-image.jpg",
  sampleAltText: "Test Bildbeschreibung auf Deutsch",
  sampleFilename: "test-bild-beschreibung",
  samplePost: {
    meta: {
      id: "test-post-1",
      slug: "test-post",
      coverImage: "test-cover.jpg",
      type: "post",
      imageUrls: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
    },
    data: {
      post_id: ["123"],
      post_name: ["test-post"],
      post_type: ["post"],
      status: ["publish"],
      pubDate: ["2024-01-01T00:00:00Z"],
      encoded: ["<p>Test content</p>"],
      link: ["https://example.com/test-post"],
      title: ["Test Post"],
      excerpt: ["Test excerpt"],
    },
    content: "<p>Test content with image</p>",
    imageImports: [],
    frontmatter: {
      id: "test-post-1",
      title: "Test Post",
      author: "test-author",
      pubDatetime: "2024-01-01T00:00:00.000Z",
      draft: false,
      featured: false,
    },
  },
  sampleConfig: {
    input: "./test.xml",
    output: "./test-output",
    yearFolders: false,
    monthFolders: false,
    postFolders: true,
    prefixDate: true,
    saveAttachedImages: true,
    saveScrapedImages: true,
    includeOtherTypes: false,
    generateAltTexts: true,
    visionatiApiKey: "Token test-key",
    visionatiBackend: "claude",
    visionatiLanguage: "de",
    visionatiTimeout: 30000,
    visionatiMaxConcurrent: 5,
    visionatiCacheEnabled: true,
    visionatiCacheFile: ".test-cache.json",
    visionatiCacheTTL: 30,
  },
};

/**
 * Wait for promises to resolve
 */
export const flushPromises = () =>
  new Promise(resolve => setImmediate(resolve));

/**
 * Create a temporary test directory path
 */
export const getTempDir = () => `/tmp/xml2markdown-test-${Date.now()}`;

/**
 * Mock environment variables
 */
export const mockEnv = vars => {
  const original = { ...process.env };
  Object.assign(process.env, vars);
  return () => {
    process.env = original;
  };
};
