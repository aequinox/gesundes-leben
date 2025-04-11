import TurndownService from 'turndown';
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import path from 'path';
import { ConversionError } from './errors';
import * as shared from './shared';
import logger from './logger'; // Import logger for consistency

// --- Interfaces and Types (Reusing from parser.ts context) ---

// Represents a generic item from the WordPress XML channel
interface WordPressItem {
  encoded?: string[]; // Content
  // Add other properties used by getPostContent if necessary
  [key: string]: any;
}

// Configuration specific to the parser/translator
interface TranslatorConfig {
  saveScrapedImages?: boolean;
  // Add other relevant config properties if needed
}

// Extend NodeJS Global interface for imageDimensions (if not already done elsewhere)
declare global {
  // eslint-disable-next-line no-var
  var imageDimensions: Map<string, { width?: number; height?: number }>;
}

// Ensure global map exists (might be redundant if done in writer.ts, but safe)
if (!global.imageDimensions) {
  global.imageDimensions = new Map<string, { width?: number; height?: number }>();
}

// --- Turndown Initialization and Rules ---

/**
 * Initializes and configures the TurndownService for converting WordPress HTML to Markdown.
 * Includes custom rules for tweets, CodePens, scripts, iframes, figures, images, and code blocks.
 * Manages alternating alignment for square-ish images.
 *
 * @returns A configured TurndownService instance.
 */
export function initTurndownService(): TurndownService {
  // Initialize alternating image alignment state within this scope
  let alternateRight = true;

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });

  // Use GFM plugins (tables, strikethrough, etc.)
  turndownService.use(turndownPluginGfm.gfm);

  // --- Custom Rules ---

  // Preserve embedded tweets (identified by blockquote class)
  turndownService.addRule('tweet', {
    filter: (node: Node): boolean =>
      node.nodeName === 'BLOCKQUOTE' && (node as HTMLElement).getAttribute('class') === 'twitter-tweet',
    replacement: (_content: string, node: Node): string => '\n\n' + (node as HTMLElement).outerHTML + '\n\n',
  });

  // Preserve embedded CodePens (identified by class and data attributes)
  turndownService.addRule('codepen', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      return (
        ['P', 'DIV'].includes(element.nodeName) &&
        element.hasAttribute('data-slug-hash') &&
        element.getAttribute('class') === 'codepen'
      );
    },
    replacement: (_content: string, node: Node): string => '\n\n' + (node as HTMLElement).outerHTML + '\n\n',
  });

  // Preserve embedded scripts (adjusting spacing)
  turndownService.addRule('script', {
    filter: 'script',
    replacement: (_content: string, node: Node): string => {
      const element = node as HTMLElement;
      let before = '\n\n';
      // Keep script tags closer if preceded by a non-text element (like tweet/codepen blockquote/div)
      if (element.previousSibling && element.previousSibling.nodeName !== '#text') {
        before = '\n';
      }
      // Ensure boolean attributes are clean
      const html = element.outerHTML.replace('async=""', 'async');
      return before + html + '\n\n';
    },
  });

  // Preserve iframes (cleaning boolean attributes)
  turndownService.addRule('iframe', {
    filter: 'iframe',
    replacement: (_content: string, node: Node): string => {
      const element = node as HTMLElement;
      const html = element.outerHTML
        .replace('allowfullscreen=""', 'allowfullscreen')
        .replace('allowpaymentrequest=""', 'allowpaymentrequest');
      return '\n\n' + html + '\n\n';
    },
  });

  // Handle WordPress block Kadence image figures
  turndownService.addRule('wpBlockKadenceImage', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      return (
        element.nodeName === 'FIGURE' &&
        element.classList.contains('wp-block-kadence-image') &&
        element.querySelector('img') !== null
      );
    },
    replacement: (_content: string, node: Node): string => {
      const element = node as HTMLElement;
      const img = element.querySelector('img');
      
      if (!img) {
        logger.warn('Kadence image figure rule matched but img missing, skipping custom replacement.');
        return '\n\n' + element.outerHTML + '\n\n';
      }

      const src = img.getAttribute('src') ?? '';
      const alt = img.getAttribute('alt') ?? '';
      const filename = src.split('/').pop() ?? ''; // Get filename safely
      
      // Get the figcaption text if available
      const figcaption = element.querySelector('figcaption');
      let caption = '';
      if (figcaption && figcaption.textContent) {
        caption = figcaption.textContent.trim();
      }
      
      // Determine alignment based on aspect ratio
      let alignmentMarker = '_'; // Default: center
      
      // Try to get image dimensions if available
      try {
        // If we have the image file, try to get its dimensions
        if (img.width && img.height) {
          // Use actual image dimensions from the DOM element
          const aspectRatio = img.width / img.height;
          
          if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
            // Alternate between left and right for square-ish images
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          } else if (aspectRatio > 1.5) { // Wide
            // Center wide images
            alignmentMarker = '_';
          } else { // Tall or other ratios
            // Also alternate for these
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
          
          // Store dimensions in global map for post-processing
          if (filename) {
            global.imageDimensions.set(filename, { 
              width: img.width, 
              height: img.height 
            });
          }
        } else {
          // Fallback to global map if DOM dimensions not available
          const dimensions = global.imageDimensions?.get(filename);
          if (dimensions?.width && dimensions?.height) {
            const aspectRatio = dimensions.width / dimensions.height;
            if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            } else if (aspectRatio > 1.5) { // Wide
              alignmentMarker = '_';
            } else { // Tall or other ratios
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            }
          } else {
            // If no dimensions available, alternate
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
        }
      } catch (error) {
        // If error occurs, use alternating alignment
        logger.warn(`Error determining image alignment for ${filename}, using alternating alignment: ${error instanceof Error ? error.message : String(error)}`);
        alignmentMarker = alternateRight ? '>' : '<';
        alternateRight = !alternateRight;
      }
      
      // Add alignment marker to caption
      if (caption) {
        caption = alignmentMarker + caption;
      } else {
        caption = alignmentMarker + 'Image';
      }
      
      // Get the post directory path for file existence checks
      const postDir = element.ownerDocument?.documentURI ? 
        path.dirname(element.ownerDocument.documentURI) : '';
      
      // Normalize image path with extension validation if post directory is available
      const normalizedSrc = shared.getNormalizedImagePath(src, postDir ? path.join(postDir, 'images') : '');
      
      // Ensure path is relative to 'images/' directory for final markdown
      const finalSrc = normalizedSrc.replace(/^.*\/([^/]+)$/, 'images/$1');
      
      // Return Markdown image format with caption in title attribute
      return `![${alt}](${finalSrc} "${caption}")`;
    },
  });

  // Handle <figure> with <img> and <figcaption> - applies alignment logic
  turndownService.addRule('figureWithImage', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      return (
        element.nodeName === 'FIGURE' &&
        element.querySelector('img') !== null &&
        element.querySelector('figcaption') !== null &&
        !element.classList.contains('wp-block-kadence-image') // Skip Kadence images handled by wpBlockKadenceImage
      );
    },
    replacement: (_content: string, node: Node): string => {
      const element = node as HTMLElement;
      const img = element.querySelector('img');
      const figcaption = element.querySelector('figcaption');

      if (!img || !figcaption) {
        logger.warn('Figure rule matched but img or figcaption missing, skipping custom replacement.');
        // Fallback: let Turndown handle inner content, or return outerHTML?
        // Returning outerHTML might be safer if structure is complex.
        return '\n\n' + element.outerHTML + '\n\n';
      }

      const src = img.getAttribute('src') ?? '';
      const alt = img.getAttribute('alt') ?? '';
      let caption = (figcaption.textContent ?? '').trim();
      const filename = src.split('/').pop() ?? ''; // Get filename safely

      let alignmentMarker = '_'; // Default: center

      // Try to get image dimensions if available
      try {
        // If we have the image file, try to get its dimensions
        if (img.width && img.height) {
          // Use actual image dimensions from the DOM element
          const aspectRatio = img.width / img.height;
          
          if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
            // Alternate between left and right for square-ish images
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          } else if (aspectRatio > 1.5) { // Wide
            // Center wide images
            alignmentMarker = '_';
          } else { // Tall or other ratios
            // Also alternate for these
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
          
      // Store dimensions in global map for post-processing
      if (filename) {
        global.imageDimensions.set(filename, { 
          width: img.width, 
          height: img.height 
        });
      }
          
        } else {
          // Fallback to global map if DOM dimensions not available
          const dimensions = global.imageDimensions?.get(filename);
          if (dimensions?.width && dimensions?.height) {
            const aspectRatio = dimensions.width / dimensions.height;
            if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            } else if (aspectRatio > 1.5) { // Wide
              alignmentMarker = '_';
            } else { // Tall or other ratios
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            }
          } else {
            // If no dimensions available, alternate
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
        }
      } catch (error) {
        // If error occurs, use alternating alignment
        logger.warn(`Error determining image alignment for ${filename}, using alternating alignment: ${error instanceof Error ? error.message : String(error)}`);
        alignmentMarker = alternateRight ? '>' : '<';
        alternateRight = !alternateRight;
      }

      // Prepend alignment marker to caption
      caption = alignmentMarker + caption;

      // Get the post directory path for file existence checks
      const postDir = element.ownerDocument?.documentURI ? 
        path.dirname(element.ownerDocument.documentURI) : '';
      
      // Normalize image path with extension validation if post directory is available
      const normalizedSrc = shared.getNormalizedImagePath(src, postDir ? path.join(postDir, 'images') : '');
      
      // Ensure path is relative to 'images/' directory for final markdown
      const finalSrc = normalizedSrc.replace(/^.*\/([^/]+)$/, 'images/$1');

      // Return Markdown image format with caption in title attribute
      return `![${alt}](${finalSrc} "${caption}")`;
    },
  });

  // Preserve <figure> structure if it has <figcaption> but NO <img>
  turndownService.addRule('figureWithoutImage', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      return (
        element.nodeName === 'FIGURE' &&
        element.querySelector('img') === null &&
        element.querySelector('figcaption') !== null
      );
    },
    // Keep the figure and its content as HTML, ensuring proper spacing
    replacement: (content: string): string => {
      const result = '\n\n<figure>\n\n' + content.trim() + '\n\n</figure>\n\n';
      return result.replace('\n\n\n\n', '\n\n'); // Clean up excessive newlines
    },
  });

  // Preserve <figcaption> if it's NOT inside a <figure> with an <img>
  // (Handled by figureWithoutImage rule if inside a figure without an image)
  turndownService.addRule('loneFigcaption', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      if (element.nodeName !== 'FIGCAPTION') return false;
      const parent = element.parentNode as HTMLElement | null;
      // Keep if no parent, or parent is not a FIGURE, or parent FIGURE has no IMG
      return !parent || parent.nodeName !== 'FIGURE' || parent.querySelector('img') === null;
    },
    // Keep the figcaption and its content as HTML
    replacement: (content: string): string => {
      return '\n\n<figcaption>\n\n' + content.trim() + '\n\n</figcaption>\n\n';
    },
  });


  // Convert <pre> blocks without <code> inside, applying language if specified
  turndownService.addRule('preCodeBlock', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      // Target <pre> tags that do NOT contain a <code> tag directly inside
      return element.nodeName === 'PRE' && element.querySelector('code') === null;
    },
    replacement: (_content: string, node: Node): string => {
      const element = node as HTMLElement;
      // Look for language specified in a data attribute (added by getPostContent)
      const language = element.getAttribute('data-wetm-language') ?? '';
      // Use textContent to get the raw code inside <pre>
      const code = element.textContent ?? '';
      return '\n\n```' + language + '\n' + code.trim() + '\n```\n\n';
    },
  });

  // Handle standalone <img> tags (not inside <figure>) - applies alignment logic
  turndownService.addRule('standaloneImage', {
    filter: (node: Node): boolean => {
      const element = node as HTMLElement;
      // Target <img> tags whose parent is not a <figure>
      return element.nodeName === 'IMG' && element.parentNode?.nodeName !== 'FIGURE';
    },
    replacement: (_content: string, node: Node): string => {
      const img = node as HTMLImageElement;
      const src = img.getAttribute('src') ?? '';
      const alt = img.getAttribute('alt') ?? '';
      let title = img.getAttribute('title') ?? '';
      const filename = src.split('/').pop() ?? '';

      let alignmentMarker = '_'; // Default: center

      // Try to get image dimensions if available
      try {
        // If we have the image file, try to get its dimensions
        if (img.width && img.height) {
          // Use actual image dimensions from the DOM element
          const aspectRatio = img.width / img.height;
          
          if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
            // Alternate between left and right for square-ish images
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          } else if (aspectRatio > 1.5) { // Wide
            // Center wide images
            alignmentMarker = '_';
          } else { // Tall or other ratios
            // Also alternate for these
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
          
          // Store dimensions in global map for post-processing
          if (filename) {
            global.imageDimensions.set(filename, { 
              width: img.width, 
              height: img.height 
            });
          }
          
        } else {
          // Fallback to global map if DOM dimensions not available
          const dimensions = global.imageDimensions?.get(filename);
          if (dimensions?.width && dimensions?.height) {
            const aspectRatio = dimensions.width / dimensions.height;
            if (aspectRatio >= 0.8 && aspectRatio <= 1.2) { // Square-ish
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            } else if (aspectRatio > 1.5) { // Wide
              alignmentMarker = '_';
            } else { // Tall or other ratios
              alignmentMarker = alternateRight ? '>' : '<';
              alternateRight = !alternateRight;
            }
          } else {
            // If no dimensions available, alternate
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight;
          }
        }
      } catch (error) {
        // If error occurs, use alternating alignment
        logger.warn(`Error determining image alignment for ${filename}, using alternating alignment: ${error instanceof Error ? error.message : String(error)}`);
        alignmentMarker = alternateRight ? '>' : '<';
        alternateRight = !alternateRight;
      }

      // Clean existing marker and prepend new one to title
      // Make sure we have a title to work with
      title = title || 'Image';
      
      // Remove existing alignment marker if present
      title = title.replace(/^[<>_]/, '');
      
      // Add the alignment marker to the beginning of the title
      title = alignmentMarker + title;

      // Get the post directory path for file existence checks
      const postDir = img.ownerDocument?.documentURI ? 
        path.dirname(img.ownerDocument.documentURI) : '';
      
      // Normalize image path with extension validation if post directory is available
      const normalizedSrc = shared.getNormalizedImagePath(src, postDir ? path.join(postDir, 'images') : '');
      
      // Ensure path is relative to 'images/' directory for final markdown
      const finalSrc = normalizedSrc.replace(/^.*\/([^/]+)$/, 'images/$1');

      return `![${alt}](${finalSrc} "${title}")`;
    },
  });

  return turndownService;
}

// --- Content Conversion ---

/** Safely gets the first element of a potential array from XML data. */
function getXmlValue(field: any[] | undefined): string | undefined {
    return Array.isArray(field) && field.length > 0 ? String(field[0]) : undefined;
}


/**
 * Converts post HTML content to Markdown using the configured Turndown service.
 * Performs pre-processing steps like handling double line breaks, normalizing image paths,
 * preserving 'more' tags, and extracting code language hints.
 *
 * @param postData - Raw post data object from the WordPress XML.
 * @param turndownService - The initialized TurndownService instance.
 * @param config - Configuration options relevant to translation.
 * @returns The processed post content in Markdown format.
 * @throws {ConversionError} If the post content is missing or conversion fails.
 */
export function getPostContent(
  postData: WordPressItem,
  turndownService: TurndownService,
  config: TranslatorConfig
): string {
  try {
    const rawContent = getXmlValue(postData.encoded);
    if (typeof rawContent !== 'string') {
      // Handle case where content might be missing or not a string
      logger.warn(`Post content missing or invalid for post ID (if available): ${getXmlValue(postData.post_id) ?? 'N/A'}. Returning empty string.`);
      return '';
    }

    let content = rawContent;

    // Insert placeholder divs to preserve paragraph breaks
    content = content.replace(/(\r?\n){2,}/g, '\n<div></div>\n');

    // Pre-process image paths if saving scraped images
    if (config.saveScrapedImages) {
      // Normalize filenames first (resized -> base)
      content = content.replace(
        /(<img[^>]*src=")([^"]*\/)?([^/"]+\.(?:gif|jpe?g|png|webp|svg))("[^>]*>)/gi,
        (match, prefix, pathPart, filename, suffix) => {
          const baseFilename = shared.getBaseFilenameIfResized(filename);
          return prefix + (pathPart || '') + (baseFilename || filename) + suffix;
        }
      );

      // Update paths to point to the 'images/' directory
      content = content.replace(
        /(<img[^>]*src=")([^"]*\/)?([^/"]+\.(?:gif|jpe?g|png|webp|svg))("[^>]*>)/gi,
        (match, prefix, _pathPart, filename, suffix) => {
            // Ensure it doesn't already start with 'images/'
            if (filename.startsWith('images/')) {
                return match; // Avoid double prefixing
            }
            return `${prefix}images/${filename}${suffix}`;
        }
      );
    }

    // Escape 'more' tag for preservation
    content = content.replace(/<!--more(?: .*?)?-->/g, '<!--more-->'); // Simplified replacement

    // Extract code language hints from WP comments and add as data attribute
    content = content.replace(
      /(<!-- wp:.+? {.*?"language":"([^"]+?)".*?} -->\s*<pre)/gs, // More robust regex
      (match, preTagPart, language) => `${preTagPart} data-wetm-language="${language}" `
    );

    // Perform the main HTML to Markdown conversion
    let markdownContent = turndownService.turndown(content);

    // Clean up extra spaces after list markers
    markdownContent = markdownContent.replace(/^(- |\* |\d+\. ) +/gm, '$1');

    // Clean up the placeholder divs used for paragraph spacing
    markdownContent = markdownContent.replace(/^<div><\/div>$/gm, ''); // Remove divs on their own lines
    markdownContent = markdownContent.replace(/<div><\/div>/g, ''); // Remove any remaining inline divs

    // Trim whitespace and ensure consistent line endings
    return markdownContent.trim().replace(/\r\n/g, '\n');

  } catch (error: any) {
    // Ensure errors are consistently ConversionError
    if (error instanceof ConversionError) {
      throw error;
    }
    const postId = getXmlValue(postData.post_id) ?? 'N/A';
    throw new ConversionError(`Failed to convert content to Markdown for post ID: ${postId}`, error);
  }
}
