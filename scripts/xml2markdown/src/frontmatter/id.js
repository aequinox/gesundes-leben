import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique identifier for the post
 * Uses UUID v4 to ensure uniqueness across exports
 *
 * @param {import('../parser').Post} post - Post object (unused)
 * @returns {string} Unique identifier
 */
export default () => {
  return uuidv4();
};

/* Alternative implementation using WordPress post ID:
module.exports = (post) => {
  if (!post.data.post_id || !post.data.post_id[0]) {
    throw new ConversionError("Post ID is missing");
  }
  return post.data.post_id[0];
};
*/
