import * as luxon from "luxon";

import { XmlConversionError } from "../../errors.js";
import logger from "../../logger.js";
import * as settings from "../../settings.js";

/**
 * Format a date from RFC2822 format according to settings
 */
function formatDate(dateStr: string, fieldName: string): string {
  try {
    // Try RFC2822 format first (WordPress default)
    let dateTime = luxon.DateTime.fromRFC2822(dateStr, {
      zone: settings.custom_date_timezone,
    });

    // If RFC2822 fails, try ISO format
    if (!dateTime.isValid) {
      dateTime = luxon.DateTime.fromISO(dateStr, {
        zone: settings.custom_date_timezone,
      });
    }

    // If both fail, try parsing as SQL datetime
    if (!dateTime.isValid) {
      dateTime = luxon.DateTime.fromSQL(dateStr, {
        zone: settings.custom_date_timezone,
      });
    }

    // If all parsing attempts fail, use current date as fallback
    if (!dateTime.isValid) {
      logger.warn(
        `Invalid ${fieldName} format: ${dateStr}. Using current date as fallback.`
      );
      dateTime = luxon.DateTime.now();
    }

    if (settings.custom_date_formatting) {
      return dateTime.toFormat(settings.custom_date_formatting);
    }
    if (settings.include_time_with_date) {
      return dateTime.toISO();
    }
    return dateTime.toISODate();
  } catch (error) {
    if (error instanceof XmlConversionError) {
      throw error;
    }
    throw new XmlConversionError(`Failed to process ${fieldName}`, {
      field: fieldName,
      originalError: error,
    });
  }
}

export { formatDate };
