/**
 * @file validation.test.ts
 * @description Comprehensive test suite for email validation utilities
 */
import { describe, expect, it } from "vitest";

import {
  extractEmailDomain,
  isSimpleValidEmail,
  isValidEmail,
  normalizeEmail,
  validateEmails,
} from "../validation";

describe("isValidEmail", () => {
  describe("valid emails", () => {
    const validEmails = [
      "user@example.com",
      "test.email@domain.co.uk",
      "user+tag@example.org",
      "firstname.lastname@company.com",
      "user123@test-domain.com",
      "a@b.co",
      "very.long.email.address@very-long-domain-name.com",
      "user@subdomain.example.com",
      "test@example-domain.com",
      "user_name@example.com",
    ];

    it.each(validEmails)("should validate %s as valid", email => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  describe("invalid emails", () => {
    const invalidEmails = [
      "",
      "not-an-email",
      "@example.com",
      "user@",
      "user@@example.com",
      "user@example",
      "user@.com",
      "user@example.",
      "user@example..com",
      ".user@example.com",
      "user.@example.com",
      "user@ex ample.com",
      "user@example.c",
      "user@-example.com",
      "user@example-.com",
      "user name@example.com",
      "user@exam ple.com",
    ];

    it.each(invalidEmails)("should validate %s as invalid", email => {
      expect(isValidEmail(email as string)).toBe(false);
    });

    it("should validate null as invalid", () => {
      expect(isValidEmail(null as any)).toBe(false);
    });

    it("should validate undefined as invalid", () => {
      expect(isValidEmail(undefined as any)).toBe(false);
    });

    it("should validate number as invalid", () => {
      expect(isValidEmail(123 as any)).toBe(false);
    });

    it("should validate object as invalid", () => {
      expect(isValidEmail({} as any)).toBe(false);
    });

    it("should validate array as invalid", () => {
      expect(isValidEmail([] as any)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle whitespace trimming", () => {
      expect(isValidEmail("  user@example.com  ")).toBe(true);
      expect(isValidEmail("\tuser@example.com\n")).toBe(true);
    });

    it("should respect maximum length constraint", () => {
      const longEmail = `${"a".repeat(250)}@example.com`;
      expect(isValidEmail(longEmail)).toBe(false);
    });

    it("should validate local part length constraints", () => {
      const longLocalPart = `${"a".repeat(65)}@example.com`;
      expect(isValidEmail(longLocalPart)).toBe(false);
    });

    it("should validate domain part length constraints", () => {
      const longDomain = `user@${"a".repeat(250)}.com`;
      expect(isValidEmail(longDomain)).toBe(false);
    });
  });

  describe("options handling", () => {
    it("should respect allowPlus option", () => {
      expect(isValidEmail("user+tag@example.com", { allowPlus: false })).toBe(
        false
      );
      expect(isValidEmail("user+tag@example.com", { allowPlus: true })).toBe(
        true
      );
    });

    it("should respect allowDots option", () => {
      expect(isValidEmail("user.name@example.com", { allowDots: false })).toBe(
        false
      );
      expect(isValidEmail("user.name@example.com", { allowDots: true })).toBe(
        true
      );
    });

    it("should respect minDomainLength option", () => {
      expect(isValidEmail("user@example.co", { minDomainLength: 3 })).toBe(
        false
      );
      expect(isValidEmail("user@example.com", { minDomainLength: 3 })).toBe(
        true
      );
    });

    it("should respect maxLength option", () => {
      expect(isValidEmail("user@example.com", { maxLength: 10 })).toBe(false);
      expect(isValidEmail("user@example.com", { maxLength: 20 })).toBe(true);
    });
  });
});

describe("isSimpleValidEmail", () => {
  it("should validate simple valid emails", () => {
    expect(isSimpleValidEmail("user@example.com")).toBe(true);
    expect(isSimpleValidEmail("test@domain.org")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(isSimpleValidEmail("not-an-email")).toBe(false);
    expect(isSimpleValidEmail("")).toBe(false);
    expect(isSimpleValidEmail(null as unknown as string)).toBe(false);
  });

  it("should handle whitespace", () => {
    expect(isSimpleValidEmail("  user@example.com  ")).toBe(true);
  });
});

describe("validateEmails", () => {
  it("should validate multiple emails", () => {
    const emails = [
      "valid@example.com",
      "invalid-email",
      "another@valid.org",
      "@invalid.com",
    ];

    const result = validateEmails(emails);

    expect(result.valid).toEqual(["valid@example.com", "another@valid.org"]);
    expect(result.invalid).toEqual(["invalid-email", "@invalid.com"]);
    expect(result.results).toHaveLength(4);
    expect(result.results[0]).toEqual({
      email: "valid@example.com",
      isValid: true,
    });
    expect(result.results[1]).toEqual({
      email: "invalid-email",
      isValid: false,
    });
  });

  it("should handle empty array", () => {
    const result = validateEmails([]);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
    expect(result.results).toEqual([]);
  });
});

describe("extractEmailDomain", () => {
  it("should extract domain from valid emails", () => {
    expect(extractEmailDomain("user@example.com")).toBe("example.com");
    expect(extractEmailDomain("test@subdomain.domain.org")).toBe(
      "subdomain.domain.org"
    );
  });

  it("should return null for invalid emails", () => {
    expect(extractEmailDomain("invalid-email")).toBe(null);
    expect(extractEmailDomain("")).toBe(null);
  });

  it("should handle case normalization", () => {
    expect(extractEmailDomain("user@EXAMPLE.COM")).toBe("example.com");
  });
});

describe("normalizeEmail", () => {
  it("should normalize valid emails", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    expect(normalizeEmail("  Test@Domain.Org  ")).toBe("test@domain.org");
  });

  it("should return null for invalid emails", () => {
    expect(normalizeEmail("invalid-email")).toBe(null);
    expect(normalizeEmail("")).toBe(null);
  });
});

describe("error handling", () => {
  it("should handle malformed input gracefully", () => {
    // These should not throw errors
    expect(() => isValidEmail(null as unknown as string)).not.toThrow();
    expect(() => isValidEmail(undefined as unknown as string)).not.toThrow();
    expect(() => isValidEmail(123 as unknown as string)).not.toThrow();
    expect(() => isValidEmail({} as unknown as string)).not.toThrow();
    expect(() => isValidEmail([] as unknown as string)).not.toThrow();
  });

  it("should return false for malformed input", () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
    expect(isValidEmail({} as unknown as string)).toBe(false);
    expect(isValidEmail([] as unknown as string)).toBe(false);
  });

  it("should handle errors in validation process", () => {
    // Test error catching in isValidEmail - lines 143-146
    // Create a mock email string that will cause an error during validation
    const mockEmail = "test@example.com";

    // Mock the logger.error to track calls
    const loggerErrorSpy = () => {};
    const originalError = (globalThis as any).logger?.error;
    if ((globalThis as any).logger) {
      (globalThis as any).logger.error = loggerErrorSpy;
    }

    // Create a malformed input that will cause type conversion errors
    const malformedInput = {
      trim: () => {
        throw new Error("Trim error");
      },
      toString: () => mockEmail,
    };

    expect(isValidEmail(malformedInput as any)).toBe(false);

    // Restore original logger
    if ((globalThis as any).logger) {
      (globalThis as any).logger.error = originalError;
    }
  });

  it("should handle local part validation edge cases", () => {
    // Test lines 169-170 - consecutive dots in local part
    expect(isValidEmail("user..name@example.com")).toBe(false);

    // Test leading/trailing dots - lines that should be covered
    expect(isValidEmail(".user@example.com")).toBe(false);
    expect(isValidEmail("user.@example.com")).toBe(false);
  });

  it("should handle domain part validation edge cases", () => {
    // Test lines 206-209 - domain throwing on error
    expect(isValidEmail("user@domain.with..consecutive.dots.com")).toBe(false);
    expect(isValidEmail("user@.example.com")).toBe(false);
    expect(isValidEmail("user@example.com.")).toBe(false);
    expect(isValidEmail("user@-example.com")).toBe(false);
    expect(isValidEmail("user@example-.com")).toBe(false);
  });

  it("should handle invalid domain labels", () => {
    // Test lines 267-268 - domain label validation
    expect(isValidEmail("user@exam_ple.com")).toBe(false); // underscore not allowed
    expect(isValidEmail("user@-example.com")).toBe(false); // leading hyphen
    expect(isValidEmail("user@example-.com")).toBe(false); // trailing hyphen

    // Test very long domain label (over 63 chars)
    const longLabel = "a".repeat(64);
    expect(isValidEmail(`user@${longLabel}.com`)).toBe(false);
  });

  it("should handle domain validation failure scenarios", () => {
    // Test lines 236-237 - insufficient labels
    expect(isValidEmail("user@domain")).toBe(false);

    // Test TLD too short
    expect(isValidEmail("user@example.c", { minDomainLength: 2 })).toBe(false);
  });
});

describe("RFC compliance", () => {
  it("should handle RFC 5322 compliant emails", () => {
    const rfcCompliantEmails = [
      "simple@example.com",
      "very.common@example.com",
      "disposable.style.email.with+symbol@example.com",
      "x@example.com",
      "example@s.example",
    ];

    rfcCompliantEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  it("should reject non-RFC compliant emails", () => {
    const nonCompliantEmails = [
      "plainaddress",
      "@missingdomain.com",
      "missing@.com",
      "missing@domain",
      "spaces in@email.com",
      "email@domain@domain.com",
    ];

    nonCompliantEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(false);
    });
  });
});
