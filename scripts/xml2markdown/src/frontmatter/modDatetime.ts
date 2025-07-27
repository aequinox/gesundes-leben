import { XmlValidationError } from "../errors.js";
import type { Post } from "../types.js";

import { formatDate } from "./utils/dateFormatter.js";

/**
 * Get post modification date/time
 * Uses publication date as WordPress doesn't reliably store modification dates
 */
export default (post: Post): string => {
  if (!post.data.pubDate?.[0]) {
    throw new XmlValidationError("Post modification date is missing", {
      field: "modDate",
    });
  }

  return formatDate(post.data.pubDate[0], "modification date");
};
