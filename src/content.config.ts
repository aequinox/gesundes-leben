import { glob } from "astro/loaders";

import { defineCollection, reference, z } from "astro:content";

import { SITE } from "@/config";
import { CATEGORIES, GROUPS } from "@/utils/types";

export const BLOG_PATH = "src/data/blog";

const PATHS: Record<string, string> = {
  books: "src/data/books",
  blog: "src/data/blog",
  authors: "src/data/authors",
  glossary: "src/data/glossary",
  favorites: "src/data/favorites",
  references: "src/data/references",
};

const authors = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: PATHS.authors }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1, "Name cannot be empty"),
      bio: z.string().min(10, "Bio must be at least 10 characters"),
      avatar: z.union([image(), z.string()]).optional(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: PATHS.blog }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.union([z.string(), reference("authors")]).default(SITE.author),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().optional(),
      keywords: z.array(z.string()).default([""]),
      featured: z.boolean().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default(["others"]),
      categories: z.array(z.enum(CATEGORIES)),
      group: z.enum(GROUPS),
      heroImage: z.object({
        src: image(),
        alt: z.string().default("Featured Image"),
        // .min(1, "Image alt text cannot be empty"),
      }),
      ogImage: image().or(z.string()).optional(),
      canonicalURL: z.string().optional(),
      timezone: z.string().optional(),
      readingTime: z
        .number()
        .positive("Reading time must be positive")
        .optional(),
      references: z.array(z.string()).default([]),
    }),
});

const glossary = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: PATHS.glossary }),
  schema: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    author: z.union([z.string(), reference("authors")]).default(SITE.author),
    pubDatetime: z.coerce.date(),
    modDatetime: z.coerce.date().optional(),
  }),
});

const favorites = defineCollection({
  loader: glob({ pattern: "**/[^_]*.yaml", base: PATHS.favorites }),
  schema: z.object({
    name: z.string().min(1, "Name cannot be empty"),
    manufacturer: z.string().min(1, "Manufacturer cannot be empty"),
    category: z.enum(["Basis", "Premium", "Profi"]).optional(),
    descriptions: z
      .array(z.string())
      .min(1, "At least one description is required"),
    url: z.string().url("Invalid URL format"),
  }),
});

const references = defineCollection({
  loader: glob({ pattern: "**/[^_]*.yaml", base: PATHS.references }),
  schema: z.object({
    type: z.enum(["journal", "website", "book", "report", "other"]),
    title: z.string().min(1, "Title cannot be empty"),
    authors: z.array(z.string()),
    year: z.number(),
    // Journal-specific fields
    journal: z.string().optional(),
    volume: z.number().optional(),
    issue: z.union([z.number(), z.string()]).optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    // Book-specific fields
    publisher: z.string().optional(),
    location: z.string().optional(),
    edition: z.string().optional(),
    isbn: z.string().optional(),
    // Common fields
    url: z.string().url("Invalid URL format").optional(),
    pmid: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    abstract: z.string().optional(),
  }),
});

export const collections = { authors, blog, favorites, glossary, references };
