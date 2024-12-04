import { defineCollection, reference, z } from "astro:content";
import { CATEGORIES, GROUPS } from "@/data/taxonomies";
import { SITE } from "@/config";
import { file } from "astro/loaders";

export interface AuthorReference {
  slug: string;
  collection: "authors";
}

export interface ImageReference {
  alt: string;
  src: ImageMetadata;
}

const authors = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      avatar: z.union([image(), z.string()]).optional(),
    }),
});

const glossary = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.union([z.string(), reference("authors")]).default(SITE.author),
    pubDatetime: z.coerce.date(),
    modDatetime: z.coerce.date().optional(),
  }),
});

const favorites = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    manufacturer: z.string(),
    category: z.enum(["Basis", "Premium", "Profi"]).optional(),
    descriptions: z.array(z.string()),
    url: z.string(),
  }),
});

const references = defineCollection({
  type: "data",
  // loader: file("src/content/references/references.json", {
  //   parser: text => JSON.parse(text).references,
  // }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number(),
    journal: z.string().optional(),
    volume: z.number().optional(),
    issue: z.number().optional(),
    pages: z.string().optional(),
    url: z.string().optional(),
    doi: z.string().optional(),
    pmid: z.string().optional(),
    slug: z.string(),
  }),
});

const books = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      description: z.string(),
      isbn: z.string().optional(),
      url: z.string(),
      bookCover: image().optional(),
      publishYear: z.number().optional(),
      rating: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
      category: z.array(z.string()).default(["Selbstentwicklung"]),
      featured: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.union([z.string(), reference("authors")]).default(SITE.author),
      heroImage: z.object({
        src: image(),
        alt: z.string(),
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
      references: z.array(reference("references")).optional(),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      readingTime: z.number().optional(),
    }),
});

export const collections = {
  authors,
  blog,
  books,
  favorites,
  glossary,
  references,
};
