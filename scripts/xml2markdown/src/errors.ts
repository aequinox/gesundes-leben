import {
  ContentProcessingError,
  ValidationError,
  ConfigurationError,
} from "../../../src/utils/errors.js";

/**
 * XML to MDX conversion error
 * Extends the project's ContentProcessingError for consistency
 */
export class XmlConversionError extends ContentProcessingError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`XML Conversion: ${message}`, {
      ...context,
      module: "xml2markdown",
    });
  }
}

/**
 * Configuration validation error for XML converter
 */
export class XmlConfigurationError extends ConfigurationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`XML Converter Config: ${message}`, {
      ...context,
      module: "xml2markdown",
    });
  }
}

/**
 * Input validation error for XML converter
 */
export class XmlValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`XML Validation: ${message}`, {
      ...context,
      module: "xml2markdown",
    });
  }
}

// Legacy export for backward compatibility
export const ConversionError = XmlConversionError;
