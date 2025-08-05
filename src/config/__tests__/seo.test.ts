import { describe, it, expect, beforeEach, vi } from "vitest";

import { SITE } from "../../config";
import { getRobotPolicies, getSitemapConfig } from "../seo";

describe("SEO Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RobotPolicy Interface", () => {
    it("should define correct robot policy structure", () => {
      const policies = getRobotPolicies();
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);

      // Check first policy structure
      const firstPolicy = policies[0];
      expect(firstPolicy).toHaveProperty("userAgent");
      expect(typeof firstPolicy?.userAgent).toBe("string");
    });

    it("should include default crawling policy", () => {
      const policies = getRobotPolicies();
      const defaultPolicy = policies.find(p => p.userAgent === "*");

      expect(defaultPolicy).toBeDefined();
      // In development mode, allow is undefined and disallow is "/"
      if (import.meta.env.DEV) {
        expect(defaultPolicy?.allow).toBeUndefined();
        expect(defaultPolicy?.disallow).toBe("/");
        expect(defaultPolicy?.crawlDelay).toBe(86400); // 24 hours in dev
      } else {
        expect(defaultPolicy?.allow).toBe("/");
        expect(
          Array.isArray(defaultPolicy?.disallow)
            ? defaultPolicy.disallow
            : [defaultPolicy?.disallow]
        ).toContain("/search/");
        expect(defaultPolicy?.crawlDelay).toBeGreaterThan(0);
      }
    });

    it("should block AI scrapers appropriately", () => {
      const policies = getRobotPolicies();

      // In development mode, only one policy is returned for "*" user agent
      if (!import.meta.env.DEV) {
        const blockedBots = [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ];

        blockedBots.forEach(bot => {
          const policy = policies.find(p => p.userAgent === bot);
          expect(policy).toBeDefined();
          expect(policy?.disallow).toBe("/");
        });
      } else {
        // In dev mode, just check that we have at least one policy that blocks everything
        expect(policies.length).toBeGreaterThan(0);
        const defaultPolicy = policies.find(p => p.userAgent === "*");
        expect(defaultPolicy?.disallow).toBe("/");
      }
    });

    it("should have optimized policies for major search engines", () => {
      const policies = getRobotPolicies();

      // Only test in production mode, dev mode returns single policy
      if (!import.meta.env.DEV) {
        // Check Googlebot policy
        const googlebotPolicy = policies.find(p => p.userAgent === "Googlebot");
        expect(googlebotPolicy).toBeDefined();
        expect(googlebotPolicy?.crawlDelay).toBeLessThanOrEqual(1); // Should be optimized

        // Check Bingbot policy
        const bingbotPolicy = policies.find(p => p.userAgent === "Bingbot");
        expect(bingbotPolicy).toBeDefined();
        expect(bingbotPolicy?.allow).toBe("/");
      } else {
        // In dev mode, just verify we have policies
        expect(policies.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Development vs Production Policies", () => {
    it("should return appropriate policies based on environment", () => {
      const policies = getRobotPolicies();
      const defaultPolicy = policies.find(p => p.userAgent === "*");

      if (import.meta.env.DEV) {
        // Development policies should block everything
        expect(defaultPolicy?.allow).toBeUndefined();
        expect(defaultPolicy?.disallow).toBe("/");
      } else {
        // Production policies should allow access
        expect(defaultPolicy?.allow).toBe("/");
      }
    });

    it("should have appropriate crawl delays in production", () => {
      const policies = getRobotPolicies();
      const googlePolicy = policies.find(p => p.userAgent === "Googlebot");
      if (googlePolicy?.crawlDelay !== undefined) {
        expect(googlePolicy.crawlDelay).toBeLessThanOrEqual(1);
      }
    });
  });

  describe("Sitemap Configuration", () => {
    it("should provide sitemap configuration", () => {
      const config = getSitemapConfig();
      expect(config).toHaveProperty("filter");
      expect(config).toHaveProperty("serialize");
      expect(typeof config.filter).toBe("function");
      expect(typeof config.serialize).toBe("function");
    });

    it("should filter out disallowed paths", () => {
      const config = getSitemapConfig();

      // Should filter out search pages
      expect(config.filter("/search/page")).toBe(false);
      expect(config.filter("/_image/test.jpg")).toBe(false);
      expect(config.filter("/api/endpoint")).toBe(false);

      // Should allow normal pages
      expect(config.filter("/posts/health-tips")).toBe(true);
      expect(config.filter("/about")).toBe(true);
    });

    it("should serialize URLs with correct priorities", () => {
      const config = getSitemapConfig();

      // Test homepage priority using actual SITE.website
      const homepageResult = config.serialize({ url: SITE.website });
      expect(homepageResult.priority).toBe(1.0);

      // Test blog post priority (needs "/posts/" in URL path)
      const postResult = config.serialize({
        url: "https://example.com/posts/health-tip",
      });
      expect(postResult.priority).toBe(0.8);

      // Test regular page priority
      const pageResult = config.serialize({ url: "https://example.com/about" });
      expect(pageResult.priority).toBe(0.6);
    });
  });

  describe("SEO Configuration Validation", () => {
    it("should have valid crawl delays", () => {
      const policies = getRobotPolicies();

      policies.forEach(policy => {
        if (policy.crawlDelay !== undefined) {
          expect(policy.crawlDelay).toBeGreaterThanOrEqual(0);
          expect(policy.crawlDelay).toBeLessThanOrEqual(86400); // Less than or equal to 24 hours
        }
      });
    });

    it("should have sensible disallow patterns", () => {
      const policies = getRobotPolicies();
      const commonDisallows = ["/search/", "/_image/", "/api/", "/admin/"];

      const mainPolicy = policies.find(p => p.userAgent === "*");
      if (mainPolicy?.disallow && Array.isArray(mainPolicy.disallow)) {
        const hasCommonPatterns = commonDisallows.some(pattern =>
          mainPolicy.disallow!.includes(pattern)
        );
        expect(hasCommonPatterns).toBe(true);
      }
    });

    it("should include sitemap references in appropriate policies", () => {
      const policies = getRobotPolicies();

      // Main policy should reference sitemap
      const mainPolicy = policies.find(p => p.userAgent === "*");
      if (mainPolicy?.sitemap) {
        expect(
          Array.isArray(mainPolicy.sitemap) ||
            typeof mainPolicy.sitemap === "string"
        ).toBe(true);
      }
    });
  });

  describe("Health Content Compliance", () => {
    it("should have appropriate health content policies", () => {
      const policies = getRobotPolicies();

      // Should have specific policy for health bots if any
      const healthBotPolicy = policies.find(p => p.userAgent === "healthbot");
      if (healthBotPolicy) {
        expect(healthBotPolicy.allow).toContain("/posts/");
        expect(healthBotPolicy.crawlDelay).toBeGreaterThan(1); // Respectful crawling
      }
    });

    it("should protect sensitive health data paths", () => {
      const policies = getRobotPolicies();
      const mainPolicy = policies.find(p => p.userAgent === "*");

      if (mainPolicy?.disallow && Array.isArray(mainPolicy.disallow)) {
        // Should protect admin and search functionality
        expect(mainPolicy.disallow).toContain("/admin/");
        expect(mainPolicy.disallow).toContain("/search/");
      }
    });
  });
});
