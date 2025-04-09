import type { Post } from '../parser';

/**
 * Get cover image as an object with src and alt properties
 * This relies on special logic executed by the parser that sets post.meta.coverImage
 * 
 * @param {Post} post - Post object
 * @returns {{ src: string, alt: string } | undefined} Cover image object if exists
 */
export default function getCoverImage(post: Post): { src: string, alt: string } | undefined {
  if (!post.meta.coverImage) {
    return undefined;
  }

  return {
    src: `./images/${post.meta.coverImage}`,
    alt: post.frontmatter?.title || "Featured Image"
  };
}