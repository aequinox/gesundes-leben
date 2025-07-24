const settings = require('../settings');
const { ConversionError } = require('../errors');

/**
 * Get array of decoded category names, filtered as specified in settings
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string[]} Array of category names
 */
module.exports = post => {
  if (!post.data.category) {
    return [];
  }

  try {
    const categories = post.data.category
      .filter(category => category.$ && category.$.domain === 'category')
      .map(({ _: name }) => decodeURIComponent(name));

    return categories.filter(category => !settings.filter_categories.includes(category));
  } catch (error) {
    throw new ConversionError('Failed to process post categories', error);
  }
};
