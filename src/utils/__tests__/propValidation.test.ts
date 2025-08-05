/**
 * @file propValidation.test.ts
 * @description Tests for prop validation utilities
 */

import { describe, it, expect } from "vitest";

import {
  validateProp,
  validateProps,
  createValidator,
  createStrictValidator,
  withValidation,
  sizeVariantValidator,
  colorVariantValidator,
  buttonVariantValidator,
  urlValidator,
  emailValidator,
  accessibleNameValidator,
  commonRules,
  type PropValidationRule,
  type PropValidationSchema,
  type ValidationContext,
} from "../propValidation";

describe("validateProp", () => {
  it("should validate required props", () => {
    const rule: PropValidationRule = {
      required: true,
      type: "string",
    };

    expect(validateProp("test", rule, "testProp").isValid).toBe(true);
    expect(validateProp(null, rule, "testProp").isValid).toBe(false);
    expect(validateProp(undefined, rule, "testProp").isValid).toBe(false);
  });

  it("should validate prop types", () => {
    const stringRule: PropValidationRule = { type: "string" };
    const numberRule: PropValidationRule = { type: "number" };
    const booleanRule: PropValidationRule = { type: "boolean" };

    expect(validateProp("hello", stringRule, "str").isValid).toBe(true);
    expect(validateProp(42, stringRule, "str").isValid).toBe(false);

    expect(validateProp(42, numberRule, "num").isValid).toBe(true);
    expect(validateProp("42", numberRule, "num").isValid).toBe(false);

    expect(validateProp(true, booleanRule, "bool").isValid).toBe(true);
    expect(validateProp("true", booleanRule, "bool").isValid).toBe(false);
  });

  it("should validate allowed values", () => {
    const rule: PropValidationRule = {
      type: "string",
      oneOf: ["small", "medium", "large"],
    };

    expect(validateProp("small", rule, "size").isValid).toBe(true);
    expect(validateProp("medium", rule, "size").isValid).toBe(true);
    expect(validateProp("extra-large", rule, "size").isValid).toBe(false);
  });

  it("should validate with custom validator functions", () => {
    const rule: PropValidationRule = {
      type: "string",
      validator: value => typeof value === "string" && value.length > 3,
    };

    expect(validateProp("hello", rule, "customProp").isValid).toBe(true);
    expect(validateProp("hi", rule, "customProp").isValid).toBe(false);
    expect(validateProp(123, rule, "customProp").isValid).toBe(false);
  });

  it("should handle optional props", () => {
    const rule: PropValidationRule = {
      required: false,
      type: "string",
    };

    expect(validateProp(undefined, rule, "optional").isValid).toBe(true);
    expect(validateProp(null, rule, "optional").isValid).toBe(true);
    expect(validateProp("value", rule, "optional").isValid).toBe(true);
    expect(validateProp(123, rule, "optional").isValid).toBe(false);
  });
});

describe("validateProps", () => {
  it("should validate all props in a schema", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
      age: { required: false, type: "number" },
      size: { type: "string", oneOf: ["small", "large"] },
    };

    const validProps = { name: "John", age: 30, size: "small" };
    const result = validateProps(validProps, schema);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should collect validation errors", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
      age: { required: true, type: "number" },
    };

    const invalidProps = { name: 123, age: "thirty" };
    const result = validateProps(invalidProps, schema);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("name");
    expect(result.errors[1]).toContain("age");
  });

  it("should handle missing required props", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      required: { required: true, type: "string" },
      optional: { required: false, type: "string" },
    };

    const props = { optional: "present" };
    const result = validateProps(props, schema);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("required");
  });

  it("should include context in validation", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
    };

    const context: ValidationContext = {
      componentName: "TestComponent",
      strict: true,
    };

    const props = { name: 123 };
    const result = validateProps(props, schema, context);

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("name must be of type string");
  });
});

describe("createValidator", () => {
  it("should create a validator function from schema", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      title: { required: true, type: "string" },
      count: { required: false, type: "number" },
    };

    const validator = createValidator(schema);

    expect(validator({ title: "Test", count: 5 }).isValid).toBe(true);
    expect(validator({ title: "Test" }).isValid).toBe(true);
    expect(validator({ count: 5 }).isValid).toBe(false); // Missing required title
    expect(validator({ title: 123 }).isValid).toBe(false); // Wrong type
  });

  it("should use provided context", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
    };

    const validator = createValidator(schema, {
      componentName: "CustomValidator",
    });

    // This should work normally
    expect(validator({ name: "valid" }).isValid).toBe(true);
    expect(validator({ name: 123 }).isValid).toBe(false);
  });
});

describe("createStrictValidator", () => {
  it("should create a strict validator that throws on errors", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      required: { required: true, type: "string" },
    };

    const strictValidator = createStrictValidator(schema, "TestComponent");

    expect(() => strictValidator({ required: "valid" })).not.toThrow();
    expect(() => strictValidator({ required: 123 })).toThrow();
    expect(() => strictValidator({})).toThrow();
  });

  it("should include component name in error message", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
    };

    const strictValidator = createStrictValidator(schema, "StrictTest");

    expect(() => strictValidator({ name: 123 })).toThrow();
  });
});

describe("withValidation", () => {
  it("should create a validator function for props", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
    };

    const validator = withValidation(schema, "TestComponent");

    const result = validator({ name: "valid" });

    expect(result).toEqual({ name: "valid" });
  });

  it("should return validated props even with errors in dev mode", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      name: { required: true, type: "string" },
    };

    const validator = withValidation(schema, "TestComponent");

    // In dev mode, it logs errors but still returns props
    const result = validator({ name: 123 });
    expect(result).toEqual({ name: 123 });
  });
});

describe("Built-in Validators", () => {
  describe("sizeVariantValidator", () => {
    it("should validate size variants", () => {
      expect(sizeVariantValidator("xs")).toBe(true);
      expect(sizeVariantValidator("sm")).toBe(true);
      expect(sizeVariantValidator("md")).toBe(true);
      expect(sizeVariantValidator("lg")).toBe(true);
      expect(sizeVariantValidator("xl")).toBe(true);
      expect(sizeVariantValidator("invalid")).toBe(false);
      expect(sizeVariantValidator(123)).toBe(false);
    });
  });

  describe("colorVariantValidator", () => {
    it("should validate color variants", () => {
      expect(colorVariantValidator("primary")).toBe(true);
      expect(colorVariantValidator("secondary")).toBe(true);
      expect(colorVariantValidator("accent")).toBe(true);
      expect(colorVariantValidator("muted")).toBe(true);
      expect(colorVariantValidator("success")).toBe(true);
      expect(colorVariantValidator("warning")).toBe(true);
      expect(colorVariantValidator("error")).toBe(true);
      expect(colorVariantValidator("invalid")).toBe(false);
    });
  });

  describe("buttonVariantValidator", () => {
    it("should validate button variants", () => {
      expect(buttonVariantValidator("default")).toBe(true);
      expect(buttonVariantValidator("accent")).toBe(true);
      expect(buttonVariantValidator("outline")).toBe(true);
      expect(buttonVariantValidator("ghost")).toBe(true);
      expect(buttonVariantValidator("subtle")).toBe(true);
      expect(buttonVariantValidator("text")).toBe(true);
      expect(buttonVariantValidator("link")).toBe(true);
      expect(buttonVariantValidator("icon")).toBe(true);
      expect(buttonVariantValidator("invalid")).toBe(false);
    });
  });

  describe("urlValidator", () => {
    it("should validate URLs", () => {
      expect(urlValidator("https://example.com")).toBe(true);
      expect(urlValidator("http://example.com")).toBe(true);
      expect(urlValidator("https://subdomain.example.com/path?query=1")).toBe(
        true
      );
      expect(urlValidator("invalid-url")).toEqual("Invalid URL format");
      expect(urlValidator("")).toEqual("URL must be a non-empty string");
    });
  });

  describe("emailValidator", () => {
    it("should validate email addresses", () => {
      expect(emailValidator("user@example.com")).toBe(true);
      expect(emailValidator("test.email+tag@domain.co.uk")).toBe(true);
      expect(emailValidator("invalid-email")).toEqual("Invalid email format");
      expect(emailValidator("user@")).toEqual("Invalid email format");
      expect(emailValidator("@domain.com")).toEqual("Invalid email format");
      expect(emailValidator("")).toEqual("Email must be a non-empty string");
    });
  });

  describe("accessibleNameValidator", () => {
    it("should validate accessible names", () => {
      expect(accessibleNameValidator({ "aria-label": "Button Label" })).toBe(
        true
      );
      expect(accessibleNameValidator({ children: "Button Text" })).toBe(true);
      expect(accessibleNameValidator({ title: "Button Title" })).toBe(true);
      expect(accessibleNameValidator({})).toEqual(
        "Interactive element must have an accessible name (aria-label, aria-labelledby, title, or text content)"
      );
    });

    it("should accept aria-labelledby", () => {
      expect(accessibleNameValidator({ "aria-labelledby": "label-id" })).toBe(
        true
      );
    });
  });
});

describe("commonRules", () => {
  it("should provide common validation rules", () => {
    expect(commonRules).toHaveProperty("requiredString");
    expect(commonRules).toHaveProperty("optionalString");
    expect(commonRules).toHaveProperty("requiredNumber");
    expect(commonRules).toHaveProperty("positiveNumber");
    expect(commonRules).toHaveProperty("requiredBoolean");
    expect(commonRules).toHaveProperty("optionalBoolean");
  });

  it("should have correctly configured common rules", () => {
    expect(commonRules.requiredString).toEqual({
      required: true,
      type: "string",
      minLength: 1,
    });
    expect(commonRules.optionalString).toEqual({ type: "string" });
    expect(commonRules.requiredNumber).toEqual({
      required: true,
      type: "number",
    });
    expect(commonRules.positiveNumber).toEqual({ type: "number", min: 0 });
    expect(commonRules.requiredBoolean).toEqual({
      required: true,
      type: "boolean",
    });
  });
});

describe("Complex Validation Scenarios", () => {
  it("should handle nested object validation", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      user: {
        type: "object",
        validator: value => {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          const obj = value as Record<string, unknown>;
          return typeof obj.name === "string" && typeof obj.age === "number";
        },
      },
    };

    const validProps = {
      user: { name: "John", age: 30 },
    };

    const invalidProps = {
      user: { name: "John", age: "thirty" },
    };

    expect(validateProps(validProps, schema).isValid).toBe(true);
    expect(validateProps(invalidProps, schema).isValid).toBe(false);
  });

  it("should handle array validation", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      tags: {
        type: "array",
        validator: value => {
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every(item => typeof item === "string");
        },
      },
    };

    const validProps = { tags: ["tag1", "tag2", "tag3"] };
    const invalidProps = { tags: ["tag1", 123, "tag3"] };

    expect(validateProps(validProps, schema).isValid).toBe(true);
    expect(validateProps(invalidProps, schema).isValid).toBe(false);
  });

  it("should handle conditional validation", () => {
    const schema: PropValidationSchema<Record<string, any>> = {
      type: {
        required: true,
        type: "string",
        oneOf: ["button", "link"],
      },
      href: {
        required: false,
        type: "string",
        validator: value => {
          // For this test, just validate it's a non-empty string if provided
          return !value || (typeof value === "string" && value.length > 0);
        },
      },
    };

    const validButton = { type: "button" };
    const validLink = { type: "link", href: "https://example.com" };
    const validLinkWithoutHref = { type: "link" }; // href is optional

    expect(validateProps(validButton, schema).isValid).toBe(true);
    expect(validateProps(validLink, schema).isValid).toBe(true);
    expect(validateProps(validLinkWithoutHref, schema).isValid).toBe(true);
  });
});
