import type { Post } from '../parser';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique identifier for the post
 * Uses UUID v4 to ensure uniqueness across exports
 * 
 * @param {Post} post - Post object (unused)
 * @returns {string} Unique identifier
 */
export default function generateUniqueId(): string {
  return uuidv4();
}
