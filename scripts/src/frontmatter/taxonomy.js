const { ConversionError } = require('../errors');

/**
 * Get the first taxonomy term from beitragsart domain
 * Maps to one of the valid group values: 'pro', 'kontra', 'fragezeiten'
 * 
 * @param {import('../parser').Post} post - Post object
 * @returns {string} Taxonomy term or default value
 */
module.exports = post => {
  if (!post.data.category) {
    return "fragezeiten"; // Default value
  }

  try {
    const taxonomies = post.data.category
      .filter(category => category.$ && category.$.domain === 'beitragsart')
      .map(({ $: attributes }) => decodeURIComponent(attributes.nicename));
    
    // Get the first taxonomy or default to "fragezeiten"
    const taxonomy = taxonomies[0] || "fragezeiten";
    
    // Ensure it's one of the valid values
    const validGroups = ["pro", "kontra", "fragezeiten"];
    return validGroups.includes(taxonomy) ? taxonomy : "fragezeiten";
  } catch (error) {
    throw new ConversionError('Failed to process post taxonomy', error);
  }
};
