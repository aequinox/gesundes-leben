import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get post featured status
 * Returns true if post is sticky (featured)
 * 
 * @param {Post} post - Post object
 * @returns {boolean} Whether the post is featured
 */
export default function isFeatured(post: Post): boolean {
  // If is_sticky property doesn't exist, post is not featured
  if (!post.data.is_sticky) {
    return false;
  }

  try {
    return post.data.is_sticky[0] !== '0';
  } catch (error) {
    throw new ConversionError('Failed to process post featured status', error);
  }
}