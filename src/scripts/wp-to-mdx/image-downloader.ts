/**
 * Image downloading service with retry capabilities and validation
 */
import { promises as fs } from "fs";
import { join } from "path";

import axios from "axios";

import { CONVERSION_DEFAULTS } from "./config";
import { RetryHandler } from "./errors";
import { logger } from "./logger";
import { SecuritySanitizer } from "./security";
import type { ImageDownloader } from "./types";

export class HttpImageDownloader implements ImageDownloader {
  private downloadedUrls = new Set<string>();

  async download(url: string, destination: string): Promise<void> {
    // Skip if already downloaded
    if (this.downloadedUrls.has(url)) {
      logger.debug(`Image already downloaded: ${url}`);
      return;
    }

    // Sanitize and validate URL
    const sanitizedUrl = SecuritySanitizer.sanitizeURL(url);
    if (!sanitizedUrl) {
      throw new Error(`Invalid URL: ${url}`);
    }

    const filename = this.extractFilename(sanitizedUrl);
    const sanitizedFilename = SecuritySanitizer.sanitizeFilename(filename);

    // Validate image extension
    if (!SecuritySanitizer.validateImageExtension(sanitizedFilename)) {
      throw new Error(`Invalid image extension: ${filename}`);
    }

    const filePath = join(destination, sanitizedFilename);

    // Check if file already exists
    try {
      await fs.access(filePath);
      logger.debug(`Image already exists: ${sanitizedFilename}`);
      this.downloadedUrls.add(url);
      return;
    } catch {
      // File doesn't exist, proceed with download
    }

    // Download with retry
    await RetryHandler.withRetry(
      () => this.downloadWithTimeout(sanitizedUrl, filePath),
      CONVERSION_DEFAULTS.MAX_RETRY_ATTEMPTS,
      CONVERSION_DEFAULTS.RETRY_DELAY_BASE,
      CONVERSION_DEFAULTS.MAX_RETRY_DELAY
    );

    this.downloadedUrls.add(url);
    logger.debug(`Successfully downloaded: ${sanitizedFilename}`);

    // Delay to avoid overwhelming the server
    await this.delay(CONVERSION_DEFAULTS.IMAGE_DOWNLOAD_DELAY);
  }

  private async downloadWithTimeout(
    url: string,
    filePath: string
  ): Promise<void> {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: CONVERSION_DEFAULTS.IMAGE_DOWNLOAD_TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WordPress-to-Astro-Converter/1.0)",
        Accept: "image/*",
      },
      validateStatus: status => status === 200,
    });

    // Validate content type
    const contentType = response.headers["content-type"];
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Validate response size (prevent extremely large downloads)
    const contentLength = parseInt(response.headers["content-length"] || "0");
    if (contentLength > 50 * 1024 * 1024) {
      // 50MB limit
      throw new Error(`Image too large: ${contentLength} bytes`);
    }

    await fs.writeFile(filePath, Buffer.from(response.data));
  }

  private extractFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop() || "unknown";

      // Ensure filename has an extension
      if (!filename.includes(".")) {
        return filename + ".jpg";
      }

      return filename;
    } catch {
      return `image-${Date.now()}.jpg`;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics about downloads
   */
  getDownloadStats(): { totalDownloaded: number; urls: string[] } {
    return {
      totalDownloaded: this.downloadedUrls.size,
      urls: Array.from(this.downloadedUrls),
    };
  }

  /**
   * Clear download history
   */
  clearDownloadHistory(): void {
    this.downloadedUrls.clear();
  }
}

export class MockImageDownloader implements ImageDownloader {
  private downloadedUrls: string[] = [];

  async download(url: string, destination: string): Promise<void> {
    logger.debug(`[MOCK] Would download ${url} to ${destination}`);
    this.downloadedUrls.push(url);
  }

  getDownloadedUrls(): string[] {
    return [...this.downloadedUrls];
  }

  clearDownloadedUrls(): void {
    this.downloadedUrls = [];
  }
}
