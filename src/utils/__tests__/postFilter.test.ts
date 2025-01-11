import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import filterBlogPosts from "../postFilter";
import type { CollectionEntry } from "astro:content";

// Mock the SITE config
vi.mock("@/config", () => ({
  SITE: {
    scheduledPostMargin: 0, // No margin by default
  },
}));

// Mock import.meta.env
const originalEnv = import.meta.env;
beforeEach(() => {
  vi.stubGlobal("import.meta", {
    env: {
      DEV: false, // Production mode by default
    },
  });
});

// Reset import.meta after tests
afterEach(() => {
  vi.stubGlobal("import.meta", { env: originalEnv });
});

describe("filterBlogPosts", () => {
  const createMockPost = (
    draft: boolean,
    pubDatetime: Date
  ): CollectionEntry<"blog"> => ({
    id: "test-post",
    slug: "test-post",
    body: "Test content",
    collection: "blog",
    data: {
      title: "Test Post",
      author: "test-author",
      description: "Test description",
      pubDatetime,
      draft,
      heroImage: {
        src: {
          src: "test.jpg",
          width: 100,
          height: 100,
          format: "jpg" as const,
        },
        alt: "Test image",
      },
      categories: [],
      group: "pro",
      tags: [],
    },
    render: vi.fn(),
  });

  test("includes non-draft posts with past publication date", () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    const post = createMockPost(false, pastDate);

    expect(filterBlogPosts(post)).toBe(true);
  });

  test("excludes non-draft posts with future publication date", () => {
    const futureDate = new Date(Date.now() + 1000); // 1 second in future
    const post = createMockPost(false, futureDate);

    expect(filterBlogPosts(post)).toBe(false);
  });

  test("excludes draft posts in production", () => {
    const pastDate = new Date(Date.now() - 1000);
    const post = createMockPost(true, pastDate);

    expect(filterBlogPosts(post)).toBe(false);
  });

  test("includes draft posts in development", () => {
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
      },
    });

    const pastDate = new Date(Date.now() - 1000);
    const post = createMockPost(true, pastDate);

    expect(filterBlogPosts(post)).toBe(true);
  });

  test("respects scheduledPostMargin", () => {
    // Mock a 1-hour margin
    vi.mock("@/config", () => ({
      SITE: {
        scheduledPostMargin: 3600000, // 1 hour in milliseconds
      },
    }));

    const justBeforeMargin = new Date(Date.now() - 3599000); // 1 second before margin
    const post = createMockPost(false, justBeforeMargin);

    expect(filterBlogPosts(post)).toBe(false);
  });

  test("handles undefined pubDatetime", () => {
    const post = createMockPost(false, undefined as unknown as Date);

    expect(filterBlogPosts(post)).toBe(false);
  });

  test("includes all posts in development regardless of date", () => {
    vi.stubGlobal("import.meta", {
      env: {
        DEV: true,
      },
    });

    const futureDate = new Date(Date.now() + 1000000);
    const post = createMockPost(false, futureDate);

    expect(filterBlogPosts(post)).toBe(true);
  });
});
