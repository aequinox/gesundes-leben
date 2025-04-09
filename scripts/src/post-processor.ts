import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
// Assuming logger, ConversionError, and shared have appropriate types or default exports
// If not, you might need to add type definitions or use require() with appropriate casting.
import logger from './logger';
import { ConversionError } from './errors';
import * as shared from './shared'; // Assuming shared exports functions like getBaseFilenameIfResized

// --- Interfaces and Types ---

interface HeroImageObject {
  src: string;
  alt: string;
}

interface Frontmatter {
  heroImage?: string | HeroImageObject;
  title?: string;
  group?: string | string[];
  description?: string;
  excerpt?: string;
  categories?: string[];
  // Add other potential frontmatter fields here if known
  [key: string]: any; // Allow other properties
}

interface MarkdownFile {
  frontmatter: Frontmatter;
  content: string;
  filePath: string;
}

interface Config {
  VALID_GROUPS: string[];
  DEFAULT_GROUP: string;
  DEFAULT_CATEGORIES: string[];
  DESCRIPTION_MAX_LENGTH: number;
  DOMAINS: {
    OLD: string;
    NEW: string;
  };
}

interface ProcessingOptions {
  recursive?: boolean;
  extension?: string;
}

// --- Constants ---

const CONFIG: Config = {
  VALID_GROUPS: ['pro', 'kontra', 'fragezeiten'],
  DEFAULT_GROUP: 'fragezeiten',
  DEFAULT_CATEGORIES: ['Wissenswertes'],
  DESCRIPTION_MAX_LENGTH: 150,
  DOMAINS: {
    OLD: 'https://gesundheit-in-tuebingen.de',
    NEW: 'https://gesundes-leben.vision'
  }
};

// --- Helper Functions ---

/**
 * Creates a markdown image reference string.
 * @param alt - The alt text.
 * @param src - The image source URL.
 * @param title - Optional image title.
 * @returns Markdown image string.
 */
function createImageReference(alt: string, src: string, title?: string | null): string {
  return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
}

// --- File Operations ---

/**
 * Reads and parses a markdown file with frontmatter.
 * @param filePath - Path to the markdown file.
 * @returns Parsed markdown file or null if parsing fails or no frontmatter exists.
 * @throws {ConversionError} If reading the file fails.
 */
async function readMarkdownFile(filePath: string): Promise<MarkdownFile | null> {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const parts = fileContent.split(/---\r?\n/);

    if (parts.length < 3) {
      logger.info(`Skipping ${filePath}: No frontmatter found`);
      return null;
    }

    const frontmatterYaml = parts[1];
    let frontmatter: Frontmatter;
    try {
      frontmatter = yaml.load(frontmatterYaml) as Frontmatter;
      if (typeof frontmatter !== 'object' || frontmatter === null) {
         throw new Error('Frontmatter is not a valid object');
      }
    } catch (error: any) {
      logger.error(`Failed to parse frontmatter in ${filePath}: ${error.message}`);
      return null;
    }

    return {
      frontmatter,
      content: parts.slice(2).join('---\n'),
      filePath
    };
  } catch (error: any) {
    // Don't wrap errors that are already ConversionErrors
    if (error instanceof ConversionError) {
        throw error;
    }
    throw new ConversionError(`Failed to read markdown file: ${filePath}`, error);
  }
}

/**
 * Writes a markdown file with frontmatter.
 * @param file - The markdown file data to write.
 * @throws {ConversionError} If writing the file fails.
 */
async function writeMarkdownFile(file: MarkdownFile): Promise<void> {
  try {
    const { frontmatter, content, filePath } = file;
    // Ensure consistent key order and no unnecessary quotes
    const frontmatterYaml = yaml.dump(frontmatter, {
        lineWidth: -1,
        sortKeys: true, // Keep frontmatter consistent
        noRefs: true, // Avoid YAML references
        quotingType: '"' // Use double quotes for consistency
    });
    const fileContent = `---\n${frontmatterYaml}---\n${content}`;

    await fs.promises.writeFile(filePath, fileContent, 'utf8');
    logger.info(`Updated file: ${filePath}`);
  } catch (error: any) {
     // Don't wrap errors that are already ConversionErrors
    if (error instanceof ConversionError) {
        throw error;
    }
    throw new ConversionError(`Failed to write markdown file: ${file.filePath}`, error);
  }
}

// --- Frontmatter Processing ---

/**
 * Processes the heroImage field in frontmatter.
 * Normalizes string paths and object paths, handling resized image filenames.
 * @param file - The markdown file object.
 * @returns True if the frontmatter was modified, false otherwise.
 */
function processHeroImage(file: MarkdownFile): boolean {
  const { frontmatter, filePath } = file;
  let modified = false;
  let currentSrc: string | undefined;

  if (frontmatter.heroImage) {
    if (typeof frontmatter.heroImage === 'string') {
      currentSrc = frontmatter.heroImage;
    } else if (typeof frontmatter.heroImage === 'object' && frontmatter.heroImage.src && typeof frontmatter.heroImage.src === 'string') {
      currentSrc = frontmatter.heroImage.src;
    }
  }

  if (currentSrc) {
    const filename = currentSrc.split('/').pop() ?? ''; // Handle potential undefined from pop()
    const baseFilename = shared.getBaseFilenameIfResized(filename);
    const normalizedFilename = baseFilename || filename;
    const newSrc = `images/${normalizedFilename}`;

    if (baseFilename) {
      logger.info(`Normalized heroImage in ${filePath}: ${filename} -> ${baseFilename}`);
      modified = true;
    }

    // Always ensure the structure is an object and path is correct
    if (typeof frontmatter.heroImage !== 'object' || frontmatter.heroImage.src !== newSrc) {
        frontmatter.heroImage = {
            src: newSrc,
            alt: frontmatter.title || "Featured Image" // Use existing alt if available? Currently overwrites.
        };
        modified = true;
    } else if (!frontmatter.heroImage.alt) { // Ensure alt text exists
        frontmatter.heroImage.alt = frontmatter.title || "Featured Image";
        modified = true;
    }
  }

  return modified;
}


/**
 * Processes the group field in frontmatter.
 * Ensures the group is a single valid string, defaulting if necessary.
 * @param file - The markdown file object.
 * @returns True if the frontmatter was modified, false otherwise.
 */
function processGroup(file: MarkdownFile): boolean {
  const { frontmatter } = file;

  if (frontmatter.group && Array.isArray(frontmatter.group)) {
    const firstGroup = frontmatter.group[0];
    const newGroup = CONFIG.VALID_GROUPS.includes(firstGroup) ? firstGroup : CONFIG.DEFAULT_GROUP;
    if (frontmatter.group.length > 1 || frontmatter.group[0] !== newGroup) {
        frontmatter.group = newGroup;
        return true;
    }
  } else if (typeof frontmatter.group !== 'string' || !CONFIG.VALID_GROUPS.includes(frontmatter.group)) {
      // If it's not a valid string (or not a string at all), set default
      frontmatter.group = CONFIG.DEFAULT_GROUP;
      return true;
  }

  return false;
}

/**
 * Processes the description field in frontmatter.
 * Uses excerpt if available, otherwise generates from content.
 * @param file - The markdown file object.
 * @returns True if the frontmatter was modified, false otherwise.
 */
function processDescription(file: MarkdownFile): boolean {
  const { frontmatter, content } = file;

  if (!frontmatter.description) {
    if (frontmatter.excerpt) {
      frontmatter.description = frontmatter.excerpt;
    } else {
      const textContent = content
        .replace(/---[\s\S]*?---/, '') // Remove frontmatter if accidentally included
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[#*`_[\]()]/g, '') // Remove markdown syntax
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      const truncated = textContent.substring(0, CONFIG.DESCRIPTION_MAX_LENGTH);
      frontmatter.description = textContent.length > CONFIG.DESCRIPTION_MAX_LENGTH
                                ? `${truncated}...`
                                : truncated;
    }
    return true;
  }

  return false;
}

/**
 * Processes the categories field in frontmatter.
 * Ensures categories exist and are an array, defaulting if necessary.
 * @param file - The markdown file object.
 * @returns True if the frontmatter was modified, false otherwise.
 */
function processCategories(file: MarkdownFile): boolean {
  const { frontmatter } = file;

  if (!frontmatter.categories || !Array.isArray(frontmatter.categories) || frontmatter.categories.length === 0) {
    frontmatter.categories = [...CONFIG.DEFAULT_CATEGORIES]; // Use spread to avoid mutation
    return true;
  }

  return false;
}

/**
 * Orchestrates all frontmatter processing steps.
 * @param file - The markdown file object.
 * @returns True if any frontmatter field was modified, false otherwise.
 */
function processFrontmatter(file: MarkdownFile): boolean {
  // Chain modifications using ||
  let modified = processHeroImage(file);
  modified = processGroup(file) || modified;
  modified = processDescription(file) || modified;
  modified = processCategories(file) || modified;
  return modified;
}

// --- Content Processing ---

/**
 * Normalizes image references in markdown content.
 * Handles resized image filenames and ensures 'images/' prefix.
 * @param file - The markdown file object.
 * @returns True if the content was modified, false otherwise.
 */
function normalizeImageReferences(file: MarkdownFile): boolean {
    const { filePath } = file;
    let modified = false;

    // Regex to find markdown images: ![alt](src "title") or ![alt](src)
    // It captures alt, src, and optional title. Excludes http(s):// links.
    const imageRegex = /!\[([^\]]*)\]\((?!(?:https?:\/\/|\/images\/))([^)"'\s]+\.(?:gif|jpe?g|png|webp|svg))(?:\s+["']([^"']*)["'])?\)/g;

    file.content = file.content.replace(imageRegex, (match, alt: string, src: string, title?: string) => {
        const filename = src.split('/').pop() ?? '';
        const baseFilename = shared.getBaseFilenameIfResized(filename);
        const normalizedFilename = baseFilename || filename;
        const normalizedSrc = `images/${normalizedFilename}`;

        if (baseFilename) {
            logger.info(`Normalized image reference filename in ${filePath}: ${filename} -> ${baseFilename}`);
            modified = true;
        }
        if (!src.startsWith('images/')) {
             logger.info(`Added 'images/' prefix to image reference in ${filePath}: ${src} -> ${normalizedSrc}`);
             modified = true;
        }

        return createImageReference(alt || '', normalizedSrc, title); // Ensure alt is string
    });

    return modified;
}


/**
 * Updates internal links in markdown content to use the new domain.
 * @param file - The markdown file object.
 * @returns True if the content was modified, false otherwise.
 */
function updateInternalLinks(file: MarkdownFile): boolean {
  const { filePath } = file;
  let modified = false;
  const oldDomainPattern = CONFIG.DOMAINS.OLD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match the domain, optionally followed by a slash, then the path.
  // Ensure it's preceded by `](` to target markdown links specifically.
  const internalLinkRegex = new RegExp(`(\\]\\()${oldDomainPattern}(\\/?[^)]*)(\\))`, 'g');

  file.content = file.content.replace(internalLinkRegex, (match, prefix: string, pathAndQuery: string, suffix: string) => {
    const oldLink = `${CONFIG.DOMAINS.OLD}${pathAndQuery}`;
    const newLink = `${CONFIG.DOMAINS.NEW}${pathAndQuery}`;
    logger.info(`Updated internal link in ${filePath}: ${oldLink} -> ${newLink}`);
    modified = true;
    return `${prefix}${newLink}${suffix}`;
  });

  return modified;
}

/**
 * Orchestrates all content processing steps.
 * @param file - The markdown file object.
 * @returns True if the content was modified, false otherwise.
 */
function processContent(file: MarkdownFile): boolean {
  let modified = normalizeImageReferences(file);
  modified = updateInternalLinks(file) || modified;
  return modified;
}

// --- Main Processing Logic ---

/**
 * Processes a single markdown file: reads, transforms frontmatter and content, and writes back if modified.
 * @param filePath - Path to the markdown file.
 * @returns True if the file was successfully processed and modified, false otherwise.
 * @throws {ConversionError} If any step fails unexpectedly.
 */
export async function processMarkdownFile(filePath: string): Promise<boolean> {
  try {
    const file = await readMarkdownFile(filePath);
    if (!file) {
      return false; // Skipped or failed to read/parse
    }

    const frontmatterModified = processFrontmatter(file);
    const contentModified = processContent(file);

    if (!frontmatterModified && !contentModified) {
      // logger.info(`No changes needed for ${filePath}`); // Optional: Log unchanged files
      return false; // Indicate no modification occurred
    }

    await writeMarkdownFile(file);
    return true; // Indicate successful modification
  } catch (error: any) {
     // Log the error but rethrow as a ConversionError for consistent handling upstream
     logger.error(`Failed to process markdown file ${filePath}: ${error.message}`);
     if (error instanceof ConversionError) {
        throw error;
     }
    throw new ConversionError(`Failed to process markdown file: ${filePath}`, error);
  }
}

/**
 * Processes all markdown files in a directory, optionally recursively.
 * @param directory - Directory containing markdown files.
 * @param options - Processing options (recursive, extension).
 * @returns The number of files successfully processed and modified.
 * @throws {ConversionError} If reading the directory fails.
 */
export async function processDirectory(directory: string, options: ProcessingOptions = {}): Promise<number> {
  const { recursive = true, extension = '.mdx' } = options;
  let processedCount = 0;

  try {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });

    // Process files in parallel for potential speedup
    const processingPromises: Promise<boolean | number>[] = entries.map(entry => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory() && recursive) {
            return processDirectory(fullPath, options); // Recursive call returns count
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
            return processMarkdownFile(fullPath); // Returns true if modified, false otherwise
        }
        return Promise.resolve(false); // Ignore other file types or non-recursive directories
    });

    const results = await Promise.all(processingPromises);

    // Sum up the results
    processedCount = results.reduce<number>((sum, result) => {
        if (typeof result === 'number') {
            return sum + result; // Add count from subdirectories
        } else if (result === true) {
            return sum + 1; // Add 1 for each modified file
        }
        return sum;
    }, 0);


  } catch (error: any) {
     // Don't wrap errors that are already ConversionErrors
    if (error instanceof ConversionError) {
        throw error;
    }
    throw new ConversionError(`Failed to process directory: ${directory}`, error);
  }

  return processedCount;
}