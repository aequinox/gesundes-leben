import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get post title
 * Note: Title is not decoded like other frontmatter string fields
 * because WordPress stores titles with HTML entities already decoded
 * 
 * @param {Post} post - Post object
 * @returns {string} Post title
 * @throws {ConversionError} When title is missing
 */
export default function getTitle(post: Post): string {
  if (!post.data.title || !post.data.title[0]) {
    throw new ConversionError('Post title is missing');
  }

  return post.data.title[0];
}