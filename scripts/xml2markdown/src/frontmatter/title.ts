import { ConversionError } from "../errors.js";
import type { Post, FrontmatterGetter } from "../types.js";

/**
 * Get post title
 * Note: Title is not decoded like other frontmatter string fields
 * because WordPress stores titles with HTML entities already decoded
 * @throws {ConversionError} When title is missing
 */
const titleGetter: FrontmatterGetter = (post: Post): string => {
  if (!post.data.title || !post.data.title[0]) {
    throw new ConversionError("Post title is missing");
  }

  return post.data.title[0];
};

export default titleGetter;
