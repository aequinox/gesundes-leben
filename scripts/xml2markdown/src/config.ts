import { z } from 'zod';

import type { XmlConverterConfig } from './types.js';

/**
 * Zod schema for XML converter configuration validation
 */
export const XmlConverterConfigSchema = z.object({
  input: z.string().min(1, 'Input file path is required'),
  output: z.string().min(1, 'Output directory path is required'),
  yearFolders: z.boolean().default(false),
  monthFolders: z.boolean().default(false),
  postFolders: z.boolean().default(false),
  prefixDate: z.boolean().default(false),
  saveAttachedImages: z.boolean().default(true),
  saveScrapedImages: z.boolean().default(true),
  includeOtherTypes: z.boolean().default(false),
});

/**
 * Validates XML converter configuration
 * @param config - Configuration object to validate
 * @returns Validated configuration
 * @throws {XmlValidationError} When configuration is invalid
 */
export async function validateConfig(config: unknown): Promise<XmlConverterConfig> {
  try {
    return XmlConverterConfigSchema.parse(config);
  } catch (error) {
    const { XmlValidationError } = await import('./errors.js');
    if (error instanceof z.ZodError) {
      throw new XmlValidationError('Invalid configuration', {
        errors: error.issues,
        received: config
      });
    }
    throw error;
  }
}

/**
 * Default configuration values
 */
export const defaultConfig: XmlConverterConfig = {
  input: '',
  output: './output',
  yearFolders: false,
  monthFolders: false,
  postFolders: false,
  prefixDate: false,
  saveAttachedImages: true,
  saveScrapedImages: true,
  includeOtherTypes: false,
};

/**
 * Available blog categories for validation
 */
export const BLOG_CATEGORIES = [
  'Ernährung',
  'Gesundheit', 
  'Wellness',
  'Mentale Gesundheit',
  'Fitness',
  'Immunsystem',
  'Prävention',
  'Naturheilkunde',
  'Organsysteme',
  'Wissenschaftliches'
] as const;

/**
 * Available blog groups for validation
 */
export const BLOG_GROUPS = ['pro', 'kontra', 'fragezeiten'] as const;

/**
 * Frontmatter fields configuration
 */
export const FRONTMATTER_FIELDS = [
  'id:id',
  'title:title', 
  'author:author',
  'pubDatetime:pubDatetime',
  'modDatetime:modDatetime',
  'excerpt:description',
  'keywords:keywords',
  'categories:categories',
  'group:group',
  'tags:tags',
  'heroImage:heroImage',
  'draft:draft',
  'featured:featured'
] as const;