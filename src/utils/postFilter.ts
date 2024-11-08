import { SITE } from "@/config";
import type { CollectionEntry } from "astro:content";

/**
 * Filters blog posts based on draft status and publication date.
 * @param post - The blog post to filter.
 * @returns True if the post should be included, false otherwise.
 */
const filterBlogPosts = ({ data }: CollectionEntry<"blog">): boolean => {
  const frontmatter = data;
  return (
    import.meta.env.DEV ||
    (!frontmatter.draft &&
      frontmatter.pubDatetime?.getTime() <=
        Date.now() - SITE.scheduledPostMargin)
  );
};

export default filterBlogPosts;
