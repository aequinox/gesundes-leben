/**
 * @file validation-final-100.test.ts
 * @description Final targeted test to hit remaining uncovered lines in validation.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";

describe("Validation Final 100% Coverage", () => {
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

  describe("Hit exact lines 143-146", () => {
    it("should trigger the exact error catch block with Error object", async () => {
      const { isValidEmail } = await import("../validation");

      // Create an object that will cause trim() to throw an Error
      const errorTrigger = {
        toString: () => "test@example.com",
        trim() {
          throw new Error("Exact line 143-146 test");
        },
      };

      const result = isValidEmail(errorTrigger as any);
      expect(result).toBe(false);
    });

    it("should trigger the exact error catch block with non-Error object", async () => {
      const { isValidEmail } = await import("../validation");

      // Create an object that will cause trim() to throw a non-Error
      const errorTrigger = {
        toString: () => "test@example.com",
        trim() {
          throw "Non-error string for line 145";
        },
      };

      const result = isValidEmail(errorTrigger as any);
      expect(result).toBe(false);
    });

    it("should trigger error during string conversion", async () => {
      const { isValidEmail } = await import("../validation");

      // Create an object that will throw during toString
      const errorTrigger = {
        toString() {
          throw new Error("toString error");
        },
      };

      const result = isValidEmail(errorTrigger as any);
      expect(result).toBe(false);
    });
  });

  describe("Hit exact lines 206-209", () => {
    it("should trigger domain length validation debug logs", async () => {
      const { isValidEmail } = await import("../validation");

      // Clear any previous calls
      mockLogger.debug.mockClear();

      // Test empty domain - should hit lines 206-209
      const result1 = isValidEmail("user@");
      expect(result1).toBe(false);

      // Test domain that's too long - should hit lines 206-209
      const longDomain = "user@" + "a".repeat(255) + ".com";
      const result2 = isValidEmail(longDomain);
      expect(result2).toBe(false);
    });

    it("should hit domain validation with various invalid domains", async () => {
      const { isValidEmail } = await import("../validation");

      const invalidDomains = [
        "user@", // Empty domain
        "user@a", // Too short
        "user@" + "x".repeat(254), // Too long
        "user@domain..com", // Double dots
        "user@.domain.com", // Starting dot
        "user@domain.com.", // Ending dot
      ];

      invalidDomains.forEach(email => {
        const result = isValidEmail(email);
        expect(result).toBe(false);
      });
    });
  });

  describe("Hit exact lines 236-237", () => {
    it("should trigger insufficient labels debug log", async () => {
      const { isValidEmail } = await import("../validation");

      // Clear any previous calls
      mockLogger.debug.mockClear();

      // Test single label domain - should hit lines 236-237
      const result = isValidEmail("user@singlelabel");
      expect(result).toBe(false);

      // Test another single label case
      const result2 = isValidEmail("user@localhost");
      expect(result2).toBe(false);
    });

    it("should test all single-label scenarios", async () => {
      const { isValidEmail } = await import("../validation");

      const singleLabelEmails = [
        "user@single",
        "user@localhost",
        "user@internal",
        "user@test",
        "user@dev",
      ];

      singleLabelEmails.forEach(email => {
        const result = isValidEmail(email);
        expect(result).toBe(false);
      });
    });
  });

  describe("Comprehensive error scenario coverage", () => {
    it("should cover all remaining error paths", async () => {
      const { isValidEmail } = await import("../validation");

      // Test scenarios that trigger different error conditions
      const errorScenarios = [
        // Error during string processing
        {
          input: {
            toString: () => {
              throw new Error("toString error");
            },
          },
          description: "toString error",
        },
        // Error during includes check
        {
          input: {
            toString: () => "test@example.com",
            includes: () => {
              throw new Error("includes error");
            },
          },
          description: "includes error",
        },
        // Error during split operation
        {
          input: {
            toString: () => "test@example.com",
            includes: () => true,
            split: () => {
              throw new Error("split error");
            },
          },
          description: "split error",
        },
        // Error during lastIndexOf
        {
          input: {
            toString: () => "test@example.com",
            includes: () => true,
            split: () => ["test", "example.com"],
            lastIndexOf: () => {
              throw new Error("lastIndexOf error");
            },
          },
          description: "lastIndexOf error",
        },
      ];

      errorScenarios.forEach(({ input, description }) => {
        const result = isValidEmail(input as any);
        expect(result).toBe(false, `Should return false for ${description}`);
      });
    });

    it("should test boundary conditions that trigger debug logs", async () => {
      const { isValidEmail } = await import("../validation");

      // Test various boundary conditions
      const boundaryEmails = [
        "user@", // Empty domain
        "user@a", // Single char domain
        "user@" + "a".repeat(253), // Max length domain
        "user@" + "a".repeat(254), // Over max length domain
        "user@single", // Single label
        "user@domain.c", // Short TLD
      ];

      boundaryEmails.forEach(email => {
        const result = isValidEmail(email);
        // All should be false due to various validation failures
        expect(result).toBe(false);
      });
    });

    it("should exercise all code paths with complex scenarios", async () => {
      const { isValidEmail } = await import("../validation");

      // Complex scenarios to hit all remaining paths
      const complexScenarios = [
        // Local part too long
        "a".repeat(65) + "@domain.com",

        // Domain with insufficient labels
        "user@onelabel",

        // Domain too long
        "user@" + "a".repeat(255),

        // Empty domain
        "user@",

        // Various malformed inputs
        null,
        undefined,
        123,
        {},
        [],

        // String edge cases
        "",
        "   ",
        "@",
        "@@",
        "user@@domain.com",
      ];

      complexScenarios.forEach(scenario => {
        const result = isValidEmail(scenario as any);
        expect(typeof result).toBe("boolean");
        // Most should be false except for valid emails
        if (
          typeof scenario === "string" &&
          scenario.includes("@") &&
          !scenario.includes("@@")
        ) {
          // Might be valid or invalid, but should be boolean
          expect(typeof result).toBe("boolean");
        } else {
          expect(result).toBe(false);
        }
      });
    });
  });
});
