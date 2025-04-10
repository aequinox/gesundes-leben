import type { Post } from '../parser';
import { ConversionError } from '../errors';
import { filter_categories } from '../settings';
import he from 'he';

/**
 * Get array of decoded category names, filtered as specified in settings
 * 
 * @param {Post} post - Post object
 * @returns {string[]} Array of category names
 */
export default function getCategories(post: Post): string[] {
  if (!post.data.category) {
    return [];
  }

  try {
    const categories = post.data.category
      .filter((category: { $: { domain: string } }) => category.$ && category.$.domain === 'category')
      .map(({ _: name }: { _: string }) => {
        // First decode URL encoding, then decode HTML entities
        const urlDecoded = decodeURIComponent(name);
        return he.decode(urlDecoded);
      });

    return categories.filter((category: string) => !filter_categories.includes(category));
  } catch (error) {
    throw new ConversionError('Failed to process post categories', error);
  }
}
