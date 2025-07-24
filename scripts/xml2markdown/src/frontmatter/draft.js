const { ConversionError } = require('../errors');

/**
 * Get post draft status
 * Returns true if post status is not "publish"
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {boolean} Whether the post is a draft
 * @throws {ConversionError} When post status is missing
 */
module.exports = post => {
  if (!post.data.status || !post.data.status[0]) {
    throw new ConversionError('Post status is missing');
  }

  return post.data.status[0] !== 'publish';
};
