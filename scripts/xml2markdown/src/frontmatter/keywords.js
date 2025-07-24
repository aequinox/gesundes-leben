import { ConversionError } from '../errors.js';

/**
 * Extract keywords from post tags and categories for Healthy Life blog
 * WordPress meta keywords or fallback to tags
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string[]} Array of keywords
 */
export default post => {
  try {
    const keywords = [];

    // First try to get keywords from WordPress meta
    if (post.data.postmeta) {
      const keywordsMeta = post.data.postmeta.find(
        meta => meta.meta_key[0] === '_yoast_wpseo_focuskw' || meta.meta_key[0] === 'keywords'
      );
      if (keywordsMeta && keywordsMeta.meta_value[0]) {
        const metaKeywords = keywordsMeta.meta_value[0]
          .split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => keyword.length > 0);
        keywords.push(...metaKeywords);
      }
    }

    // If no meta keywords found, extract from tags
    if (keywords.length === 0 && post.data.category) {
      const tags = post.data.category
        .filter(category => category.$ && category.$.domain === 'post_tag')
        .map(({ _: name }) => decodeURIComponent(name))
        .filter(tag => tag && tag.length > 0);
      
      keywords.push(...tags);
    }

    // If still no keywords, use categories as fallback
    if (keywords.length === 0 && post.data.category) {
      const categories = post.data.category
        .filter(category => category.$ && category.$.domain === 'category')
        .map(({ _: name }) => decodeURIComponent(name))
        .filter(cat => cat && cat.length > 0 && !['uncategorized', 'Uncategorized', 'Unkategorisiert'].includes(cat));
      
      keywords.push(...categories);
    }

    // Remove duplicates and return max 10 keywords
    return [...new Set(keywords)].slice(0, 10);
  } catch (error) {
    throw new ConversionError('Failed to process post keywords', error);
  }
};