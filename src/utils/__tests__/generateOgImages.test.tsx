import { describe, expect, test, vi } from "vitest";
import {
  generateOgImageForPost,
  generateOgImageForSite,
  type OgImageOptions,
} from "../generateOgImages";
import type { CollectionEntry } from "astro:content";

// Mock Resvg
vi.mock("@resvg/resvg-js", () => ({
  Resvg: class MockResvg {
    constructor(
      public svg: string,
      public options: any
    ) {}
    render() {
      return {
        asPng: () => Buffer.from("mock-png-data"),
      };
    }
  },
}));

// Mock templates
vi.mock("../og-templates/post", () => ({
  default: vi.fn().mockResolvedValue("<svg>Mock Post Template</svg>"),
}));

vi.mock("../og-templates/site", () => ({
  default: vi.fn().mockResolvedValue("<svg>Mock Site Template</svg>"),
}));

describe("OG Image Generation", () => {
  const createMockPost = (): CollectionEntry<"blog"> => ({
    id: "test-post",
    slug: "test-post",
    body: "Test content",
    collection: "blog",
    data: {
      title: "Test Post",
      author: "test-author",
      description: "Test description",
      pubDatetime: new Date(),
      draft: false,
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

  describe("generateOgImageForPost", () => {
    test("generates image with default options", async () => {
      const post = createMockPost();
      const result = await generateOgImageForPost(post);

      expect(result).toBeInstanceOf(Buffer);
    });

    test("throws error for missing post", async () => {
      await expect(generateOgImageForPost(undefined as any)).rejects.toThrow(
        "Post data is required"
      );
    });

    test("validates width", async () => {
      const post = createMockPost();
      await expect(
        generateOgImageForPost(post, { width: 100 })
      ).rejects.toThrow("Width must be between 200 and 2048 pixels");
    });

    test("validates height", async () => {
      const post = createMockPost();
      await expect(
        generateOgImageForPost(post, { height: 3000 })
      ).rejects.toThrow("Height must be between 200 and 2048 pixels");
    });

    test("applies custom options", async () => {
      const post = createMockPost();
      const options: OgImageOptions = {
        width: 800,
        height: 400,
        background: "#000000",
        font: {
          loadSystemFonts: false,
          defaultFontFamily: "Helvetica",
        },
      };

      const result = await generateOgImageForPost(post, options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("generateOgImageForSite", () => {
    test("generates image with default options", async () => {
      const result = await generateOgImageForSite();
      expect(result).toBeInstanceOf(Buffer);
    });

    test("validates width", async () => {
      await expect(generateOgImageForSite({ width: 100 })).rejects.toThrow(
        "Width must be between 200 and 2048 pixels"
      );
    });

    test("validates height", async () => {
      await expect(generateOgImageForSite({ height: 3000 })).rejects.toThrow(
        "Height must be between 200 and 2048 pixels"
      );
    });

    test("applies custom options", async () => {
      const options: OgImageOptions = {
        width: 800,
        height: 400,
        background: "#000000",
        fitTo: {
          mode: "zoom",
          value: 1.5,
        },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });

    test("handles template error", async () => {
      vi.mock("../og-templates/site", () => ({
        default: vi.fn().mockRejectedValue(new Error("Template error")),
      }));

      await expect(generateOgImageForSite()).rejects.toThrow(
        "Failed to generate site OG image"
      );
    });
  });

  describe("fit modes", () => {
    test("handles original mode", async () => {
      const options: OgImageOptions = {
        fitTo: { mode: "original" },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });

    test("handles width mode", async () => {
      const options: OgImageOptions = {
        fitTo: { mode: "width", value: 800 },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });

    test("handles height mode", async () => {
      const options: OgImageOptions = {
        fitTo: { mode: "height", value: 400 },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });

    test("handles zoom mode", async () => {
      const options: OgImageOptions = {
        fitTo: { mode: "zoom", value: 1.5 },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe("font options", () => {
    test("handles custom font files", async () => {
      const options: OgImageOptions = {
        font: {
          loadSystemFonts: false,
          fontFiles: ["/path/to/font.ttf"],
          defaultFontFamily: "CustomFont",
        },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });

    test("merges font options with defaults", async () => {
      const options: OgImageOptions = {
        font: {
          defaultFontFamily: "CustomFont",
        },
      };

      const result = await generateOgImageForSite(options);
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
