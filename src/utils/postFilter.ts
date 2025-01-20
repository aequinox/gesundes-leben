import { SITE } from "@/config";
import type { CollectionEntry } from "astro:content";

/**
 * Filters blog posts based on draft status and publication date.
 *
 * @param {CollectionEntry<"blog">} post - The blog post to filter.
 * @returns {boolean} True if the post should be included, false otherwise.
 */
const filterBlogPosts = ({ data }: CollectionEntry<"blog">): boolean => {
  const isDevelopment = import.meta.env.DEV;
  const { draft, pubDatetime } = data;

  if (!pubDatetime) {
    return false;
  }

  return (
    isDevelopment ||
    (!draft && pubDatetime.getTime() <= Date.now() + SITE.scheduledPostMargin)
  );
};

export default filterBlogPosts;
