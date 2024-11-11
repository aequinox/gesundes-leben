import type { ImageMetadata } from "astro";

export interface BookData {
  title: string;
  author: string;
  description: string;
  isbn?: string;
  url?: string;
  bookCover?: ImageMetadata;
  publishYear?: number;
  rating: 1 | 2 | 3 | 4 | 5;
  category?: string[];
  featured?: boolean;
}

export type BookTippProps = BookData & {
  class?: string;
};
