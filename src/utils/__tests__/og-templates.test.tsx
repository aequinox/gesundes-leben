import { SITE } from "../../config";
import { describe, expect, test, vi } from "vitest";
import type { CollectionEntry } from "astro:content";

// Define the mock result type
interface SatoriMockResult {
  jsx: {
    props: {
      children: any;
      style?: any;
    };
  };
  options: {
    width: number;
    height: number;
    embedFont: boolean;
    fonts: any[];
  };
}

// Mock satori module first
vi.mock("satori", () => ({
  default: (jsx: any, options: any): Promise<SatoriMockResult> =>
    Promise.resolve({
      jsx: { props: { children: jsx } },
      options,
    }),
}));

vi.mock("../loadGoogleFont", () => ({
  default: vi.fn(async () => [
    {
      name: "Test Font",
      data: new Uint8Array(),
      weight: 400,
      style: "normal",
    },
  ]),
}));

vi.mock("@/services/content/AuthorService", () => ({
  authorService: {
    getAuthorEntry: vi.fn(async author => {
      if (author === "test-author") {
        return {
          data: {
            name: "Test Author",
          },
        };
      }
      return null;
    }),
  },
}));

// Import the templates after mocking
const { default: postTemplate } = await import("../og-templates/post");
const { default: siteTemplate } = await import("../og-templates/site");

// Mock return type assertion function
const asMockResult = (value: unknown): SatoriMockResult =>
  value as SatoriMockResult;

describe("OG Templates", () => {
  describe("Post Template", () => {
    test("renders with all required data", async () => {
      const mockPost = {
        data: {
          title: "Test Post Title",
          author: "test-author",
        },
      } as CollectionEntry<"blog">;

      const result = asMockResult(await postTemplate(mockPost));

      // Check dimensions
      expect(result.options.width).toBe(1200);
      expect(result.options.height).toBe(630);
      expect(result.options.embedFont).toBe(true);

      // Check content rendering
      const jsx = result.jsx;
      expect(jsx.props.children).toBeDefined();

      // Find title text
      const titleElement = findElementWithText(jsx, mockPost.data.title);
      expect(titleElement).toBeTruthy();

      // Find author text
      const authorElement = findElementWithText(jsx, "Test Author");
      expect(authorElement).toBeTruthy();
    });

    test("handles missing author gracefully", async () => {
      const mockPost = {
        data: {
          title: "Test Post Title",
          author: "non-existent-author",
        },
      } as CollectionEntry<"blog">;

      const result = asMockResult(await postTemplate(mockPost));
      const jsx = result.jsx;

      // Should use SITE.author as fallback
      const authorElement = findElementWithText(jsx, SITE.author);
      expect(authorElement).toBeTruthy();
    });
  });

  describe("Site Template", () => {
    test("renders site information correctly", async () => {
      const result = asMockResult(await siteTemplate());

      // Check dimensions
      expect(result.options.width).toBe(1200);
      expect(result.options.height).toBe(630);
      expect(result.options.embedFont).toBe(true);

      // Check content rendering
      const jsx = result.jsx;

      // Find site title
      const titleElement = findElementWithText(jsx, SITE.title);
      expect(titleElement).toBeTruthy();

      // Find site description
      const descElement = findElementWithText(jsx, SITE.desc);
      expect(descElement).toBeTruthy();

      // Find hostname
      const hostnameElement = findElementWithText(
        jsx,
        new URL(SITE.website).hostname
      );
      expect(hostnameElement).toBeTruthy();
    });
  });
});

// Helper function to find elements containing specific text
function findElementWithText(element: any, text: string): any {
  if (!element || typeof element !== "object") return null;

  if (element.props?.children === text) return element;

  if (Array.isArray(element.props?.children)) {
    for (const child of element.props.children) {
      const found = findElementWithText(child, text);
      if (found) return found;
    }
  }

  if (typeof element.props?.children === "object") {
    return findElementWithText(element.props.children, text);
  }

  return null;
}
