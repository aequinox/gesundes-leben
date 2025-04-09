const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const http = require('http');
const https = require('https');
const luxon = require('luxon');
const path = require('path');
const Buffer = require('buffer').Buffer;
const sharp = require('sharp');

const shared = require('./shared');
const settings = require('./settings');
const { ConversionError } = require('./errors');
const postProcessor = require('./post-processor');

/**
 * @typedef {Object} Payload
 * @property {*} item - Item to process (post or image URL)
 * @property {string} name - Display name for logging
 * @property {string} destinationPath - Path to write file to
 * @property {number} delay - Delay before processing in ms
 */

/**
 * Write markdown files and download images for posts
 * @param {import('./parser').Post[]} posts - Array of posts to write
 * @param {Object} config - Configuration options
 * @returns {Promise<void>}
 * @throws {ConversionError} When file writing fails
 */
async function writeFilesPromise(posts, config) {
  await writeMarkdownFilesPromise(posts, config);
  await writeImageFilesPromise(posts, config);
  
  // Post-process the generated markdown files to ensure Astro compatibility
  try {
    console.log('\nPost-processing markdown files for Astro compatibility...');
    const processedCount = await postProcessor.processDirectory(config.output, {
      extension: '.mdx',
      recursive: true
    });
    console.log(`Post-processed ${processedCount} files for Astro compatibility.`);
  } catch (error) {
    console.log(chalk.yellow('[WARNING]') + ' Post-processing failed: ' + error.message);
    console.log('You may need to run the fix-markdown.js script manually.');
  }
}

/**
 * Process an array of payloads with a given load function
 * @param {Payload[]} payloads - Array of payloads to process
 * @param {function} loadFunc - Function to load data for each payload
 * @returns {Promise<void>}
 */
async function processPayloadsPromise(payloads, loadFunc) {
  const promises = payloads.map(
    payload =>
      new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const data = await loadFunc(payload.item);
            await writeFile(payload.destinationPath, data);
            console.log(chalk.green('[OK]') + ' ' + payload.name);
            resolve();
          } catch (error) {
            console.log(
              chalk.red('[FAILED]') +
                ' ' +
                payload.name +
                ' ' +
                chalk.red('(' + error.toString() + ')')
            );
            reject(error);
          }
        }, payload.delay);
      })
  );

  const results = await Promise.allSettled(promises);
  const failedCount = results.filter(result => result.status === 'rejected').length;

  if (failedCount === 0) {
    console.log('Done, got them all!');
  } else {
    console.log('Done, but with ' + chalk.red(failedCount + ' failed') + '.');
  }
}

/**
 * Write data to a file, creating directories as needed
 * @param {string} destinationPath - Path to write file to
 * @param {string|Buffer} data - Data to write
 * @returns {Promise<void>}
 * @throws {ConversionError} When file writing fails
 */
async function writeFile(destinationPath, data) {
  try {
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.promises.writeFile(destinationPath, data);
  } catch (error) {
    throw new ConversionError(`Failed to write file: ${destinationPath}`, error);
  }
}

/**
 * Write markdown files for posts
 * @param {import('./parser').Post[]} posts - Array of posts to write
 * @param {Object} config - Configuration options
 * @returns {Promise<void>}
 */
async function writeMarkdownFilesPromise(posts, config) {
  // package up posts into payloads
  let skipCount = 0;
  let delay = 0;
  const payloads = posts.flatMap(post => {
    const destinationPath = getPostPath(post, config);
    if (checkFile(destinationPath)) {
      // already exists, don't need to save again
      skipCount++;
      return [];
    } else {
      const payload = {
        item: post,
        name: (config.includeOtherTypes ? post.meta.type + ' - ' : '') + post.meta.slug,
        destinationPath,
        delay,
      };
      delay += settings.markdown_file_write_delay;
      return [payload];
    }
  });

  const remainingCount = payloads.length;
  if (remainingCount + skipCount === 0) {
    console.log('\nNo posts to save...');
  } else {
    console.log(`\nSaving ${remainingCount} posts (${skipCount} already exist)...`);
    await processPayloadsPromise(payloads, loadMarkdownFilePromise);
  }
}

/**
 * Load markdown content for a post
 * @param {import('./parser').Post} post - Post to load content for
 * @returns {Promise<string>} Markdown content
 */
function loadMarkdownFilePromise(post) {
  let output = '---\n';

  Object.entries(post.frontmatter).forEach(([key, value]) => {
    let outputValue;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        // array of one or more strings
        outputValue = value.reduce((list, item) => {
          const itemStr = typeof item === 'string' ? item : String(item);
          const escapedItem = itemStr.replace(/"/g, '\\"');
          return `${list}\n  - "${escapedItem}"`;
        }, '');
      }
    } else if (typeof value === 'object' && value !== null) {
      // object value (like heroImage)
      outputValue = '\n' + Object.entries(value).reduce((objStr, [k, v]) => {
        const vStr = typeof v === 'string' ? v : String(v);
        const escapedV = vStr.replace(/"/g, '\\"');
        return `${objStr}  ${k}: "${escapedV}"\n`;
      }, '');
    } else {
      // single value (string, number, boolean, etc.)
      const valueStr = typeof value === 'string' ? value : String(value);
      const escapedValue = valueStr.replace(/"/g, '\\"');
      if (escapedValue.length > 0) {
        outputValue = `"${escapedValue}"`;
      }
    }

    if (outputValue !== undefined) {
      output += `${key}: ${outputValue}\n`;
    }
  });

  output += `---\n\n${post.content}\n`;
  return output;
}

// Using shared functions for image filename normalization

/**
 * Write image files for posts
 * @param {import('./parser').Post[]} posts - Array of posts to write
 * @param {Object} config - Configuration options
 * @returns {Promise<void>}
 */
async function writeImageFilesPromise(posts, config) {
  // collect image data from all posts into a single flattened array of payloads
  let skipCount = 0;
  let delay = 0;
  
  // Track which base images we've already processed
  const processedBaseImages = new Set();
  
  // First pass: collect all image URLs and identify base images
  const allImageUrls = posts.flatMap(post => post.meta.imageUrls);
  const baseImageMap = new Map();
  
  allImageUrls.forEach(imageUrl => {
    const filename = shared.getFilenameFromUrl(imageUrl);
    const baseFilename = shared.getBaseFilenameIfResized(filename);
    
    if (baseFilename) {
      // This is a resized version, add it to the map
      if (!baseImageMap.has(baseFilename)) {
        baseImageMap.set(baseFilename, []);
      }
      baseImageMap.get(baseFilename).push({ url: imageUrl, filename });
    }
  });
  
  // Second pass: create payloads, prioritizing base images and skipping resized versions
  const payloads = posts.flatMap(post => {
    const postPath = getPostPath(post, config);
    const imagesDir = path.join(path.dirname(postPath), 'images');
    
    return post.meta.imageUrls.flatMap(imageUrl => {
      const filename = shared.getFilenameFromUrl(imageUrl);
      const destinationPath = path.join(imagesDir, filename);
      
      // Check if this is a resized version
      const baseFilename = shared.getBaseFilenameIfResized(filename);
      
      // Skip if the file already exists
      if (checkFile(destinationPath)) {
        skipCount++;
        return [];
      }
      
      // Skip if this is a resized version and we've already processed the base image
      if (baseFilename && processedBaseImages.has(baseFilename)) {
        console.log(chalk.blue('[INFO]') + ` Skipping resized version: ${filename} (base: ${baseFilename})`);
        skipCount++;
        return [];
      }
      
      // If this is a base image, mark it as processed
      if (!baseFilename) {
        // Check if any resized versions of this image exist in the map
        if (baseImageMap.has(filename)) {
          processedBaseImages.add(filename);
        }
      }
      
      const payload = {
        item: imageUrl,
        name: filename,
        destinationPath,
        delay,
      };
      delay += settings.image_file_request_delay;
      return [payload];
    });
  });

  const remainingCount = payloads.length;
  if (remainingCount + skipCount === 0) {
    console.log('\nNo images to download and save...');
  } else {
    console.log(
      `\nDownloading and saving ${remainingCount} images (${skipCount} already exist)...`
    );
    await processPayloadsPromise(payloads, loadImageFilePromise);
  }
}

// Global map to store image dimensions
if (!global.imageDimensions) {
  global.imageDimensions = new Map();
}

/**
 * Load image data from URL
 * @param {string} imageUrl - URL to load image from
 * @returns {Promise<Buffer>} Image data
 * @throws {ConversionError} When image loading fails
 */
async function loadImageFilePromise(imageUrl) {
  // only encode the URL if it doesn't already have encoded characters
  const url = /%[\da-f]{2}/i.test(imageUrl) ? imageUrl : encodeURI(imageUrl);

  const config = {
    method: 'get',
    url,
    headers: {
      'User-Agent': 'wordpress-export-to-markdown',
    },
    responseType: 'arraybuffer',
  };

  if (!settings.strict_ssl) {
    // custom agents to disable SSL errors (adding both http and https, just in case)
    config.httpAgent = new http.Agent({ rejectUnauthorized: false });
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }

  try {
    const response = await axios(config);
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    // Extract image dimensions using Sharp
    try {
      const filename = shared.getFilenameFromUrl(imageUrl);
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;
      
      // Store dimensions in the global map
      global.imageDimensions.set(filename, { width, height });
      console.log(chalk.blue('[INFO]') + ` Image dimensions for ${filename}: ${width}x${height}`);
    } catch (dimensionError) {
      console.log(chalk.yellow('[WARNING]') + ` Failed to extract dimensions for ${shared.getFilenameFromUrl(imageUrl)}: ${dimensionError.message}`);
    }
    
    return imageBuffer;
  } catch (error) {
    if (error.response) {
      // request was made, but server responded with an error status code
      throw new ConversionError(`HTTP ${error.response.status} error downloading image`);
    }
    throw new ConversionError('Failed to download image', error);
  }
}

/**
 * Get destination path for a post
 * @param {import('./parser').Post} post - Post to get path for
 * @param {Object} config - Configuration options
 * @returns {string} Destination path
 */
function getPostPath(post, config) {
  let dt;
  if (settings.custom_date_formatting) {
    dt = luxon.DateTime.fromFormat(post.frontmatter.date, settings.custom_date_formatting);
  } else {
    dt = luxon.DateTime.fromISO(post.frontmatter.date);
  }

  // start with base output dir
  const pathSegments = [config.output];

  // create segment for post type if we're dealing with more than just "post"
  if (config.includeOtherTypes) {
    pathSegments.push(post.meta.type);
  }

  if (config.yearFolders) {
    pathSegments.push(dt.toFormat('yyyy'));
  }

  if (config.monthFolders) {
    pathSegments.push(dt.toFormat('LL'));
  }

  // create slug fragment, possibly date prefixed
  let slugFragment = post.meta.slug;
  if (config.prefixDate) {
    slugFragment = dt.toFormat('yyyy-LL-dd') + '-' + slugFragment;
  }

  // use slug fragment as folder or filename as specified
  if (config.postFolders) {
    pathSegments.push(slugFragment, 'index.mdx');
  } else {
    pathSegments.push(slugFragment + '.mdx');
  }

  return path.join(...pathSegments);
}

/**
 * Check if a file exists
 * @param {string} path - Path to check
 * @returns {boolean} Whether file exists
 */
function checkFile(path) {
  return fs.existsSync(path);
}

module.exports = { writeFilesPromise };
