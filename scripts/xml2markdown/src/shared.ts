import { ConversionError } from "./errors.js";
import logger from "./logger.js";

/**
 * Extract filename from URL
 * Attempts to decode the filename if it's URL encoded
 *
 * @param url - URL to extract filename from
 * @returns Decoded filename
 * @throws {ConversionError} When URL is invalid
 */
function getFilenameFromUrl(url: string): string {
  if (!url) {
    throw new ConversionError("URL is required");
  }

  try {
    const [filename] = url.split("/").slice(-1);
    try {
      return decodeURIComponent(filename);
    } catch (_error) {
      // If decoding fails, log the error and return filename as-is
      logger.error("Failed to decode filename:", _error);
      return filename;
    }
  } catch (_error) {
    throw new ConversionError("Failed to extract filename from URL", {
      url,
      error: _error instanceof Error ? _error.message : String(_error),
    });
  }
}

export { getFilenameFromUrl };
