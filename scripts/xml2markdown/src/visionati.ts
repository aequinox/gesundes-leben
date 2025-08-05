import axios from "axios";

import type { CacheService } from "./cache.js";
import { XmlConversionError } from "./errors.js";
import { xmlLogger } from "./logger.js";

interface VisionatiConfig {
  apiKey: string;
  baseUrl?: string;
  backend?: string;
  language?: string;
  prompt?: string;
  timeout?: number;
  maxConcurrent?: number;
  retryAttempts?: number;
}

interface VisionatiResponse {
  description: string;
  filename: string;
  originalUrl: string;
  creditsUsed: number;
  error?: string;
}

interface QueuedRequest {
  imageUrl: string;
  resolve: (value: VisionatiResponse) => void;
  reject: (reason: Error) => void;
}

/**
 * Visionati API service for generating AI-powered alt texts and filenames
 * Optimized for German health blog content with proper error handling and rate limiting
 */
class VisionatiService {
  private apiKey: string;
  private baseUrl: string;
  private backend: string;
  private language: string;
  private prompt: string;
  private timeout: number;
  private maxConcurrent: number;
  private retryAttempts: number;
  private activeRequests: number;
  private requestQueue: QueuedRequest[];
  private requestCache: Map<string, VisionatiResponse>;
  private cacheService: CacheService | null;
  private cacheHits: number;
  private cacheMisses: number;

  constructor(
    config: VisionatiConfig,
    cacheService: CacheService | null = null
  ) {
    // Ensure API key has proper Token prefix
    let {apiKey} = config;
    if (apiKey && !apiKey.startsWith("Token ")) {
      apiKey = `Token ${apiKey}`;
    }

    this.apiKey = apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.visionati.com/api";
    this.backend = config.backend ?? "claude";
    this.language = config.language ?? "de";
    this.prompt = config.prompt ?? this.getDefaultGermanHealthPrompt();
    this.timeout = config.timeout ?? 30000;
    this.maxConcurrent = config.maxConcurrent ?? 5;
    this.retryAttempts = config.retryAttempts ?? 3;

    // Rate limiting and concurrency control
    this.activeRequests = 0;
    this.requestQueue = [];
    this.requestCache = new Map<string, VisionatiResponse>(); // In-memory cache for current session

    // Persistent cache service
    this.cacheService = cacheService;
    this.cacheHits = 0;
    this.cacheMisses = 0;

    xmlLogger.info(
      `🤖 Visionati Service initialized - Backend: ${this.backend}, Language: ${this.language}, Persistent Cache: ${cacheService ? "enabled" : "disabled"}`
    );
  }

  /**
   * Get default German health-focused prompt
   * @returns {string} Default prompt template
   */
  getDefaultGermanHealthPrompt(): string {
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
  async generateAltText(imageUrl: string): Promise<VisionatiResponse> {
    // Check persistent cache first
    if (this.cacheService) {
      const config = {
        backend: this.backend,
        language: this.language,
        prompt: this.prompt,
      };

      const cachedEntry = this.cacheService.get(imageUrl, config);
      if (cachedEntry) {
        this.cacheHits++;
        xmlLogger.debug(`💾 Using persistent cached result for: ${imageUrl}`);

        // Convert cache entry to response format
        const response = {
          description: cachedEntry.altText,
          filename: cachedEntry.filename,
          originalUrl: imageUrl,
          creditsUsed: 0, // No credits used for cached result
        };

        // Also store in memory cache for faster access
        const cacheKey = this.getCacheKey(imageUrl);
        this.requestCache.set(cacheKey, response);

        return response;
      }
    }

    // Check in-memory cache
    const cacheKey = this.getCacheKey(imageUrl);
    if (this.requestCache.has(cacheKey)) {
      xmlLogger.debug(`📋 Using in-memory cached result for: ${imageUrl}`);
      const cachedResult = this.requestCache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    this.cacheMisses++;

    // Add to queue if at concurrency limit
    if (this.activeRequests >= this.maxConcurrent) {
      xmlLogger.debug(`⏳ Queuing request for: ${imageUrl}`);
      return this.queueRequest(imageUrl);
    }

    const result = await this.executeRequest(imageUrl);
    return result;
  }

  /**
   * Generate alt texts for multiple images with batching
   * @param {string[]} imageUrls - Array of image URLs
   * @returns {Promise<VisionatiResponse[]>} Array of generated content
   */
  async generateAltTexts(imageUrls: string[]): Promise<VisionatiResponse[]> {
    xmlLogger.info(
      `🚀 Processing ${imageUrls.length} images with Visionati AI`
    );

    const results: VisionatiResponse[] = [];
    const batches = this.createBatches(imageUrls, this.maxConcurrent);

    for (const batch of batches) {
      xmlLogger.debug(`📦 Processing batch of ${batch.length} images`);
      const batchPromises = batch.map(url => this.generateAltText(url));
       
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          xmlLogger.warn(
            `⚠️ Failed to process image: ${batch[index]} - ${result.reason.message}`
          );
          // Add fallback result
          results.push(
            this.createFallbackResponse(batch[index], result.reason)
          );
        }
      });

      // Optional delay between batches for rate limiting (configurable)
      if (batches.indexOf(batch) < batches.length - 1 && batches.length > 2) {
        // Only add delay for large batch operations to avoid overwhelming the API
         
        await this.delay(500); // Reduced delay for better performance
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
  private async executeRequest(imageUrl: string): Promise<VisionatiResponse> {
    this.activeRequests++;

    try {
      xmlLogger.debug(`🔍 Analyzing image: ${imageUrl}`);

      const response = await this.makeApiRequest(imageUrl);
      const parsedResponse = await this.parseApiResponse(response, imageUrl);

      // Cache successful response in memory
      const cacheKey = this.getCacheKey(imageUrl);
      this.requestCache.set(cacheKey, parsedResponse);

      // Save to persistent cache
      if (this.cacheService) {
        const config = {
          backend: this.backend,
          language: this.language,
          prompt: this.prompt,
        };
        this.cacheService.set(imageUrl, parsedResponse, config);
      }

      xmlLogger.debug(`✅ Generated alt text for: ${imageUrl}`);
      return parsedResponse;
    } catch (error) {
      xmlLogger.error(`❌ Failed to generate alt text for: ${imageUrl}`, error);
      throw new XmlConversionError(
        `Visionati API request failed: ${(error as Error).message}`,
        {
          originalError: error as Error,
          imageUrl,
          module: "visionati",
        }
      );
    } finally {
      this.activeRequests--;
      void this.processQueue();
    }
  }

  /**
   * Make HTTP request to Visionati API
   * @param {string} imageUrl - Image URL to analyze
   * @returns {Promise<unknown>} Raw API response
   * @private
   */
  private async makeApiRequest(imageUrl: string): Promise<unknown> {
    const requestData = {
      url: imageUrl,
      backend: this.backend,
      feature: "descriptions",
      prompt: this.prompt,
    };

    const config = {
      method: "POST",
      url: `${this.baseUrl}/fetch`,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        "User-Agent": "healthy-life-xml-converter/2.0.0",
      },
      data: requestData,
      timeout: this.timeout,
    };

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
         
        const response = await axios(config);

        if (response.status === 200 && response.data) {
          return response.data;
        }

        throw new Error(`Unexpected response status: ${response.status}`);
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          xmlLogger.warn(
            `🔄 Retry attempt ${attempt}/${this.retryAttempts} for ${imageUrl} in ${delay}ms`
          );
           
          await this.delay(delay);
        }
      }
    }

    throw lastError ?? new Error("Unknown error occurred");
  }

  /**
   * Parse Visionati API response into standardized format
   * @param {unknown} response - Raw API response
   * @param {string} imageUrl - Original image URL
   * @returns {Promise<VisionatiResponse>} Parsed response
   * @private
   */
  private async parseApiResponse(
    response: unknown,
    imageUrl: string
  ): Promise<VisionatiResponse> {
    try {
      // Add debug logging to see actual response structure
      xmlLogger.debug(
        "🔍 Visionati API Response:",
        JSON.stringify(response, null, 2)
      );

      // Handle different possible response formats
      let description: string;
      let creditsUsed = 1;

      // Type for various response formats
      interface VisionatiApiResponse {
        // Legacy format
        all?: {
          assets?: Array<{
            descriptions?: Array<{
              description: string;
            }>;
          }>;
        };
        result?: string;
        description?: string;
        text?: string;
        credits_paid?: number;
        credits_used?: number;
        
        // New API format (request confirmation)
        request_id?: string;
        user_id?: number;
        urls?: string[];
        files?: number;
        file_names?: string[];
        features?: string[];
        backends?: string[];
        role?: string;
        tag_score?: number;
        capture_interval?: number;
        max_frames?: number;
        language?: string;
        prompt?: string;
        success?: boolean;
        response_uri?: string;
        
        // Error format
        error?: string;
      }

      const typedResponse = response as VisionatiApiResponse;

      // Handle error responses first
      if (typedResponse.error) {
        throw new Error(`Visionati API error: ${typedResponse.error}`);
      }

      // Handle new API format with polling mechanism
      if (typedResponse.response_uri && typedResponse.request_id) {
        xmlLogger.debug(`🔄 Batch response detected, polling: ${typedResponse.response_uri}`);
        const polledResponse = await this.pollForResults(typedResponse.response_uri);
        return this.parsePolledResponse(polledResponse, imageUrl);
      }

      // Try different immediate response structures
      if (typedResponse.all?.assets && typedResponse.all.assets.length > 0) {
        // Original working format from JavaScript version
        const descriptions = typedResponse.all.assets[0].descriptions ?? [];
        if (descriptions.length === 0) {
          throw new Error("No descriptions found in API response");
        }
        const [{ description: desc }] = descriptions;
        description = desc;
        creditsUsed = typedResponse.credits_paid ?? 1;

        // Debug log the actual description content
        xmlLogger.debug(`🔍 Raw description from Visionati: "${description}"`);
      } else if (typedResponse.result) {
        // Alternative format: direct result field
        description = typedResponse.result;
        creditsUsed =
          typedResponse.credits_paid ?? typedResponse.credits_used ?? 1;
      } else if (typedResponse.description) {
        // Alternative format: direct description field
        const { description: desc } = typedResponse;
        description = desc;
        creditsUsed =
          typedResponse.credits_paid ?? typedResponse.credits_used ?? 1;
      } else if (typedResponse.text) {
        // Alternative format: text field
        description = typedResponse.text;
        creditsUsed =
          typedResponse.credits_paid ?? typedResponse.credits_used ?? 1;
      } else if (typeof response === "string") {
        // Direct string response
        description = response;
        creditsUsed = 1;
      } else {
        // Log the full response structure for debugging
        xmlLogger.error("🚨 Unknown Visionati response format:", {
          keys: Object.keys(response as Record<string, unknown>),
          sample: JSON.stringify(response).substring(0, 500),
        });
        throw new Error(
          "Unknown API response format - no recognizable description field"
        );
      }

      if (!description) {
        throw new Error("Empty description in API response");
      }

      // Parse description and filename separated by @
      const parts = description.split("@").map(part => part.trim());
      if (parts.length !== 2) {
        // If no @ separator, treat entire response as alt text and generate filename
        const altText = description.trim();
        const generatedFilename = this.generateFilenameFromAltText(altText);

        return {
          description: altText,
          filename: this.sanitizeFilename(generatedFilename),
          originalUrl: imageUrl,
          creditsUsed,
        };
      }

      const [altTextPart, filename] = parts;

      // Extract alt text from square brackets if present
      const bracketMatch = altTextPart.match(/^\[(.*)\]$/);
      const altText = bracketMatch ? bracketMatch[1] : altTextPart;

      return {
        description: altText,
        filename: this.sanitizeFilename(filename),
        originalUrl: imageUrl,
        creditsUsed,
      };
    } catch (error) {
      throw new XmlConversionError(
        `Failed to parse Visionati response: ${(error as Error).message}`,
        {
          originalError: error as Error,
          response,
          imageUrl,
        }
      );
    }
  }

  /**
   * Generate SEO-friendly filename from alt text
   * @param {string} altText - Alt text description
   * @returns {string} Generated filename
   * @private
   */
  private generateFilenameFromAltText(altText: string): string {
    return altText
      .toLowerCase()
      .replace(/[^a-z0-9äöüß\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80); // Keep shorter for generated names
  }

  /**
   * Sanitize and validate generated filename
   * @param {string} filename - Generated filename
   * @returns {string} Sanitized filename
   * @private
   */
  private sanitizeFilename(filename: string): string {
    // Remove any existing extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    // Convert to lowercase and replace invalid characters
    return nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9äöüß-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100); // Limit length
  }

  /**
   * Create fallback response for failed requests
   * @param {string} imageUrl - Original image URL
   * @param {Error} error - Original error
   * @returns {VisionatiResponse} Fallback response
   * @private
   */
  private createFallbackResponse(
    imageUrl: string,
    error: Error
  ): VisionatiResponse {
    const originalFilename =
      imageUrl.split("/").pop()?.split("?")[0] ?? "image";
    const fallbackFilename = originalFilename.replace(/\.[^/.]+$/, "");

    return {
      description: "Bild im Kontext des Gesundheitsblogs", // Generic German alt text
      filename: this.sanitizeFilename(fallbackFilename),
      originalUrl: imageUrl,
      creditsUsed: 0,
      error: error.message,
    };
  }

  /**
   * Queue request for later processing
   * @param {string} imageUrl - Image URL to queue
   * @returns {Promise<VisionatiResponse>} Promise that resolves when processed
   * @private
   */
  private queueRequest(imageUrl: string): Promise<VisionatiResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        imageUrl,
        resolve,
        reject,
      });
    });
  }

  /**
   * Process next item in queue
   * @private
   */
  private async processQueue(): Promise<void> {
    if (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.maxConcurrent
    ) {
      const queuedRequest = this.requestQueue.shift();
      if (!queuedRequest) {
        return;
      }

      const { imageUrl, resolve, reject } = queuedRequest;

      try {
        const result = await this.executeRequest(imageUrl);
        resolve(result);
      } catch (error) {
        reject(error as Error);
      }
    }
  }

  /**
   * Create cache key for request
   * @param {string} imageUrl - Image URL
   * @returns {string} Cache key
   * @private
   */
  private getCacheKey(imageUrl: string): string {
    return `${imageUrl}:${this.prompt}:${this.language}:${this.backend}`;
  }

  /**
   * Create batches from array
   * @param {string[]} items - Items to batch
   * @param {number} batchSize - Size of each batch
   * @returns {string[][]} Array of batches
   * @private
   */
  private createBatches(items: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
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
  private delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats(): {
    activeRequests: number;
    queuedRequests: number;
    memoryCachedResponses: number;
    persistentCacheHits: number;
    persistentCacheMisses: number;
    cacheHitRate: string;
    configuration: {
      backend: string;
      language: string;
      maxConcurrent: number;
      timeout: number;
      persistentCache: string;
    };
    persistentCacheStats?: unknown;
  } {
    const stats = {
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      memoryCachedResponses: this.requestCache.size,
      persistentCacheHits: this.cacheHits,
      persistentCacheMisses: this.cacheMisses,
      cacheHitRate:
        this.cacheHits + this.cacheMisses > 0
          ? `${Math.round(
              (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100
            )}%`
          : "N/A",
      configuration: {
        backend: this.backend,
        language: this.language,
        maxConcurrent: this.maxConcurrent,
        timeout: this.timeout,
        persistentCache: this.cacheService ? "enabled" : "disabled",
      },
    };

    // Add persistent cache stats if available
    if (this.cacheService) {
      const persistentStats = this.cacheService.getStats();
      Object.assign(stats, { persistentCacheStats: persistentStats });
    }

    return stats;
  }

  /**
   * Poll for results from response_uri (for batch requests)
   * @param {string} responseUri - URI to poll for results
   * @returns {Promise<unknown>} Polled response
   * @private
   */
  private async pollForResults(responseUri: string): Promise<unknown> {
    const maxPollingAttempts = 10;
    const pollingInterval = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxPollingAttempts; attempt++) {
      try {
        xmlLogger.debug(`🔄 Polling attempt ${attempt}/${maxPollingAttempts}: ${responseUri}`);
        
         
        const response = await axios({
          method: "GET",
          url: responseUri,
          headers: {
            "X-API-Key": this.apiKey,
            "User-Agent": "healthy-life-xml-converter/2.0.0",
          },
          timeout: this.timeout,
        });

        if (response.status === 200 && response.data) {
          // Check if we got actual results or if it's still processing
          if (response.data.status === "processing") {
            xmlLogger.debug(`⏳ Still processing, waiting ${pollingInterval}ms...`);
             
            await this.delay(pollingInterval);
            continue;
          }
          
          xmlLogger.debug(`✅ Polling completed successfully`);
          return response.data;
        }

        throw new Error(`Polling failed with status: ${response.status}`);
      } catch (error) {
        if (attempt === maxPollingAttempts) {
          throw new Error(`Polling failed after ${maxPollingAttempts} attempts: ${(error as Error).message}`);
        }
        
        xmlLogger.warn(`⚠️ Polling attempt ${attempt} failed, retrying...`);
         
        await this.delay(pollingInterval);
      }
    }

    throw new Error("Polling timeout - max attempts reached");
  }

  /**
   * Parse polled response from batch request
   * @param {unknown} response - Polled response data
   * @param {string} imageUrl - Original image URL
   * @returns {VisionatiResponse} Parsed response
   * @private
   */
  private parsePolledResponse(response: unknown, imageUrl: string): VisionatiResponse {
    try {
      xmlLogger.debug("🔍 Parsing polled response:", JSON.stringify(response, null, 2));

      // The polled response should contain the actual analysis results
      const polledData = response as {
        all?: {
          assets?: Array<{
            descriptions?: Array<{
              description?: string;
              text?: string;
            }>;
          }>;
        };
        results?: Array<{
          descriptions?: Array<{
            text?: string;
          }>;
        }>;
        credits_paid?: number;
        credits_used?: number;
      };

      let description: string | undefined;
      let creditsUsed = 1;

      // Try different formats in the polled response
      if (polledData.all?.assets && polledData.all.assets.length > 0) {
        const descriptions = polledData.all.assets[0].descriptions ?? [];
        if (descriptions.length > 0) {
          description = descriptions[0].description ?? descriptions[0].text;
        }
        creditsUsed = polledData.credits_paid ?? polledData.credits_used ?? 1;
      } else if (polledData.results && polledData.results.length > 0) {
        const descriptions = polledData.results[0].descriptions ?? [];
        if (descriptions.length > 0) {
          description = descriptions[0].text;
        }
        creditsUsed = polledData.credits_paid ?? polledData.credits_used ?? 1;
      }

      if (!description) {
        throw new Error("No description found in polled response");
      }

      xmlLogger.debug(`🔍 Extracted description from polled response: "${description}"`);

      // Parse description and filename separated by @
      const parts = description.split("@").map(part => part.trim());
      if (parts.length !== 2) {
        // If no @ separator, treat entire response as alt text and generate filename
        const altText = description.trim();
        const generatedFilename = this.generateFilenameFromAltText(altText);

        return {
          description: altText,
          filename: this.sanitizeFilename(generatedFilename),
          originalUrl: imageUrl,
          creditsUsed,
        };
      }

      const [altTextPart, filename] = parts;

      // Extract alt text from square brackets if present
      const bracketMatch = altTextPart.match(/^\[(.*)\]$/);
      const altText = bracketMatch ? bracketMatch[1] : altTextPart;

      return {
        description: altText,
        filename: this.sanitizeFilename(filename),
        originalUrl: imageUrl,
        creditsUsed,
      };
    } catch (error) {
      throw new XmlConversionError(
        `Failed to parse polled response: ${(error as Error).message}`,
        {
          originalError: error as Error,
          response,
          imageUrl,
        }
      );
    }
  }

  /**
   * Clear cache and reset state
   */
  reset(): void {
    this.requestCache.clear();
    this.requestQueue.length = 0;
    this.activeRequests = 0;
    xmlLogger.debug("🔄 Visionati service reset");
  }
}

// Export types and classes at the end of the file
export type { VisionatiConfig, VisionatiResponse };
export { VisionatiService };
