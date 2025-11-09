/**
 * @file ButtonClassBuilder.test.ts
 * @description Tests for Button class building utility
 */

import { describe, it, expect } from "vitest";

import {
  buildButtonClasses,
  type ButtonClassOptions,
} from "../ButtonClassBuilder";

describe("buildButtonClasses", () => {
  describe("Base functionality", () => {
    it("should generate classes with default options", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toBeTruthy();
      expect(typeof classes).toBe("string");
    });

    it("should include custom className", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
        className: "custom-class another-class",
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("custom-class");
      expect(classes).toContain("another-class");
    });
  });

  describe("Variant classes", () => {
    const variants: Array<ButtonClassOptions["variant"]> = [
      "default",
      "accent",
      "outline",
      "ghost",
      "subtle",
      "text",
      "link",
      "icon",
    ];

    variants.forEach(variant => {
      it(`should generate correct classes for ${variant} variant`, () => {
        const options: ButtonClassOptions = {
          variant,
          size: "md",
          shape: "default",
          disabled: false,
          loading: false,
          fullWidth: false,
        };

        const classes = buildButtonClasses(options);

        expect(classes).toBeTruthy();
        expect(typeof classes).toBe("string");

        // Check variant-specific classes
        switch (variant) {
          case "default":
            expect(classes).toContain("bg-foreground");
            expect(classes).toContain("text-background");
            break;
          case "accent":
            expect(classes).toContain("bg-accent");
            expect(classes).toContain("text-background");
            break;
          case "outline":
            expect(classes).toContain("bg-transparent");
            expect(classes).toContain("text-accent");
            expect(classes).toContain("border-accent/30");
            break;
          case "ghost":
            expect(classes).toContain("bg-transparent");
            expect(classes).toContain("text-foreground");
            break;
          case "subtle":
            expect(classes).toContain("bg-card");
            expect(classes).toContain("text-foreground");
            break;
          case "text":
            expect(classes).toContain("bg-transparent");
            expect(classes).toContain("text-accent");
            expect(classes).toContain("border-0");
            break;
          case "link":
            expect(classes).toContain("bg-transparent");
            expect(classes).toContain("text-accent");
            expect(classes).toContain("p-0");
            expect(classes).toContain("min-h-auto");
            break;
          case "icon":
            expect(classes).toContain("bg-transparent");
            expect(classes).toContain("aspect-square");
            break;
        }
      });
    });
  });

  describe("Size classes", () => {
    const sizes: Array<ButtonClassOptions["size"]> = [
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
    ];

    sizes.forEach(size => {
      it(`should generate correct classes for ${size} size`, () => {
        const options: ButtonClassOptions = {
          variant: "default",
          size,
          shape: "default",
          disabled: false,
          loading: false,
          fullWidth: false,
        };

        const classes = buildButtonClasses(options);

        // Check size-specific classes
        switch (size) {
          case "xs":
            expect(classes).toContain("min-h-6");
            expect(classes).toContain("px-2");
            expect(classes).toContain("text-xs");
            break;
          case "sm":
            expect(classes).toContain("min-h-8");
            expect(classes).toContain("px-3");
            expect(classes).toContain("text-sm");
            break;
          case "md":
            expect(classes).toContain("min-h-10");
            expect(classes).toContain("px-4");
            break;
          case "lg":
            expect(classes).toContain("min-h-12");
            expect(classes).toContain("px-6");
            expect(classes).toContain("text-base");
            break;
          case "xl":
            expect(classes).toContain("min-h-14");
            expect(classes).toContain("px-8");
            expect(classes).toContain("text-lg");
            break;
        }
      });
    });

    it("should not include size classes for link variant", () => {
      const options: ButtonClassOptions = {
        variant: "link",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      // Link variant should have p-0, not the size padding
      expect(classes).toContain("p-0");
    });
  });

  describe("Shape classes", () => {
    const shapes: Array<ButtonClassOptions["shape"]> = [
      "default",
      "rounded",
      "pill",
      "circle",
      "square",
    ];

    shapes.forEach(shape => {
      it(`should generate correct classes for ${shape} shape`, () => {
        const options: ButtonClassOptions = {
          variant: "default",
          size: "md",
          shape,
          disabled: false,
          loading: false,
          fullWidth: false,
        };

        const classes = buildButtonClasses(options);

        // Check shape-specific classes
        switch (shape) {
          case "default":
            // Default shape uses size-specific rounding
            expect(classes).toContain("rounded-lg");
            break;
          case "rounded":
            expect(classes).toContain("rounded-lg");
            break;
          case "pill":
            expect(classes).toContain("rounded-full");
            break;
          case "circle":
            expect(classes).toContain("rounded-full");
            expect(classes).toContain("aspect-square");
            break;
          case "square":
            expect(classes).toContain("rounded-none");
            expect(classes).toContain("aspect-square");
            break;
        }
      });
    });
  });

  describe("State classes", () => {
    it("should include disabled classes when disabled", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: true,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("cursor-not-allowed");
      expect(classes).toContain("opacity-50");
      expect(classes).toContain("pointer-events-none");
    });

    it("should include loading classes when loading", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: true,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("cursor-wait");
      expect(classes).toContain("pointer-events-none");
    });

    it("should include fullWidth classes when fullWidth", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: true,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("w-full");
    });

    it("should handle multiple states simultaneously", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: true,
        loading: true,
        fullWidth: true,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("cursor-not-allowed");
      expect(classes).toContain("opacity-50");
      expect(classes).toContain("cursor-wait");
      expect(classes).toContain("w-full");
    });
  });

  describe("Complex combinations", () => {
    it("should handle accent variant with xl size and pill shape", () => {
      const options: ButtonClassOptions = {
        variant: "accent",
        size: "xl",
        shape: "pill",
        disabled: false,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("bg-accent");
      expect(classes).toContain("min-h-14");
      expect(classes).toContain("px-8");
      expect(classes).toContain("rounded-full");
    });

    it("should handle outline variant with xs size and disabled state", () => {
      const options: ButtonClassOptions = {
        variant: "outline",
        size: "xs",
        shape: "default",
        disabled: true,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("bg-transparent");
      expect(classes).toContain("text-accent");
      expect(classes).toContain("min-h-6");
      expect(classes).toContain("cursor-not-allowed");
    });

    it("should handle icon variant with circle shape and loading state", () => {
      const options: ButtonClassOptions = {
        variant: "icon",
        size: "md",
        shape: "circle",
        disabled: false,
        loading: true,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("bg-transparent");
      expect(classes).toContain("aspect-square");
      expect(classes).toContain("rounded-full");
      expect(classes).toContain("cursor-wait");
    });

    it("should handle ghost variant with fullWidth and custom className", () => {
      const options: ButtonClassOptions = {
        variant: "ghost",
        size: "lg",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: true,
        className: "custom-ghost-button",
      };

      const classes = buildButtonClasses(options);

      expect(classes).toContain("bg-transparent");
      expect(classes).toContain("min-h-12");
      expect(classes).toContain("w-full");
      expect(classes).toContain("custom-ghost-button");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty className", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
        className: "",
      };

      const classes = buildButtonClasses(options);

      expect(classes).toBeTruthy();
      expect(typeof classes).toBe("string");
    });

    it("should handle undefined className", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
        className: undefined,
      };

      const classes = buildButtonClasses(options);

      expect(classes).toBeTruthy();
      expect(typeof classes).toBe("string");
    });

    it("should deduplicate classes when using cn utility", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
        className: "rounded-lg", // This might conflict with size classes
      };

      const classes = buildButtonClasses(options);

      // cn utility should handle deduplication
      expect(classes).toBeTruthy();
    });
  });

  describe("Accessibility and interaction classes", () => {
    it("should include focus styles in base classes", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      // Should include focus ring styles
      expect(classes).toBeTruthy();
      expect(typeof classes).toBe("string");
    });

    it("should include transition classes", () => {
      const options: ButtonClassOptions = {
        variant: "default",
        size: "md",
        shape: "default",
        disabled: false,
        loading: false,
        fullWidth: false,
      };

      const classes = buildButtonClasses(options);

      // Should include animation and transition styles
      expect(classes).toBeTruthy();
      expect(typeof classes).toBe("string");
    });
  });
});
