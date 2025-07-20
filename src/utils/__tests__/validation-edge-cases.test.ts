/**
 * @file validation-edge-cases.test.ts
 * @description Edge case tests specifically targeting uncovered lines in validation.ts
 */
import { isValidEmail } from "../validation";
import { describe, it, expect, vi } from "bun:test";

describe("Validation Edge Cases - Coverage Completion", () => {
  describe("Error handling coverage", () => {
    it("should handle errors during email validation process - lines 143-146", () => {
      // Mock a malformed email object that will cause errors during processing
      const malformedEmail = {
        toString: () => "test@example.com",
        trim: () => {
          throw new Error("Trim operation failed");
        },
        includes: () => true,
        lastIndexOf: () => 5,
        substring: () => {
          throw new Error("Substring operation failed");
        },
      };

      // This should trigger the catch block on lines 143-146
      const result = isValidEmail(malformedEmail as any);
      expect(result).toBe(false);
    });

    it("should handle errors in local part validation - lines 169-170", () => {
      // This case should be already covered, but ensure we test the specific scenario
      expect(isValidEmail("user..consecutive@example.com")).toBe(false);
      expect(isValidEmail(".starting-dot@example.com")).toBe(false);
      expect(isValidEmail("ending-dot.@example.com")).toBe(false);
    });

    it("should handle errors in domain part validation - lines 206-209", () => {
      // Test domain part validation error scenarios
      expect(isValidEmail("user@domain..consecutive.com")).toBe(false);
      expect(isValidEmail("user@.starting-dot.com")).toBe(false);
      expect(isValidEmail("user@ending-dot.com.")).toBe(false);
      expect(isValidEmail("user@-starting-hyphen.com")).toBe(false);
      expect(isValidEmail("user@ending-hyphen-.com")).toBe(false);
    });

    it("should handle insufficient domain labels - lines 236-237", () => {
      // Test insufficient labels in domain validation
      expect(isValidEmail("user@singlelabel")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });

    it("should handle domain label validation errors - lines 267-268", () => {
      // Test invalid domain label scenarios
      expect(isValidEmail("user@invalid_underscore.com")).toBe(false);
      expect(isValidEmail("user@-hyphen-start.com")).toBe(false);
      expect(isValidEmail("user@hyphen-end-.com")).toBe(false);

      // Test very long domain label (over 63 characters)
      const longLabel = "a".repeat(64);
      expect(isValidEmail(`user@${longLabel}.com`)).toBe(false);

      // Test empty domain label
      expect(isValidEmail("user@.com")).toBe(false);
    });

    it("should handle complex error scenarios", () => {
      // Combine multiple error conditions to ensure all paths are covered
      const invalidEmails = [
        "user@domain@double-at.com", // Multiple @ symbols
        "user@domain with spaces.com", // Spaces in domain
        "user@domain..double-dot.com", // Consecutive dots in domain
        "user@.com", // Missing domain
        "user@domain.", // Trailing dot
        "user@", // Missing domain entirely
        "@domain.com", // Missing local part
        "user@domain.c", // TLD too short (when minDomainLength is default 2)
        "", // Empty string
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe("Options edge cases", () => {
    it("should handle all validation options combinations", () => {
      const email = "user+tag.name@sub-domain.example.co";

      // Test with all options disabled
      expect(
        isValidEmail(email, {
          allowPlus: false,
          allowDots: false,
          minDomainLength: 3,
          maxLength: 10,
          allowInternational: false,
        })
      ).toBe(false);

      // Test with minimal valid options
      expect(
        isValidEmail("a@b.co", {
          allowPlus: true,
          allowDots: true,
          minDomainLength: 2,
          maxLength: 10,
          allowInternational: true,
        })
      ).toBe(true);
    });

    it("should handle boundary conditions", () => {
      // Test exact length limits
      const exactLengthEmail = "a".repeat(58) + "@b.co"; // Total 64 chars
      expect(isValidEmail(exactLengthEmail, { maxLength: 64 })).toBe(true);
      expect(isValidEmail(exactLengthEmail, { maxLength: 62 })).toBe(false);

      // Test exact local part limit (65 chars to exceed 64 limit)
      const longLocalPart = "a".repeat(65) + "@example.com";
      expect(isValidEmail(longLocalPart)).toBe(false);

      // Test exact domain part limit (254 chars to exceed 253 limit)
      const longDomain = "user@" + "a".repeat(250) + ".com";
      expect(isValidEmail(longDomain)).toBe(false);
    });
  });

  describe("International and special character handling", () => {
    it("should handle international characters based on options", () => {
      const internationalEmail = "用户@例子.测试";

      // With international allowed (should use EMAIL_REGEX)
      const resultInternational = isValidEmail(internationalEmail, {
        allowInternational: true,
      });

      // With international disabled (should use STRICT_EMAIL_REGEX)
      const resultStrict = isValidEmail(internationalEmail, {
        allowInternational: false,
      });

      // The strict regex should be more restrictive
      expect(resultStrict).toBe(false);
    });

    it("should handle regex validation failure paths", () => {
      // Test basic invalid emails that should definitely fail
      const basicInvalidEmails = [
        "", // Empty string
        "@domain.com", // Missing local part
        "user@", // Missing domain
        "user@@domain.com", // Double @ symbols
        "user@domain", // Missing TLD
      ];

      basicInvalidEmails.forEach((email, index) => {
        const result = isValidEmail(email);
        expect(result).toBe(
          false,
          `Email at index ${index} (${JSON.stringify(email)}) should be invalid but was valid`
        );
      });
    });
  });
});
