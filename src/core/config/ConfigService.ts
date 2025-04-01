import { SITE } from "@/config";

/**
 * Configuration service for centralized configuration management
 */
export interface IConfigService {
  /**
   * Get a specific configuration value
   * @param key Configuration key
   * @param defaultValue Optional default value if key not found
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Get all configuration values
   */
  getAll(): Record<string, unknown>;

  /**
   * Check if a configuration key exists
   * @param key Configuration key
   */
  has(key: string): boolean;
}

export class ConfigService implements IConfigService {
  private config: Record<string, unknown>;

  constructor() {
    // Merge different configuration sources
    this.config = {
      ...SITE,
      // Add more configuration sources as needed
      env: {
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
      },
    };
  }

  get<T>(key: string, defaultValue?: T): T {
    const keys = key.split(".");
    let value: unknown = this.config;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  getAll(): Record<string, unknown> {
    return { ...this.config };
  }

  has(key: string): boolean {
    const keys = key.split(".");
    let value: unknown = this.config;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return false;
      }
    }

    return true;
  }
}

// Singleton instance
export const configService = new ConfigService();
