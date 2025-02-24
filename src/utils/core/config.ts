/**
 * @module config
 * @description
 * Configuration management utilities for consistent configuration handling
 * across the application. Provides type-safe configuration merging,
 * validation, and access.
 *
 * @example
 * ```typescript
 * import { ConfigManager } from './utils/core/config';
 *
 * const config = ConfigManager.merge(defaults, userConfig);
 * ConfigManager.validate(config, schema);
 * ```
 */

import { ConfigurationError } from "./errors";

/**
 * Type for configuration validation functions.
 */
export type Validator<T> = (value: unknown) => value is T;

/**
 * Configuration validation schema type.
 */
export type ValidationSchema<T> = {
  [K in keyof T]: Validator<T[K]>;
};

/**
 * Base type for configuration objects.
 */
export type ConfigObject = Record<string, unknown>;

/**
 * Configuration manager interface.
 * Defines the contract for configuration operations.
 */
export interface ConfigurationManager {
  /**
   * Merges default and custom configurations.
   *
   * @param defaults - Default configuration
   * @param custom - Custom configuration overrides
   * @returns Merged configuration
   */
  merge<T extends ConfigObject>(defaults: T, custom?: Partial<T>): T;

  /**
   * Validates configuration against a schema.
   *
   * @param config - Configuration to validate
   * @param schema - Validation schema
   * @throws {ConfigurationError} If validation fails
   */
  validate<T extends ConfigObject>(
    config: T,
    schema: ValidationSchema<T>
  ): void;

  /**
   * Creates a frozen (immutable) configuration object.
   *
   * @param config - Configuration to freeze
   * @returns Frozen configuration
   */
  freeze<T extends ConfigObject>(config: T): Readonly<T>;
}

/**
 * Type guard for checking if a value is a plain object.
 */
function isPlainObject(value: unknown): value is ConfigObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Configuration manager implementation.
 * Provides utilities for managing application configuration.
 */
export const ConfigManager: ConfigurationManager = {
  merge<T extends ConfigObject>(defaults: T, custom?: Partial<T>): T {
    if (!custom) return { ...defaults };

    const merged = { ...defaults };
    for (const key in custom) {
      const customValue = custom[key];
      const defaultValue = defaults[key];

      if (customValue === undefined) continue;

      if (isPlainObject(customValue) && isPlainObject(defaultValue)) {
        // Type assertion is safe here because we've checked both values are plain objects
        merged[key] = ConfigManager.merge(
          defaultValue as ConfigObject,
          customValue as Partial<ConfigObject>
        ) as T[Extract<keyof T, string>];
      } else {
        merged[key] = customValue as T[Extract<keyof T, string>];
      }
    }

    return merged;
  },

  validate<T extends ConfigObject>(
    config: T,
    schema: ValidationSchema<T>
  ): void {
    for (const key in schema) {
      const validator = schema[key];
      const value = config[key];

      if (!validator(value)) {
        throw new ConfigurationError(
          `Invalid configuration value for "${String(key)}"`,
          { value, key }
        );
      }
    }
  },

  freeze<T extends ConfigObject>(config: T): Readonly<T> {
    const deepFreeze = <U extends ConfigObject>(obj: U): Readonly<U> => {
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = obj[prop];
        if (
          value !== null &&
          typeof value === "object" &&
          !Object.isFrozen(value)
        ) {
          deepFreeze(value as ConfigObject);
        }
      });
      return obj;
    };

    return deepFreeze(config);
  },
};

/**
 * Common configuration validators.
 * Provides reusable validation functions for common types.
 */
export const Validators = {
  isString: (value: unknown): value is string => typeof value === "string",

  isNumber: (value: unknown): value is number =>
    typeof value === "number" && !isNaN(value),

  isBoolean: (value: unknown): value is boolean => typeof value === "boolean",

  isArray:
    <T>(itemValidator: Validator<T>) =>
    (value: unknown): value is T[] =>
      Array.isArray(value) && value.every(item => itemValidator(item)),

  isObject:
    <T extends ConfigObject>(schema: ValidationSchema<T>) =>
    (value: unknown): value is T => {
      if (!isPlainObject(value)) return false;
      try {
        ConfigManager.validate(value as T, schema);
        return true;
      } catch {
        return false;
      }
    },

  optional:
    <T>(validator: Validator<T>) =>
    (value: unknown): value is T | undefined =>
      value === undefined || validator(value),

  oneOf:
    <T>(...validators: Validator<T>[]) =>
    (value: unknown): value is T =>
      validators.some(validator => validator(value)),
};

/**
 * Creates a validated configuration object.
 * Combines merging, validation, and freezing in one operation.
 *
 * @param defaults - Default configuration
 * @param custom - Custom configuration overrides
 * @param schema - Validation schema
 * @returns Validated and frozen configuration
 *
 * @example
 * ```typescript
 * const config = createConfig(
 *   { port: 3000 },
 *   { port: 8080 },
 *   { port: Validators.isNumber }
 * );
 * ```
 */
export function createConfig<T extends ConfigObject>(
  defaults: T,
  custom: Partial<T>,
  schema: ValidationSchema<T>
): Readonly<T> {
  const merged = ConfigManager.merge(defaults, custom);
  ConfigManager.validate(merged, schema);
  return ConfigManager.freeze(merged);
}
