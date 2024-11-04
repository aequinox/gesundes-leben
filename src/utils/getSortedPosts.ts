import type { CollectionEntry } from "astro:content";
import addReadingTimeToPosts from "./getPostsWithRT";

/**
 * Sorts blog posts by modification or publication date (newest first).
 * @param posts - An array of blog posts.
 * @returns A promise that resolves to a sorted array of blog posts.
 */
const sortPostsByDate = async (
  posts: CollectionEntry<"blog">[]
): Promise<CollectionEntry<"blog">[]> => {
  const postsWithReadingTime = await addReadingTimeToPosts(posts);

  return postsWithReadingTime
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default sortPostsByDate;
