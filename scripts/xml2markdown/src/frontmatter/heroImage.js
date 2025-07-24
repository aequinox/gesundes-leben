/**
 * Get hero image object from post meta for Healthy Life blog
 * Returns object with src and alt properties matching blog schema
 * This relies on special logic executed by the parser that sets post.meta.coverImage
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {Object|undefined} Hero image object with src and alt, or undefined if no image
 */
export default post => {
  if (!post.meta.coverImage) {
    return undefined;
  }

  // Extract alt text from WordPress attachment data if available
  let altText = '';
  
  if (post.data.postmeta && post.meta.coverImageId) {
    const altMeta = post.data.postmeta.find(
      meta => meta.meta_key[0] === '_wp_attachment_image_alt' && meta.post_id === post.meta.coverImageId
    );
    if (altMeta && altMeta.meta_value[0]) {
      altText = decodeURIComponent(altMeta.meta_value[0]);
    }
  }

  // If no alt text found, try to get from image filename or post title
  if (!altText) {
    // Try to extract meaningful alt text from filename
    const filename = post.meta.coverImage;
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/\d+x\d+/g, '') // Remove dimensions like "300x300"
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleanName && cleanName.length > 3) {
      altText = cleanName;
    } else if (post.data.title && post.data.title[0]) {
      // Fallback to post title
      altText = `Beitragsbild für: ${post.data.title[0]}`;
    } else {
      altText = 'Beitragsbild';
    }
  }

  return {
    src: `./images/${post.meta.coverImage}`,
    alt: altText
  };
};