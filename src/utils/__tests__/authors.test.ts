/**
 * @file authors.test.ts
 * @description Tests for author utility functions
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

import { getAllAuthors, getAuthorEntry } from "../authors";

// Mock the astro:content module at the top level
vi.mock("astro:content", () => {
  const mockGetCollection = vi.fn();
  return {
    getCollection: mockGetCollection,
    getEntry: vi.fn().mockResolvedValue(null),
    render: vi.fn().mockResolvedValue({
      Content: () => null,
      remarkPluginFrontmatter: {},
    }),
  };
});

describe("Authors utilities", () => {
  const mockAuthors = [
    {
      id: "dr-mueller",
      slug: "dr-mueller",
      collection: "authors",
      data: {
        name: "Dr. Sarah Müller",
        email: "s.mueller@example.com",
        bio: "Ernährungsexpertin und Autorin",
        avatar: "/authors/dr-mueller.jpg",
        specialties: ["Ernährung", "Gesundheit"],
      },
    },
    {
      id: "prof-schmidt",
      slug: "prof-schmidt",
      collection: "authors",
      data: {
        name: "Prof. Dr. Klaus Schmidt",
        email: "k.schmidt@example.com",
        bio: "Medizinprofessor und Forscher",
        avatar: "/authors/prof-schmidt.jpg",
        specialties: ["Medizin", "Forschung"],
      },
    },
  ];

  interface MockedAstroContent {
    getCollection: ReturnType<typeof vi.fn>;
    getEntry: ReturnType<typeof vi.fn>;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked module and set up the return value
    const astroContent = (await vi.importMock("astro:content")) as unknown as MockedAstroContent;
    vi.mocked(astroContent.getCollection).mockResolvedValue(mockAuthors);
  });

  describe("getAllAuthors", () => {
    it("should return all authors", async () => {
      const authors = await getAllAuthors();

      expect(authors).toHaveLength(2);
      const astroContent = (await vi.importMock("astro:content")) as unknown as MockedAstroContent;
      expect(astroContent.getCollection).toHaveBeenCalledWith("authors");

      // Check that authors have expected properties
      authors.forEach(author => {
        expect(author).toHaveProperty("id");
        expect(author).toHaveProperty("data");
        expect(author.data).toHaveProperty("name");
        expect(author.data).toHaveProperty("email");
      });
    });

    it("should return authors with German names and specialties", async () => {
      const authors = await getAllAuthors();

      const germanAuthor = authors.find(a => a.id === "kai-renner");
      expect(germanAuthor?.data.name).toBe("Kai Renner");
      expect(germanAuthor?.data.bio).toContain("Homöopath");
    });
  });

  describe("getAuthorEntry", () => {
    it("should return the correct author by ID", async () => {
      // Mock getEntry to return specific author
      const astroContent = (await vi.importMock("astro:content")) as unknown as MockedAstroContent;
      vi.mocked(astroContent.getEntry).mockResolvedValue(mockAuthors[0]);

      const author = await getAuthorEntry("dr-mueller");

      expect(author).toBeDefined();
      expect(author?.id).toBe("dr-mueller");
      expect(author?.data.name).toBe("Dr. Sarah Müller");
    });

    it("should return null for non-existent author ID", async () => {
      const astroContent = (await vi.importMock("astro:content")) as unknown as MockedAstroContent;
      vi.mocked(astroContent.getEntry).mockResolvedValue(null);

      const author = await getAuthorEntry("non-existent");

      expect(author).toBeNull();
    });

    it("should handle empty or invalid IDs gracefully", async () => {
      const astroContent = (await vi.importMock("astro:content")) as unknown as MockedAstroContent;
      vi.mocked(astroContent.getEntry).mockResolvedValue(null);

      const emptyIdAuthor = await getAuthorEntry("");
      expect(emptyIdAuthor).toBeNull();
    });
  });
});
