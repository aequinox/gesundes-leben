import { ConversionError } from "../errors.js";
import type { Post } from "../types.js";

/**
 * Get post featured status
 * Returns true if post is sticky (featured)
 */
export default (post: Post): boolean => {
  // If is_sticky property doesn't exist, post is not featured
  if (!post.data.is_sticky) {
    return false;
  }

  try {
    return post.data.is_sticky[0] !== "0";
  } catch (error) {
    throw new ConversionError(
      "Failed to process post featured status",
      error as Record<string, unknown>
    );
  }
};
