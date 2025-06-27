/**
 * @module validation
 * @description
 * Validation utility functions for form inputs and data validation.
 * Provides robust, type-safe validation functions following best practices.
 *
 * @example
 * ```typescript
 * import { isValidEmail, isValidUrl } from './utils/validation';
 *
 * const email = 'user@example.com';
 * if (isValidEmail(email)) {
 *   // Process valid email
 * }
 * ```
 */
import { logger } from "./logger";

/**
 * Email validation options interface
 */
export interface EmailValidationOptions {
  /** Allow plus signs in local part (e.g., user+tag@domain.com) */
  allowPlus?: boolean;
  /** Allow dots in local part (e.g., user.name@domain.com) */
  allowDots?: boolean;
  /** Minimum domain length */
  minDomainLength?: number;
  /** Maximum email length */
  maxLength?: number;
  /** Allow international domain names */
  allowInternational?: boolean;
}

/**
 * Default email validation options
 */
const DEFAULT_EMAIL_OPTIONS: Required<EmailValidationOptions> = {
  allowPlus: true,
  allowDots: true,
  minDomainLength: 2,
  maxLength: 254, // RFC 5321 limit
  allowInternational: true,
};

/**
 * Comprehensive email validation regex pattern
 * Based on RFC 5322 specification with practical considerations
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Stricter email validation regex (more conservative)
 * Excludes some special characters that might cause issues
 */
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates an email address using comprehensive rules
 *
 * This function performs multiple validation checks:
 * - Basic format validation using regex
 * - Length validation
 * - Domain validation
 * - Special character handling based on options
 *
 * @param email - The email address to validate
 * @param options - Optional validation configuration
 * @returns Boolean indicating whether the email is valid
 *
 * @example
 * ```typescript
 * // Basic validation
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 *
 * // With custom options
 * isValidEmail('user+tag@example.com', { allowPlus: false }); // false
 * isValidEmail('user.name@example.com', { allowDots: false }); // false
 * ```
 */
export const isValidEmail = (
  email: string,
  options: EmailValidationOptions = {}
): boolean => {
  try {
    // Merge options with defaults
    const opts = { ...DEFAULT_EMAIL_OPTIONS, ...options };

    // Basic type and null checks
    if (!email || typeof email !== "string") {
      logger.debug("Email validation failed: invalid input type");
      return false;
    }

    // Trim whitespace
    const trimmedEmail = email.trim();

    // Check length constraints
    if (trimmedEmail.length === 0 || trimmedEmail.length > opts.maxLength) {
      logger.debug(
        `Email validation failed: length constraint (${trimmedEmail.length})`
      );
      return false;
    }

    // Check for basic email structure (must contain @ and .)
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      logger.debug("Email validation failed: missing @ or .");
      return false;
    }

    // Split email into local and domain parts
    const atIndex = trimmedEmail.lastIndexOf("@");
    if (atIndex <= 0 || atIndex === trimmedEmail.length - 1) {
      logger.debug("Email validation failed: invalid @ position");
      return false;
    }

    const localPart = trimmedEmail.substring(0, atIndex);
    const domainPart = trimmedEmail.substring(atIndex + 1);

    // Validate local part
    if (!isValidLocalPart(localPart, opts)) {
      return false;
    }

    // Validate domain part
    if (!isValidDomainPart(domainPart, opts)) {
      return false;
    }

    // Final regex validation
    const regex = opts.allowInternational ? EMAIL_REGEX : STRICT_EMAIL_REGEX;
    const isValid = regex.test(trimmedEmail);

    if (!isValid) {
      logger.debug("Email validation failed: regex test");
    }

    return isValid;
  } catch (error) {
    logger.error(
      `Error in email validation: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
};

/**
 * Validates the local part of an email address (before @)
 * @param localPart - The local part to validate
 * @param options - Validation options
 * @returns Boolean indicating validity
 */
const isValidLocalPart = (
  localPart: string,
  options: Required<EmailValidationOptions>
): boolean => {
  // Check length (RFC 5321: max 64 characters)
  if (localPart.length === 0 || localPart.length > 64) {
    logger.debug(`Local part validation failed: length (${localPart.length})`);
    return false;
  }

  // Check for consecutive dots
  if (localPart.includes("..")) {
    logger.debug("Local part validation failed: consecutive dots");
    return false;
  }

  // Check for leading/trailing dots
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    logger.debug("Local part validation failed: leading/trailing dots");
    return false;
  }

  // Check plus sign if not allowed
  if (!options.allowPlus && localPart.includes("+")) {
    logger.debug("Local part validation failed: plus sign not allowed");
    return false;
  }

  // Check dots if not allowed
  if (!options.allowDots && localPart.includes(".")) {
    logger.debug("Local part validation failed: dots not allowed");
    return false;
  }

  return true;
};

/**
 * Validates the domain part of an email address (after @)
 * @param domainPart - The domain part to validate
 * @param options - Validation options
 * @returns Boolean indicating validity
 */
const isValidDomainPart = (
  domainPart: string,
  options: Required<EmailValidationOptions>
): boolean => {
  // Check length (RFC 5321: max 253 characters)
  if (domainPart.length === 0 || domainPart.length > 253) {
    logger.debug(
      `Domain part validation failed: length (${domainPart.length})`
    );
    return false;
  }

  // Check for consecutive dots
  if (domainPart.includes("..")) {
    logger.debug("Domain part validation failed: consecutive dots");
    return false;
  }

  // Check for leading/trailing dots or hyphens
  if (
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    domainPart.startsWith("-") ||
    domainPart.endsWith("-")
  ) {
    logger.debug(
      "Domain part validation failed: invalid leading/trailing characters"
    );
    return false;
  }

  // Split domain into labels
  const labels = domainPart.split(".");

  // Must have at least 2 labels (e.g., example.com)
  if (labels.length < 2) {
    logger.debug("Domain part validation failed: insufficient labels");
    return false;
  }

  // Check TLD length
  const tld = labels[labels.length - 1];
  if (tld.length < options.minDomainLength) {
    logger.debug(
      `Domain part validation failed: TLD too short (${tld.length})`
    );
    return false;
  }

  // Validate each label
  for (const label of labels) {
    if (!isValidDomainLabel(label)) {
      return false;
    }
  }

  return true;
};

/**
 * Validates a single domain label
 * @param label - The domain label to validate
 * @returns Boolean indicating validity
 */
const isValidDomainLabel = (label: string): boolean => {
  // Check length (RFC 1035: max 63 characters per label)
  if (label.length === 0 || label.length > 63) {
    logger.debug(`Domain label validation failed: length (${label.length})`);
    return false;
  }

  // Check for valid characters (alphanumeric and hyphens)
  if (!/^[a-zA-Z0-9-]+$/.test(label)) {
    logger.debug("Domain label validation failed: invalid characters");
    return false;
  }

  // Check for leading/trailing hyphens
  if (label.startsWith("-") || label.endsWith("-")) {
    logger.debug("Domain label validation failed: leading/trailing hyphens");
    return false;
  }

  return true;
};

/**
 * Simple email validation for basic use cases
 * Uses a more permissive approach suitable for most applications
 *
 * @param email - The email address to validate
 * @returns Boolean indicating whether the email appears valid
 *
 * @example
 * ```typescript
 * isSimpleValidEmail('user@example.com'); // true
 * isSimpleValidEmail('not-an-email'); // false
 * ```
 */
export const isSimpleValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmedEmail = email.trim();
  return STRICT_EMAIL_REGEX.test(trimmedEmail);
};

/**
 * Validates multiple email addresses
 * @param emails - Array of email addresses to validate
 * @param options - Validation options
 * @returns Object with validation results
 */
export const validateEmails = (
  emails: string[],
  options: EmailValidationOptions = {}
): {
  valid: string[];
  invalid: string[];
  results: Array<{ email: string; isValid: boolean }>;
} => {
  const valid: string[] = [];
  const invalid: string[] = [];
  const results: Array<{ email: string; isValid: boolean }> = [];

  for (const email of emails) {
    const isValid = isValidEmail(email, options);
    results.push({ email, isValid });

    if (isValid) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid, results };
};

/**
 * Extracts the domain from a valid email address
 * @param email - The email address
 * @returns The domain part or null if invalid
 */
export const extractEmailDomain = (email: string): string | null => {
  if (!isValidEmail(email)) {
    return null;
  }

  const atIndex = email.lastIndexOf("@");
  return atIndex > 0 ? email.substring(atIndex + 1).toLowerCase() : null;
};

/**
 * Normalizes an email address for consistent storage/comparison
 * @param email - The email address to normalize
 * @returns Normalized email address or null if invalid
 */
export const normalizeEmail = (email: string): string | null => {
  if (!isValidEmail(email)) {
    return null;
  }

  return email.trim().toLowerCase();
};
