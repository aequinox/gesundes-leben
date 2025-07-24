import axios from 'axios';
import { XmlConversionError } from './errors.js';
import { xmlLogger } from './logger.js';

/**
 * @typedef {Object} VisionatiConfig
 * @property {string} apiKey - Visionati API key
 * @property {string} [baseUrl] - API base URL
 * @property {string} [backend] - AI backend to use
 * @property {string} [language] - Response language
 * @property {string} [prompt] - Custom prompt template
 * @property {number} [timeout] - Request timeout in ms
 * @property {number} [maxConcurrent] - Max concurrent requests
 * @property {number} [retryAttempts] - Number of retry attempts
 */

/**
 * @typedef {Object} VisionatiResponse
 * @property {string} description - Generated alt text description
 * @property {string} filename - Generated SEO filename
 * @property {string} originalUrl - Original image URL
 * @property {number} creditsUsed - API credits consumed
 */

/**
 * Visionati API service for generating AI-powered alt texts and filenames
 * Optimized for German health blog content with proper error handling and rate limiting
 */
export class VisionatiService {
  /**
   * @param {VisionatiConfig} config - Service configuration
   */
  constructor(config) {
    // Ensure API key has proper Token prefix
    let apiKey = config.apiKey;
    if (apiKey && !apiKey.startsWith('Token ')) {
      apiKey = `Token ${apiKey}`;
    }
    
    this.apiKey = apiKey;
    this.baseUrl = config.baseUrl || 'https://api.visionati.com/api';
    this.backend = config.backend || 'claude';
    this.language = config.language || 'de';
    this.prompt = config.prompt || this.getDefaultGermanHealthPrompt();
    this.timeout = config.timeout || 30000;
    this.maxConcurrent = config.maxConcurrent || 5;
    this.retryAttempts = config.retryAttempts || 3;
    
    // Rate limiting and concurrency control
    this.activeRequests = 0;
    this.requestQueue = [];
    this.requestCache = new Map();
    
    xmlLogger.info(`🤖 Visionati Service initialized - Backend: ${this.backend}, Language: ${this.language}`);
  }

  /**
   * Get default German health-focused prompt
   * @returns {string} Default prompt template
   */
  getDefaultGermanHealthPrompt() {
    return `Analysiere dieses Bild für einen deutschen Gesundheitsblog. 
Erstelle eine präzise, barrierefreie Alt-Text-Beschreibung auf Deutsch und einen SEO-optimierten Dateinamen.
Fokus auf Gesundheit, Wellness, Ernährung oder medizinische Themen.
Trenne Alt-Text und Dateinamen mit @ Symbol.
Format: [Alt-Text] @ [seo-dateiname-ohne-extension.jpg]`;
  }

  /**
   * Generate alt text and filename for an image URL
   * @param {string} imageUrl - URL of the image to analyze
   * @returns {Promise<VisionatiResponse>} Generated content
   * @throws {XmlConversionError} When API call fails
   */
  async generateAltText(imageUrl) {
    // Check cache first
    const cacheKey = this.getCacheKey(imageUrl);
    if (this.requestCache.has(cacheKey)) {
      xmlLogger.debug(`📋 Using cached result for: ${imageUrl}`);
      return this.requestCache.get(cacheKey);
    }

    // Add to queue if at concurrency limit
    if (this.activeRequests >= this.maxConcurrent) {
      xmlLogger.debug(`⏳ Queuing request for: ${imageUrl}`);
      return this.queueRequest(imageUrl);
    }

    return this.executeRequest(imageUrl);
  }

  /**
   * Generate alt texts for multiple images with batching
   * @param {string[]} imageUrls - Array of image URLs
   * @returns {Promise<VisionatiResponse[]>} Array of generated content
   */
  async generateAltTexts(imageUrls) {
    xmlLogger.info(`🚀 Processing ${imageUrls.length} images with Visionati AI`);
    
    const results = [];
    const batches = this.createBatches(imageUrls, this.maxConcurrent);
    
    for (const batch of batches) {
      xmlLogger.debug(`📦 Processing batch of ${batch.length} images`);
      const batchPromises = batch.map(url => this.generateAltText(url));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          xmlLogger.warn(`⚠️ Failed to process image: ${batch[index]} - ${result.reason.message}`);
          // Add fallback result
          results.push(this.createFallbackResponse(batch[index], result.reason));
        }
      });
      
      // Small delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(1000);
      }
    }
    
    xmlLogger.info(`✅ Completed processing ${results.length} images`);
    return results;
  }

  /**
   * Execute API request with retry logic
   * @param {string} imageUrl - Image URL to process
   * @returns {Promise<VisionatiResponse>} API response
   * @private
   */
  async executeRequest(imageUrl) {
    this.activeRequests++;
    
    try {
      xmlLogger.debug(`🔍 Analyzing image: ${imageUrl}`);
      
      const response = await this.makeApiRequest(imageUrl);
      const parsedResponse = this.parseApiResponse(response, imageUrl);
      
      // Cache successful response
      const cacheKey = this.getCacheKey(imageUrl);
      this.requestCache.set(cacheKey, parsedResponse);
      
      xmlLogger.debug(`✅ Generated alt text for: ${imageUrl}`);
      return parsedResponse;
      
    } catch (error) {
      xmlLogger.error(`❌ Failed to generate alt text for: ${imageUrl}`, error);
      throw new XmlConversionError(`Visionati API request failed: ${error.message}`, {
        originalError: error,
        imageUrl,
        module: 'visionati'
      });
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Make HTTP request to Visionati API
   * @param {string} imageUrl - Image URL to analyze
   * @returns {Promise<Object>} Raw API response
   * @private
   */
  async makeApiRequest(imageUrl) {
    const requestData = {
      url: imageUrl,
      backend: this.backend,
      feature: 'descriptions',
      prompt: this.prompt
    };

    const config = {
      method: 'POST',
      url: `${this.baseUrl}/fetch`,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'healthy-life-xml-converter/2.0.0'
      },
      data: requestData,
      timeout: this.timeout
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios(config);
        
        if (response.status === 200 && response.data) {
          return response.data;
        }
        
        throw new Error(`Unexpected response status: ${response.status}`);
        
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          xmlLogger.warn(`🔄 Retry attempt ${attempt}/${this.retryAttempts} for ${imageUrl} in ${delay}ms`);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Parse Visionati API response into standardized format
   * @param {Object} response - Raw API response
   * @param {string} imageUrl - Original image URL
   * @returns {VisionatiResponse} Parsed response
   * @private
   */
  parseApiResponse(response, imageUrl) {
    try {
      // Add debug logging to see actual response structure
      xmlLogger.debug('🔍 Visionati API Response:', JSON.stringify(response, null, 2));
      
      // Handle different possible response formats
      let description;
      let creditsUsed = 1;
      
      // Try different response structures
      if (response.all?.assets && response.all.assets.length > 0) {
        // Original expected format
        const descriptions = response.all.assets[0].descriptions || [];
        if (descriptions.length === 0) {
          throw new Error('No descriptions found in API response');
        }
        description = descriptions[0].description;
        creditsUsed = response.credits_paid || 1;
      } else if (response.result) {
        // Alternative format: direct result field
        description = response.result;
        creditsUsed = response.credits_paid || response.credits_used || 1;
      } else if (response.description) {
        // Alternative format: direct description field
        description = response.description;
        creditsUsed = response.credits_paid || response.credits_used || 1;
      } else if (response.text) {
        // Alternative format: text field
        description = response.text;
        creditsUsed = response.credits_paid || response.credits_used || 1;
      } else if (typeof response === 'string') {
        // Direct string response
        description = response;
        creditsUsed = 1;
      } else {
        // Log the full response structure for debugging
        xmlLogger.error('🚨 Unknown Visionati response format:', {
          keys: Object.keys(response),
          sample: JSON.stringify(response).substring(0, 500)
        });
        throw new Error('Unknown API response format - no recognizable description field');
      }

      if (!description) {
        throw new Error('Empty description in API response');
      }

      // Parse description and filename separated by @
      const parts = description.split('@').map(part => part.trim());
      if (parts.length !== 2) {
        // If no @ separator, treat entire response as alt text and generate filename
        const altText = description.trim();
        const generatedFilename = this.generateFilenameFromAltText(altText);
        
        return {
          description: altText,
          filename: this.sanitizeFilename(generatedFilename),
          originalUrl: imageUrl,
          creditsUsed
        };
      }

      const [altText, filename] = parts;
      
      return {
        description: altText,
        filename: this.sanitizeFilename(filename),
        originalUrl: imageUrl,
        creditsUsed
      };
      
    } catch (error) {
      throw new XmlConversionError(`Failed to parse Visionati response: ${error.message}`, {
        originalError: error,
        response,
        imageUrl
      });
    }
  }

  /**
   * Generate SEO-friendly filename from alt text
   * @param {string} altText - Alt text description
   * @returns {string} Generated filename
   * @private
   */
  generateFilenameFromAltText(altText) {
    return altText
      .toLowerCase()
      .replace(/[^a-z0-9äöüß\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80); // Keep shorter for generated names
  }

  /**
   * Sanitize and validate generated filename
   * @param {string} filename - Generated filename
   * @returns {string} Sanitized filename
   * @private
   */
  sanitizeFilename(filename) {
    // Remove any existing extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Convert to lowercase and replace invalid characters
    return nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9äöüß-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100); // Limit length
  }

  /**
   * Create fallback response for failed requests
   * @param {string} imageUrl - Original image URL
   * @param {Error} error - Original error
   * @returns {VisionatiResponse} Fallback response
   * @private
   */
  createFallbackResponse(imageUrl, error) {
    const originalFilename = imageUrl.split('/').pop()?.split('?')[0] || 'image';
    const fallbackFilename = originalFilename.replace(/\.[^/.]+$/, '');
    
    return {
      description: 'Bild im Kontext des Gesundheitsblogs', // Generic German alt text
      filename: this.sanitizeFilename(fallbackFilename),
      originalUrl: imageUrl,
      creditsUsed: 0,
      error: error.message
    };
  }

  /**
   * Queue request for later processing
   * @param {string} imageUrl - Image URL to queue
   * @returns {Promise<VisionatiResponse>} Promise that resolves when processed
   * @private
   */
  queueRequest(imageUrl) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        imageUrl,
        resolve,
        reject
      });
    });
  }

  /**
   * Process next item in queue
   * @private
   */
  async processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { imageUrl, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await this.executeRequest(imageUrl);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * Create cache key for request
   * @param {string} imageUrl - Image URL
   * @returns {string} Cache key
   * @private
   */
  getCacheKey(imageUrl) {
    return `${imageUrl}:${this.prompt}:${this.language}:${this.backend}`;
  }

  /**
   * Create batches from array
   * @param {Array} items - Items to batch
   * @param {number} batchSize - Size of each batch
   * @returns {Array[]} Array of batches
   * @private
   */
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      cachedResponses: this.requestCache.size,
      configuration: {
        backend: this.backend,
        language: this.language,
        maxConcurrent: this.maxConcurrent,
        timeout: this.timeout
      }
    };
  }

  /**
   * Clear cache and reset state
   */
  reset() {
    this.requestCache.clear();
    this.requestQueue.length = 0;
    this.activeRequests = 0;
    xmlLogger.debug('🔄 Visionati service reset');
  }
}