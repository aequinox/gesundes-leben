import * as luxon from "luxon";

import { XmlConversionError, XmlValidationError } from "../errors.js";
import * as settings from "../settings.js";
import type { Post } from "../types.js";

/**
 * Get formatted post date
 * This value is used for year/month folders, date prefixes, etc. as needed
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Formatted date string
 * @throws {ConversionError} When date parsing fails
 */
export default (post: Post): string => {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new XmlValidationError("Post publication date is missing", {
      field: "pubDate",
    });
  }

  try {
    const dateTime = luxon.DateTime.fromRFC2822(post.data.pubDate[0], {
      zone: settings.custom_date_timezone,
    });

    if (!dateTime.isValid) {
      throw new XmlValidationError(
        `Invalid date format: ${dateTime.invalidReason}`,
        { field: "pubDate", value: post.data.pubDate[0] }
      );
    }

    if (settings.custom_date_formatting) {
      return dateTime.toFormat(settings.custom_date_formatting);
    } else if (settings.include_time_with_date) {
      return dateTime.toISO();
    } else {
      return dateTime.toISODate();
    }
  } catch (error) {
    if (error instanceof XmlConversionError) {
      throw error;
    }
    throw new XmlConversionError("Failed to process post date", {
      originalError: error,
    });
  }
};
