import { ConversionError } from '../errors.js';

/**
 * Get post title
 * Note: Title is not decoded like other frontmatter string fields
 * because WordPress stores titles with HTML entities already decoded
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Post title
 * @throws {ConversionError} When title is missing
 */
export default post => {
  if (!post.data.title || !post.data.title[0]) {
    throw new ConversionError('Post title is missing');
  }

  return post.data.title[0];
};
