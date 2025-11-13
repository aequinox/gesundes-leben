import { SITE } from "@/config";

import type { Post } from "./types";

/**
 * Filters blog posts based on draft status and publication time
 *
 * Determines if a post should be displayed based on:
 * - Draft status: Excludes draft posts in production
 * - Scheduled publishing: Respects post publication time with margin
 * - Development mode: Shows all posts in development
 *
 * @param post - The blog post to filter
 * @returns true if the post should be displayed, false otherwise
 */
const postFilter = ({ data }: Post): boolean => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
