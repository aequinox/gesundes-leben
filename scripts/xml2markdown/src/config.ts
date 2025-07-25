import fs from "fs";
import path from "path";

import { z } from "zod";

import type { XmlConverterConfig } from "./types.js";

/**
 * Enhanced Zod schema for XML converter configuration validation
 * Includes file system validation, path resolution, and dependency checking
 */
export const XmlConverterConfigSchema = z.object({
  // Required file paths with validation
  input: z.string()
    .min(1, "Input file path is required")
    .refine(async (path) => {
      try {
        await fs.promises.access(path, fs.constants.R_OK);
        return path.toLowerCase().endsWith('.xml');
      } catch {
        return false;
      }
    }, "Input file must exist and be a readable .xml file"),
    
  output: z.string()
    .min(1, "Output directory path is required")
    .transform((path) => {
      // Resolve relative paths to absolute
      return path.startsWith('/') ? path : process.cwd() + '/' + path;
    }),
    
  // File organization options
  yearFolders: z.boolean().default(false),
  monthFolders: z.boolean().default(false),
  postFolders: z.boolean().default(false),
  prefixDate: z.boolean().default(false),
  
  // Image processing options
  saveAttachedImages: z.boolean().default(true),
  saveScrapedImages: z.boolean().default(true),
  
  // Content filtering
  includeOtherTypes: z.boolean().default(false),
  
  // Visionati AI configuration with enhanced validation
  generateAltTexts: z.boolean().default(false),
  visionatiApiKey: z.string().optional()
    .refine((key) => {
      // If generateAltTexts is true, API key should be provided
      return !key || key.length >= 10; // Basic length check
    }, "Visionati API key must be at least 10 characters"),
    
  visionatiBackend: z.enum(["claude", "gpt4", "gemini"]).default("claude"),
  
  visionatiLanguage: z.string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Language must be ISO 639-1 format (e.g., 'de', 'en-US')")
    .default("de"),
    
  visionatiPrompt: z.string().optional()
    .refine((prompt) => !prompt || prompt.length <= 1000, "Custom prompt must be 1000 characters or less"),
    
  visionatiTimeout: z.number()
    .min(5000, "Timeout must be at least 5 seconds")
    .max(120000, "Timeout must not exceed 2 minutes")
    .default(30000),
    
  visionatiMaxConcurrent: z.number()
    .int("Max concurrent must be an integer")
    .min(1, "At least 1 concurrent request required")
    .max(20, "Maximum 20 concurrent requests allowed")
    .default(5),
    
  // Cache configuration with validation
  visionatiCacheEnabled: z.boolean().default(true),
  
  visionatiCacheFile: z.string()
    .default(".visionati-cache.json")
    .refine((filePath) => {
      // Validate cache file path and directory permissions
      const dir = path.dirname(path.resolve(filePath));
      try {
        fs.accessSync(dir, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    }, "Cache file directory must be writable"),
    
  visionatiCacheTTL: z.number()
    .int("Cache TTL must be an integer")
    .min(1, "Cache TTL must be at least 1 day")
    .max(365, "Cache TTL must not exceed 365 days")
    .default(30),
})
.refine((config) => {
  // Cross-field validation: if generateAltTexts is true, API key is required
  if (config.generateAltTexts && !config.visionatiApiKey) {
    return false;
  }
  return true;
}, {
  message: "Visionati API key is required when generateAltTexts is enabled",
  path: ["visionatiApiKey"]
})
.refine((config) => {
  // Logical validation: monthFolders requires yearFolders
  if (config.monthFolders && !config.yearFolders) {
    return false;
  }
  return true;
}, {
  message: "Year folders must be enabled when month folders are enabled",
  path: ["monthFolders"]
});

/**
 * Validates XML converter configuration
 * @param config - Configuration object to validate
 * @returns Validated configuration
 * @throws {XmlValidationError} When configuration is invalid
 */
/**
 * Enhanced configuration validation with detailed error reporting
 * @param config - Configuration object to validate
 * @returns Promise resolving to validated configuration
 * @throws {XmlConfigurationError} When configuration is invalid
 */
export async function validateConfig(
  config: unknown
): Promise<XmlConverterConfig> {
  try {
    // Pre-validation checks
    if (!config || typeof config !== 'object') {
      const { XmlConfigurationError } = await import("./errors.js");
      throw XmlConfigurationError.forInvalidValue(
        "config",
        config,
        "non-null object"
      );
    }

    // Validate with Zod schema
    const validatedConfig = await XmlConverterConfigSchema.parseAsync(config);
    
    // Additional runtime validations
    await performRuntimeValidations(validatedConfig);
    
    return validatedConfig;
  } catch (error) {
    const { XmlConfigurationError } = await import("./errors.js");
    
    if (error instanceof z.ZodError) {
      // Format Zod errors into user-friendly messages
      const formattedErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: 'received' in issue ? issue.received : undefined,
      }));
      
      throw new XmlConfigurationError("Configuration validation failed", {
        errors: formattedErrors,
        received: config,
        totalErrors: error.issues.length,
      });
    }
    
    if (error instanceof XmlConfigurationError) {
      throw error;
    }
    
    throw new XmlConfigurationError("Unexpected configuration error", {
      originalError: error,
    });
  }
}

/**
 * Perform additional runtime validations
 * @param config Validated configuration object
 */
async function performRuntimeValidations(config: XmlConverterConfig): Promise<void> {
  const { XmlConfigurationError } = await import("./errors.js");
  
  // Validate input file exists and is readable
  try {
    const stats = await fs.promises.stat(config.input);
    if (!stats.isFile()) {
      throw XmlConfigurationError.forInvalidValue(
        "input",
        config.input,
        "valid file path"
      );
    }
  } catch (error) {
    if (error instanceof XmlConfigurationError) {
      throw error;
    }
    throw XmlConfigurationError.forInvalidValue(
      "input",
      config.input,
      "accessible file path"
    );
  }
  
  // Validate output directory can be created
  try {
    await fs.promises.mkdir(config.output, { recursive: true });
    await fs.promises.access(config.output, fs.constants.W_OK);
  } catch {
    throw XmlConfigurationError.forInvalidValue(
      "output",
      config.output,
      "writable directory path"
    );
  }
}

/**
 * Enhanced default configuration values with environment-aware settings
 */
export const defaultConfig: Partial<XmlConverterConfig> = {
  output: path.resolve(process.cwd(), "output"),
  yearFolders: false,
  monthFolders: false,
  postFolders: true, // Enable post folders by default for better organization
  prefixDate: false,
  saveAttachedImages: true,
  saveScrapedImages: true,
  includeOtherTypes: false,
  
  // AI processing defaults
  generateAltTexts: false,
  visionatiBackend: "claude",
  visionatiLanguage: "de", // German for health blog
  visionatiTimeout: 30000,
  visionatiMaxConcurrent: 5,
  
  // Cache defaults
  visionatiCacheEnabled: true,
  visionatiCacheFile: path.resolve(process.cwd(), ".visionati-cache.json"),
  visionatiCacheTTL: 30,
};

/**
 * Merge user configuration with defaults
 * @param userConfig Partial user configuration
 * @returns Complete configuration with defaults applied
 */
export function mergeWithDefaults(userConfig: Partial<XmlConverterConfig>): XmlConverterConfig {
  return {
    ...defaultConfig,
    ...userConfig,
  } as XmlConverterConfig;
}

/**
 * Available blog categories for validation
 */
export const BLOG_CATEGORIES = [
  "Ernährung",
  "Gesundheit",
  "Wellness",
  "Mentale Gesundheit",
  "Fitness",
  "Immunsystem",
  "Prävention",
  "Naturheilkunde",
  "Organsysteme",
  "Wissenschaftliches",
] as const;

/**
 * Available blog groups for validation
 */
export const BLOG_GROUPS = ["pro", "kontra", "fragezeiten"] as const;

/**
 * Frontmatter fields configuration
 */
export const FRONTMATTER_FIELDS = [
  "id:id",
  "title:title",
  "author:author",
  "pubDatetime:pubDatetime",
  "modDatetime:modDatetime",
  "excerpt:description",
  "keywords:keywords",
  "categories:categories",
  "group:group",
  "tags:tags",
  "heroImage:heroImage",
  "draft:draft",
  "featured:featured",
] as const;
