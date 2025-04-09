import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get post excerpt with collapsed newlines
 * Replaces all consecutive newlines with a single space
 * 
 * @param {Post} post - Post object
 * @returns {string} Post excerpt with normalized whitespace
 * @throws {ConversionError} When post excerpt is missing
 */
export default function getExcerpt(post: Post): string {
  if (!post.data.encoded || !post.data.encoded[1]) {
    throw new ConversionError('Post excerpt is missing');
  }

  try {
    return post.data.encoded[1].replace(/[\r\n]+/gm, ' ');
  } catch (error) {
    throw new ConversionError('Failed to process post excerpt', error);
  }
}