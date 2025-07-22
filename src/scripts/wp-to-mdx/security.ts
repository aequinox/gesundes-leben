/**
 * Security utilities for sanitizing and validating input data
 */
import { SECURITY_CONFIG } from "./config";
import { logger } from "./logger";

export class SecuritySanitizer {
  /**
   * Sanitize HTML content by removing dangerous elements
   */
  static sanitizeHTML(html: string): string {
    let sanitized = html;

    // Remove dangerous script elements and their content
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    // Remove other dangerous elements
    SECURITY_CONFIG.DANGEROUS_ELEMENTS.forEach(element => {
      if (element !== "script") {
        // Already handled above
        const regex = new RegExp(
          `<${element}\\b[^<]*(?:(?!<\\/${element}>)<[^<]*)*<\\/${element}>`,
          "gi"
        );
        sanitized = sanitized.replace(regex, "");

        // Also handle self-closing tags
        const selfClosingRegex = new RegExp(`<${element}\\b[^>]*\\/>`, "gi");
        sanitized = sanitized.replace(selfClosingRegex, "");
      }
    });

    // Remove dangerous attributes from remaining elements
    SECURITY_CONFIG.DANGEROUS_ATTRIBUTES.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, "gi");
      sanitized = sanitized.replace(regex, "");
    });

    // Log if content was modified
    if (sanitized !== html) {
      logger.warn("HTML content was sanitized for security");
    }

    return sanitized;
  }

  /**
   * Sanitize filename to be safe for file system
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) {
      return "unnamed-file";
    }

    // Replace dangerous characters with underscores
    let sanitized = filename.replace(
      SECURITY_CONFIG.ALLOWED_FILENAME_CHARS,
      "_"
    );

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, "");

    // Ensure filename isn't empty after sanitization
    if (!sanitized) {
      sanitized = "unnamed-file";
    }

    // Limit filename length
    if (sanitized.length > 255) {
      const extension = sanitized.match(/\.[^.]+$/)?.[0] || "";
      const baseName = sanitized.slice(0, 255 - extension.length);
      sanitized = baseName + extension;
    }

    return sanitized;
  }

  /**
   * Validate and sanitize URLs
   */
  static sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url);

      // Only allow http and https protocols
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error(`Unsupported protocol: ${urlObj.protocol}`);
      }

      return urlObj.toString();
    } catch (error) {
      logger.warn(`Invalid URL sanitized: ${url}`);
      return "";
    }
  }

  /**
   * Sanitize text content for YAML frontmatter
   */
  static sanitizeYAMLValue(value: string): string {
    if (!value) {
      return "";
    }

    // Escape YAML special characters
    let sanitized = value
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/"/g, '\\"') // Escape quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t"); // Escape tabs

    // Remove control characters (except newlines, tabs, carriage returns)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return sanitized;
  }

  /**
   * Validate file extension against allowed types
   */
  static validateImageExtension(filename: string): boolean {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".avif",
    ];
    const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0];

    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Sanitize WordPress shortcode parameters to prevent injection
   */
  static sanitizeShortcodeParams(params: string): string {
    // Remove potentially dangerous characters from shortcode parameters
    return params
      .replace(/[<>'"]/g, "") // Remove HTML-like characters
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/data:/gi, "") // Remove data: protocol
      .replace(/vbscript:/gi, ""); // Remove vbscript: protocol
  }

  /**
   * Validate slug format
   */
  static validateSlug(slug: string): boolean {
    if (!slug) {
      return false;
    }

    // Slug should only contain lowercase letters, numbers, and hyphens
    const slugPattern = /^[a-z0-9-]+$/;
    return slugPattern.test(slug) && slug.length > 0 && slug.length <= 200;
  }

  /**
   * Sanitize and validate email addresses
   */
  static sanitizeEmail(email: string): string {
    if (!email) {
      return "";
    }

    // Basic email validation and sanitization
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = email.trim().toLowerCase();

    if (emailPattern.test(sanitized)) {
      return sanitized;
    }

    logger.warn(`Invalid email address sanitized: ${email}`);
    return "";
  }

  /**
   * Sanitize author name
   */
  static sanitizeAuthorName(name: string): string {
    if (!name) {
      return "";
    }

    // Remove HTML tags and excessive whitespace
    let sanitized = name
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Limit length
    if (sanitized.length > 100) {
      sanitized = sanitized.slice(0, 97) + "...";
    }

    return sanitized;
  }

  /**
   * Validate and sanitize date strings
   */
  static sanitizeDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Check if date is reasonable (not too far in past or future)
      const now = new Date();
      const hundredYearsAgo = new Date(now.getFullYear() - 100, 0, 1);
      const tenYearsFromNow = new Date(now.getFullYear() + 10, 11, 31);

      if (date < hundredYearsAgo || date > tenYearsFromNow) {
        logger.warn(`Date outside reasonable range: ${dateString}`);
        return null;
      }

      return date;
    } catch (error) {
      logger.warn(`Invalid date string: ${dateString}`);
      return null;
    }
  }

  /**
   * Comprehensive content sanitization for WordPress imports
   */
  static sanitizeWordPressContent(content: string): string {
    if (!content) {
      return "";
    }

    let sanitized = content;

    // 1. Sanitize HTML
    sanitized = this.sanitizeHTML(sanitized);

    // 2. Remove WordPress-specific potentially dangerous shortcodes
    const dangerousShortcodes = ["php", "exec", "eval", "include", "require"];
    dangerousShortcodes.forEach(shortcode => {
      const regex = new RegExp(
        `\\[${shortcode}[^\\]]*\\].*?\\[\\/${shortcode}\\]`,
        "gis"
      );
      sanitized = sanitized.replace(regex, "");
    });

    // 3. Sanitize remaining shortcode parameters
    sanitized = sanitized.replace(/\[([^\]]+)\]/g, (match, params) => {
      const sanitizedParams = this.sanitizeShortcodeParams(params);
      return `[${sanitizedParams}]`;
    });

    // 4. Remove comments that might contain code
    sanitized = sanitized.replace(/<!--.*?-->/gs, "");

    return sanitized;
  }
}
