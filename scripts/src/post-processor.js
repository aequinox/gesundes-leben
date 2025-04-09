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
const shared = require('./shared');

/**
 * Configuration constants
 */
const CONFIG = {
  VALID_GROUPS: ['pro', 'kontra', 'fragezeiten'],
  DEFAULT_GROUP: 'fragezeiten',
  DEFAULT_CATEGORIES: ['Wissenswertes'],
  DESCRIPTION_MAX_LENGTH: 150,
  DOMAINS: {
    OLD: 'https://gesundheit-in-tuebingen.de',
    NEW: 'https://gesundes-leben.vision'
  }
};

/**
 * @typedef {Object} MarkdownFile
 * @property {Object} frontmatter - The frontmatter data
 * @property {string} content - The markdown content
 * @property {string} filePath - The path to the file
 */

/**
 * @typedef {Object} ProcessingResult
 * @property {boolean} modified - Whether the file was modified
 * @property {MarkdownFile} file - The processed file
 */

/**
 * Read and parse a markdown file
 * 
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<MarkdownFile|null>} - Parsed markdown file or null if parsing failed
 */
async function readMarkdownFile(filePath) {
  try {
    // Read the file
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Split content into frontmatter and markdown
    const parts = content.split(/---\r?\n/);
    if (parts.length < 3) {
      logger.info(`Skipping ${filePath}: No frontmatter found`);
      return null;
    }
    
    // Parse frontmatter
    const frontmatterYaml = parts[1];
    let frontmatter;
    try {
      frontmatter = yaml.load(frontmatterYaml);
    } catch (error) {
      logger.error(`Failed to parse frontmatter in ${filePath}`, error);
      return null;
    }
    
    return {
      frontmatter,
      content: parts.slice(2).join('---\n'),
      filePath
    };
  } catch (error) {
    throw new ConversionError(`Failed to read markdown file: ${filePath}`, error);
  }
}

/**
 * Write a markdown file
 * 
 * @param {MarkdownFile} file - The markdown file to write
 * @returns {Promise<void>}
 */
async function writeMarkdownFile(file) {
  try {
    const { frontmatter, content, filePath } = file;
    const frontmatterYaml = yaml.dump(frontmatter, { lineWidth: -1 });
    const fileContent = `---\n${frontmatterYaml}---\n${content}`;
    
    await fs.promises.writeFile(filePath, fileContent, 'utf8');
    logger.info(`Updated file: ${filePath}`);
  } catch (error) {
    throw new ConversionError(`Failed to write markdown file: ${file.filePath}`, error);
  }
}

/**
 * Process heroImage in frontmatter
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the frontmatter was modified
 */
function processHeroImage(file) {
  const { frontmatter, filePath } = file;
  let modified = false;
  
  // Process string heroImage
  if (frontmatter.heroImage && typeof frontmatter.heroImage === 'string') {
    const filename = frontmatter.heroImage.split('/').pop();
    const baseFilename = shared.getBaseFilenameIfResized(filename);
    const normalizedFilename = baseFilename || filename;
    
    if (baseFilename) {
      logger.info(`Normalized heroImage in ${filePath}: ${filename} -> ${baseFilename}`);
    }
    
    frontmatter.heroImage = {
      src: `images/${normalizedFilename}`,
      alt: frontmatter.title || "Featured Image"
    };
    modified = true;
  } 
  // Process object heroImage
  else if (frontmatter.heroImage && typeof frontmatter.heroImage === 'object' && 
           frontmatter.heroImage.src && typeof frontmatter.heroImage.src === 'string') {
    
    const src = frontmatter.heroImage.src;
    const filename = src.split('/').pop();
    const baseFilename = shared.getBaseFilenameIfResized(filename);
    const normalizedFilename = baseFilename || filename;
    
    if (baseFilename) {
      logger.info(`Normalized heroImage.src in ${filePath}: ${filename} -> ${baseFilename}`);
      modified = true;
    }
    
    frontmatter.heroImage.src = `images/${normalizedFilename}`;
    modified = true;
  }
  
  return modified;
}

/**
 * Process group in frontmatter
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the frontmatter was modified
 */
function processGroup(file) {
  const { frontmatter } = file;
  
  if (frontmatter.group && Array.isArray(frontmatter.group)) {
    const firstGroup = frontmatter.group[0];
    frontmatter.group = CONFIG.VALID_GROUPS.includes(firstGroup) ? firstGroup : CONFIG.DEFAULT_GROUP;
    return true;
  }
  
  return false;
}

/**
 * Process description in frontmatter
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the frontmatter was modified
 */
function processDescription(file) {
  const { frontmatter, content } = file;
  
  if (!frontmatter.description && frontmatter.excerpt) {
    frontmatter.description = frontmatter.excerpt;
    return true;
  } else if (!frontmatter.description) {
    const textContent = content.replace(/[#*`_[\]()]/g, '').trim();
    frontmatter.description = textContent.substring(0, CONFIG.DESCRIPTION_MAX_LENGTH) + 
                             (textContent.length > CONFIG.DESCRIPTION_MAX_LENGTH ? '...' : '');
    return true;
  }
  
  return false;
}

/**
 * Process categories in frontmatter
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the frontmatter was modified
 */
function processCategories(file) {
  const { frontmatter } = file;
  
  if (!frontmatter.categories || !Array.isArray(frontmatter.categories) || frontmatter.categories.length === 0) {
    frontmatter.categories = CONFIG.DEFAULT_CATEGORIES;
    return true;
  }
  
  return false;
}

/**
 * Process all frontmatter transformations
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the frontmatter was modified
 */
function processFrontmatter(file) {
  const heroImageModified = processHeroImage(file);
  const groupModified = processGroup(file);
  const descriptionModified = processDescription(file);
  const categoriesModified = processCategories(file);
  
  return heroImageModified || groupModified || descriptionModified || categoriesModified;
}

/**
 * Create a markdown image reference
 * 
 * @param {string} alt - The alt text
 * @param {string} src - The image source
 * @param {string|null} title - The image title
 * @returns {string} - The markdown image reference
 */
function createImageReference(alt, src, title) {
  return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
}

/**
 * Normalize image references in markdown content
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the content was modified
 */
function normalizeImageReferences(file) {
  const { content, filePath } = file;
  let modified = false;
  let newContent = content;
  
  // Normalize resized image references
  newContent = newContent.replace(
    /!\[([^\]]*)\]\(([^)]+\.(?:gif|jpe?g|png|webp))(?:\s+"([^"]*)")?\)/g,
    (match, alt, src, title) => {
      const filename = src.split('/').pop();
      const baseFilename = shared.getBaseFilenameIfResized(filename);
      
      if (baseFilename) {
        const normalizedSrc = src.replace(filename, baseFilename);
        logger.info(`Normalized image reference in ${filePath}: ${filename} -> ${baseFilename}`);
        modified = true;
        return createImageReference(alt, normalizedSrc, title);
      }
      
      return match;
    }
  );
  
  // Ensure all image paths have images/ prefix
  newContent = newContent.replace(
    /!\[([^\]]*)\]\((?!images\/|https?:\/\/)([^)]+\.(?:gif|jpe?g|png|webp))(?:\s+"([^"]*)")?\)/g,
    (match, alt, src, title) => {
      const normalizedSrc = `images/${src}`;
      modified = true;
      return createImageReference(alt, normalizedSrc, title);
    }
  );
  
  if (modified) {
    file.content = newContent;
  }
  
  return modified;
}

/**
 * Update internal links in markdown content
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the content was modified
 */
function updateInternalLinks(file) {
  const { content, filePath } = file;
  let modified = false;
  let newContent = content;
  
  // Handle links without trailing slash
  const oldDomain = CONFIG.DOMAINS.OLD;
  const newDomain = CONFIG.DOMAINS.NEW;
  const internalLinkRegex = new RegExp(`(\\[[^\\]]+\\]\\()${oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^)]*)\\)`, 'g');
  
  newContent = newContent.replace(internalLinkRegex, (match, prefix, path) => {
    logger.info(`Updated internal link in ${filePath}: ${oldDomain}${path} -> ${newDomain}${path}`);
    modified = true;
    return `${prefix}${newDomain}${path})`;
  });
  
  // Handle links with trailing slash
  const oldDomainWithSlash = `${oldDomain}/`;
  const newDomainWithSlash = `${newDomain}/`;
  const internalLinkRegexWithSlash = new RegExp(`(\\[[^\\]]+\\]\\()${oldDomainWithSlash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^)]*)\\)`, 'g');
  
  newContent = newContent.replace(internalLinkRegexWithSlash, (match, prefix, path) => {
    logger.info(`Updated internal link in ${filePath}: ${oldDomainWithSlash}${path} -> ${newDomainWithSlash}${path}`);
    modified = true;
    return `${prefix}${newDomainWithSlash}${path})`;
  });
  
  if (modified) {
    file.content = newContent;
  }
  
  return modified;
}

/**
 * Process all content transformations
 * 
 * @param {MarkdownFile} file - The markdown file
 * @returns {boolean} - Whether the content was modified
 */
function processContent(file) {
  const imagesModified = normalizeImageReferences(file);
  const linksModified = updateInternalLinks(file);
  
  return imagesModified || linksModified;
}

/**
 * Process a single markdown file to ensure Astro compatibility
 * 
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<boolean>} - True if file was processed successfully
 * @throws {ConversionError} When processing fails
 */
async function processMarkdownFile(filePath) {
  try {
    // Read and parse the file
    const file = await readMarkdownFile(filePath);
    if (!file) {
      return false;
    }
    
    // Process frontmatter and content
    const frontmatterModified = processFrontmatter(file);
    const contentModified = processContent(file);
    
    // If no changes were made, return
    if (!frontmatterModified && !contentModified) {
      return false;
    }
    
    // Write the updated file
    await writeMarkdownFile(file);
    
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
