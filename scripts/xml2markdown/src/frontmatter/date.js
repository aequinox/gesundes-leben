import * as luxon from 'luxon';
import { ConversionError } from '../errors.js';
import * as settings from '../settings.js';

/**
 * Get formatted post date
 * This value is used for year/month folders, date prefixes, etc. as needed
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Formatted date string
 * @throws {ConversionError} When date parsing fails
 */
export default post => {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post publication date is missing');
  }

  try {
    const dateTime = luxon.DateTime.fromRFC2822(post.data.pubDate[0], {
      zone: settings.custom_date_timezone,
    });

    if (!dateTime.isValid) {
      throw new ConversionError(`Invalid date format: ${dateTime.invalidReason}`);
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
    throw new ConversionError('Failed to process post date', error);
  }
};
