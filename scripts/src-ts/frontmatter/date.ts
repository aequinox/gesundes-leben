import type { Post } from '../parser';
import { ConversionError } from '../errors';
import { format, parseISO, parse, isValid } from 'date-fns';
import { custom_date_formatting, include_time_with_date } from '../settings';

/**
 * Get formatted post date
 * This value is used for year/month folders, date prefixes, etc. as needed
 * 
 * @param {Post} post - Post object
 * @returns {string} Formatted date string
 * @throws {ConversionError} When date parsing fails
 */
export default function getDate(post: Post): string {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post publication date is missing');
  }

  try {
    const dateStr = post.data.pubDate[0];
    
    // Try to parse the date as ISO first
    let dateTime = parseISO(dateStr);
    
    // If ISO parsing fails, try RFC2822 format (WordPress export format)
    if (!isValid(dateTime)) {
      // RFC2822 format example: "Fri, 28 Mar 2025 13:00:16 +0000"
      // Try to parse with a pattern that matches this format
      try {
        dateTime = parse(dateStr, 'EEE, dd MMM yyyy HH:mm:ss xxxx', new Date());
      } catch (parseError) {
        // If that fails too, try another common WordPress format
        try {
          dateTime = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
        } catch (parseError2) {
          // If all parsing attempts fail, throw an error
          throw new ConversionError(`Invalid date format: ${dateStr}`);
        }
      }
    }

    if (!isValid(dateTime)) {
      throw new ConversionError(`Invalid date format: ${dateStr}`);
    }

    if (custom_date_formatting) {
      return format(dateTime, custom_date_formatting);
    } else if (include_time_with_date) {
      return format(dateTime, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX');
    } else {
      return format(dateTime, 'yyyy-MM-dd');
    }
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw new ConversionError('Failed to process post date', error);
  }
}
