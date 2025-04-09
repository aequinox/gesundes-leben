import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get post slug from meta
 * The slug is previously decoded and set on post.meta by the parser
 * 
 * @param {Post} post - Post object
 * @returns {string} Post slug
 * @throws {ConversionError} When slug is missing
 */
export default function getSlug(post: Post): string {
  if (!post.meta.slug) {
    throw new ConversionError('Post slug is missing');
  }

  return post.meta.slug;
}