import { ConversionError } from "../errors.js";
import type { Post } from "../types.js";

/**
 * Get post excerpt with collapsed newlines
 * Replaces all consecutive newlines with a single space
 */
export default (post: Post): string | undefined => {
  if (!post.data.encoded || !post.data.encoded[1]) {
    throw new ConversionError("Post excerpt is missing");
  }

  try {
    return post.data.encoded[1].replace(/[\r\n]+/gm, " ");
  } catch (error) {
    throw new ConversionError(
      "Failed to process post excerpt",
      error as Record<string, unknown>
    );
  }
};
