/**
 * Logo Configuration
 *
 * This module defines settings for the site logo.
 */

/**
 * Logo configuration interface
 * Settings for the site logo
 */
export interface LogoConfig {
  /** Whether to show the logo */
  readonly enable: boolean;

  /** Whether to use SVG format */
  readonly svg: boolean;

  /** Logo width in pixels */
  readonly width: number;

  /** Logo height in pixels */
  readonly height: number;
}

/**
 * Logo Configuration
 * Settings for the site logo
 */
export const LOGO_IMAGE: Readonly<LogoConfig> = {
  enable: false, // Whether to show logo
  svg: true, // Use SVG format
  width: 216, // Logo width
  height: 46, // Logo height
};
