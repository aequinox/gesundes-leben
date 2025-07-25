import { v4 as uuidv4 } from "uuid";

import type { Post, FrontmatterGetter } from "../types.js";

/**
 * Generate a unique identifier for the post
 * Uses UUID v4 to ensure uniqueness across exports
 */
const idGetter: FrontmatterGetter = (_post: Post): string => {
  return uuidv4();
};

export default idGetter;

/* Alternative implementation using WordPress post ID:
module.exports = (post) => {
  if (!post.data.post_id?.[0]) {
    throw new ConversionError("Post ID is missing");
  }
  return post.data.post_id[0];
};
*/
