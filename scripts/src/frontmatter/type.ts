import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get post type
 * Common values are "post" and "page", but custom post types are also possible
 * This value is already validated by the parser's getPostTypes function
 * 
 * @param {Post} post - Post object
 * @returns {string} Post type
 * @throws {ConversionError} When post type is missing
 */
export default function getType(post: Post): string {
  if (!post.data.post_type || !post.data.post_type[0]) {
    throw new ConversionError('Post type is missing');
  }

  return post.data.post_type[0];
}