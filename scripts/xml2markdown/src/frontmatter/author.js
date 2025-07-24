const { ConversionError } = require('../errors');

/**
 * Get the author slug from the post creator
 * WordPress doesn't allow special characters in usernames, so no decoding needed
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Author slug
 * @throws {ConversionError} When creator data is missing
 */
module.exports = post => {
  if (!post.data.creator || !post.data.creator[0]) {
    throw new ConversionError('Post creator data is missing');
  }

  return post.data.creator[0] === 'SPfeiffer' ? 'sandra-pfeiffer' : 'kai-renner';
};
