import { ConversionError } from "../errors.js";
import type { Post } from "../types.js";

/**
 * Get post type
 * Common values are "post" and "page", but custom post types are also possible
 * This value is already validated by the parser's getPostTypes function
 */
export default (post: Post): string => {
  if (!post.data.post_type || !post.data.post_type[0]) {
    throw new ConversionError("Post type is missing");
  }

  return post.data.post_type[0];
};
