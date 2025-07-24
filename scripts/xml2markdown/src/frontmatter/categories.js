import * as settings from '../settings.js';
import { ConversionError } from '../errors.js';

/**
 * WordPress to Healthy Life blog category mapping
 * Maps WordPress categories to valid blog categories
 */
const CATEGORY_MAPPING = {
  // Direct mappings
  'ernährung': 'Ernährung',
  'immunsystem': 'Immunsystem', 
  'lesenswertes': 'Lesenswertes',
  'lifestyle': 'Lifestyle & Psyche',
  'psyche': 'Lifestyle & Psyche',
  'mikronährstoffe': 'Mikronährstoffe',
  'nährstoffe': 'Mikronährstoffe',
  'organsysteme': 'Organsysteme',
  'wissenschaftliches': 'Wissenschaftliches',
  'wissenswertes': 'Wissenswertes',
  
  // English to German mappings
  'nutrition': 'Ernährung',
  'immune': 'Immunsystem',
  'lifestyle': 'Lifestyle & Psyche',
  'psychology': 'Lifestyle & Psyche',
  'micronutrients': 'Mikronährstoffe',
  'organs': 'Organsysteme',
  'science': 'Wissenschaftliches',
  'knowledge': 'Wissenswertes',
  
  // Common variations
  'nahrung': 'Ernährung',
  'vitamine': 'Mikronährstoffe',
  'mineralien': 'Mikronährstoffe',
  'spurenelemente': 'Mikronährstoffe',
  'körper': 'Organsysteme',
  'gesundheit': 'Wissenswertes',
  'medizin': 'Wissenschaftliches'
};

/**
 * Valid blog categories from types.ts
 */
const VALID_CATEGORIES = [
  'Ernährung',
  'Immunsystem', 
  'Lesenswertes',
  'Lifestyle & Psyche',
  'Mikronährstoffe',
  'Organsysteme',
  'Wissenschaftliches',
  'Wissenswertes'
];

/**
 * Get array of mapped category names for Healthy Life blog
 * Maps WordPress categories to valid blog categories and filters out invalid ones
 *
 * @param {import('../parser').Post} post - Post object
 * @returns {string[]} Array of valid blog category names
 */
export default post => {
  if (!post.data.category) {
    return ['Wissenswertes']; // Default category if none found
  }

  try {
    const rawCategories = post.data.category
      .filter(category => category.$ && category.$.domain === 'category')
      .map(({ _: name }) => decodeURIComponent(name))
      .filter(category => !settings.filter_categories.includes(category));

    const mappedCategories = [];
    
    for (const category of rawCategories) {
      const lowerCategory = category.toLowerCase();
      
      // Check direct mapping
      if (CATEGORY_MAPPING[lowerCategory]) {
        mappedCategories.push(CATEGORY_MAPPING[lowerCategory]);
      }
      // Check if it's already a valid category (case insensitive)
      else if (VALID_CATEGORIES.find(valid => valid.toLowerCase() === lowerCategory)) {
        const validCategory = VALID_CATEGORIES.find(valid => valid.toLowerCase() === lowerCategory);
        mappedCategories.push(validCategory);
      }
      // Check partial matches for compound categories
      else {
        let matched = false;
        for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
          if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
            mappedCategories.push(value);
            matched = true;
            break;
          }
        }
        
        // If no mapping found, try to match with valid categories partially
        if (!matched) {
          for (const validCat of VALID_CATEGORIES) {
            if (validCat.toLowerCase().includes(lowerCategory) || lowerCategory.includes(validCat.toLowerCase())) {
              mappedCategories.push(validCat);
              matched = true;
              break;
            }
          }
        }
      }
    }

    // Remove duplicates and ensure we have at least one category
    const uniqueCategories = [...new Set(mappedCategories)];
    return uniqueCategories.length > 0 ? uniqueCategories : ['Wissenswertes'];
    
  } catch (error) {
    throw new ConversionError('Failed to process post categories', error);
  }
};
