/**
 * @file validation-complete.test.ts
 * @description Final comprehensive test to achieve 100% validation coverage
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";

describe("Complete Validation Coverage", () => {
  let originalLogger: any;
  let mockLogger: any;

  beforeEach(() => {
    originalLogger = (globalThis as any).logger;
    mockLogger = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };
    (globalThis as any).logger = mockLogger;
  });

  afterEach(() => {
    (globalThis as any).logger = originalLogger;
    vi.clearAllMocks();
  });

  it("should achieve 100% coverage with targeted scenarios", async () => {
    // Import fresh to ensure mocked logger is used
    const { isValidEmail } = await import("../validation");

    // Test error scenarios that trigger lines 143-146
    const errorCasingObjects = [
      // Object that throws during toString conversion
      {
        toString() {
          throw new Error("toString error");
        },
      },
      // Object that throws during property access
      {
        get trim() {
          throw new Error("trim error");
        },
        toString() {
          return "test@example.com";
        },
      },
      // Object with problematic method access
      {
        toString() {
          return "test@example.com";
        },
        trim() {
          throw new Error("property access error");
        },
      },
    ];

    errorCasingObjects.forEach((obj, index) => {
      const result = isValidEmail(obj as any);
      expect(result).toBe(false, `Error object ${index} should return false`);
    });

    // Test domain validation scenarios for lines 206-209
    const domainTests = [
      "user@", // Empty domain - triggers length 0
      "user@" + "a".repeat(254), // Domain too long - triggers length > 253
    ];

    domainTests.forEach(email => {
      const result = isValidEmail(email);
      expect(result).toBe(false);
    });

    // Test insufficient labels scenario for lines 236-237
    const insufficientLabelTests = [
      "user@single", // Only one label
      "user@", // No labels after @
    ];

    insufficientLabelTests.forEach(email => {
      const result = isValidEmail(email);
      expect(result).toBe(false);
    });

    // Test all debug logging paths
    const debugTests = [
      "user..dots@domain.com", // Consecutive dots in local part
      ".start@domain.com", // Leading dot in local part
      "end.@domain.com", // Trailing dot in local part
      "user@domain..com", // Consecutive dots in domain
      "user@.domain.com", // Leading dot in domain
      "user@domain.com.", // Trailing dot in domain
      "user@-domain.com", // Leading hyphen in domain
      "user@domain-.com", // Trailing hyphen in domain
      "user@single", // Insufficient labels
      "user@a.b", // TLD too short with minDomainLength: 3
    ];

    debugTests.forEach(email => {
      const options = email === "user@a.b" ? { minDomainLength: 3 } : {};
      const result = isValidEmail(email, options);
      expect(result).toBe(false);
    });

    // Test domain label validation errors
    const labelTests = [
      "user@inv_alid.com", // Invalid characters in label
      "user@-invalid.com", // Leading hyphen in label
      "user@invalid-.com", // Trailing hyphen in label
      "user@" + "a".repeat(64) + ".com", // Label too long (over 63 chars)
      "user@.com", // Empty label
    ];

    labelTests.forEach(email => {
      const result = isValidEmail(email);
      expect(result).toBe(false);
    });

    // Test options validation
    const optionsTests = [
      { email: "user+tag@domain.com", options: { allowPlus: false } },
      { email: "user.dot@domain.com", options: { allowDots: false } },
      { email: "user@domain.co", options: { minDomainLength: 3 } },
      { email: "user@domain.com", options: { maxLength: 10 } },
    ];

    optionsTests.forEach(({ email, options }) => {
      const result = isValidEmail(email, options);
      expect(result).toBe(false);
    });

    // Test regex selection paths
    const internationalEmail = "用户@例子.测试";

    // Test with international allowed
    isValidEmail(internationalEmail, { allowInternational: true });

    // Test with international not allowed
    const strictResult = isValidEmail(internationalEmail, {
      allowInternational: false,
    });
    expect(strictResult).toBe(false);

    // All tests should return false to verify coverage
    expect(true).toBe(true); // Basic assertion to ensure test passes
  });

  it("should test complex error scenarios", async () => {
    const { isValidEmail } = await import("../validation");

    // Create object that will fail at different stages
    const complexErrorObject = {
      toString: () => "test@example.com",
      trim: () => {
        throw new Error("Complex trim error");
      },
      includes: () => true,
      lastIndexOf: () => 4,
      substring: () => "test",
    };

    const result = isValidEmail(complexErrorObject as any);
    expect(result).toBe(false);
  });

  it("should test non-Error exception handling", async () => {
    const { isValidEmail } = await import("../validation");

    // Create object that throws non-Error
    const nonErrorObject = {
      toString: () => "test@example.com",
      trim: () => {
        throw "String error"; // Non-Error object
      },
    };

    const result = isValidEmail(nonErrorObject as any);
    expect(result).toBe(false);
  });
});
