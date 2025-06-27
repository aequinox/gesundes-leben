/**
 * @file designSystem.test.ts
 * @description Comprehensive tests for design system utilities
 */
import {
  cn,
  combineClasses,
  responsive,
  createSizeVariants,
  createColorVariants,
  focusStyles,
  shadowStyles,
  animationStyles,
  buttonBaseClasses,
  inputBaseClasses,
  cardBaseClasses,
  linkBaseClasses,
  screenReaderStyles,
  iconStyles,
  DESIGN_TOKENS,
} from "../ui/designSystem";
import { describe, it, expect } from "vitest";

describe("Design System Utilities", () => {
  describe("cn (class name utility)", () => {
    it("should combine string classes", () => {
      expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
    });

    it("should handle array inputs", () => {
      expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
    });

    it("should filter out falsy values", () => {
      expect(cn("class1", false, null, undefined, "", "class2")).toBe(
        "class1 class2"
      );
    });

    it("should handle nested arrays", () => {
      expect(cn(["class1", "class2", "class3"], "class4")).toBe(
        "class1 class2 class3 class4"
      );
    });

    it("should return empty string for no valid classes", () => {
      expect(cn(false, null, undefined)).toBe("");
    });
  });

  describe("combineClasses", () => {
    it("should combine multiple class sets", () => {
      const set1 = ["class1", "class2"];
      const set2 = ["class3", "class4"];
      expect(combineClasses(set1, set2)).toEqual([
        "class1",
        "class2",
        "class3",
        "class4",
      ]);
    });

    it("should handle empty arrays", () => {
      expect(combineClasses([], ["class1"])).toEqual(["class1"]);
    });
  });

  describe("responsive utility", () => {
    it("should create responsive classes", () => {
      const base = ["text-base"];
      const variants = {
        md: ["text-lg"],
        lg: ["text-xl"],
      };

      const result = responsive(base, variants);
      expect(result).toEqual(["text-base", "md:text-lg", "lg:text-xl"]);
    });

    it("should handle empty variants", () => {
      const base = ["text-base"];
      const result = responsive(base, {});
      expect(result).toEqual(["text-base"]);
    });
  });

  describe("createSizeVariants", () => {
    it("should create readonly size variants", () => {
      const variants = createSizeVariants({
        sm: ["text-sm"],
        md: ["text-base"],
        lg: ["text-lg"],
      });

      expect(variants.sm).toEqual(["text-sm"]);
      expect(variants.md).toEqual(["text-base"]);
      expect(variants.lg).toEqual(["text-lg"]);
    });
  });

  describe("createColorVariants", () => {
    it("should create readonly color variants", () => {
      const variants = createColorVariants({
        primary: ["text-blue-500"],
        secondary: ["text-gray-500"],
      });

      expect(variants.primary).toEqual(["text-blue-500"]);
      expect(variants.secondary).toEqual(["text-gray-500"]);
    });
  });
});

describe("Design System Styles", () => {
  describe("focusStyles", () => {
    it("should provide consistent focus ring styles", () => {
      expect(focusStyles.ring).toContain("focus-visible:outline-none");
      expect(focusStyles.ring).toContain("focus-visible:ring-2");
      expect(focusStyles.ring).toContain("focus-visible:ring-accent");
    });

    it("should provide OKLCH outline styles", () => {
      expect(focusStyles.oklchOutline).toContain(
        "focus-visible:[outline:2px_solid_oklch(var(--color-accent))]"
      );
    });
  });

  describe("shadowStyles", () => {
    it("should provide elevation shadow styles", () => {
      expect(shadowStyles.elevation.low).toContain(
        "shadow-[var(--shadow-elevation-low)]"
      );
      expect(shadowStyles.elevation.medium).toContain(
        "shadow-[var(--shadow-elevation-medium)]"
      );
      expect(shadowStyles.elevation.high).toContain(
        "shadow-[var(--shadow-elevation-high)]"
      );
    });

    it("should provide colored shadow styles", () => {
      expect(shadowStyles.colored.pro).toContain("shadow-[var(--shadow-pro)]");
      expect(shadowStyles.colored.contra).toContain(
        "shadow-[var(--shadow-contra)]"
      );
      expect(shadowStyles.colored.questionTime).toContain(
        "shadow-[var(--shadow-question-time)]"
      );
    });

    it("should provide hover transition styles", () => {
      expect(shadowStyles.hoverTransitions.elevate).toContain(
        "hover:shadow-[var(--shadow-elevation-medium)]"
      );
      expect(shadowStyles.hoverTransitions.elevate).toContain(
        "transition-shadow"
      );
    });
  });

  describe("animationStyles", () => {
    it("should provide transition styles", () => {
      expect(animationStyles.transitions.all).toContain("transition-all");
      expect(animationStyles.transitions.colors).toContain("transition-colors");
    });

    it("should provide hover effects", () => {
      expect(animationStyles.hover.lift).toContain("hover:translate-y-[-1px]");
      expect(animationStyles.hover.scale).toContain("hover:scale-105");
    });

    it("should provide state styles", () => {
      expect(animationStyles.states.loading).toContain("cursor-wait");
      expect(animationStyles.states.disabled).toContain("cursor-not-allowed");
      expect(animationStyles.states.disabled).toContain("opacity-50");
    });

    it("should provide motion reduction styles", () => {
      expect(animationStyles.motionSafe).toContain(
        "motion-reduce:transform-none"
      );
      expect(animationStyles.motionSafe).toContain(
        "motion-reduce:transition-none"
      );
    });
  });
});

describe("Component Base Styles", () => {
  describe("buttonBaseClasses", () => {
    it("should provide essential button styles", () => {
      expect(buttonBaseClasses).toContain("relative");
      expect(buttonBaseClasses).toContain("inline-flex");
      expect(buttonBaseClasses).toContain("items-center");
      expect(buttonBaseClasses).toContain("justify-center");
      expect(buttonBaseClasses).toContain("font-medium");
    });
  });

  describe("inputBaseClasses", () => {
    it("should provide essential input styles", () => {
      expect(inputBaseClasses).toContain("block");
      expect(inputBaseClasses).toContain("w-full");
      expect(inputBaseClasses).toContain("bg-background");
      expect(inputBaseClasses).toContain("border");
      expect(inputBaseClasses).toContain("rounded-lg");
    });
  });

  describe("cardBaseClasses", () => {
    it("should provide essential card styles", () => {
      expect(cardBaseClasses).toContain("relative");
      expect(cardBaseClasses).toContain("overflow-hidden");
      expect(cardBaseClasses).toContain("bg-card");
      expect(cardBaseClasses).toContain("border");
    });
  });

  describe("linkBaseClasses", () => {
    it("should provide essential link styles", () => {
      expect(linkBaseClasses).toContain("text-accent");
      expect(linkBaseClasses).toContain("no-underline");
      expect(linkBaseClasses).toContain("transition-colors");
    });
  });
});

describe("Accessibility Styles", () => {
  describe("screenReaderStyles", () => {
    it("should provide screen reader only styles", () => {
      expect(screenReaderStyles.only).toContain("sr-only");
    });

    it("should provide focusable screen reader styles", () => {
      expect(screenReaderStyles.focusable).toContain("sr-only");
      expect(screenReaderStyles.focusable).toContain("focus:not-sr-only");
      expect(screenReaderStyles.focusable).toContain("focus:absolute");
    });
  });
});

describe("Icon Styles", () => {
  describe("iconStyles", () => {
    it("should provide size variants", () => {
      expect(iconStyles.sizes.xs).toContain("size-3");
      expect(iconStyles.sizes.sm).toContain("size-4");
      expect(iconStyles.sizes.md).toContain("size-5");
      expect(iconStyles.sizes.lg).toContain("size-6");
      expect(iconStyles.sizes.xl).toContain("size-8");
    });

    it("should provide common icon styles", () => {
      expect(iconStyles.common).toContain("flex-shrink-0");
      expect(iconStyles.common).toContain("select-none");
    });

    it("should provide decorative styles", () => {
      expect(iconStyles.decorative).toContain("aria-hidden");
    });
  });
});

describe("Design Tokens", () => {
  describe("DESIGN_TOKENS", () => {
    it("should provide spacing scale", () => {
      expect(DESIGN_TOKENS.spacing.xs).toBe("0.25rem");
      expect(DESIGN_TOKENS.spacing.sm).toBe("0.5rem");
      expect(DESIGN_TOKENS.spacing.md).toBe("1rem");
      expect(DESIGN_TOKENS.spacing.lg).toBe("1.5rem");
      expect(DESIGN_TOKENS.spacing.xl).toBe("2rem");
    });

    it("should provide border radius scale", () => {
      expect(DESIGN_TOKENS.borderRadius.none).toBe("0");
      expect(DESIGN_TOKENS.borderRadius.sm).toBe("0.125rem");
      expect(DESIGN_TOKENS.borderRadius.md).toBe("0.375rem");
      expect(DESIGN_TOKENS.borderRadius.full).toBe("9999px");
    });

    it("should provide animation durations", () => {
      expect(DESIGN_TOKENS.animation.fast).toBe("150ms");
      expect(DESIGN_TOKENS.animation.normal).toBe("300ms");
      expect(DESIGN_TOKENS.animation.slow).toBe("500ms");
    });

    it("should provide breakpoints", () => {
      expect(DESIGN_TOKENS.breakpoints.sm).toBe("640px");
      expect(DESIGN_TOKENS.breakpoints.md).toBe("768px");
      expect(DESIGN_TOKENS.breakpoints.lg).toBe("1024px");
      expect(DESIGN_TOKENS.breakpoints.xl).toBe("1280px");
      expect(DESIGN_TOKENS.breakpoints["2xl"]).toBe("1536px");
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  describe("cn with edge cases", () => {
    it("should handle deeply nested arrays", () => {
      const nested = ["class1", "class2", "class3"];
      expect(cn(nested)).toBe("class1 class2 class3");
    });

    it("should handle mixed falsy and truthy values", () => {
      expect(
        cn(
          "valid-class",
          false && "false-class",
          true && "true-class",
          null,
          undefined,
          false,
          "",
          "another-valid"
        )
      ).toBe("valid-class true-class another-valid");
    });

    it("should handle booleans", () => {
      expect(cn("valid", false, "class")).toBe("valid class");
    });
  });

  describe("responsive with edge cases", () => {
    it("should handle undefined variants", () => {
      const base = ["text-base"];
      const variants = {
        md: undefined,
        lg: ["text-xl"],
      };

      const result = responsive(base, variants);
      expect(result).toEqual(["text-base", "lg:text-xl"]);
    });

    it("should handle empty variant arrays", () => {
      const base = ["text-base"];
      const variants = {
        md: [],
        lg: ["text-xl"],
      };

      const result = responsive(base, variants);
      expect(result).toEqual(["text-base", "lg:text-xl"]);
    });
  });
});
