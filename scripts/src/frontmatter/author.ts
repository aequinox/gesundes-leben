import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get the author slug from the post creator
 * WordPress doesn't allow special characters in usernames, so no decoding needed
 * 
 * @param {Post} post - Post object
 * @returns {string} Author slug
 * @throws {ConversionError} When creator data is missing
 */
export default function getAuthor(post: Post): string {
  if (!post.data.creator || !post.data.creator[0]) {
    throw new ConversionError('Post creator data is missing');
  }

  return post.data.creator[0] === 'SPfeiffer' ? 'sandra-pfeiffer' : 'kai-renner';
}