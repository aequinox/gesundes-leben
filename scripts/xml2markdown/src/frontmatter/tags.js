import { ConversionError } from '../errors.js';

/**
 * Get array of decoded tag names
 * Filters category data to only include post_tag domain
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string[]} Array of tag names
 */
export default post => {
  if (!post.data.category) {
    return [];
  }

  try {
    return post.data.category
      .filter(category => category.$ && category.$.domain === 'post_tag')
      .map(({ _: name }) => decodeURIComponent(name));
  } catch (error) {
    throw new ConversionError('Failed to process post tags', error);
  }
};
