import * as luxon from 'luxon';
import { XmlConversionError } from '../../errors.js';
import * as settings from '../../settings.js';

/**
 * Format a date from RFC2822 format according to settings
 *
 * @param {string} dateStr - Date string in RFC2822 format
 * @param {string} fieldName - Name of the date field for error messages
 * @returns {string} Formatted date string
 * @throws {ConversionError} When date parsing fails
 */
function formatDate(dateStr, fieldName) {
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
      console.warn(`Invalid ${fieldName} format: ${dateStr}. Using current date as fallback.`);
      dateTime = luxon.DateTime.now();
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
    throw new XmlConversionError(`Failed to process ${fieldName}`, { field: fieldName, originalError: error });
  }
}

export { formatDate };
