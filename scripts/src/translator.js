const turndown = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');
const { ConversionError } = require('./errors');
const shared = require('./shared');

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
  // Initialize alternating image alignment
  let alternateRight = true;
  
  const turndownService = new turndown({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
  });

  turndownService.use(turndownPluginGfm.tables);

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

  // Handle figure with figcaption for images
  turndownService.addRule('figure', {
    filter: node => {
      return node.nodeName === 'FIGURE' && 
             node.querySelector('img') && 
             node.querySelector('figcaption');
    },
    replacement: (content, node) => {
      const img = node.querySelector('img');
      const figcaption = node.querySelector('figcaption');
      
      if (!img || !figcaption) {
        return content;
      }
      
      // Extract image attributes
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      let caption = figcaption.textContent.trim();
      
      // Get filename from src
      const filename = src.split('/').pop();
      
      // Determine alignment based on aspect ratio
      let alignmentMarker = '_'; // Default to center
      
      // Check if we have dimensions for this image
      if (global.imageDimensions && global.imageDimensions.has(filename)) {
        const { width, height } = global.imageDimensions.get(filename);
        
        if (width && height) {
          const aspectRatio = width / height;
          
          if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
            // Square-ish image - alternate between left and right
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight; // Toggle for next image
          } else if (aspectRatio > 1.5) {
            // Wide image (16:9, 4:1, etc.) - center
            alignmentMarker = '_';
          } else {
            // Default to alternating for other aspect ratios
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight; // Toggle for next image
          }
        } else {
          // If dimensions are invalid, use alternating pattern
          alignmentMarker = alternateRight ? '>' : '<';
          alternateRight = !alternateRight; // Toggle for next image
        }
      } else {
        // If dimensions unknown, use alternating pattern
        alignmentMarker = alternateRight ? '>' : '<';
        alternateRight = !alternateRight; // Toggle for next image
      }
      
      // Add the alignment marker to the caption
      caption = alignmentMarker + caption;
      
      // Return the markdown image with alignment in caption
      return `![${alt}](${src.replace(/^.*\/([^/]+)$/, 'images/$1')} "${caption}")`;
    },
  });

  // preserve <figure> when it contains a <figcaption> but no image
  turndownService.addRule('figureNoImage', {
    filter: node => {
      return node.nodeName === 'FIGURE' && 
             !node.querySelector('img') && 
             node.querySelector('figcaption');
    },
    replacement: (content, node) => {
      // extra newlines are necessary for markdown and HTML to render correctly together
      const result = '\n\n<figure>\n\n' + content + '\n\n</figure>\n\n';
      return result.replace('\n\n\n\n', '\n\n'); // collapse quadruple newlines
    },
  });

  // preserve <figcaption> for non-image figures
  turndownService.addRule('figcaption', {
    filter: node => {
      return node.nodeName === 'FIGCAPTION' && 
             (!node.parentNode || node.parentNode.nodeName !== 'FIGURE' || 
              !node.parentNode.querySelector('img'));
    },
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


  // Custom rule for standalone images (not in figure)
  turndownService.addRule('image', {
    filter: node => {
      return node.nodeName === 'IMG' && 
             (!node.parentNode || node.parentNode.nodeName !== 'FIGURE');
    },
    replacement: function(content, node) {
      // Extract image attributes
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      let title = node.getAttribute('title') || '';
      
      // Get filename from src
      const filename = src.split('/').pop();
      
      // Determine alignment based on aspect ratio
      let alignmentMarker = '_'; // Default to center
      
      // Check if we have dimensions for this image
      if (global.imageDimensions && global.imageDimensions.has(filename)) {
        const { width, height } = global.imageDimensions.get(filename);
        
        if (width && height) {
          const aspectRatio = width / height;
          
          if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
            // Square-ish image - alternate between left and right
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight; // Toggle for next image
          } else if (aspectRatio > 1.5) {
            // Wide image (16:9, 4:1, etc.) - center
            alignmentMarker = '_';
          } else {
            // Default to alternating for other aspect ratios
            alignmentMarker = alternateRight ? '>' : '<';
            alternateRight = !alternateRight; // Toggle for next image
          }
        } else {
          // If dimensions are invalid, use alternating pattern
          alignmentMarker = alternateRight ? '>' : '<';
          alternateRight = !alternateRight; // Toggle for next image
        }
      } else {
        // If dimensions unknown, use alternating pattern
        alignmentMarker = alternateRight ? '>' : '<';
        alternateRight = !alternateRight; // Toggle for next image
      }
      
      // Remove any existing alignment markers from title
      title = title.replace(/^[<>_]/, '');
      
      // Add the alignment marker to the title
      if (title) {
        title = alignmentMarker + title;
      } else {
        // If no title, add a minimal title with alignment
        title = alignmentMarker + 'Image';
      }
      
      // Return the markdown image with alignment in title
      return `![${alt}](${src} "${title}")`;
    }
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
 * @returns {string} Post content in Markdown format
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

    // use turndown to convert HTML to Markdown
    content = turndownService.turndown(content);

    // clean up extra spaces in list items
    content = content.replace(/(-|\d+\.) +/g, '$1 ');

    return content;
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw new ConversionError('Failed to convert post content to Markdown', error);
  }
}

module.exports = {
  initTurndownService,
  getPostContent,
};
