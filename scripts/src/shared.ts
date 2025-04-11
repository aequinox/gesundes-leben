import fs from 'fs';
import path from 'path';
import { ConversionError } from './errors';
import logger from './logger'; // Import the logger for consistent logging

// Extend NodeJS Global interface for imageDimensions
declare global {
  // eslint-disable-next-line no-var
  var imageDimensions: Map<string, { width?: number; height?: number }>;
}

// Ensure global map exists
if (!global.imageDimensions) {
  global.imageDimensions = new Map<string, { width?: number; height?: number }>();
}

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
/**
 * Checks if a file exists with a different extension.
 * Useful for finding the correct file when the extension in the reference is wrong.
 * 
 * @param basePath - The base directory path where to look for the file
 * @param filename - The filename with potentially incorrect extension
 * @param possibleExtensions - Array of possible extensions to check (without the dot)
 * @returns The filename with the correct extension if found, or the original filename if not
 */
export function findCorrectFileExtension(
  basePath: string, 
  filename: string, 
  possibleExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
): string {
  if (!filename) {
    return filename;
  }

  try {
    // Check if the file already exists with its current extension
    const fullPath = path.join(basePath, filename);
    if (fs.existsSync(fullPath)) {
      return filename; // File exists with current extension
    }

    // Extract the base name without extension
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return filename; // No extension found
    }

    const baseName = filename.substring(0, lastDotIndex);
    const currentExt = filename.substring(lastDotIndex + 1).toLowerCase();

    // Don't check the current extension again
    const extensionsToCheck = possibleExtensions.filter(ext => ext.toLowerCase() !== currentExt);

    // Try each possible extension
    for (const ext of extensionsToCheck) {
      const alternativeFilename = `${baseName}.${ext}`;
      const alternativePath = path.join(basePath, alternativeFilename);
      
      if (fs.existsSync(alternativePath)) {
        logger.info(`Found correct file extension: ${filename} -> ${alternativeFilename}`);
        return alternativeFilename;
      }
    }

    // If no alternative found, return the original
    return filename;
  } catch (error: unknown) {
    logger.error(`Error checking file extensions for: ${filename}`, error);
    return filename; // Return original on error
  }
}

/**
 * Gets the dimensions of an image file.
 * 
 * @param imagePath - The full path to the image file
 * @returns An object with width and height properties, or undefined if dimensions couldn't be determined
 */
export function getImageDimensions(imagePath: string): { width?: number; height?: number } | undefined {
  try {
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      logger.warn(`Image file not found: ${imagePath}`);
      return undefined;
    }

    // For now, we'll use a simple approach to get dimensions from global map if available
    // In a real implementation, you might use a library like 'image-size' to get actual dimensions
    const filename = path.basename(imagePath);
    
    // Check if we have dimensions in the global map
    if (global.imageDimensions?.has(filename)) {
      return global.imageDimensions.get(filename);
    }
    
    // If we don't have dimensions, return undefined
    // In a real implementation, you would calculate dimensions here
    logger.info(`No dimensions found for image: ${filename}`);
    return undefined;
  } catch (error) {
    logger.error(`Error getting image dimensions for: ${imagePath}`, error);
    return undefined;
  }
}

export function getNormalizedImagePath(src: string, basePath: string = ''): string {
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
    let normalizedFilename = baseFilename || filename;

    // If basePath is provided, check for correct file extension
    if (basePath) {
      normalizedFilename = findCorrectFileExtension(basePath, normalizedFilename);
    }

    // Replace the original filename with the normalized one in the src path
    const parts = src.split('/');
    parts[parts.length - 1] = normalizedFilename; // Replace last part (filename)
    return parts.join('/');
  } catch (error: unknown) {
      // Log error during normalization process and return original src as fallback
      logger.error(`Error normalizing image path for src: ${src}`, error);
      return src;
  }
}
