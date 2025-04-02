/**
 * Post-processor for WordPress to Markdown conversion
 * Handles additional transformations and fixes for Astro compatibility
 * 
 * @module post-processor
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const logger = require('./logger');
const { ConversionError } = require('./errors');

/**
 * Process a single markdown file to ensure Astro compatibility
 * 
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<boolean>} - True if file was processed successfully
 * @throws {ConversionError} When processing fails
 */
async function processMarkdownFile(filePath) {
  try {
    // Read the file
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Split content into frontmatter and markdown
    const parts = content.split(/---\r?\n/);
    if (parts.length < 3) {
      logger.info(`Skipping ${filePath}: No frontmatter found`);
      return false;
    }
    
    // Parse frontmatter
    const frontmatterYaml = parts[1];
    let frontmatter;
    try {
      frontmatter = yaml.load(frontmatterYaml);
    } catch (error) {
      logger.error(`Failed to parse frontmatter in ${filePath}`, error);
      return false;
    }
    
    // Apply fixes to frontmatter
    let modified = false;
    
    // Fix heroImage if it's a string
    if (frontmatter.heroImage && typeof frontmatter.heroImage === 'string') {
      // Add ./images/ prefix if not already present
      const imagePath = frontmatter.heroImage.startsWith('./images/') 
        ? frontmatter.heroImage 
        : `./images/${frontmatter.heroImage}`;
      
      frontmatter.heroImage = {
        src: imagePath,
        alt: frontmatter.title || "Featured Image"
      };
      modified = true;
    } 
    // Fix heroImage if it's an object but missing ./images/ prefix
    else if (frontmatter.heroImage && typeof frontmatter.heroImage === 'object' && 
             frontmatter.heroImage.src && typeof frontmatter.heroImage.src === 'string' &&
             !frontmatter.heroImage.src.startsWith('./images/')) {
      frontmatter.heroImage.src = `./images/${frontmatter.heroImage.src}`;
      modified = true;
    }
    
    // Fix group if it's an array
    if (frontmatter.group && Array.isArray(frontmatter.group)) {
      const validGroups = ['pro', 'kontra', 'fragezeiten'];
      const firstGroup = frontmatter.group[0];
      frontmatter.group = validGroups.includes(firstGroup) ? firstGroup : 'fragezeiten';
      modified = true;
    }
    
    // Add required fields if missing
    if (!frontmatter.description && frontmatter.excerpt) {
      frontmatter.description = frontmatter.excerpt;
      modified = true;
    } else if (!frontmatter.description) {
      // Create a description from the first 150 characters of content
      const markdown = parts.slice(2).join('---\n');
      const textContent = markdown.replace(/[#*`_\[\]()]/g, '').trim();
      frontmatter.description = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
      modified = true;
    }
    
    // Ensure categories is an array of valid values
    if (!frontmatter.categories || !Array.isArray(frontmatter.categories) || frontmatter.categories.length === 0) {
      frontmatter.categories = ["Wissenswertes"];
      modified = true;
    }
    
    // If no changes were made, return
    if (!modified) {
      return false;
    }
    
    // Write the updated file
    const updatedFrontmatter = yaml.dump(frontmatter, { lineWidth: -1 });
    const updatedContent = `---\n${updatedFrontmatter}---\n${parts.slice(2).join('---\n')}`;
    
    await fs.promises.writeFile(filePath, updatedContent, 'utf8');
    logger.info(`Updated frontmatter in ${filePath}`);
    
    return true;
  } catch (error) {
    throw new ConversionError(`Failed to process markdown file: ${filePath}`, error);
  }
}

/**
 * Process all markdown files in a directory
 * 
 * @param {string} directory - Directory containing markdown files
 * @param {Object} options - Processing options
 * @param {boolean} [options.recursive=true] - Whether to process subdirectories
 * @param {string} [options.extension='.mdx'] - File extension to process
 * @returns {Promise<number>} - Number of files processed
 * @throws {ConversionError} When processing fails
 */
async function processDirectory(directory, options = {}) {
  const { recursive = true, extension = '.mdx' } = options;
  
  try {
    let processedCount = 0;
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory() && recursive) {
        processedCount += await processDirectory(fullPath, options);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        const processed = await processMarkdownFile(fullPath);
        if (processed) {
          processedCount++;
        }
      }
    }
    
    return processedCount;
  } catch (error) {
    throw new ConversionError(`Failed to process directory: ${directory}`, error);
  }
}

module.exports = {
  processMarkdownFile,
  processDirectory
};
