import { describe, expect, test, vi, beforeEach } from "vitest";
import { getAuthorEntry, getAuthorEntries } from "../getAuthor";
import { contentManager } from "../content";
import type { CollectionEntry } from "astro:content";

// Mock the contentManager.authors
vi.mock("../content", () => ({
  contentManager: {
    authors: {
      getAuthorEntry: vi.fn(),
    },
  },
}));

describe("getAuthorEntry", () => {
  const mockAuthor: CollectionEntry<"authors"> = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should handle string input", async () => {
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

describe("getAuthorEntries", () => {
  const mockAuthors: CollectionEntry<"authors">[] = [
    {
      id: "author1",
      slug: "author1",
      body: "",
      collection: "authors",
      data: { name: "Author One", bio: "Bio 1" },
      render: vi.fn().mockResolvedValue({ code: "" }),
    },
    {
      id: "author2",
      slug: "author2",
      body: "",
      collection: "authors",
      data: { name: "Author Two", bio: "Bio 2" },
      render: vi.fn().mockResolvedValue({ code: "" }),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should retrieve multiple authors with string inputs", async () => {
    vi.mocked(contentManager.authors.getAuthorEntry)
      .mockResolvedValueOnce(mockAuthors[0])
      .mockResolvedValueOnce(mockAuthors[1]);

    const result = await getAuthorEntries(["author1", "author2"]);

    expect(result).toEqual(mockAuthors);
    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledTimes(2);
  });

  test("should retrieve multiple authors with object inputs", async () => {
    const authorRefs = [
      { collection: "authors" as const, id: "author1" },
      { collection: "authors" as const, id: "author2" },
    ];

    vi.mocked(contentManager.authors.getAuthorEntry)
      .mockResolvedValueOnce(mockAuthors[0])
      .mockResolvedValueOnce(mockAuthors[1]);

    const result = await getAuthorEntries(authorRefs);

    expect(result).toEqual(mockAuthors);
    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledTimes(2);
  });

  test("should filter out null results", async () => {
    vi.mocked(contentManager.authors.getAuthorEntry)
      .mockResolvedValueOnce(mockAuthors[0])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockAuthors[1]);

    const result = await getAuthorEntries([
      "author1",
      "non-existent",
      "author2",
    ]);

    expect(result).toEqual([mockAuthors[0], mockAuthors[1]]);
    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledTimes(3);
  });

  test("should handle empty input array", async () => {
    const result = await getAuthorEntries([]);

    expect(result).toEqual([]);
    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledTimes(0);
  });

  test("should handle mixed input types", async () => {
    const mixedInputs = [
      "author1",
      { collection: "authors" as const, id: "author2" },
    ];

    vi.mocked(contentManager.authors.getAuthorEntry)
      .mockResolvedValueOnce(mockAuthors[0])
      .mockResolvedValueOnce(mockAuthors[1]);

    const result = await getAuthorEntries(mixedInputs);

    expect(result).toEqual(mockAuthors);
    expect(contentManager.authors.getAuthorEntry).toHaveBeenCalledTimes(2);
  });
});
