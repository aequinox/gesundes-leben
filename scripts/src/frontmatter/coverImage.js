/**
 * Get cover image as an object with src and alt properties
 * This relies on special logic executed by the parser that sets post.meta.coverImage
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {Object|undefined} Cover image object if exists
 */
module.exports = post => {
  if (!post.meta.coverImage) {
    return undefined;
  }
  
  return {
    src: `./images/${post.meta.coverImage}`,
    alt: post.frontmatter?.title || "Featured Image"
  };
};
