import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import fs from 'fs';
import https from 'https';
import path from 'path';
import sharp from 'sharp';
import { ImageProcessingError } from '../error/ErrorService';
import { loggerService } from '../logger/LoggerService';
import configService from '../config/ConfigService';

/**
 * Interface for image dimensions.
 */
export interface ImageDimensions {
  width?: number;
  height?: number;
}

/**
 * Interface for image metadata.
 */
export interface ImageMetadata {
  dimensions: ImageDimensions;
  format?: string;
  size?: number;
}

/**
 * Enum for image alignment.
 */
export enum ImageAlignment {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
}

/**
 * Interface for image alignment options.
 */
export interface ImageAlignmentOptions {
  squareAspectRatioMin: number;
  squareAspectRatioMax: number;
  wideAspectRatioThreshold: number;
  defaultAlignment: ImageAlignment;
}

/**
 * Service for handling image operations.
 */
export class ImageService {
  private readonly alignmentOptions: ImageAlignmentOptions;
  private alternateRight = true;

  /**
   * Creates an instance of ImageService.
   * @param alignmentOptions - Options for image alignment.
   */
  constructor(alignmentOptions?: Partial<ImageAlignmentOptions>) {
    this.alignmentOptions = {
      squareAspectRatioMin: 0.8,
      squareAspectRatioMax: 1.2,
      wideAspectRatioThreshold: 1.5,
      defaultAlignment: ImageAlignment.CENTER,
      ...alignmentOptions,
    };
  }

  /**
   * Gets the dimensions of an image file.
   * @param imagePath - Path to the image file.
   * @returns Promise resolving to image dimensions.
   * @throws {ImageProcessingError} If the image file cannot be processed.
   */
  public async getImageDimensions(imagePath: string): Promise<ImageDimensions> {
    try {
      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        loggerService.warn(`Image file not found: ${imagePath}`);
        return {};
      }

      // Get dimensions using Sharp
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      loggerService.error(`Error getting image dimensions for: ${imagePath}`, error);
      throw new ImageProcessingError(`Failed to get image dimensions: ${imagePath}`, error);
    }
  }

  /**
   * Gets the metadata of an image file.
   * @param imagePath - Path to the image file.
   * @returns Promise resolving to image metadata.
   * @throws {ImageProcessingError} If the image file cannot be processed.
   */
  public async getImageMetadata(imagePath: string): Promise<ImageMetadata> {
    try {
      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        loggerService.warn(`Image file not found: ${imagePath}`);
        return { dimensions: {} };
      }

      // Get metadata using Sharp
      const metadata = await sharp(imagePath).metadata();
      const stats = fs.statSync(imagePath);

      return {
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
        format: metadata.format,
        size: stats.size,
      };
    } catch (error) {
      loggerService.error(`Error getting image metadata for: ${imagePath}`, error);
      throw new ImageProcessingError(`Failed to get image metadata: ${imagePath}`, error);
    }
  }

  /**
   * Determines the appropriate alignment for an image based on its dimensions.
   * @param dimensions - The image dimensions.
   * @returns The image alignment.
   */
  public determineAlignment(dimensions: ImageDimensions): ImageAlignment {
    if (!dimensions.width || !dimensions.height) {
      // If dimensions are unknown, alternate between left and right
      const alignment = this.alternateRight ? ImageAlignment.RIGHT : ImageAlignment.LEFT;
      this.alternateRight = !this.alternateRight;
      return alignment;
    }

    const aspectRatio = dimensions.width / dimensions.height;

    if (
      aspectRatio >= this.alignmentOptions.squareAspectRatioMin &&
      aspectRatio <= this.alignmentOptions.squareAspectRatioMax
    ) {
      // Square-ish images alternate between left and right
      const alignment = this.alternateRight ? ImageAlignment.RIGHT : ImageAlignment.LEFT;
      this.alternateRight = !this.alternateRight;
      return alignment;
    } else if (aspectRatio > this.alignmentOptions.wideAspectRatioThreshold) {
      // Wide images are centered
      return ImageAlignment.CENTER;
    } else {
      // Other images alternate between left and right
      const alignment = this.alternateRight ? ImageAlignment.RIGHT : ImageAlignment.LEFT;
      this.alternateRight = !this.alternateRight;
      return alignment;
    }
  }

  /**
   * Determines the alignment marker for an image based on its dimensions.
   * @param dimensions - The image dimensions.
   * @returns The alignment marker.
   */
  public getAlignmentMarker(dimensions: ImageDimensions): string {
    const alignment = this.determineAlignment(dimensions);

    switch (alignment) {
      case ImageAlignment.LEFT:
        return '<';
      case ImageAlignment.RIGHT:
        return '>';
      case ImageAlignment.CENTER:
      default:
        return '_';
    }
  }

  /**
   * Determines the alignment marker for an image based on its filename.
   * Uses a hash of the filename to ensure consistent alignment.
   * @param filename - The image filename.
   * @returns The alignment marker.
   */
  public getAlignmentMarkerFromFilename(filename: string): string {
    // Calculate a simple hash of the filename
    const hash = filename.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Use the hash to determine alignment
    if (hash % 3 === 0) {
      return '_'; // Center
    } else if (hash % 3 === 1) {
      return '<'; // Left
    } else {
      return '>'; // Right
    }
  }

  /**
   * Downloads an image from a URL.
   * @param imageUrl - The URL of the image to download.
   * @returns Promise resolving to a Buffer containing the image data.
   * @throws {ImageProcessingError} If the image cannot be downloaded.
   */
  public async downloadImage(imageUrl: string): Promise<Buffer> {
    // Encode URL only if necessary
    const url = /%[\da-f]{2}/i.test(imageUrl) ? imageUrl : encodeURI(imageUrl);
    const settings = configService.getSettings();

    const axiosConfig: AxiosRequestConfig = {
      method: 'get',
      url,
      headers: {
        'User-Agent': 'wordpress-export-to-markdown', // Identify the client
      },
      responseType: 'arraybuffer',
      timeout: settings.image_download_timeout,
    };

    // Disable SSL verification if configured
    if (settings.strict_ssl === false) {
      axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    try {
      const response = await axios(axiosConfig);
      
      if (response.status !== 200) {
        throw new ImageProcessingError(`HTTP ${response.status} error downloading image`);
      }
      
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ? `HTTP ${error.response.status} ` : '';
        throw new ImageProcessingError(`${status}Error downloading image: ${error.message}`, error);
      }
      
      throw new ImageProcessingError('Failed to download image', error);
    }
  }

  /**
   * Extracts the filename from a URL.
   * @param url - The URL to extract the filename from.
   * @returns The extracted filename.
   */
  public getFilenameFromUrl(url: string): string {
    if (!url) {
      throw new ImageProcessingError('URL is required to extract filename.');
    }

    try {
      const filenameEncoded = url.split('/').pop() ?? '';
      
      if (!filenameEncoded) {
        loggerService.warn(`Could not extract filename component from URL: ${url}`);
        return '';
      }

      try {
        return decodeURIComponent(filenameEncoded);
      } catch (decodeError) {
        loggerService.error(`Failed to decode filename: "${filenameEncoded}" from URL: ${url}`, decodeError);
        return filenameEncoded;
      }
    } catch (error) {
      throw new ImageProcessingError(`Failed to extract filename from URL: ${url}`, error);
    }
  }

  /**
   * Checks if a filename is a resized version of an image.
   * @param filename - The filename to check.
   * @returns The base filename if it's a resized version, otherwise null.
   */
  public getBaseFilenameIfResized(filename: string): string | null {
    if (!filename) {
      return null;
    }
    
    // Regex to match patterns like: image-name-123x456.jpg
    const match = filename.match(/^(.+)-(\d+)x(\d+)(\.[^.]+)$/);
    
    if (match && match[1] && match[4]) {
      return match[1] + match[4];
    }
    
    return null;
  }

  /**
   * Checks if a file exists with a different extension.
   * @param basePath - The base directory path.
   * @param filename - The filename to check.
   * @param possibleExtensions - Array of possible extensions to check.
   * @returns The filename with the correct extension if found, otherwise the original filename.
   */
  public findCorrectFileExtension(
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
        return filename;
      }

      // Extract the base name without extension
      const lastDotIndex = filename.lastIndexOf('.');
      
      if (lastDotIndex === -1) {
        return filename;
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
          loggerService.info(`Found correct file extension: ${filename} -> ${alternativeFilename}`);
          return alternativeFilename;
        }
      }

      return filename;
    } catch (error) {
      loggerService.error(`Error checking file extensions for: ${filename}`, error);
      return filename;
    }
  }

  /**
   * Gets the normalized image path.
   * @param src - The original image source.
   * @param basePath - The base directory path.
   * @returns The normalized image path.
   */
  public getNormalizedImagePath(src: string, basePath: string = ''): string {
    if (!src) {
      return '';
    }

    try {
      const filename = this.getFilenameFromUrl(src);
      
      if (!filename) {
        loggerService.warn(`Could not extract filename from src: ${src} in getNormalizedImagePath. Returning original src.`);
        return src;
      }

      const baseFilename = this.getBaseFilenameIfResized(filename);
      let normalizedFilename = baseFilename || filename;

      // If basePath is provided, check for correct file extension
      if (basePath) {
        normalizedFilename = this.findCorrectFileExtension(basePath, normalizedFilename);
      }

      // Replace the original filename with the normalized one in the src path
      const parts = src.split('/');
      parts[parts.length - 1] = normalizedFilename;
      return parts.join('/');
    } catch (error) {
      loggerService.error(`Error normalizing image path for src: ${src}`, error);
      return src;
    }
  }
}

// Export a singleton instance of the ImageService
export const imageService = new ImageService();
