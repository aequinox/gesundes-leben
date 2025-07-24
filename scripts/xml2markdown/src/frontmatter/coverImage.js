/**
 * Get cover image filename from post meta
 * This relies on special logic executed by the parser that sets post.meta.coverImage
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string|undefined} Cover image filename if exists
 */
module.exports = post => {
  return post.meta.coverImage;
};
