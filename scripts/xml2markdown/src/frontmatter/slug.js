import { ConversionError } from '../errors.js';

/**
 * Get post slug from meta
 * The slug is previously decoded and set on post.meta by the parser
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Post slug
 * @throws {ConversionError} When slug is missing
 */
export default post => {
  if (!post.meta.slug) {
    throw new ConversionError('Post slug is missing');
  }

  return post.meta.slug;
};
