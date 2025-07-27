import { XmlValidationError } from "../errors.js";
import type { Post } from "../types.js";

import { formatDate } from "./utils/dateFormatter.js";

/**
 * Get post publication date/time
 */
export default (post: Post): string => {
  if (!post.data.pubDate?.[0]) {
    throw new XmlValidationError("Post publication date is missing", {
      field: "pubDate",
    });
  }

  return formatDate(post.data.pubDate[0], "publication date");
};
