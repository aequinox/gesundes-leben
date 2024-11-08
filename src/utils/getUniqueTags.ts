import { slugifyStr } from "@/utils/slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "@/utils/postFilter";

/**
 * Extracts and returns unique tags from a list of blog posts.
 * @param posts - An array of blog posts.
 * @returns An array of unique tags.  Each tag object contains the slugified tag and the original tag name.
 */
const extractUniqueTags = (
  posts: CollectionEntry<"blog">[]
): {
  tag: string;
  tagName: string;
}[] => {
  const uniqueTags = new Set<string>();
  return posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .map(tag => {
      const slugifiedTag = slugifyStr(tag);
      uniqueTags.add(slugifiedTag);
      return { tag: slugifiedTag, tagName: tag };
    })
    .sort((a, b) => a.tag.localeCompare(b.tag));
};

export default extractUniqueTags;
