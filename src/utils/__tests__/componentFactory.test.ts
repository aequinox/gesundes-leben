/**
 * @file componentFactory.test.ts
 * @description Tests for component factory utilities with enhanced type safety
 */

import { describe, it, expect, vi } from "vitest";

import {
  createComponentFactory,
  createButtonVariants,
  createBadgeVariants,
  createCardVariants,
  createLayoutVariants,
  composeComponents,
  createResponsiveVariant,
  createThemeVariants,
  withPerformanceMonitoring,
  buttonFactory,
  badgeFactory,
  cardFactory,
  layoutFactory,
  type ComponentVariantConfig,
  type InteractiveComponent,
  type VariantComponent,
  type LayoutComponent,
  type ContentComponent,
} from "../componentFactory";

describe("createComponentFactory", () => {
  it("should create a component factory with default configuration", () => {
    const config: ComponentVariantConfig = {
      name: "TestComponent",
      baseClasses: "base-class",
      variants: {
        size: {
          small: "text-sm",
          large: "text-lg",
        },
      },
    };

    const factory = createComponentFactory(config);

    expect(factory).toBeDefined();
    expect(typeof factory).toBe("function");
  });

  it("should generate component with correct classes", () => {
    const config: ComponentVariantConfig = {
      name: "Button",
      baseClasses: "btn",
      variants: {
        size: {
          sm: "btn-sm",
          lg: "btn-lg",
        },
        variant: {
          primary: "btn-primary",
          secondary: "btn-secondary",
        },
      },
      defaultVariants: {
        size: "sm",
        variant: "primary",
      },
    };

    const factory = createComponentFactory(config);
    const result = factory({ size: "lg", variant: "secondary" });

    expect(result.className).toContain("btn");
    expect(result.className).toContain("btn-lg");
    expect(result.className).toContain("btn-secondary");
  });

  it("should use default variants when none provided", () => {
    const config: ComponentVariantConfig = {
      name: "Button",
      baseClasses: "btn",
      variants: {
        size: {
          sm: "btn-sm",
          lg: "btn-lg",
        },
      },
      defaultVariants: {
        size: "sm",
      },
    };

    const factory = createComponentFactory(config);
    const result = factory({});

    expect(result.className).toContain("btn");
    expect(result.className).toContain("btn-sm");
  });

  it("should handle compound variants", () => {
    const config: ComponentVariantConfig = {
      name: "Button",
      baseClasses: "btn",
      variants: {
        size: { sm: "btn-sm", lg: "btn-lg" },
        variant: { primary: "btn-primary", danger: "btn-danger" },
      },
      compoundVariants: [
        {
          size: "lg",
          variant: "danger",
          className: "btn-lg-danger-special",
        },
      ],
    };

    const factory = createComponentFactory(config);
    const result = factory({ size: "lg", variant: "danger" });

    expect(result.className).toContain("btn-lg-danger-special");
  });
});

describe("createButtonVariants", () => {
  it("should create button variants with proper structure", () => {
    const variants = createButtonVariants();

    expect(variants).toHaveProperty("size");
    expect(variants).toHaveProperty("variant");
    expect(variants.size).toHaveProperty("sm");
    expect(variants.size).toHaveProperty("md");
    expect(variants.size).toHaveProperty("lg");
    expect(variants.variant).toHaveProperty("primary");
    expect(variants.variant).toHaveProperty("secondary");
    expect(variants.variant).toHaveProperty("outline");
  });

  it("should allow custom button variants", () => {
    const customVariants = {
      size: { xs: "btn-xs", xl: "btn-xl" },
      type: { success: "btn-success", warning: "btn-warning" },
    };

    const variants = createButtonVariants(customVariants);

    expect(variants.size).toHaveProperty("xs");
    expect(variants.size).toHaveProperty("xl");
    expect(variants.type).toHaveProperty("success");
    expect(variants.type).toHaveProperty("warning");
  });
});

describe("createBadgeVariants", () => {
  it("should create badge variants with proper structure", () => {
    const variants = createBadgeVariants();

    expect(variants).toHaveProperty("size");
    expect(variants).toHaveProperty("variant");
    expect(variants.size).toHaveProperty("sm");
    expect(variants.size).toHaveProperty("md");
    expect(variants.variant).toHaveProperty("default");
    expect(variants.variant).toHaveProperty("primary");
    expect(variants.variant).toHaveProperty("success");
  });
});

describe("createCardVariants", () => {
  it("should create card variants with proper structure", () => {
    const variants = createCardVariants();

    expect(variants).toHaveProperty("padding");
    expect(variants).toHaveProperty("shadow");
    expect(variants).toHaveProperty("variant");
    expect(variants.padding).toHaveProperty("none");
    expect(variants.padding).toHaveProperty("sm");
    expect(variants.shadow).toHaveProperty("sm");
    expect(variants.shadow).toHaveProperty("lg");
  });
});

describe("createLayoutVariants", () => {
  it("should create layout variants with proper structure", () => {
    const variants = createLayoutVariants();

    expect(variants).toHaveProperty("container");
    expect(variants).toHaveProperty("spacing");
    expect(variants).toHaveProperty("direction");
    expect(variants.container).toHaveProperty("none");
    expect(variants.container).toHaveProperty("sm");
    expect(variants.spacing).toHaveProperty("none");
    expect(variants.direction).toHaveProperty("row");
    expect(variants.direction).toHaveProperty("col");
  });
});

describe("composeComponents", () => {
  it("should compose multiple component factories", () => {
    const baseConfig: ComponentVariantConfig = {
      name: "Base",
      baseClasses: "base",
      variants: { size: { sm: "sm", lg: "lg" } },
    };

    const extensionConfig: ComponentVariantConfig = {
      name: "Extension",
      baseClasses: "extension",
      variants: { color: { red: "red", blue: "blue" } },
    };

    const composed = composeComponents(baseConfig, extensionConfig);

    expect(composed.baseClasses).toContain("base");
    expect(composed.baseClasses).toContain("extension");
    expect(composed.variants).toHaveProperty("size");
    expect(composed.variants).toHaveProperty("color");
  });
});

describe("createResponsiveVariant", () => {
  it("should create responsive variants with breakpoint prefixes", () => {
    const baseVariants = {
      size: { sm: "text-sm", lg: "text-lg" },
    };

    const responsive = createResponsiveVariant(baseVariants);

    expect(responsive.size).toHaveProperty("sm");
    expect(responsive.size).toHaveProperty("lg");
    expect(responsive.size).toHaveProperty("md:sm");
    expect(responsive.size).toHaveProperty("lg:lg");
  });
});

describe("createThemeVariants", () => {
  it("should create theme variants with proper light/dark classes", () => {
    const baseVariants = {
      color: { primary: "text-blue-500", secondary: "text-gray-500" },
    };

    const themed = createThemeVariants(baseVariants);

    expect(themed.color).toHaveProperty("primary");
    expect(themed.color).toHaveProperty("secondary");
    expect(themed.color.primary).toContain("text-blue-500");
    expect(themed.color.primary).toContain("dark:text-blue-400");
  });
});

describe("withPerformanceMonitoring", () => {
  it("should wrap component factory with performance monitoring", () => {
    const mockConfig: ComponentVariantConfig = {
      name: "TestComponent",
      baseClasses: "test",
      variants: {},
    };

    const factory = createComponentFactory(mockConfig);
    const monitoredFactory = withPerformanceMonitoring(
      factory,
      "TestComponent"
    );

    expect(typeof monitoredFactory).toBe("function");

    // Should still work like original factory
    const result = monitoredFactory({});
    expect(result).toHaveProperty("className");
    expect(result.className).toContain("test");
  });

  it("should measure performance of component creation", () => {
    const mockPerformance = {
      mark: vi.fn(),
      measure: vi.fn(),
    };

    // Mock performance API
    Object.defineProperty(window, "performance", {
      value: mockPerformance,
      writable: true,
    });

    const mockConfig: ComponentVariantConfig = {
      name: "PerformanceTest",
      baseClasses: "test",
      variants: {},
    };

    const factory = createComponentFactory(mockConfig);
    const monitoredFactory = withPerformanceMonitoring(
      factory,
      "PerformanceTest"
    );

    monitoredFactory({});

    expect(mockPerformance.mark).toHaveBeenCalledWith("PerformanceTest-start");
    expect(mockPerformance.mark).toHaveBeenCalledWith("PerformanceTest-end");
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      "PerformanceTest",
      "PerformanceTest-start",
      "PerformanceTest-end"
    );
  });
});

describe("Component Factory Instances", () => {
  describe("buttonFactory", () => {
    it("should be a functional button factory", () => {
      const result = buttonFactory({ size: "lg", variant: "primary" });

      expect(result).toHaveProperty("className");
      expect(result.className).toBeTruthy();
    });
  });

  describe("badgeFactory", () => {
    it("should be a functional badge factory", () => {
      const result = badgeFactory({ size: "sm", variant: "success" });

      expect(result).toHaveProperty("className");
      expect(result.className).toBeTruthy();
    });
  });

  describe("cardFactory", () => {
    it("should be a functional card factory", () => {
      const result = cardFactory({ padding: "lg", shadow: "lg" });

      expect(result).toHaveProperty("className");
      expect(result.className).toBeTruthy();
    });
  });

  describe("layoutFactory", () => {
    it("should be a functional layout factory", () => {
      const result = layoutFactory({ container: "lg", direction: "col" });

      expect(result).toHaveProperty("className");
      expect(result.className).toBeTruthy();
    });
  });
});

describe("Type Safety", () => {
  it("should handle Record<string, unknown> props correctly", () => {
    const config: ComponentVariantConfig = {
      name: "TypeSafeComponent",
      baseClasses: "base",
      variants: {
        size: { sm: "sm", lg: "lg" },
      },
    };

    const factory = createComponentFactory(config);

    // Test with unknown props
    const props: Record<string, unknown> = {
      size: "sm",
      customProp: "customValue",
      nested: { prop: "value" },
    };

    const result = factory(props);
    expect(result).toHaveProperty("className");
    expect(result.className).toContain("base");
    expect(result.className).toContain("sm");
  });

  it("should preserve type information for component interfaces", () => {
    const interactiveComponent: InteractiveComponent = {
      onClick: vi.fn(),
      onKeyDown: vi.fn(),
      disabled: false,
      tabIndex: 0,
      "aria-label": "Interactive Component",
    };

    expect(interactiveComponent).toHaveProperty("onClick");
    expect(interactiveComponent).toHaveProperty("aria-label");
    expect(typeof interactiveComponent.onClick).toBe("function");
  });

  it("should support variant component types", () => {
    const variantComponent: VariantComponent = {
      size: "sm",
      variant: "primary",
      className: "custom-class",
    };

    expect(variantComponent).toHaveProperty("size");
    expect(variantComponent).toHaveProperty("variant");
    expect(variantComponent.size).toBe("sm");
  });

  it("should support layout component types", () => {
    const layoutComponent: LayoutComponent = {
      direction: "column",
      spacing: "md",
      align: "center",
      justify: "start",
    };

    expect(layoutComponent).toHaveProperty("direction");
    expect(layoutComponent).toHaveProperty("spacing");
    expect(layoutComponent.direction).toBe("column");
  });

  it("should support content component types", () => {
    const contentComponent: ContentComponent = {
      content: "Test content",
      truncate: true,
      highlight: false,
    };

    expect(contentComponent).toHaveProperty("content");
    expect(contentComponent).toHaveProperty("truncate");
    expect(contentComponent.content).toBe("Test content");
  });
});
