import { defineCollection, reference, z } from "astro:content";
import { CATEGORIES, GROUPS } from "@/data/taxonomies";
import { SITE } from "@/config";

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
    author: reference("authors"),
    pubDatetime: z.coerce.date(),
    modDatetime: z.coerce.date().optional().nullable(),
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

/**
 * Defines the schema for a blog collection with various content properties.
 *
 * Schema Fields:
 * - title: A string representing the post title.
 * - author: A union of string and author reference, defaults to SITE.author.
 * - heroImage: An object with image source and alt text.
 * - pubDatetime: The publication date coerced to a date object.
 * - modDatetime: An optional modification date.
 * - featured: An optional boolean indicating if the post is featured.
 * - draft: A boolean indicating if the post is a draft, defaults to false.
 * - tags: An array of strings for post tags, defaults to ["others"].
 * - categories: An array of category enums.
 * - group: A group enum value.
 * - favorites: An optional record mapping to arrays of favorite references.
 * - ogImage: An optional OpenGraph image, with size refinement or as a string.
 * - description: A string describing the post.
 * - canonicalURL: An optional string for the canonical URL.
 * - readingTime: An optional number indicating reading time in minutes.
 * - references: An optional array of references.
 *
 * The schema also applies a transformation to add "Drafts" or "Scheduled" tags
 * based on the draft status and publication date.
 */
const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        author: z.union([z.string(), reference("authors")]).default(SITE.author),
        heroImage: z.object({
          src: image(),
          alt: z.string(),
        }),
        pubDatetime: z.coerce.date(),
        modDatetime: z.coerce.date().optional(), //.nullable(),
        featured: z.boolean().optional(),
        draft: z.boolean().default(false),
        tags: z.array(z.string()).default(["others"]),
        categories: z.array(z.enum(CATEGORIES)),
        group: z.enum(GROUPS),
        favorites: z
          .record(z.string(), z.array(reference("favorites")))
          .optional(),
        ogImage: image()
          .refine(img => img.width >= 1200 && img.height >= 630, {
            message: "OpenGraph image must be at least 1200 X 630 pixels!",
          })
          .or(z.string())
          .optional(),
        description: z.string(),
        canonicalURL: z.string().optional(),
        readingTime: z.number().optional(),
        // references: z.array(reference("references")).optional(),
      })
      // .transform(obj => {
      //   // Add draft tag
      //   if (obj.draft == true) {
      //     obj.tags.push("Drafts");
      //   } else if (obj.pubDatetime > new Date()) {
      //     obj.tags.push("Scheduled");
      //   }
      //   return obj;
      // }),
});



export const collections = { authors, blog, favorites, glossary };
