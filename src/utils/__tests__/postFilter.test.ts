import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import filterBlogPosts from "../postFilter";
import type { CollectionEntry } from "astro:content";

describe("filterBlogPosts", () => {
  // Store original env
  const originalEnv = import.meta.env;

  // Test dates
  const NOW = new Date().getTime();
  const PAST_DATE = new Date(NOW - 7 * 24 * 60 * 60 * 1000); // 1 week earlier
  const FUTURE_DATE = new Date(NOW + 7 * 24 * 60 * 60 * 1000); // 1 week later

  beforeEach(() => {
    // Mock Date.now() to return a timestamp
    vi.spyOn(Date, "now").mockImplementation(() => NOW);

    // Reset to production mode
    vi.stubGlobal("import.meta", {
      env: {
        DEV: false,
      },
    });

    // Reset SITE config with no margin
    vi.mock("@/config", () => ({
      SITE: {
        scheduledPostMargin: 0,
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("import.meta", { env: originalEnv });
  });

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

  describe("in production mode", () => {
    test("includes non-draft posts with past publication date", () => {
      const post = createMockPost(false, PAST_DATE);
      expect(filterBlogPosts(post)).toBe(true);
    });

    test.skip("excludes non-draft posts with future publication date", () => {
      const post = createMockPost(false, FUTURE_DATE);
      expect(filterBlogPosts(post)).toBe(false);
    });

    test("excludes draft posts regardless of publication date", () => {
      const pastPost = createMockPost(true, PAST_DATE);
      const futurePost = createMockPost(true, FUTURE_DATE);

      expect(filterBlogPosts(pastPost)).toBe(false);
      expect(filterBlogPosts(futurePost)).toBe(false);
    });

    test.skip("excludes posts within scheduled margin period", () => {
      // Set a 24-hour margin
      vi.mock("@/config", () => ({
        SITE: {
          scheduledPostMargin: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        },
      }));

      // A post from 12 hours ago (within 24-hour margin)
      const withinMargin = new Date(NOW - 12 * 60 * 60 * 1000);
      const post = createMockPost(false, withinMargin);

      expect(filterBlogPosts(post)).toBe(false);
    });
  });

  describe("in development mode", () => {
    beforeEach(() => {
      vi.stubGlobal("import.meta", {
        env: {
          DEV: true,
        },
      });
    });

    test("includes all posts with valid dates regardless of draft status", () => {
      const draftPast = createMockPost(true, PAST_DATE);
      const draftFuture = createMockPost(true, FUTURE_DATE);
      const nonDraftPast = createMockPost(false, PAST_DATE);
      const nonDraftFuture = createMockPost(false, FUTURE_DATE);

      expect(filterBlogPosts(draftPast)).toBe(true);
      expect(filterBlogPosts(draftFuture)).toBe(true);
      expect(filterBlogPosts(nonDraftPast)).toBe(true);
      expect(filterBlogPosts(nonDraftFuture)).toBe(true);
    });
  });

  describe("invalid dates", () => {
    test("excludes posts with missing publication date", () => {
      const post = createMockPost(false, undefined as unknown as Date);
      expect(filterBlogPosts(post)).toBe(false);
    });
  });
});
