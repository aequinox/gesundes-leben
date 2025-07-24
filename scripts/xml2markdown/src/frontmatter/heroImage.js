/**
 * Generate variable name for image imports (matches translator.js logic)
 * @param {string} filename - Image filename
 * @returns {string} Variable name for import
 */
function generateImageVariableName(filename) {
  // Remove extension and clean up the filename
  const baseName = filename.replace(/\.[^/.]+$/, '');
  
  // Convert to camelCase and ensure it starts with a letter
  let varName = baseName
    .replace(/[^a-zA-Z0-9]/g, ' ') // Replace non-alphanumeric with spaces
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  // Ensure it starts with a letter (prepend 'img' if it starts with a number)
  if (/^[0-9]/.test(varName)) {
    varName = 'img' + varName.charAt(0).toUpperCase() + varName.slice(1);
  }
  
  // Fallback if empty
  if (!varName) {
    varName = 'blogImage';
  }
  
  return varName;
}

/**
 * Get hero image object from post meta for Healthy Life blog
 * Returns object with src and alt properties matching blog schema
 * Uses imported image variable instead of string path for Astro compatibility
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {Object|undefined} Hero image object with src and alt, or undefined if no image
 */
export default post => {
  if (!post.meta.coverImage) {
    return undefined;
  }

  // Determine the actual filename to use (AI-enhanced or original)
  let actualFilename = post.meta.coverImage;
  let altText = '';
  
  // Check if we have AI-enhanced metadata for this image
  if (post.meta.aiImageMetadata) {
    // Find the hero image URL in imageUrls and get AI metadata
    const heroImageUrl = post.meta.imageUrls.find(url => 
      url.endsWith(post.meta.coverImage) || url.includes(post.meta.coverImage)
    );
    
    if (heroImageUrl && post.meta.aiImageMetadata.has(heroImageUrl)) {
      const aiMetadata = post.meta.aiImageMetadata.get(heroImageUrl);
      altText = aiMetadata.altText;
      actualFilename = aiMetadata.filename; // Use AI-enhanced filename
    }
  }
  
  // Generate variable name for the actual filename (AI-enhanced or original)
  const heroImageVar = generateImageVariableName(actualFilename);
  
  // Fallback to WordPress attachment data if no AI alt text
  if (!altText && post.data.postmeta && post.meta.coverImageId) {
    const altMeta = post.data.postmeta.find(
      meta => meta.meta_key[0] === '_wp_attachment_image_alt' && meta.post_id === post.meta.coverImageId
    );
    if (altMeta && altMeta.meta_value[0]) {
      altText = decodeURIComponent(altMeta.meta_value[0]);
    }
  }

  // If still no alt text found, generate from filename or post title
  if (!altText) {
    // Try to extract meaningful alt text from actual filename
    const nameWithoutExt = actualFilename.replace(/\.[^/.]+$/, ''); // Remove extension
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
    src: `./images/${actualFilename}`,  // Use path to AI-enhanced filename
    alt: altText
  };
};