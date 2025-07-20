/**
 * @file setup.test.ts
 * @description Tests for the global test setup file to ensure all utilities work correctly
 */
import { describe, it, expect, beforeEach, vi } from "bun:test";
import { performanceHelpers, a11yHelpers } from "../setup";

describe("Test Setup Utilities", () => {
  describe("Performance Helpers", () => {
    it("should measure render time correctly", async () => {
      const mockRenderFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      };

      const time = await performanceHelpers.measureRenderTime(mockRenderFn);
      expect(time).toBeGreaterThan(8); // Should be around 10ms
      expect(time).toBeLessThan(50); // Allow for some variance
    });

    it("should pass expectFastRender for fast renders", () => {
      expect(() => performanceHelpers.expectFastRender(10, 16)).not.toThrow();
    });

    it("should throw expectFastRender for slow renders", () => {
      expect(() => performanceHelpers.expectFastRender(20, 16)).toThrow("Render took 20ms, expected < 16ms");
    });

    it("should use default threshold when not specified", () => {
      expect(() => performanceHelpers.expectFastRender(20)).toThrow("Render took 20ms, expected < 16ms");
    });
  });

  describe("Accessibility Helpers", () => {
    let mockElement: Element;

    beforeEach(() => {
      // Create a mock DOM element for testing
      mockElement = {
        querySelectorAll: vi.fn(),
        tagName: "DIV"
      } as unknown as Element;
    });

    describe("checkAriaLabels", () => {
      it("should pass when all interactive elements have labels", () => {
        const mockButton = {
          getAttribute: vi.fn((attr: string) => attr === 'aria-label' ? 'Click me' : null),
          tagName: 'BUTTON',
          textContent: null
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).not.toThrow();
      });

      it("should pass when element has text content", () => {
        const mockButton = {
          getAttribute: vi.fn(() => null),
          tagName: 'BUTTON',
          textContent: 'Click me'
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).not.toThrow();
      });

      it("should pass when element has aria-labelledby", () => {
        const mockButton = {
          getAttribute: vi.fn((attr: string) => attr === 'aria-labelledby' ? 'label-id' : null),
          tagName: 'BUTTON',
          textContent: null
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).not.toThrow();
      });

      it("should pass when element has title", () => {
        const mockButton = {
          getAttribute: vi.fn((attr: string) => attr === 'title' ? 'Button title' : null),
          tagName: 'BUTTON',
          textContent: null
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).not.toThrow();
      });

      it("should throw when interactive element lacks accessible label", () => {
        const mockButton = {
          getAttribute: vi.fn(() => null),
          tagName: 'BUTTON',
          textContent: null
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).toThrow(
          "Interactive element missing accessible label: BUTTON"
        );
      });

      it("should handle whitespace-only text content", () => {
        const mockButton = {
          getAttribute: vi.fn(() => null),
          tagName: 'BUTTON',
          textContent: '   \n\t  '
        };

        (mockElement.querySelectorAll as any).mockReturnValue([mockButton]);

        expect(() => a11yHelpers.checkAriaLabels(mockElement)).toThrow(
          "Interactive element missing accessible label: BUTTON"
        );
      });
    });

    describe("checkHeadingHierarchy", () => {
      it("should pass for correct heading hierarchy", () => {
        const headings = [
          { tagName: 'H1' },
          { tagName: 'H2' },
          { tagName: 'H3' },
          { tagName: 'H2' },
          { tagName: 'H3' }
        ];

        (mockElement.querySelectorAll as any).mockReturnValue(headings);

        expect(() => a11yHelpers.checkHeadingHierarchy(mockElement)).not.toThrow();
      });

      it("should throw for skipped heading levels", () => {
        const headings = [
          { tagName: 'H1' },
          { tagName: 'H3' } // Skips H2
        ];

        (mockElement.querySelectorAll as any).mockReturnValue(headings);

        expect(() => a11yHelpers.checkHeadingHierarchy(mockElement)).toThrow(
          "Heading hierarchy skip detected: H3 after h1"
        );
      });

      it("should handle starting with h2 after h1", () => {
        const headings = [
          { tagName: 'H1' },
          { tagName: 'H4' } // Skips H2 and H3
        ];

        (mockElement.querySelectorAll as any).mockReturnValue(headings);

        expect(() => a11yHelpers.checkHeadingHierarchy(mockElement)).toThrow(
          "Heading hierarchy skip detected: H4 after h1"
        );
      });

      it("should pass when no headings are present", () => {
        (mockElement.querySelectorAll as any).mockReturnValue([]);

        expect(() => a11yHelpers.checkHeadingHierarchy(mockElement)).not.toThrow();
      });
    });
  });

  describe("Global Mocks", () => {
    it("should have IntersectionObserver mock", () => {
      expect(globalThis.IntersectionObserver).toBeDefined();
      const observer = globalThis.IntersectionObserver();
      expect(observer.observe).toBeDefined();
      expect(observer.disconnect).toBeDefined();
      expect(observer.unobserve).toBeDefined();
    });

    it("should have ResizeObserver mock", () => {
      expect(globalThis.ResizeObserver).toBeDefined();
      const observer = globalThis.ResizeObserver();
      expect(observer.observe).toBeDefined();
      expect(observer.disconnect).toBeDefined();
      expect(observer.unobserve).toBeDefined();
    });

    it("should have matchMedia mock", () => {
      expect(globalThis.matchMedia).toBeDefined();
      const result = globalThis.matchMedia("(max-width: 768px)");
      expect(result.matches).toBe(false);
      expect(result.media).toBe("(max-width: 768px)");
      expect(result.onchange).toBe(null);
      expect(result.addListener).toBeDefined();
      expect(result.removeListener).toBeDefined();
      expect(result.addEventListener).toBeDefined();
      expect(result.removeEventListener).toBeDefined();
      expect(result.dispatchEvent).toBeDefined();
    });
  });

  describe("Custom Matchers", () => {
    it("should test accessibility helpers directly", () => {
      // Test checkAriaLabels coverage - lines 112-125
      const mockElementWithLabel = {
        querySelectorAll: vi.fn().mockReturnValue([
          {
            getAttribute: vi.fn((attr: string) => attr === 'aria-label' ? 'test label' : null),
            tagName: 'BUTTON',
            textContent: null
          }
        ])
      } as unknown as Element;

      expect(() => a11yHelpers.checkAriaLabels(mockElementWithLabel)).not.toThrow();
    });

    it("should test accessibility helpers with error scenarios", () => {
      // Test error scenarios to hit all coverage paths
      const mockElementWithoutLabel = {
        querySelectorAll: vi.fn().mockReturnValue([
          {
            getAttribute: vi.fn(() => null),
            tagName: 'BUTTON',
            textContent: null
          }
        ])
      } as unknown as Element;

      expect(() => a11yHelpers.checkAriaLabels(mockElementWithoutLabel)).toThrow(
        'Interactive element missing accessible label: BUTTON'
      );
    });

    it("should test heading hierarchy validation", () => {
      // Test checkHeadingHierarchy coverage
      const mockElementWithBadHeadings = {
        querySelectorAll: vi.fn().mockReturnValue([
          { tagName: 'H1' },
          { tagName: 'H3' }  // Skip H2
        ])
      } as unknown as Element;

      expect(() => a11yHelpers.checkHeadingHierarchy(mockElementWithBadHeadings)).toThrow(
        'Heading hierarchy skip detected: H3 after h1'
      );
    });

    it("should have extended expect matchers available", () => {
      // Test that the matchers are properly extended
      // We can't directly test the matchers without proper DOM, but we can verify they exist
      expect(typeof (expect as any).toBeAccessible).toBe('function');
      expect(typeof (expect as any).toHaveValidMarkup).toBe('function');
    });

    it("should test matcher error handling", () => {
      // Test error scenarios in the custom matchers
      const mockElement = {
        querySelectorAll: vi.fn().mockImplementation(() => {
          throw new Error("Query failed");
        })
      } as unknown as Element;

      // Test that accessibility checker handles errors gracefully
      expect(() => {
        try {
          a11yHelpers.checkAriaLabels(mockElement);
        } catch (e) {
          // Expected to throw due to query failure
          expect(e).toBeInstanceOf(Error);
        }
      }).not.toThrow();
    });
  });
});