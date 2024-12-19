/**
 * Content Collections Configuration
 * This file defines the schema and configuration for all content collections in the project.
 * @module content/config
 */

import { defineCollection, reference, z } from "astro:content";
import { CATEGORIES, GROUPS } from "../data/taxonomies";
import { SITE } from "../config";
import type { ImageMetadata } from "astro";

// Type definitions
/**
 * Represents a reference to an author in the content collection
 * @interface AuthorReference
 */
export interface AuthorReference {
  slug: string;
  collection: "authors";
}

/**
 * Represents an image with metadata and alt text
 * @interface ImageReference
 */
export interface ImageReference {
  alt: string;
  src: ImageMetadata;
}

// Schema Constants
const RATING_VALUES = ["1", "2", "3", "4", "5"] as const;
type Rating = (typeof RATING_VALUES)[number];
const DEFAULT_CATEGORY = ["Selbstentwicklung"];

// Collection Schemas
/**
 * Authors collection schema
 * Defines the structure for author content
 */
const authors = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1, "Name cannot be empty"),
      bio: z.string().min(10, "Bio must be at least 10 characters"),
      avatar: z.union([image(), z.string()]).optional(),
    }),
});

/**
 * Glossary collection schema
 * Defines the structure for glossary entries
 */
const glossary = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    author: z.union([z.string(), reference("authors")]).default(SITE.author),
    pubDatetime: z.coerce.date(),
    modDatetime: z.coerce.date().optional(),
  }),
});

/**
 * Favorites collection schema
 * Defines the structure for favorite items/products
 */
const favorites = defineCollection({
  type: "data",
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

/**
 * References collection schema
 * Defines the structure for academic/research references
 */
const references = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    authors: z.array(z.string()).min(1, "At least one author is required"),
    year: z.number().min(1000).max(new Date().getFullYear()),
    journal: z.string().optional(),
    volume: z.number().positive("Volume must be a positive number").optional(),
    issue: z.number().positive("Issue must be a positive number").optional(),
    pages: z
      .string()
      .regex(/^\d+(-\d+)?$/, "Invalid page format (e.g., '1-10' or '5')")
      .optional(),
    url: z.string().url("Invalid URL format").optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,}\/\S+$/, "Invalid DOI format")
      .optional(),
    pmid: z.string().regex(/^\d+$/, "PMID must be a number").optional(),
    keywords: z.array(z.string()).optional(),
    abstract: z.string().optional(),
    slug: z.string().min(1, "Slug cannot be empty"),
  }),
});

/**
 * Books collection schema
 * Defines the structure for book entries
 */
const books = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1, "Title cannot be empty"),
      author: z.string().min(1, "Author cannot be empty"),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      isbn: z
        .string()
        .regex(/^(?:\d{9}X|\d{10}|\d{13})$/, "Invalid ISBN format")
        .optional(),
      url: z.string().url("Invalid URL format"),
      bookCover: image().optional(),
      publishYear: z
        .number()
        .min(1000)
        .max(new Date().getFullYear())
        .optional(),
      rating: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
      // rating: z.enum(RATING_VALUES),
      category: z.array(z.string()).default(DEFAULT_CATEGORY),
      featured: z.boolean().default(false),
    }),
});

/**
 * Blog collection schema
 * Defines the structure for blog posts
 */
const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1, "Title cannot be empty"),
      author: z.union([z.string(), reference("authors")]).default(SITE.author),
      heroImage: z.object({
        src: image(),
        alt: z.string().default("Featured Image"),
        // .min(1, "Image alt text cannot be empty"),
      }),
      pubDatetime: z.coerce.date(),
      modDatetime: z.coerce.date().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default(["others"]),
      categories: z.array(z.enum(CATEGORIES)),
      group: z.enum(GROUPS),
      books: z.record(z.string(), z.array(reference("books"))).optional(),
      favorites: z
        .record(z.string(), z.array(reference("favorites")))
        .optional(),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
      canonicalURL: z.string().url("Invalid URL format").optional(),
      readingTime: z
        .number()
        .positive("Reading time must be positive")
        .optional(),
    }),
});

/**
 * Export all content collections
 * @exports collections
 */
export const collections = {
  authors,
  blog,
  books,
  favorites,
  glossary,
  references,
} as const;
