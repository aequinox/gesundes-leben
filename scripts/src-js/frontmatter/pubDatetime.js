const { ConversionError } = require('../errors');
const { formatDate } = require('./utils/dateFormatter');

/**
 * Get post publication date/time
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Formatted publication date
 * @throws {ConversionError} When date parsing fails
 */
module.exports = post => {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post publication date is missing');
  }

  return formatDate(post.data.pubDate[0], 'publication date');
};
