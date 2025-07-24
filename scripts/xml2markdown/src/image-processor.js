import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

import { VisionatiService } from './visionati.js';
import { XmlConversionError } from './errors.js';
import { xmlLogger } from './logger.js';
import * as shared from './shared.js';

/**
 * @typedef {Object} ProcessedImage
 * @property {string} originalUrl - Original image URL
 * @property {string} originalFilename - Original filename
 * @property {string} finalFilename - Final filename (with AI enhancement if enabled)
 * @property {string} altText - Alt text (AI-generated or fallback)
 * @property {string} destinationPath - Full path where image will be saved
 * @property {Buffer} data - Image data buffer
 * @property {boolean} aiEnhanced - Whether AI enhancement was used
 * @property {number} creditsUsed - Visionati credits consumed
 */

/**
 * Enhanced image processor with AI-powered alt text and filename generation
 * Integrates Visionati API for German health blog content optimization
 */
export class ImageProcessor {
  /**
   * @param {import('./types.js').XmlConverterConfig} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.visionatiService = null;
    this.totalCreditsUsed = 0;
    this.processedCount = 0;
    this.aiEnhancedCount = 0;
    
    // Initialize Visionati service if AI features are enabled
    if (config.generateAltTexts && config.visionatiApiKey) {
      this.initializeVisionatiService();
    } else if (config.generateAltTexts && !config.visionatiApiKey) {
      xmlLogger.warn('⚠️ AI alt text generation requested but no API key provided. Using fallback descriptions.');
    }
  }

  /**
   * Initialize Visionati API service
   * @private
   */
  initializeVisionatiService() {
    try {
      const visionatiConfig = {
        apiKey: this.config.visionatiApiKey,
        backend: this.config.visionatiBackend || 'claude',
        language: this.config.visionatiLanguage || 'de',
        prompt: this.config.visionatiPrompt,
        timeout: this.config.visionatiTimeout || 30000,
        maxConcurrent: this.config.visionatiMaxConcurrent || 5,
        retryAttempts: 3
      };

      this.visionatiService = new VisionatiService(visionatiConfig);
      xmlLogger.info('🤖 AI-powered image processing enabled');
      
    } catch (error) {
      xmlLogger.error('❌ Failed to initialize Visionati service:', error);
      xmlLogger.warn('🔄 Falling back to basic image processing');
      this.visionatiService = null;
    }
  }

  /**
   * Process multiple images with AI enhancement
   * @param {string[]} imageUrls - Array of image URLs to process
   * @param {string} destinationDir - Directory to save images
   * @returns {Promise<ProcessedImage[]>} Array of processed images
   */
  async processImages(imageUrls, destinationDir) {
    if (imageUrls.length === 0) {
      xmlLogger.info('📷 No images to process');
      return [];
    }

    xmlLogger.info(`🚀 Processing ${imageUrls.length} images${this.visionatiService ? ' with AI enhancement' : ''}`);

    // Ensure destination directory exists
    await this.ensureDirectory(destinationDir);

    const results = [];
    const batchSize = this.config.visionatiMaxConcurrent || 5;
    
    // Process images in batches to control memory usage and API limits
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      xmlLogger.debug(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageUrls.length / batchSize)}`);
      
      const batchPromises = batch.map(url => this.processImage(url, destinationDir));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const imageUrl = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
          this.processedCount++;
          if (result.value.aiEnhanced) {
            this.aiEnhancedCount++;
          }
        } else {
          xmlLogger.error(`❌ Failed to process image: ${imageUrl}`, result.reason);
          // Add fallback processed image
          results.push(this.createFailedImageResult(imageUrl, destinationDir, result.reason));
        }
      });
    }

    this.logProcessingStats();
    return results;
  }

  /**
   * Process single image with AI enhancement
   * @param {string} imageUrl - Image URL to process
   * @param {string} destinationDir - Directory to save image
   * @returns {Promise<ProcessedImage>} Processed image result
   */
  async processImage(imageUrl, destinationDir) {
    try {
      xmlLogger.debug(`🔍 Processing image: ${imageUrl}`);

      // Get AI-enhanced metadata if service is available
      let aiMetadata = null;
      if (this.visionatiService) {
        try {
          aiMetadata = await this.visionatiService.generateAltText(imageUrl);
          this.totalCreditsUsed += aiMetadata.creditsUsed;
        } catch (error) {
          xmlLogger.warn(`⚠️ AI enhancement failed for ${imageUrl}: ${error.message}`);
        }
      }

      // Determine final filename and alt text
      const originalFilename = shared.getFilenameFromUrl(imageUrl);
      const finalFilename = this.determineFinalFilename(originalFilename, aiMetadata);
      const altText = this.determineAltText(originalFilename, aiMetadata);
      
      // Download image data
      const imageData = await this.downloadImage(imageUrl);
      
      // Prepare final result
      const destinationPath = path.join(destinationDir, finalFilename);
      
      const result = {
        originalUrl: imageUrl,
        originalFilename,
        finalFilename,
        altText,
        destinationPath,
        data: imageData,
        aiEnhanced: !!aiMetadata && !aiMetadata.error,
        creditsUsed: aiMetadata?.creditsUsed || 0
      };

      xmlLogger.debug(`✅ Processed: ${originalFilename} → ${finalFilename}`);
      return result;

    } catch (error) {
      throw new XmlConversionError(`Failed to process image: ${imageUrl}`, {
        originalError: error,
        imageUrl,
        module: 'image-processor'
      });
    }
  }

  /**
   * Download image data from URL
   * @param {string} imageUrl - Image URL to download
   * @returns {Promise<Buffer>} Image data buffer
   * @private
   */
  async downloadImage(imageUrl) {
    const axios = await import('axios');
    const http = await import('http');
    const https = await import('https');

    // URL encoding if needed
    const url = /%[\da-f]{2}/i.test(imageUrl) ? imageUrl : encodeURI(imageUrl);

    const config = {
      method: 'get',
      url,
      headers: {
        'User-Agent': 'healthy-life-xml-converter/2.0.0',
        'Accept': 'image/*'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    };

    // Add custom agents for SSL issues if needed
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
      config.httpAgent = new http.default.Agent({ rejectUnauthorized: false });
      config.httpsAgent = new https.default.Agent({ rejectUnauthorized: false });
    }

    try {
      const response = await axios.default(config);
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      if (error.response) {
        throw new XmlConversionError(`HTTP ${error.response.status} error downloading image`, {
          status: error.response.status,
          imageUrl
        });
      }
      throw new XmlConversionError('Network error downloading image', {
        originalError: error,
        imageUrl
      });
    }
  }

  /**
   * Determine final filename (AI-enhanced or original)
   * @param {string} originalFilename - Original filename
   * @param {Object|null} aiMetadata - AI-generated metadata
   * @returns {string} Final filename with extension
   * @private
   */
  determineFinalFilename(originalFilename, aiMetadata) {
    if (aiMetadata && !aiMetadata.error && aiMetadata.filename) {
      // Use AI-generated filename with original extension
      const originalExt = path.extname(originalFilename) || '.jpg';
      return aiMetadata.filename + originalExt;
    }
    
    // Use original filename, sanitized for German health blog
    return this.sanitizeFilename(originalFilename);
  }

  /**
   * Determine alt text (AI-generated or fallback)
   * @param {string} originalFilename - Original filename
   * @param {Object|null} aiMetadata - AI-generated metadata
   * @returns {string} Alt text description
   * @private
   */
  determineAltText(originalFilename, aiMetadata) {
    if (aiMetadata && !aiMetadata.error && aiMetadata.description) {
      return aiMetadata.description;
    }
    
    // Generate basic German fallback alt text
    const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase();
      
    return `Bild: ${cleanName} - Gesundheitsblog Illustration`;
  }

  /**
   * Sanitize filename for web usage
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   * @private
   */
  sanitizeFilename(filename) {
    const name = path.parse(filename).name;
    const ext = path.extname(filename) || '.jpg';
    
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9äöüß]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
    
    return sanitized + ext;
  }

  /**
   * Create failed image result for error recovery
   * @param {string} imageUrl - Original image URL
   * @param {string} destinationDir - Destination directory
   * @param {Error} error - Processing error
   * @returns {ProcessedImage} Fallback processed image
   * @private
   */
  createFailedImageResult(imageUrl, destinationDir, error) {
    const originalFilename = shared.getFilenameFromUrl(imageUrl);
    const finalFilename = this.sanitizeFilename(originalFilename);
    
    return {
      originalUrl: imageUrl,
      originalFilename,
      finalFilename,
      altText: 'Bild konnte nicht verarbeitet werden - Gesundheitsblog',
      destinationPath: path.join(destinationDir, finalFilename),
      data: Buffer.alloc(0),
      aiEnhanced: false,
      creditsUsed: 0,
      error: error.message
    };
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   * @private
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new XmlConversionError(`Failed to create directory: ${dirPath}`, {
          originalError: error
        });
      }
    }
  }

  /**
   * Log processing statistics
   * @private
   */
  logProcessingStats() {
    xmlLogger.info(`📊 Image Processing Summary:`);
    xmlLogger.info(`   • Total processed: ${this.processedCount}`);
    xmlLogger.info(`   • AI enhanced: ${this.aiEnhancedCount}`);
    xmlLogger.info(`   • Visionati credits used: ${this.totalCreditsUsed}`);
    
    if (this.visionatiService) {
      const stats = this.visionatiService.getStats();
      xmlLogger.debug(`   • Cache hits: ${stats.cachedResponses}`);
      xmlLogger.debug(`   • Active requests: ${stats.activeRequests}`);
    }
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getStats() {
    return {
      processedCount: this.processedCount,
      aiEnhancedCount: this.aiEnhancedCount,
      totalCreditsUsed: this.totalCreditsUsed,
      enhancementRate: this.processedCount > 0 ? (this.aiEnhancedCount / this.processedCount) * 100 : 0,
      visionatiStats: this.visionatiService?.getStats() || null
    };
  }

  /**
   * Reset processor state
   */
  reset() {
    this.processedCount = 0;
    this.aiEnhancedCount = 0;
    this.totalCreditsUsed = 0;
    this.visionatiService?.reset();
  }
}