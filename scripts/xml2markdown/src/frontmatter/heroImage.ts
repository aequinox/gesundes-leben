import type { Post } from "../types.js";

// Note: generateImageVariableName available in translator.ts if needed for image variable generation

/**
 * Get hero image object from post meta for Healthy Life blog
 * Returns object with src and alt properties matching blog schema
 * Uses imported image variable instead of string path for Astro compatibility
 */
export default (post: Post): { src: string; alt: string } | undefined => {
  if (!post.meta.coverImage) {
    return undefined;
  }

  // Determine the actual filename to use (AI-enhanced or original)
  let actualFilename = post.meta.coverImage;
  let altText = "";

  // Check if we have AI-enhanced metadata for this image
  if (post.meta.aiImageMetadata) {
    // First try to find URL by enhanced filename
    let heroImageUrl = post.meta.imageUrls.find(
      (url: string) =>
        url.endsWith(post.meta.coverImage || "") ||
        url.includes(post.meta.coverImage || "")
    );

    // If not found, try to find by matching AI-enhanced filename in metadata
    if (!heroImageUrl) {
      for (const [url, metadata] of post.meta.aiImageMetadata.entries()) {
        if (metadata.filename === post.meta.coverImage) {
          heroImageUrl = url;
          break;
        }
      }
    }

    if (heroImageUrl && post.meta.aiImageMetadata.has(heroImageUrl)) {
      const aiMetadata = post.meta.aiImageMetadata.get(heroImageUrl);
      if (aiMetadata) {
        altText = aiMetadata.altText;
        actualFilename = aiMetadata.filename; // Use AI-enhanced filename
      }
    }
  }

  // Note: Variable name generation available via generateImageVariableName(actualFilename) if needed

  // Fallback to WordPress attachment data if no AI alt text
  if (!altText && post.data.postmeta && post.meta.coverImageId) {
    const altMeta = post.data.postmeta.find(
      meta =>
        meta.meta_key[0] === "_wp_attachment_image_alt" &&
        (meta as unknown as { post_id?: string }).post_id ===
          post.meta.coverImageId
    );
    if (altMeta && altMeta.meta_value[0]) {
      altText = decodeURIComponent(altMeta.meta_value[0]);
    }
  }

  // If still no alt text found, generate from filename or post title
  if (!altText) {
    // Try to extract meaningful alt text from actual filename
    const nameWithoutExt = actualFilename.replace(/\.[^/.]+$/, ""); // Remove extension
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
      .replace(/\d+x\d+/g, "") // Remove dimensions like "300x300"
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    if (cleanName && cleanName.length > 3) {
      altText = cleanName;
    } else if (post.data.title && post.data.title[0]) {
      // Fallback to post title
      altText = `Beitragsbild für: ${post.data.title[0]}`;
    } else {
      altText = "Beitragsbild";
    }
  }

  return {
    src: `./images/${actualFilename}`, // Use path to AI-enhanced filename
    alt: altText,
  };
};
