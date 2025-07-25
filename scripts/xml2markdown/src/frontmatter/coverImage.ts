import type { Post } from "../types.js";

/**
 * Get cover image filename from post meta
 * This relies on special logic executed by the parser that sets post.meta.coverImage
 */
export default (post: Post): string | undefined => {
  return post.meta.coverImage;
};
