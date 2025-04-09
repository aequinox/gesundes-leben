const { ConversionError } = require('./errors');

/**
 * Extract filename from URL
 * Attempts to decode the filename if it's URL encoded
 *
 * @param {string} url - URL to extract filename from
 * @returns {string} Decoded filename
 * @throws {ConversionError} When URL is invalid
 */
function getFilenameFromUrl(url) {
  if (!url) {
    throw new ConversionError('URL is required');
  }

  try {
    const filename = url.split('/').slice(-1)[0];
    try {
      return decodeURIComponent(filename);
    } catch (_error) {
      // If decoding fails, log the error and return filename as-is
      console.error('Failed to decode filename:', _error);
      return filename;
    }
  } catch (_error) {
    throw new ConversionError('Failed to extract filename from URL', _error);
  }
}

/**
 * Check if a filename is a resized version of another image
 * @param {string} filename - Filename to check
 * @returns {string|null} Base filename if it's a resized version, null otherwise
 */
function getBaseFilenameIfResized(filename) {
  // Match patterns like: image-name-123x456.jpg -> would return image-name.jpg
  const match = filename.match(/^(.+)-\d+x\d+(\.[^.]+)$/);
  if (match) {
    return match[1] + match[2];
  }
  return null;
}

/**
 * Get the normalized image filename, converting resized versions to base versions
 * @param {string} src - Image source URL or path
 * @returns {string} Normalized image path
 */
function getNormalizedImagePath(src) {
  // Extract filename from src
  const filename = src.split('/').pop();
  
  // Check if this is a resized version
  const baseFilename = getBaseFilenameIfResized(filename);
  
  // If it's a resized version, use the base filename instead
  const normalizedFilename = baseFilename || filename;
  
  // Replace the filename in the src
  return src.replace(filename, normalizedFilename);
}

module.exports = { 
  getFilenameFromUrl,
  getBaseFilenameIfResized,
  getNormalizedImagePath
};
