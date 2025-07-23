/**
 * Enhanced form validation utilities with comprehensive validation rules
 *
 * Provides type-safe, composable validation patterns for forms and user input
 * with internationalization support and accessibility considerations.
 *
 * @example
 * ```typescript
 * import { createValidator, ValidationRule } from '@/utils/validation/form-validation';
 *
 * const emailValidator = createValidator([
 *   ValidationRule.required(),
 *   ValidationRule.email(),
 *   ValidationRule.maxLength(254)
 * ]);
 *
 * const result = await emailValidator.validate('user@example.com');
 * ```
 */
import type { FormFieldConfig, ValidationResult } from "@/types";
import { logger } from "@/utils/logger";

export interface ValidationContext {
  field: string;
  value: unknown;
  formData?: Record<string, unknown>;
  locale?: string;
}

export interface ValidatorRule {
  validate: (
    context: ValidationContext
  ) => Promise<ValidationResult> | ValidationResult;
  message: string | ((context: ValidationContext) => string);
  code: string;
  severity: "error" | "warning" | "info";
}

export interface FormValidationSchema {
  [fieldName: string]: ValidatorRule[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  fieldResults: Record<string, ValidationResult>;
}

/**
 * Comprehensive form validator with async support
 */
export class FormValidator {
  private schema: FormValidationSchema;
  private locale: string;

  constructor(schema: FormValidationSchema, locale = "en") {
    this.schema = schema;
    this.locale = locale;
  }

  /**
   * Validate entire form data against schema
   */
  public async validateForm(
    formData: Record<string, unknown>
  ): Promise<FormValidationResult> {
    const result: FormValidationResult = {
      isValid: true,
      errors: {},
      warnings: {},
      fieldResults: {},
    };

    // Validate each field
    for (const [fieldName, _rules] of Object.entries(this.schema)) {
      const fieldResult = await this.validateField(
        fieldName,
        formData[fieldName],
        formData
      );
      result.fieldResults[fieldName] = fieldResult;

      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors[fieldName] = fieldResult.errors;
      }

      if (fieldResult.warnings && fieldResult.warnings.length > 0) {
        result.warnings[fieldName] = fieldResult.warnings;
      }
    }

    return result;
  }

  /**
   * Validate a single field
   */
  public async validateField(
    fieldName: string,
    value: unknown,
    formData?: Record<string, unknown>
  ): Promise<ValidationResult> {
    const rules = this.schema[fieldName] || [];
    const context: ValidationContext = {
      field: fieldName,
      value,
      formData,
      locale: this.locale,
    };

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Run all validation rules
    for (const rule of rules) {
      try {
        const ruleResult = await Promise.resolve(rule.validate(context));

        if (!ruleResult.isValid) {
          const message =
            typeof rule.message === "function"
              ? rule.message(context)
              : rule.message;

          if (rule.severity === "error") {
            result.isValid = false;
            result.errors.push(message);
          } else if (rule.severity === "warning") {
            result.warnings = result.warnings || [];
            result.warnings.push(message);
          }
        }
      } catch (error) {
        logger.error(`Validation rule error for field ${fieldName}:`, error);
        result.isValid = false;
        result.errors.push("Validation error occurred");
      }
    }

    return result;
  }

  /**
   * Add validation rule for a field
   */
  public addRule(fieldName: string, rule: ValidatorRule): void {
    if (!this.schema[fieldName]) {
      this.schema[fieldName] = [];
    }
    this.schema[fieldName].push(rule);
  }

  /**
   * Remove all rules for a field
   */
  public removeField(fieldName: string): void {
    delete this.schema[fieldName];
  }

  /**
   * Update locale for error messages
   */
  public setLocale(locale: string): void {
    this.locale = locale;
  }
}

/**
 * Pre-built validation rules
 */
export class ValidationRule {
  /**
   * Required field validation
   */
  static required(message = "This field is required"): ValidatorRule {
    return {
      code: "required",
      severity: "error",
      message,
      validate: ({ value }) => ({
        isValid:
          value !== null && value !== undefined && String(value).trim() !== "",
        errors: [],
      }),
    };
  }

  /**
   * Email validation with RFC compliance
   */
  static email(message = "Please enter a valid email address"): ValidatorRule {
    return {
      code: "email",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value || typeof value !== "string") {
          return { isValid: false, errors: [] };
        }

        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return {
          isValid: emailRegex.test(value),
          errors: [],
        };
      },
    };
  }

  /**
   * Minimum length validation
   */
  static minLength(min: number, message?: string): ValidatorRule {
    return {
      code: "minLength",
      severity: "error",
      message: message || `Must be at least ${min} characters`,
      validate: ({ value }) => {
        const str = String(value || "");
        return {
          isValid: str.length >= min,
          errors: [],
        };
      },
    };
  }

  /**
   * Maximum length validation
   */
  static maxLength(max: number, message?: string): ValidatorRule {
    return {
      code: "maxLength",
      severity: "error",
      message: message || `Must be no more than ${max} characters`,
      validate: ({ value }) => {
        const str = String(value || "");
        return {
          isValid: str.length <= max,
          errors: [],
        };
      },
    };
  }

  /**
   * Pattern validation with regex
   */
  static pattern(regex: RegExp, message = "Invalid format"): ValidatorRule {
    return {
      code: "pattern",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value || typeof value !== "string") {
          return { isValid: false, errors: [] };
        }
        return {
          isValid: regex.test(value),
          errors: [],
        };
      },
    };
  }

  /**
   * Numeric range validation
   */
  static range(min: number, max: number, message?: string): ValidatorRule {
    return {
      code: "range",
      severity: "error",
      message: message || `Must be between ${min} and ${max}`,
      validate: ({ value }) => {
        const num = Number(value);
        if (isNaN(num)) {
          return { isValid: false, errors: [] };
        }
        return {
          isValid: num >= min && num <= max,
          errors: [],
        };
      },
    };
  }

  /**
   * Password strength validation
   */
  static passwordStrength(
    message = "Password must contain uppercase, lowercase, number, and special character"
  ): ValidatorRule {
    return {
      code: "passwordStrength",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value || typeof value !== "string") {
          return { isValid: false, errors: [] };
        }

        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
        const minLength = value.length >= 8;

        return {
          isValid: hasUpper && hasLower && hasNumber && hasSpecial && minLength,
          errors: [],
        };
      },
    };
  }

  /**
   * URL validation
   */
  static url(message = "Please enter a valid URL"): ValidatorRule {
    return {
      code: "url",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value || typeof value !== "string") {
          return { isValid: false, errors: [] };
        }

        try {
          new URL(value);
          return { isValid: true, errors: [] };
        } catch {
          return { isValid: false, errors: [] };
        }
      },
    };
  }

  /**
   * Phone number validation (international format)
   */
  static phone(message = "Please enter a valid phone number"): ValidatorRule {
    return {
      code: "phone",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value || typeof value !== "string") {
          return { isValid: false, errors: [] };
        }

        // Basic international phone number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const cleanedPhone = value.replace(/[\s\-\(\)]/g, "");

        return {
          isValid: phoneRegex.test(cleanedPhone),
          errors: [],
        };
      },
    };
  }

  /**
   * Date validation
   */
  static date(message = "Please enter a valid date"): ValidatorRule {
    return {
      code: "date",
      severity: "error",
      message,
      validate: ({ value }) => {
        if (!value) {
          return { isValid: false, errors: [] };
        }

        const date = new Date(String(value));
        return {
          isValid: !isNaN(date.getTime()),
          errors: [],
        };
      },
    };
  }

  /**
   * Conditional validation based on other field
   */
  static requiredIf(
    condition: (formData: Record<string, unknown>) => boolean,
    message = "This field is required"
  ): ValidatorRule {
    return {
      code: "requiredIf",
      severity: "error",
      message,
      validate: ({ value, formData }) => {
        if (!condition(formData || {})) {
          return { isValid: true, errors: [] };
        }

        return ValidationRule.required().validate({
          field: "",
          value,
          formData,
        });
      },
    };
  }

  /**
   * Async validation (e.g., checking uniqueness)
   */
  static async(
    asyncValidator: (value: unknown) => Promise<boolean>,
    message = "Validation failed"
  ): ValidatorRule {
    return {
      code: "async",
      severity: "error",
      message,
      validate: async ({ value }) => {
        try {
          const isValid = await asyncValidator(value);
          return { isValid, errors: [] };
        } catch (error) {
          logger.error("Async validation error:", error);
          return { isValid: false, errors: [] };
        }
      },
    };
  }

  /**
   * Custom validation function
   */
  static custom(
    validator: (context: ValidationContext) => boolean | ValidationResult,
    message = "Validation failed"
  ): ValidatorRule {
    return {
      code: "custom",
      severity: "error",
      message,
      validate: context => {
        try {
          const result = validator(context);

          if (typeof result === "boolean") {
            return { isValid: result, errors: [] };
          }

          return result;
        } catch (error) {
          logger.error("Custom validation error:", error);
          return { isValid: false, errors: [] };
        }
      },
    };
  }
}

/**
 * Create a field validator from form field configuration
 */
export function createFieldValidator(config: FormFieldConfig): ValidatorRule[] {
  const rules: ValidatorRule[] = [];

  if (config.required) {
    rules.push(ValidationRule.required());
  }

  if (config.type === "email") {
    rules.push(ValidationRule.email());
  }

  if (config.type === "url") {
    rules.push(ValidationRule.url());
  }

  if (config.type === "tel") {
    rules.push(ValidationRule.phone());
  }

  if (config.validation) {
    const { validation } = config;

    if (validation.minLength) {
      rules.push(ValidationRule.minLength(validation.minLength));
    }

    if (validation.maxLength) {
      rules.push(ValidationRule.maxLength(validation.maxLength));
    }

    if (validation.min && validation.max) {
      rules.push(ValidationRule.range(validation.min, validation.max));
    }

    if (validation.pattern) {
      rules.push(ValidationRule.pattern(new RegExp(validation.pattern)));
    }

    if (validation.custom) {
      rules.push(ValidationRule.custom(validation.custom));
    }
  }

  return rules;
}

/**
 * Create a form validator from form configuration
 */
export function createFormValidator(
  fields: FormFieldConfig[],
  locale = "en"
): FormValidator {
  const schema: FormValidationSchema = {};

  for (const field of fields) {
    schema[field.name] = createFieldValidator(field);
  }

  return new FormValidator(schema, locale);
}

/**
 * Utility function to sanitize form input
 */
export function sanitizeInput(value: unknown): string {
  if (typeof value !== "string") {
    return String(value || "");
  }

  return value.trim().replace(/[<>\"'&]/g, match => {
    const entityMap: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "&": "&amp;",
    };
    return entityMap[match] || match;
  });
}

/**
 * Debounced validation for real-time form feedback
 */
export function createDebouncedValidator(
  validator: FormValidator,
  delay = 300
): {
  validateField: (
    fieldName: string,
    value: unknown,
    formData?: Record<string, unknown>
  ) => Promise<ValidationResult>;
  cancel: () => void;
} {
  let timeoutId: number | undefined;

  return {
    validateField: (fieldName, value, formData) => {
      return new Promise(resolve => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(async () => {
          const result = await validator.validateField(
            fieldName,
            value,
            formData
          );
          resolve(result);
        }, delay);
      });
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}
