import { ConversionError } from './errors';
import logger from './logger'; // Import the logger for consistent logging

/**
 * Extracts the filename from a URL.
 * Attempts to decode the filename if it's URL encoded.
 *
 * @param url - The URL string to extract the filename from.
 * @returns The decoded filename.
 * @throws {ConversionError} If the URL is empty or invalid, or if filename extraction fails.
 */
export function getFilenameFromUrl(url: string): string {
  if (!url) {
    // Use logger for consistency, though throwing might be better here
    logger.error('getFilenameFromUrl called with empty URL.');
    throw new ConversionError('URL is required to extract filename.');
  }

  try {
    // Ensure there's a fallback if split results in an empty array or pop returns undefined
    const filenameEncoded = url.split('/').pop() ?? '';
    if (!filenameEncoded) {
        logger.warn(`Could not extract filename component from URL: ${url}`);
        return ''; // Return empty string if no filename part found
    }

    try {
      // Attempt to decode
      return decodeURIComponent(filenameEncoded);
    } catch (decodeError: unknown) {
      // If decoding fails, log the error and return the encoded filename
      logger.error(`Failed to decode filename: "${filenameEncoded}" from URL: ${url}`, decodeError);
      return filenameEncoded; // Return the original encoded filename
    }
  } catch (splitError: unknown) {
    // Catch potential errors during the split/pop process itself
    throw new ConversionError(`Failed to extract filename from URL: ${url}`, splitError);
  }
}

/**
 * Checks if a filename matches the pattern for a resized image (e.g., "image-123x456.jpg").
 *
 * @param filename - The filename to check.
 * @returns The base filename (e.g., "image.jpg") if it's a resized version, otherwise null.
 */
export function getBaseFilenameIfResized(filename: string): string | null {
  if (!filename) {
    return null;
  }
  // Regex to match patterns like: image-name-123x456.jpg
  // It captures the base part (image-name) and the extension (.jpg)
  const match = filename.match(/^(.+)-(\d+)x(\d+)(\.[^.]+)$/);
  if (match && match[1] && match[4]) {
    // Ensure the base part is not empty and has a valid extension captured
    return match[1] + match[4]; // Combine base name and extension
  }
  return null; // No match found
}

/**
 * Gets the normalized image path, replacing resized filenames with their base versions.
 * Example: path/to/image-123x456.jpg -> path/to/image.jpg
 *
 * @param src - The original image source URL or path string.
 * @returns The normalized image path string. Returns the original src if filename extraction fails.
 */
export function getNormalizedImagePath(src: string): string {
  if (!src) {
    return ''; // Return empty if src is empty
  }

  try {
    const filename = getFilenameFromUrl(src); // Use the robust function to get filename
    if (!filename) {
        logger.warn(`Could not extract filename from src: ${src} in getNormalizedImagePath. Returning original src.`);
        return src; // Return original if filename extraction failed
    }

    const baseFilename = getBaseFilenameIfResized(filename);

    // If it's a resized version, replace the original filename with the base filename in the src path
    if (baseFilename) {
      // Be careful with replacement: ensure only the filename part is replaced
      const parts = src.split('/');
      parts[parts.length - 1] = baseFilename; // Replace last part (filename)
      return parts.join('/');
    }

    // If it's not a resized version, return the original src
    return src;
  } catch (error: unknown) {
      // Log error during normalization process and return original src as fallback
      logger.error(`Error normalizing image path for src: ${src}`, error);
      return src;
  }
}