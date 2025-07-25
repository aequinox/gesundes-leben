import { ConversionError } from "../errors.js";
import type { Post, FrontmatterGetter } from "../types.js";

/**
 * Get the author slug from the post creator
 * WordPress doesn't allow special characters in usernames, so no decoding needed
 * @throws {ConversionError} When creator data is missing
 */
const authorGetter: FrontmatterGetter = (post: Post): string => {
  if (!post.data.creator || !post.data.creator[0]) {
    throw new ConversionError("Post creator data is missing");
  }

  return post.data.creator[0] === "SPfeiffer"
    ? "sandra-pfeiffer"
    : "kai-renner";
};

export default authorGetter;
