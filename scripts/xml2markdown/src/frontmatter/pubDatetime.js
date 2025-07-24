import { XmlValidationError } from '../errors.js';
import { formatDate } from './utils/dateFormatter.js';

/**
 * Get post publication date/time
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Formatted publication date
 * @throws {ConversionError} When date parsing fails
 */
export default post => {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new XmlValidationError('Post publication date is missing', { field: 'pubDate' });
  }

  return formatDate(post.data.pubDate[0], 'publication date');
};
