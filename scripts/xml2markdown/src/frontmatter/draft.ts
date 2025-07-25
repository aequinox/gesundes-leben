import { XmlConversionError } from "../errors.js";
import type { Post } from "../types.js";

/**
 * Get post draft status
 * Returns true if post status is not "publish"
 */
export default (post: Post): boolean => {
  if (!post.data.status || !post.data.status[0]) {
    throw new XmlConversionError("Post status is missing");
  }

  return post.data.status[0] !== "publish";
};
