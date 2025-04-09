import type { Post } from '../parser';
import { ConversionError } from '../errors';
import { formatDate } from './utils/dateFormatter';

/**
 * Get post modification date/time
 * Uses publication date as WordPress doesn't reliably store modification dates
 * 
 * @param {Post} post - Post object
 * @returns {string} Formatted modification date
 * @throws {ConversionError} When date parsing fails
 */
export default function getModificationDate(post: Post): string {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post modification date is missing');
  }

  return formatDate(post.data.pubDate[0], 'modification date');
}