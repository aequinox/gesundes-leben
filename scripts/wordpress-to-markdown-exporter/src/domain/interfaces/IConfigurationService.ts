import { Result } from "../../utils/Result.js";
import { Configuration } from "../models/Configuration.js";

/**
 * Interface for configuration service
 */
export interface IConfigurationService {
  /**
   * Get configuration from command line arguments or interactive wizard
   * @param argv Command line arguments
   * @returns Result containing the configuration or an error
   */
  getConfig(argv: string[]): Promise<Result<Configuration>>;

  /**
   * Validate configuration
   * @param config Configuration to validate
   * @returns Result containing the validated configuration or an error
   */
  validateConfig(config: Configuration): Result<Configuration>;

  /**
   * Get default configuration
   * @returns Default configuration
   */
  getDefaultConfig(): Configuration;

  /**
   * Merge configuration with defaults
   * @param config Partial configuration
   * @returns Complete configuration with defaults applied
   */
  mergeWithDefaults(config: Partial<Configuration>): Configuration;
}
