/**
 * Visionati AI image analysis service with persistent caching
 */
import axios from "axios";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

import { CONVERSION_DEFAULTS } from "./config";
import { RetryHandler } from "./errors";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type {
  ImageAnalysisResult,
  VisionatiCache,
  VisionatiCacheEntry,
  VisionatiConfig,
  VisionatiParsedResponse,
  VisionatiRequest,
  VisionatiResponse,
  VisionatiStats,
} from "./types";

export class VisionatiImageAnalyzer {
  private cache: VisionatiCache = {};
  private config: VisionatiConfig;
  private stats: VisionatiStats = {
    totalEntries: 0,
    totalCreditsUsed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    costSavings: 0,
  };

  constructor(config: VisionatiConfig) {
    this.config = config;
  }

  /**
   * Initialize the analyzer by loading existing cache
   */
  async initialize(): Promise<void> {
    if (!this.config.enableVisionati) {
      logger.debug("Visionati analysis disabled");
      return;
    }

    if (!this.config.apiKey) {
      throw new Error("Visionati API key not found in environment");
    }

    if (this.config.useCache) {
      await this.loadCache();
    }

    logger.debug(
      `Visionati analyzer initialized with ${this.stats.totalEntries} cached entries`
    );
  }

  /**
   * Analyze an image and generate German filename and alt text
   */
  async analyzeImage(
    imageUrl: string,
    originalFilename: string
  ): Promise<ImageAnalysisResult> {
    if (!this.config.enableVisionati) {
      return this.createFallbackResult(originalFilename);
    }

    const sanitizedUrl = SecuritySanitizer.sanitizeURL(imageUrl);
    if (!sanitizedUrl) {
      logger.warn(`Invalid image URL: ${imageUrl}`);
      return this.createFallbackResult(originalFilename);
    }

    // Check cache first
    if (this.config.useCache && this.cache[sanitizedUrl]) {
      const cached = this.cache[sanitizedUrl];
      this.stats.cacheHits++;
      logger.debug(`Cache hit for image: ${originalFilename}`);

      return {
        originalFilename,
        generatedFilename: cached.generatedFilename || originalFilename,
        generatedAltText: cached.generatedAltText || "",
        tags: cached.visionatiResponse.data?.tags || [],
        fromCache: true,
        creditsUsed: 0,
      };
    }

    // Analyze with API
    try {
      const response = await this.callVisionatiAPI(sanitizedUrl);
      const result = await this.processAnalysisResult(
        sanitizedUrl,
        originalFilename,
        response
      );

      // Save to cache
      if (this.config.useCache) {
        await this.saveCacheEntry(
          sanitizedUrl,
          originalFilename,
          response,
          result
        );
      }

      this.stats.cacheMisses++;
      this.stats.totalCreditsUsed += response.credits_used || 2;

      return result;
    } catch (error) {
      logger.error(`Visionati API error for ${originalFilename}: ${error}`);
      return this.createFallbackResult(originalFilename);
    }
  }

  /**
   * Call the Visionati API with custom German health prompts
   */
  private async callVisionatiAPI(imageUrl: string): Promise<VisionatiResponse> {
    const customPrompt = this.getCustomPrompt();

    const request: VisionatiRequest = {
      url: imageUrl,
      lang: this.config.language || "de",
      backend: this.config.backend || "auto",
      role: this.config.role || "Inspector",
      prompt: customPrompt, // Use the dedicated prompt parameter
      feature: "description",
    };

    return RetryHandler.withRetry(
      async () => {
        const response = await axios.post(
          "https://api.visionati.com/api/fetch",
          request,
          {
            headers: {
              "X-API-Key": `Token ${this.config.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: CONVERSION_DEFAULTS.IMAGE_DOWNLOAD_TIMEOUT,
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || "Visionati API error");
        }

        return response.data;
      },
      CONVERSION_DEFAULTS.MAX_RETRY_ATTEMPTS,
      CONVERSION_DEFAULTS.RETRY_DELAY_BASE,
      CONVERSION_DEFAULTS.MAX_RETRY_DELAY
    );
  }

  /**
   * Process the API response using custom prompt parsing
   */
  private async processAnalysisResult(
    imageUrl: string,
    originalFilename: string,
    response: VisionatiResponse
  ): Promise<ImageAnalysisResult> {
    const description = response.data?.description || "";
    const tags = response.data?.tags || [];

    // Try to parse structured response from custom prompt
    const parsedResponse = this.parseCustomPromptResponse(description);

    let generatedFilename: string;
    let generatedAltText: string;

    if (parsedResponse.success) {
      // Use AI-generated content from custom prompt
      generatedAltText = parsedResponse.altText;
      generatedFilename = this.sanitizeFilename(
        parsedResponse.filename,
        originalFilename
      );

      logger.debug(`Custom prompt parsing successful for ${originalFilename}`);
    } else {
      // Fallback to local generation
      logger.debug(
        `Custom prompt parsing failed for ${originalFilename}, using fallback: ${parsedResponse.error}`
      );

      generatedFilename = this.generateGermanFilename(
        description,
        tags,
        originalFilename
      );
      generatedAltText = this.generateGermanAltText(description, tags);
    }

    return {
      originalFilename,
      generatedFilename,
      generatedAltText,
      tags,
      fromCache: false,
      creditsUsed: response.credits_used || 2,
    };
  }

  /**
   * Get the appropriate custom prompt based on configuration
   */
  private getCustomPrompt(): string {
    if (this.config.customPrompt) {
      return this.config.customPrompt;
    }

    const promptType = this.config.promptType || "DEFAULT";
    return CONVERSION_DEFAULTS.VISIONATI_PROMPTS[promptType];
  }

  /**
   * Parse the structured response from custom prompt
   */
  private parseCustomPromptResponse(
    description: string
  ): VisionatiParsedResponse {
    try {
      // Look for the expected format: ALTTEXT: [text] @ DATEINAME: [filename]
      const altTextMatch = description.match(/ALTTEXT:\s*([^@]+?)(?=\s*@|$)/i);
      const filenameMatch = description.match(/DATEINAME:\s*([^\n\r]+)/i);

      if (!altTextMatch) {
        return {
          altText: "",
          filename: "",
          success: false,
          error: "Could not find ALTTEXT in response",
        };
      }

      if (!filenameMatch) {
        return {
          altText: "",
          filename: "",
          success: false,
          error: "Could not find DATEINAME in response",
        };
      }

      const altText = altTextMatch[1].trim();
      const filename = filenameMatch[1].trim();

      // Validate alt text length
      if (
        altText.length < 10 ||
        altText.length > this.config.maxAltTextLength
      ) {
        return {
          altText: "",
          filename: "",
          success: false,
          error: `Alt text length ${altText.length} outside acceptable range (10-${this.config.maxAltTextLength})`,
        };
      }

      // Basic filename validation
      if (filename.length < 3 || filename.length > 80) {
        return {
          altText: "",
          filename: "",
          success: false,
          error: `Filename length ${filename.length} outside acceptable range (3-80)`,
        };
      }

      return {
        altText,
        filename,
        success: true,
      };
    } catch (error) {
      return {
        altText: "",
        filename: "",
        success: false,
        error: `Parsing error: ${error}`,
      };
    }
  }

  /**
   * Sanitize and validate AI-generated filename
   */
  private sanitizeFilename(filename: string, originalFilename: string): string {
    // Remove any file extension from AI-generated filename
    const baseFilename = filename.replace(/\.[^.]*$/, "");

    // Convert to lowercase and replace spaces/special chars with hyphens
    let sanitized = baseFilename
      .toLowerCase()
      .replace(/[^a-zäöüß0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure minimum length
    if (sanitized.length < 3) {
      logger.warn(
        `Generated filename too short: "${sanitized}", using fallback`
      );
      return this.generateGermanFilename("", [], originalFilename);
    }

    // Add original file extension
    const extension = this.extractFileExtension(originalFilename);
    return `${sanitized}${extension}`;
  }

  /**
   * Generate semantic German filename from AI analysis (fallback method)
   */
  private generateGermanFilename(
    description: string,
    tags: string[],
    originalFilename: string
  ): string {
    // Extract health-related keywords
    const healthKeywords = CONVERSION_DEFAULTS.HEALTH_KEYWORDS.filter(
      keyword =>
        description.toLowerCase().includes(keyword.toLowerCase()) ||
        tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );

    if (healthKeywords.length === 0) {
      // Use description-based filename
      const words = description
        .toLowerCase()
        .replace(/[^a-zäöüß\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 4);

      if (words.length > 0) {
        const extension = this.extractFileExtension(originalFilename);
        return `${words.join("-")}${extension}`;
      }
    } else {
      // Use health keywords for filename
      const keywordSlug = healthKeywords
        .slice(0, 3)
        .join("-")
        .toLowerCase()
        .replace(/[^a-zäöüß-]/g, "");

      const extension = this.extractFileExtension(originalFilename);
      return `${keywordSlug}${extension}`;
    }

    // Fallback to original filename
    return originalFilename;
  }

  /**
   * Generate German alt text optimized for accessibility (80-125 characters)
   */
  private generateGermanAltText(description: string, tags: string[]): string {
    if (!description) {
      return "";
    }

    let altText = description.trim();

    // Ensure German style and punctuation
    if (!altText.endsWith(".")) {
      altText += ".";
    }

    // Check length and truncate if necessary
    const maxLength = this.config.maxAltTextLength || 125;
    if (altText.length > maxLength) {
      // Find the last complete sentence within the limit
      const sentences = altText.split(". ");
      let result = "";

      for (const sentence of sentences) {
        const potential = result ? `${result}. ${sentence}` : sentence;

        if (potential.length <= maxLength - 1) {
          result = potential;
        } else {
          break;
        }
      }

      altText = result
        ? `${result}.`
        : altText.substring(0, maxLength - 1) + ".";
    }

    return altText;
  }

  /**
   * Save a cache entry
   */
  private async saveCacheEntry(
    imageUrl: string,
    originalFilename: string,
    response: VisionatiResponse,
    result: ImageAnalysisResult
  ): Promise<void> {
    const cacheEntry: VisionatiCacheEntry = {
      timestamp: new Date().toISOString(),
      imageUrl,
      visionatiResponse: response,
      generatedFilename: result.generatedFilename,
      generatedAltText: result.generatedAltText,
      apiCreditsUsed: response.credits_used || 2,
    };

    this.cache[imageUrl] = cacheEntry;
    this.stats.totalEntries = Object.keys(this.cache).length;

    await this.saveCache();
  }

  /**
   * Load cache from disk
   */
  private async loadCache(): Promise<void> {
    try {
      const cacheData = await fs.readFile(this.config.cacheFile, "utf-8");
      this.cache = JSON.parse(cacheData);

      // Calculate stats
      this.stats.totalEntries = Object.keys(this.cache).length;
      this.stats.totalCreditsUsed = Object.values(this.cache).reduce(
        (sum, entry) => sum + entry.apiCreditsUsed,
        0
      );

      logger.debug(`Loaded ${this.stats.totalEntries} entries from cache`);
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        logger.warn(`Failed to load cache: ${error}`);
      }
      this.cache = {};
      this.stats.totalEntries = 0;
    }
  }

  /**
   * Save cache to disk
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheDir = join(this.config.cacheFile, "..");
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(
        this.config.cacheFile,
        JSON.stringify(this.cache, null, 2),
        "utf-8"
      );
      logger.debug(`Saved cache with ${this.stats.totalEntries} entries`);
    } catch (error) {
      logger.error(`Failed to save cache: ${error}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): VisionatiStats {
    return {
      ...this.stats,
      costSavings: this.stats.cacheHits * 2, // Assuming 2 credits per image
    };
  }

  /**
   * Clear cache (for testing/maintenance)
   */
  async clearCache(): Promise<void> {
    this.cache = {};
    this.stats = {
      totalEntries: 0,
      totalCreditsUsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      costSavings: 0,
    };
    await this.saveCache();
  }

  /**
   * Create fallback result when AI analysis fails
   */
  private createFallbackResult(originalFilename: string): ImageAnalysisResult {
    return {
      originalFilename,
      generatedFilename: originalFilename,
      generatedAltText: "",
      tags: [],
      fromCache: false,
      creditsUsed: 0,
    };
  }

  /**
   * Extract file extension from filename
   */
  private extractFileExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : ".jpg";
  }
}
