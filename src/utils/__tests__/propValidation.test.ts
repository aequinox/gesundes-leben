/**
 * @file propValidation.test.ts
 * @description Tests for prop validation utilities
 */

import { describe, it, expect, vi } from "vitest";

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

    expect(validateProp("test", rule, "testProp")).toBe(true);
    expect(validateProp(null, rule, "testProp")).toBe(false);
    expect(validateProp(undefined, rule, "testProp")).toBe(false);
  });

  it("should validate prop types", () => {
    const stringRule: PropValidationRule = { type: "string" };
    const numberRule: PropValidationRule = { type: "number" };
    const booleanRule: PropValidationRule = { type: "boolean" };

    expect(validateProp("hello", stringRule, "str")).toBe(true);
    expect(validateProp(42, stringRule, "str")).toBe(false);

    expect(validateProp(42, numberRule, "num")).toBe(true);
    expect(validateProp("42", numberRule, "num")).toBe(false);

    expect(validateProp(true, booleanRule, "bool")).toBe(true);
    expect(validateProp("true", booleanRule, "bool")).toBe(false);
  });

  it("should validate allowed values", () => {
    const rule: PropValidationRule = {
      type: "string",
      allowedValues: ["small", "medium", "large"],
    };

    expect(validateProp("small", rule, "size")).toBe(true);
    expect(validateProp("medium", rule, "size")).toBe(true);
    expect(validateProp("extra-large", rule, "size")).toBe(false);
  });

  it("should validate with custom validator functions", () => {
    const rule: PropValidationRule = {
      type: "string",
      validator: value => typeof value === "string" && value.length > 3,
    };

    expect(validateProp("hello", rule, "customProp")).toBe(true);
    expect(validateProp("hi", rule, "customProp")).toBe(false);
    expect(validateProp(123, rule, "customProp")).toBe(false);
  });

  it("should handle optional props", () => {
    const rule: PropValidationRule = {
      required: false,
      type: "string",
    };

    expect(validateProp(undefined, rule, "optional")).toBe(true);
    expect(validateProp(null, rule, "optional")).toBe(true);
    expect(validateProp("value", rule, "optional")).toBe(true);
    expect(validateProp(123, rule, "optional")).toBe(false);
  });
});

describe("validateProps", () => {
  it("should validate all props in a schema", () => {
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
      age: { required: false, type: "number" },
      size: { type: "string", allowedValues: ["small", "large"] },
    };

    const validProps = { name: "John", age: 30, size: "small" };
    const result = validateProps(validProps, schema);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should collect validation errors", () => {
    const schema: PropValidationSchema = {
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
    const schema: PropValidationSchema = {
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
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
    };

    const context: ValidationContext = {
      componentName: "TestComponent",
      strict: true,
    };

    const props = { name: 123 };
    const result = validateProps(props, schema, context);

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("TestComponent");
  });
});

describe("createValidator", () => {
  it("should create a validator function from schema", () => {
    const schema: PropValidationSchema = {
      title: { required: true, type: "string" },
      count: { required: false, type: "number" },
    };

    const validator = createValidator(schema);

    expect(validator({ title: "Test", count: 5 })).toBe(true);
    expect(validator({ title: "Test" })).toBe(true);
    expect(validator({ count: 5 })).toBe(false); // Missing required title
    expect(validator({ title: 123 })).toBe(false); // Wrong type
  });

  it("should use provided context", () => {
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
    };

    const validator = createValidator(schema, {
      componentName: "CustomValidator",
    });

    // This should work normally
    expect(validator({ name: "valid" })).toBe(true);
    expect(validator({ name: 123 })).toBe(false);
  });
});

describe("createStrictValidator", () => {
  it("should create a strict validator that throws on errors", () => {
    const schema: PropValidationSchema = {
      required: { required: true, type: "string" },
    };

    const strictValidator = createStrictValidator(schema);

    expect(() => strictValidator({ required: "valid" })).not.toThrow();
    expect(() => strictValidator({ required: 123 })).toThrow();
    expect(() => strictValidator({})).toThrow();
  });

  it("should include component name in error message", () => {
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
    };

    const strictValidator = createStrictValidator(schema, {
      componentName: "StrictTest",
    });

    expect(() => strictValidator({ name: 123 })).toThrow("StrictTest");
  });
});

describe("withValidation", () => {
  it("should wrap a function with prop validation", () => {
    const originalFn = vi.fn().mockReturnValue("result");
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
    };

    const wrappedFn = withValidation(originalFn, schema);

    const result = wrappedFn({ name: "valid" });

    expect(result).toBe("result");
    expect(originalFn).toHaveBeenCalledWith({ name: "valid" });
  });

  it("should throw error for invalid props when wrapped", () => {
    const originalFn = vi.fn();
    const schema: PropValidationSchema = {
      name: { required: true, type: "string" },
    };

    const wrappedFn = withValidation(originalFn, schema);

    expect(() => wrappedFn({ name: 123 })).toThrow();
    expect(originalFn).not.toHaveBeenCalled();
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
      expect(sizeVariantValidator("2xl")).toBe(true);
      expect(sizeVariantValidator("invalid")).toBe(false);
      expect(sizeVariantValidator(123)).toBe(false);
    });
  });

  describe("colorVariantValidator", () => {
    it("should validate color variants", () => {
      expect(colorVariantValidator("primary")).toBe(true);
      expect(colorVariantValidator("secondary")).toBe(true);
      expect(colorVariantValidator("success")).toBe(true);
      expect(colorVariantValidator("danger")).toBe(true);
      expect(colorVariantValidator("warning")).toBe(true);
      expect(colorVariantValidator("info")).toBe(true);
      expect(colorVariantValidator("light")).toBe(true);
      expect(colorVariantValidator("dark")).toBe(true);
      expect(colorVariantValidator("invalid")).toBe(false);
    });
  });

  describe("buttonVariantValidator", () => {
    it("should validate button variants", () => {
      expect(buttonVariantValidator("solid")).toBe(true);
      expect(buttonVariantValidator("outline")).toBe(true);
      expect(buttonVariantValidator("ghost")).toBe(true);
      expect(buttonVariantValidator("link")).toBe(true);
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
      expect(urlValidator("/relative/path")).toBe(true);
      expect(urlValidator("invalid-url")).toBe(false);
      expect(urlValidator("ftp://example.com")).toBe(false);
    });
  });

  describe("emailValidator", () => {
    it("should validate email addresses", () => {
      expect(emailValidator("user@example.com")).toBe(true);
      expect(emailValidator("test.email+tag@domain.co.uk")).toBe(true);
      expect(emailValidator("invalid-email")).toBe(false);
      expect(emailValidator("user@")).toBe(false);
      expect(emailValidator("@domain.com")).toBe(false);
    });
  });

  describe("accessibleNameValidator", () => {
    it("should validate accessible names", () => {
      expect(accessibleNameValidator("Button Label")).toBe(true);
      expect(accessibleNameValidator("A")).toBe(true); // Single character is valid
      expect(accessibleNameValidator("")).toBe(false);
      expect(accessibleNameValidator("   ")).toBe(false); // Only whitespace
      expect(accessibleNameValidator("Valid accessible name with spaces")).toBe(
        true
      );
    });

    it("should reject overly long accessible names", () => {
      const longName = "A".repeat(256); // 256 characters
      expect(accessibleNameValidator(longName)).toBe(false);
    });
  });
});

describe("commonRules", () => {
  it("should provide common validation rules", () => {
    expect(commonRules).toHaveProperty("required");
    expect(commonRules).toHaveProperty("optional");
    expect(commonRules).toHaveProperty("string");
    expect(commonRules).toHaveProperty("number");
    expect(commonRules).toHaveProperty("boolean");
    expect(commonRules).toHaveProperty("array");
    expect(commonRules).toHaveProperty("object");
  });

  it("should have correctly configured common rules", () => {
    expect(commonRules.required).toEqual({ required: true });
    expect(commonRules.optional).toEqual({ required: false });
    expect(commonRules.string).toEqual({ type: "string" });
    expect(commonRules.number).toEqual({ type: "number" });
    expect(commonRules.boolean).toEqual({ type: "boolean" });
  });
});

describe("Complex Validation Scenarios", () => {
  it("should handle nested object validation", () => {
    const schema: PropValidationSchema = {
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
    const schema: PropValidationSchema = {
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
    const schema: PropValidationSchema = {
      type: {
        required: true,
        type: "string",
        allowedValues: ["button", "link"],
      },
      href: {
        required: false,
        type: "string",
        validator: (value, propName, allProps) => {
          // href is required only when type is 'link'
          if ((allProps as any).type === "link") {
            return typeof value === "string" && value.length > 0;
          }
          return true;
        },
      },
    };

    const validButton = { type: "button" };
    const validLink = { type: "link", href: "https://example.com" };
    const invalidLink = { type: "link" }; // Missing href

    expect(validateProps(validButton, schema).isValid).toBe(true);
    expect(validateProps(validLink, schema).isValid).toBe(true);
    expect(validateProps(invalidLink, schema).isValid).toBe(false);
  });
});
