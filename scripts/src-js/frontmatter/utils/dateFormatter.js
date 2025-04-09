const luxon = require('luxon');
const { ConversionError } = require('../../errors');
const settings = require('../../settings');

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
    const dateTime = luxon.DateTime.fromRFC2822(dateStr, {
      zone: settings.custom_date_timezone,
    });

    if (!dateTime.isValid) {
      throw new ConversionError(`Invalid ${fieldName} format: ${dateTime.invalidReason}`);
    }

    if (settings.custom_date_formatting) {
      return dateTime.toFormat(settings.custom_date_formatting);
    } else if (settings.include_time_with_date) {
      return dateTime.toISO();
    } else {
      return dateTime.toISODate();
    }
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw new ConversionError(`Failed to process ${fieldName}`, error);
  }
}

module.exports = { formatDate };
