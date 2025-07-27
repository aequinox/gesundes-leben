/**
 * TypeScript declarations for Visionati API service
 */

export interface VisionatiConfig {
  /** Visionati API key */
  apiKey: string;
  /** API base URL */
  baseUrl?: string;
  /** AI backend to use */
  backend?: "claude" | "gpt4" | "gemini";
  /** Response language */
  language?: string;
  /** Custom prompt template */
  prompt?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum concurrent requests */
  maxConcurrent?: number;
  /** Number of retry attempts */
  retryAttempts?: number;
}

export interface VisionatiResponse {
  /** Generated alt text description */
  description: string;
  /** Generated SEO filename (without extension) */
  filename: string;
  /** Original image URL */
  originalUrl: string;
  /** API credits consumed */
  creditsUsed: number;
  /** Error message if request failed */
  error?: string;
}

export interface VisionatiStats {
  /** Number of active requests */
  activeRequests: number;
  /** Number of queued requests */
  queuedRequests: number;
  /** Number of cached responses */
  cachedResponses: number;
  /** Service configuration */
  configuration: {
    backend: string;
    language: string;
    maxConcurrent: number;
    timeout: number;
  };
}

/**
 * Visionati API service for generating AI-powered alt texts and filenames
 */
export declare class VisionatiService {
  constructor(config: VisionatiConfig);

  /**
   * Generate alt text and filename for an image URL
   */
  generateAltText(imageUrl: string): Promise<VisionatiResponse>;

  /**
   * Generate alt texts for multiple images with batching
   */
  generateAltTexts(imageUrls: string[]): Promise<VisionatiResponse[]>;

  /**
   * Get service statistics
   */
  getStats(): VisionatiStats;

  /**
   * Clear cache and reset state
   */
  reset(): void;
}
