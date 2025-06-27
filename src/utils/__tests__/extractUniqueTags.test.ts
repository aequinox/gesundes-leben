import { describe, expect, test, vi } from "vitest";

// Mock dependencies - must be before imports that use them
vi.mock("@/utils/slugs", () => ({
  slugify: (str: string) => str.toLowerCase().replace(/\s+/g, "-"),
}));

import { extractUniqueTags } from "../tags";
import type { Post } from "../types";

describe("extractUniqueTags", () => {
  test("extracts unique tags from posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        collection: "blog",
        data: {
          title: "Post 1",
          tags: ["Tag One", "Tag Two"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          keywords: [],
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Ernährung"],
          group: "pro",
        },
        render: vi.fn(),
      },
      {
        id: "post-2",
        collection: "blog",
        data: {
          title: "Post 2",
          tags: ["Tag Two", "Tag Three"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Immunsystem"],
          group: "pro",
        },
        render: vi.fn(),
      },
    ] as unknown as Post[];

    const result = extractUniqueTags(mockPosts);

    expect(result).toEqual([
      { tag: "tag-one", tagName: "Tag One" },
      { tag: "tag-three", tagName: "Tag Three" },
      { tag: "tag-two", tagName: "Tag Two" },
    ]);
  });

  test("filters out draft posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        collection: "blog",
        data: {
          title: "Post 1",
          tags: ["Tag One"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          keywords: [],
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Ernährung"],
          group: "pro",
        },
        render: vi.fn(),
      },
      {
        id: "draft-post",
        collection: "blog",
        data: {
          title: "Draft Post",
          tags: ["Tag Two"],
          draft: true,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Immunsystem"],
          group: "pro",
        },
        render: vi.fn(),
      },
    ] as unknown as Post[];

    const result = extractUniqueTags(mockPosts);

    expect(result).toEqual([{ tag: "tag-one", tagName: "Tag One" }]);
  });

  test("handles empty posts array", () => {
    const result = extractUniqueTags([]);
    expect(result).toEqual([]);
  });

  test("handles posts with no tags", () => {
    const mockPosts = [
      {
        id: "post-1",
        collection: "blog",
        data: {
          title: "Post 1",
          tags: [],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          keywords: [],
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Ernährung"],
          group: "pro",
        },
        render: vi.fn(),
      },
    ] as unknown as Post[];

    const result = extractUniqueTags(mockPosts);
    expect(result).toEqual([]);
  });

  test("handles duplicate tags across posts", () => {
    const mockPosts = [
      {
        id: "post-1",
        collection: "blog",
        data: {
          title: "Post 1",
          tags: ["Tag One", "Tag One"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          keywords: [],
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Ernährung"],
          group: "pro",
        },
        render: vi.fn(),
      },
      {
        id: "post-2",
        collection: "blog",
        data: {
          title: "Post 2",
          tags: ["Tag One"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Immunsystem"],
          group: "pro",
        },
        render: vi.fn(),
      },
    ] as unknown as Post[];

    const result = extractUniqueTags(mockPosts);

    expect(result).toEqual([{ tag: "tag-one", tagName: "Tag One" }]);
  });

  test("sorts tags alphabetically", () => {
    const mockPosts = [
      {
        id: "post-1",
        collection: "blog",
        data: {
          title: "Post 1",
          tags: ["Zebra", "Apple", "Banana"],
          draft: false,
          author: "test-author",
          pubDatetime: new Date("2024-01-01"),
          description: "Test description",
          keywords: [],
          heroImage: {
            src: {
              src: "test.jpg",
              width: 100,
              height: 100,
              format: "jpg" as const,
            },
            alt: "Test image",
          },
          categories: ["Ernährung"],
          group: "pro",
        },
        render: vi.fn(),
      },
    ] as unknown as Post[];

    const result = extractUniqueTags(mockPosts);

    expect(result).toEqual([
      { tag: "apple", tagName: "Apple" },
      { tag: "banana", tagName: "Banana" },
      { tag: "zebra", tagName: "Zebra" },
    ]);
  });
});
