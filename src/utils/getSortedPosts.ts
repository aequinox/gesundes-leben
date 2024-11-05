import type { CollectionEntry } from "astro:content";
import { contentManager } from "./content";

/**
 * Sorts blog posts by modification or publication date (newest first).
 * Also adds reading time if not already calculated.
 * @param posts - An array of blog posts.
 * @returns A promise that resolves to a sorted array of blog posts.
 */
const sortPostsByDate = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return contentManager.posts.updateReadingTimes(
    posts.sort((a, b) => {
      return new Date(b.data.modDatetime || b.data.pubDatetime).getTime() -
        new Date(a.data.modDatetime || a.data.pubDatetime).getTime();
    })
  );
};

export default sortPostsByDate;
