const { ConversionError } = require('../errors');
const { formatDate } = require('./utils/dateFormatter');

/**
 * Get post modification date/time
 * Uses publication date as WordPress doesn't reliably store modification dates
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Formatted modification date
 * @throws {ConversionError} When date parsing fails
 */
module.exports = post => {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post modification date is missing');
  }

  return formatDate(post.data.pubDate[0], 'modification date');
};
