import type { Post } from '../parser';

/**
 * Example function to get and return what you want
 * 
 * @param {Post} post - Post object
 * @returns {string} Example return value
 */
export default function getExample(post: Post): string {
  return 'EXAMPLE: ' + post.data.title[0];
}