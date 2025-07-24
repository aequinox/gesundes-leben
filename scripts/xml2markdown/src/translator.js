import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { ConversionError } from './errors.js';

/**
 * Generate a valid JavaScript variable name from an image filename
 * @param {string} filename - Image filename
 * @returns {string} Valid variable name
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
 * @typedef {Object} TurndownService
 * @property {function} addRule - Add a custom rule for HTML to Markdown conversion
 * @property {function} use - Use a turndown plugin
 * @property {function} turndown - Convert HTML to Markdown
 */

/**
 * Initialize TurndownService with custom rules for WordPress content
 * @returns {TurndownService} Configured TurndownService instance
 */
function initTurndownService() {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });

  turndownService.use(gfm);

  // preserve embedded tweets
  turndownService.addRule('tweet', {
    filter: node =>
      node.nodeName === 'BLOCKQUOTE' && node.getAttribute('class') === 'twitter-tweet',
    replacement: (content, node) => '\n\n' + node.outerHTML,
  });

  // preserve embedded codepens
  turndownService.addRule('codepen', {
    filter: node => {
      // codepen embed snippets have changed over the years
      // but this series of checks should find the commonalities
      return (
        ['P', 'DIV'].includes(node.nodeName) &&
        node.attributes['data-slug-hash'] &&
        node.getAttribute('class') === 'codepen'
      );
    },
    replacement: (content, node) => '\n\n' + node.outerHTML,
  });

  // preserve embedded scripts (for tweets, codepens, gists, etc.)
  turndownService.addRule('script', {
    filter: 'script',
    replacement: (content, node) => {
      let before = '\n\n';
      if (node.previousSibling && node.previousSibling.nodeName !== '#text') {
        // keep twitter and codepen <script> tags snug with the element above them
        before = '\n';
      }
      const html = node.outerHTML.replace('async=""', 'async');
      return before + html + '\n\n';
    },
  });

  // iframe boolean attributes do not need to be set to empty string
  turndownService.addRule('iframe', {
    filter: 'iframe',
    replacement: (content, node) => {
      const html = node.outerHTML
        .replace('allowfullscreen=""', 'allowfullscreen')
        .replace('allowpaymentrequest=""', 'allowpaymentrequest');
      return '\n\n' + html + '\n\n';
    },
  });

  // convert <figure> with images to Astro <Image> components
  turndownService.addRule('figure', {
    filter: 'figure',
    replacement: (content, node) => {
      const img = node.querySelector('img');
      const figcaption = node.querySelector('figcaption');
      
      if (img) {
        // Extract image details
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        
        // Generate image variable name from filename
        const filename = src.split('/').pop() || 'image';
        const imageVar = generateImageVariableName(filename);
        
        // Store image import for later use (will be added to frontmatter or imports)
        if (!turndownService._imageImports) {
          turndownService._imageImports = [];
        }
        turndownService._imageImports.push({
          variable: imageVar,
          path: src.includes('images/') ? `./${src}` : `./images/${src.split('/').pop()}`,
          filename: filename
        });
        
        // Generate Astro Image component
        let imageComponent = `<Image\n  src={${imageVar}}\n  alt="${alt.replace(/"/g, '&quot;')}"`;
        
        // Determine position from figure classes or default to center
        let position = 'center';
        const figureClass = node.getAttribute('class') || '';
        
        if (figureClass.includes('align-right') || figureClass.includes('float-right')) {
          position = 'right';
        } else if (figureClass.includes('align-left') || figureClass.includes('float-left')) {
          position = 'left';
        } else if (figureClass.includes('align-center') || figureClass.includes('center')) {
          position = 'center';
        }
        
        // Check for WordPress alignment classes as well
        if (figureClass.includes('alignright')) {
          position = 'right';
        } else if (figureClass.includes('alignleft')) {
          position = 'left';
        } else if (figureClass.includes('aligncenter')) {
          position = 'center';
        }
        
        imageComponent += `\n  position="${position}"`;
        
        imageComponent += '\n/>';
        
        return '\n\n' + imageComponent + '\n\n';
      } else if (figcaption) {
        // Preserve figures without images but with captions
        const result = '\n\n<figure>\n\n' + content + '\n\n</figure>\n\n';
        return result.replace('\n\n\n\n', '\n\n'); // collapse quadruple newlines
      } else {
        // does not contain image or figcaption, do not preserve
        return content;
      }
    },
  });

  // preserve <figcaption>
  turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: content => {
      // extra newlines are necessary for markdown and HTML to render correctly together
      return '\n\n<figcaption>\n\n' + content + '\n\n</figcaption>\n\n';
    },
  });

  // convert <pre> into a code block with language when appropriate
  turndownService.addRule('pre', {
    filter: node => {
      // a <pre> with <code> inside will already render nicely, so don't interfere
      return node.nodeName === 'PRE' && !node.querySelector('code');
    },
    replacement: (content, node) => {
      const language = node.getAttribute('data-wetm-language') || '';
      return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n';
    },
  });

  return turndownService;
}

/**
 * Convert post HTML content to Markdown
 *
 * @param {Object} postData - Raw post data from WordPress export
 * @param {TurndownService} turndownService - Configured TurndownService instance
 * @param {Object} config - Configuration options
 * @param {boolean} [config.saveScrapedImages] - Whether to update image paths for scraped images
 * @returns {{content: string, imageImports: Array}} Post content and image imports
 * @throws {ConversionError} When content conversion fails
 */
function getPostContent(postData, turndownService, config) {
  try {
    if (!postData.encoded || !postData.encoded[0]) {
      throw new ConversionError('Post content is missing');
    }

    let content = postData.encoded[0];

    // insert an empty div element between double line breaks
    // this nifty trick causes turndown to keep adjacent paragraphs separated
    // without mucking up content inside of other elements (like <code> blocks)
    content = content.replace(/(\r?\n){2}/g, '\n<div></div>\n');

    if (config.saveScrapedImages) {
      // writeImageFile() will save all content images to a relative /images
      // folder so update references in post content to match
      content = content.replace(
        /(<img[^>]*src=").*?([^/"]+\.(?:gif|jpe?g|png|webp))("[^>]*>)/gi,
        '$1images/$2$3'
      );
    }

    // preserve "more" separator, max one per post, optionally with custom label
    // by escaping angle brackets (will be unescaped during turndown conversion)
    content = content.replace(/<(!--more( .*)?--)>/, '&lt;$1&gt;');

    // some WordPress plugins specify a code language in an HTML comment above a
    // <pre> block, save it to a data attribute so the "pre" rule can use it
    content = content.replace(
      /(<!-- wp:.+? \{"language":"(.+?)"\} -->\r?\n<pre )/g,
      '$1data-wetm-language="$2" '
    );

    // Clear any previous image imports
    turndownService._imageImports = [];
    
    // use turndown to convert HTML to Markdown
    content = turndownService.turndown(content);

    // clean up extra spaces in list items
    content = content.replace(/(-|\d+\.) +/g, '$1 ');

    // Return both content and image imports
    return {
      content: content,
      imageImports: turndownService._imageImports || []
    };
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw new ConversionError('Failed to convert post content to Markdown', error);
  }
}

export {
  initTurndownService,
  getPostContent,
};
