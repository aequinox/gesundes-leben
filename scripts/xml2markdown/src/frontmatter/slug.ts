import { ConversionError } from "../errors.js";
import type { Post } from "../types.js";

/**
 * Get post slug from meta
 * The slug is previously decoded and set on post.meta by the parser
 */
export default (post: Post): string => {
  if (!post.meta.slug) {
    throw new ConversionError("Post slug is missing");
  }

  return post.meta.slug;
};
