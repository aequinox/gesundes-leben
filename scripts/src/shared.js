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

module.exports = { getFilenameFromUrl };
