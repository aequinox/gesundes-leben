import type { Post } from '../parser';
import { ConversionError } from '../errors';
import { formatDate } from './utils/dateFormatter';

/**
 * Get post publication date/time
 * 
 * @param {Post} post - Post object
 * @returns {string} Formatted publication date
 * @throws {ConversionError} When date parsing fails
 */
export default function getPublicationDate(post: Post): string {
  if (!post.data.pubDate || !post.data.pubDate[0]) {
    throw new ConversionError('Post publication date is missing');
  }

  return formatDate(post.data.pubDate[0], 'publication date');
}