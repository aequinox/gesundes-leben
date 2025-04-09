import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get array of decoded tag names
 * Filters category data to only include post_tag domain
 * 
 * @param {Post} post - Post object
 * @returns {string[]} Array of tag names
 */
export default function getTags(post: Post): string[] {
  if (!post.data.category) {
    return [];
  }

  try {
    return post.data.category
      .filter((category: { $: { domain: string } }) => category.$ && category.$.domain === 'post_tag')
      .map(({ _: name }: { _: string }) => decodeURIComponent(name));
  } catch (error) {
    throw new ConversionError('Failed to process post tags', error);
  }
}