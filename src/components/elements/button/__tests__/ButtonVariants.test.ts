/**
 * @file ButtonVariants.test.ts
 * @description Tests for Button variant configurations
 */

import { describe, it, expect } from "vitest";

import {
  variantClasses,
  sizeClasses,
  shapeClasses,
  stateClasses,
  iconClasses,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
} from "../ButtonVariants";

describe("ButtonVariants", () => {
  describe("variantClasses", () => {
    it("should have all required variants defined", () => {
      const requiredVariants: ButtonVariant[] = [
        "default",
        "accent",
        "outline",
        "ghost",
        "subtle",
        "text",
        "link",
        "icon",
      ];

      requiredVariants.forEach((variant) => {
        expect(variantClasses).toHaveProperty(variant);
        expect(Array.isArray(variantClasses[variant])).toBe(true);
        expect(variantClasses[variant].length).toBeGreaterThan(0);
      });
    });

    describe("default variant", () => {
      it("should have solid background styles", () => {
        expect(variantClasses.default).toContain("bg-foreground");
        expect(variantClasses.default).toContain("text-background");
      });

      it("should have border styles", () => {
        expect(variantClasses.default).toContain("border");
        expect(variantClasses.default).toContain("border-transparent");
      });

      it("should have hover styles", () => {
        expect(variantClasses.default).toContain("hover:bg-foreground/90");
      });
    });

    describe("accent variant", () => {
      it("should have accent background styles", () => {
        expect(variantClasses.accent).toContain("bg-accent");
        expect(variantClasses.accent).toContain("text-background");
      });

      it("should have hover styles", () => {
        expect(variantClasses.accent).toContain("hover:bg-accent/90");
      });
    });

    describe("outline variant", () => {
      it("should have transparent background", () => {
        expect(variantClasses.outline).toContain("bg-transparent");
      });

      it("should have border styles", () => {
        expect(variantClasses.outline).toContain("border");
        expect(variantClasses.outline).toContain("border-accent/30");
      });

      it("should have hover styles", () => {
        expect(variantClasses.outline).toContain("hover:border-accent");
        expect(variantClasses.outline).toContain("hover:bg-accent/5");
      });
    });

    describe("ghost variant", () => {
      it("should have transparent background", () => {
        expect(variantClasses.ghost).toContain("bg-transparent");
      });

      it("should have subtle hover effect", () => {
        expect(variantClasses.ghost).toContain("hover:bg-card/50");
      });
    });

    describe("subtle variant", () => {
      it("should have card background", () => {
        expect(variantClasses.subtle).toContain("bg-card");
      });

      it("should have hover styles", () => {
        expect(variantClasses.subtle).toContain("hover:bg-card-muted");
      });
    });

    describe("text variant", () => {
      it("should have transparent background", () => {
        expect(variantClasses.text).toContain("bg-transparent");
      });

      it("should have no border", () => {
        expect(variantClasses.text).toContain("border-0");
      });

      it("should have underline on hover", () => {
        expect(variantClasses.text).toContain("hover:underline");
      });

      it("should have no shadow", () => {
        expect(variantClasses.text).toContain("shadow-none");
        expect(variantClasses.text).toContain("hover:shadow-none");
      });
    });

    describe("link variant", () => {
      it("should have link-specific styles", () => {
        expect(variantClasses.link).toContain("bg-transparent");
        expect(variantClasses.link).toContain("text-accent");
        expect(variantClasses.link).toContain("border-0");
      });

      it("should have minimal padding", () => {
        expect(variantClasses.link).toContain("p-0");
        expect(variantClasses.link).toContain("min-h-auto");
      });

      it("should have underline on hover", () => {
        expect(variantClasses.link).toContain("hover:underline");
      });
    });

    describe("icon variant", () => {
      it("should have square aspect ratio", () => {
        expect(variantClasses.icon).toContain("aspect-square");
      });

      it("should have transparent background", () => {
        expect(variantClasses.icon).toContain("bg-transparent");
      });

      it("should have appropriate padding", () => {
        expect(variantClasses.icon).toContain("p-2");
      });
    });
  });

  describe("sizeClasses", () => {
    it("should have all required sizes defined", () => {
      const requiredSizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

      requiredSizes.forEach((size) => {
        expect(sizeClasses).toHaveProperty(size);
        expect(Array.isArray(sizeClasses[size])).toBe(true);
        expect(sizeClasses[size].length).toBeGreaterThan(0);
      });
    });

    describe("xs size", () => {
      it("should have smallest dimensions", () => {
        expect(sizeClasses.xs).toContain("min-h-6");
        expect(sizeClasses.xs).toContain("px-2");
        expect(sizeClasses.xs).toContain("py-1");
        expect(sizeClasses.xs).toContain("text-xs");
        expect(sizeClasses.xs).toContain("rounded");
      });
    });

    describe("sm size", () => {
      it("should have small dimensions", () => {
        expect(sizeClasses.sm).toContain("min-h-8");
        expect(sizeClasses.sm).toContain("px-3");
        expect(sizeClasses.sm).toContain("py-1.5");
        expect(sizeClasses.sm).toContain("text-sm");
        expect(sizeClasses.sm).toContain("rounded-md");
      });
    });

    describe("md size", () => {
      it("should have medium dimensions", () => {
        expect(sizeClasses.md).toContain("min-h-10");
        expect(sizeClasses.md).toContain("px-4");
        expect(sizeClasses.md).toContain("py-2");
        expect(sizeClasses.md).toContain("text-sm");
        expect(sizeClasses.md).toContain("rounded-lg");
      });
    });

    describe("lg size", () => {
      it("should have large dimensions", () => {
        expect(sizeClasses.lg).toContain("min-h-12");
        expect(sizeClasses.lg).toContain("px-6");
        expect(sizeClasses.lg).toContain("py-3");
        expect(sizeClasses.lg).toContain("text-base");
        expect(sizeClasses.lg).toContain("rounded-lg");
      });
    });

    describe("xl size", () => {
      it("should have largest dimensions", () => {
        expect(sizeClasses.xl).toContain("min-h-14");
        expect(sizeClasses.xl).toContain("px-8");
        expect(sizeClasses.xl).toContain("py-4");
        expect(sizeClasses.xl).toContain("text-lg");
        expect(sizeClasses.xl).toContain("rounded-xl");
      });
    });

    it("should have progressive sizing", () => {
      // Extract min-height values for comparison
      const getMinHeight = (classes: string[]) => {
        const minHClass = classes.find((c) => c.startsWith("min-h-"));
        return minHClass ? parseInt(minHClass.replace("min-h-", "")) : 0;
      };

      const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
      const heights = sizes.map((size) => getMinHeight(sizeClasses[size]));

      // Verify heights are progressively larger
      for (let i = 1; i < heights.length; i++) {
        expect(heights[i]).toBeGreaterThan(heights[i - 1]);
      }
    });
  });

  describe("shapeClasses", () => {
    it("should have all required shapes defined", () => {
      const requiredShapes: ButtonShape[] = [
        "default",
        "rounded",
        "pill",
        "circle",
        "square",
      ];

      requiredShapes.forEach((shape) => {
        expect(shapeClasses).toHaveProperty(shape);
        expect(Array.isArray(shapeClasses[shape])).toBe(true);
      });
    });

    describe("default shape", () => {
      it("should use size-specific rounding", () => {
        expect(shapeClasses.default).toEqual([]);
      });
    });

    describe("rounded shape", () => {
      it("should have rounded corners", () => {
        expect(shapeClasses.rounded).toContain("rounded-lg");
      });
    });

    describe("pill shape", () => {
      it("should have fully rounded corners", () => {
        expect(shapeClasses.pill).toContain("rounded-full");
      });
    });

    describe("circle shape", () => {
      it("should have circular shape", () => {
        expect(shapeClasses.circle).toContain("rounded-full");
        expect(shapeClasses.circle).toContain("aspect-square");
        expect(shapeClasses.circle).toContain("p-0");
      });
    });

    describe("square shape", () => {
      it("should have square shape with no rounding", () => {
        expect(shapeClasses.square).toContain("rounded-none");
        expect(shapeClasses.square).toContain("aspect-square");
      });
    });
  });

  describe("stateClasses", () => {
    it("should have all required states defined", () => {
      expect(stateClasses).toHaveProperty("disabled");
      expect(stateClasses).toHaveProperty("loading");
      expect(stateClasses).toHaveProperty("fullWidth");
    });

    describe("disabled state", () => {
      it("should have disabled styles", () => {
        expect(stateClasses.disabled).toContain("cursor-not-allowed");
        expect(stateClasses.disabled).toContain("opacity-50");
        expect(stateClasses.disabled).toContain("pointer-events-none");
      });

      it("should disable hover effects", () => {
        expect(stateClasses.disabled).toContain("hover:translate-y-0");
      });
    });

    describe("loading state", () => {
      it("should have loading styles", () => {
        expect(stateClasses.loading).toContain("cursor-wait");
        expect(stateClasses.loading).toContain("pointer-events-none");
      });
    });

    describe("fullWidth state", () => {
      it("should have full width styles", () => {
        expect(stateClasses.fullWidth).toContain("w-full");
      });
    });
  });

  describe("iconClasses", () => {
    it("should have all required icon positions defined", () => {
      expect(iconClasses).toHaveProperty("start");
      expect(iconClasses).toHaveProperty("end");
      expect(iconClasses).toHaveProperty("only");
    });

    describe("icon positions", () => {
      it("should have correct spacing for start position", () => {
        expect(iconClasses.start).toContain("mr-2");
      });

      it("should have correct spacing for end position", () => {
        expect(iconClasses.end).toContain("ml-2");
      });

      it("should have no spacing for only position", () => {
        expect(iconClasses.only).toEqual([]);
      });
    });
  });

  describe("Type safety", () => {
    it("should enforce ButtonVariant type", () => {
      const validVariants: ButtonVariant[] = [
        "default",
        "accent",
        "outline",
        "ghost",
        "subtle",
        "text",
        "link",
        "icon",
      ];

      validVariants.forEach((variant) => {
        // TypeScript should allow these
        const _classes = variantClasses[variant];
        expect(_classes).toBeDefined();
      });
    });

    it("should enforce ButtonSize type", () => {
      const validSizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

      validSizes.forEach((size) => {
        // TypeScript should allow these
        const _classes = sizeClasses[size];
        expect(_classes).toBeDefined();
      });
    });

    it("should enforce ButtonShape type", () => {
      const validShapes: ButtonShape[] = [
        "default",
        "rounded",
        "pill",
        "circle",
        "square",
      ];

      validShapes.forEach((shape) => {
        // TypeScript should allow these
        const _classes = shapeClasses[shape];
        expect(_classes).toBeDefined();
      });
    });
  });

  describe("Consistency checks", () => {
    it("should have consistent color usage", () => {
      // All variants should use theme colors
      Object.values(variantClasses).forEach((classes) => {
        classes.forEach((className) => {
          // Should not have hardcoded color values like #fff or rgb()
          expect(className).not.toMatch(/#[0-9a-f]{3,6}/i);
          expect(className).not.toMatch(/rgb\(/i);
        });
      });
    });

    it("should have consistent spacing scale", () => {
      // All sizes should use Tailwind spacing scale
      Object.values(sizeClasses).forEach((classes) => {
        classes.forEach((className) => {
          // Should not have arbitrary spacing values
          expect(className).not.toMatch(/\[[\d.]+rem\]/);
          expect(className).not.toMatch(/\[[\d.]+px\]/);
        });
      });
    });

    it("should all variants be arrays", () => {
      Object.values(variantClasses).forEach((classes) => {
        expect(Array.isArray(classes)).toBe(true);
      });

      Object.values(sizeClasses).forEach((classes) => {
        expect(Array.isArray(classes)).toBe(true);
      });

      Object.values(shapeClasses).forEach((classes) => {
        expect(Array.isArray(classes)).toBe(true);
      });
    });
  });
});
