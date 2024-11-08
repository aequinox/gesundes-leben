import { getCollection, type CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll, slugifyStr } from "./slugify";

const getPostsBy = async (
  posts: CollectionEntry<"blog">[],
  type: "tags" | "categories" | "group",
  value: string
): Promise<CollectionEntry<"blog">[]> =>
  await getSortedPosts(
    // posts.filter(post => slugify(post.data[type]).includes(value))
    type === "group"
      ? posts.filter(post => slugifyStr(post.data[type]).includes(value))
      : posts.filter(post => slugifyAll(post.data[type]).includes(value))
  );

export const getPostsByCategory = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "categories", value);
};

export const getPostsByGroup = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "group", value);
};

export const getAllPostsByGroup = async (
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return await getPostsBy(posts, "group", value);
};

export const getPostsByTag = async (
  posts: CollectionEntry<"blog">[],
  value: string
): Promise<CollectionEntry<"blog">[]> => {
  return await getPostsBy(posts, "tags", value);
};
