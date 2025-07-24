const { ConversionError } = require('../errors');

/**
 * Get array of decoded taxonomy terms
 * Filters category data to only include beitragsart domain
 * Uses nicename attribute instead of name
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string[]} Array of taxonomy terms
 */
module.exports = post => {
  if (!post.data.category) {
    return [];
  }

  try {
    return post.data.category
      .filter(category => category.$ && category.$.domain === 'beitragsart')
      .map(({ $: attributes }) => decodeURIComponent(attributes.nicename));
  } catch (error) {
    throw new ConversionError('Failed to process post taxonomy', error);
  }
};
