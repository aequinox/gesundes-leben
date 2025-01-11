import { describe, expect, test, vi, beforeEach } from "vitest";
import { getAuthorEntry } from "../getAuthor";
import { contentManager } from "../content";
import type { Author } from "../content/types";

// Mock the contentManager.authors
vi.mock("../content", () => ({
  contentManager: {
    authors: {
      getAuthorEntry: vi.fn(),
    },
  },
}));

describe("getAuthorEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should handle string input", async () => {
    const mockAuthor: Author = {
      id: "test-author",
      slug: "test-author",
      body: "",
      collection: "authors",
      data: {
        name: "Test Author",
        bio: "Test bio",
      },
      render: vi.fn().mockResolvedValue({ code: "" }),
    };
    vi.mocked(contentManager.authors.getAuthorEntry).mockResolvedValue(
      mockAuthor
    );

    const result = await getAuthorEntry("test-author");

    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledWith(
      "test-author"
    );
    expect(result).toEqual(mockAuthor);
  });

  test("should handle object input", async () => {
    const authorRef = { collection: "authors" as const, id: "test-author" };
    const mockAuthor: Author = {
      id: "test-author",
      slug: "test-author",
      body: "",
      collection: "authors",
      data: {
        name: "Test Author",
        bio: "Test bio",
      },
      render: vi.fn().mockResolvedValue({ code: "" }),
    };
    vi.mocked(contentManager.authors.getAuthorEntry).mockResolvedValue(
      mockAuthor
    );

    const result = await getAuthorEntry(authorRef);

    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledWith(
      authorRef
    );
    expect(result).toEqual(mockAuthor);
  });

  test("should handle null response", async () => {
    vi.mocked(contentManager.authors.getAuthorEntry).mockResolvedValue(null);

    const result = await getAuthorEntry("non-existent");

    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledWith(
      "non-existent"
    );
    expect(result).toBeNull();
  });

  test("should handle errors", async () => {
    vi.mocked(contentManager.authors.getAuthorEntry).mockRejectedValue(
      new Error("Test error")
    );

    const result = await getAuthorEntry("error-case");

    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledWith(
      "error-case"
    );
    expect(result).toBeNull();
  });
});
