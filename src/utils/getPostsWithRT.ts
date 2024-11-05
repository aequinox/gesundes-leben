import type { CollectionEntry } from "astro:content";
import { contentManager } from "./content";

/**
 * Adds reading time data to an array of blog posts.
 * @param posts - An array of blog posts.
 * @returns An array of blog posts with reading time data added.
 */
const addReadingTimeToPosts = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  return contentManager.posts.updateReadingTimes(posts);
};

export default addReadingTimeToPosts;
