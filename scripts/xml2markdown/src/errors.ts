import {
  ContentProcessingError,
  ValidationError,
  ConfigurationError,
} from "../../../src/utils/errors.js";

/**
 * XML to MDX conversion error
 * Extends the project's ContentProcessingError for consistency
 * Used for errors during XML parsing, content processing, and file generation
 */
export class XmlConversionError extends ContentProcessingError {
  /** Error context specific to XML conversion */
  public readonly xmlContext?: Readonly<Record<string, unknown>>;

  constructor(
    message: string, 
    context?: Readonly<Record<string, unknown>>,
    _cause?: Error
  ) {
    super(`XML Conversion: ${message}`, {
      ...context,
      module: "xml2markdown",
      timestamp: new Date().toISOString(),
    });
    
    this.xmlContext = context;
    this.name = "XmlConversionError";
  }

  /**
   * Create error for XML parsing failures
   */
  static forParsingFailure(originalError: Error, filePath?: string): XmlConversionError {
    return new XmlConversionError(
      "Failed to parse WordPress XML export",
      {
        operation: "xml_parsing",
        filePath,
        originalMessage: originalError.message,
      },
      originalError
    );
  }

  /**
   * Create error for image processing failures
   */
  static forImageProcessing(url: string, originalError: Error): XmlConversionError {
    return new XmlConversionError(
      "Failed to process image",
      {
        operation: "image_processing",
        imageUrl: url,
        originalMessage: originalError.message,
      },
      originalError
    );
  }

  /**
   * Create error for file writing failures
   */
  static forFileWriting(filePath: string, originalError: Error): XmlConversionError {
    return new XmlConversionError(
      "Failed to write output file",
      {
        operation: "file_writing",
        filePath,
        originalMessage: originalError.message,
      },
      originalError
    );
  }
}

/**
 * Configuration validation error for XML converter
 * Used for invalid configuration options and missing required settings
 */
export class XmlConfigurationError extends ConfigurationError {
  /** Configuration field that caused the error */
  public readonly field?: string;
  /** Expected value or format */
  public readonly expected?: string;
  /** Actual value provided */
  public readonly actual?: unknown;

  constructor(
    message: string, 
    context?: {
      field?: string;
      expected?: string;
      actual?: unknown;
      [key: string]: unknown;
    }
  ) {
    super(`XML Converter Config: ${message}`, {
      ...context,
      module: "xml2markdown",
      timestamp: new Date().toISOString(),
    });
    
    this.field = context?.field;
    this.expected = context?.expected;
    this.actual = context?.actual;
    this.name = "XmlConfigurationError";
  }

  /**
   * Create error for missing required configuration
   */
  static forMissingRequired(field: string): XmlConfigurationError {
    return new XmlConfigurationError(
      `Missing required configuration field: ${field}`,
      {
        field,
        expected: "non-empty value",
        actual: undefined,
      }
    );
  }

  /**
   * Create error for invalid configuration value
   */
  static forInvalidValue(
    field: string, 
    actual: unknown, 
    expected: string
  ): XmlConfigurationError {
    return new XmlConfigurationError(
      `Invalid value for configuration field: ${field}`,
      {
        field,
        expected,
        actual,
      }
    );
  }
}

/**
 * Input validation error for XML converter
 * Used for invalid input data, malformed XML, and data consistency issues
 */
export class XmlValidationError extends ValidationError {
  /** Source of the validation error */
  public readonly source?: string;
  /** Validation rule that failed */
  public readonly rule?: string;

  constructor(
    message: string, 
    context?: {
      source?: string;
      rule?: string;
      [key: string]: unknown;
    }
  ) {
    super(`XML Validation: ${message}`, {
      ...context,
      module: "xml2markdown",
      timestamp: new Date().toISOString(),
    });
    
    this.source = context?.source;
    this.rule = context?.rule;
    this.name = "XmlValidationError";
  }

  /**
   * Create error for invalid XML structure
   */
  static forInvalidXmlStructure(expectedElement: string): XmlValidationError {
    return new XmlValidationError(
      `Invalid XML structure: missing or malformed ${expectedElement}`,
      {
        source: "xml_structure",
        rule: "required_elements",
        expectedElement,
      }
    );
  }

  /**
   * Create error for missing frontmatter getter
   */
  static forMissingFrontmatterGetter(field: string): XmlValidationError {
    return new XmlValidationError(
      `Could not find frontmatter getter: ${field}`,
      {
        source: "frontmatter_processing",
        rule: "getter_exists",
        field,
      }
    );
  }

  /**
   * Create error for invalid post data
   */
  static forInvalidPostData(postId: string, issue: string): XmlValidationError {
    return new XmlValidationError(
      `Invalid post data for post ${postId}: ${issue}`,
      {
        source: "post_data",
        rule: "data_consistency",
        postId,
        issue,
      }
    );
  }
}

// Legacy export for backward compatibility
export const ConversionError = XmlConversionError;
