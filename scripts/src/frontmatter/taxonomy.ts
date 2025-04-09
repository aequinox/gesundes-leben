import type { Post } from '../parser';
import { ConversionError } from '../errors';

/**
 * Get the first taxonomy term from beitragsart domain
 * Maps to one of the valid group values: 'pro', 'kontra', 'fragezeiten'
 * 
 * @param {Post} post - Post object
 * @returns {string} Taxonomy term or default value
 */
export default function getTaxonomy(post: Post): string {
  if (!post.data.category) {
    return "fragezeiten"; // Default value
  }

  try {
    const taxonomies = post.data.category
      .filter((category: { $: { domain: string } }) => category.$ && category.$.domain === 'beitragsart')
      .map(({ $: attributes }: { $: { nicename: string } }) => decodeURIComponent(attributes.nicename));
    
    // Get the first taxonomy or default to "fragezeiten"
    const taxonomy = taxonomies[0] || "fragezeiten";
    
    // Ensure it's one of the valid values
    const validGroups = ["pro", "kontra", "fragezeiten"];
    return validGroups.includes(taxonomy) ? taxonomy : "fragezeiten";
  } catch (error) {
    throw new ConversionError('Failed to process post taxonomy', error);
  }
}