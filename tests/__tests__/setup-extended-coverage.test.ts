/**
 * @file setup-extended-coverage.test.ts
 * @description Comprehensive test to achieve 100% coverage of setup.ts matchers
 */
import { describe, it, expect, vi } from "bun:test";

describe("Setup Extended Matchers - 100% Coverage", () => {
  describe("toBeAccessible matcher comprehensive coverage", () => {
    it("should exercise success path lines 112-120", () => {
      const mockElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([
            {
              getAttribute: vi.fn((attr: string) => attr === 'aria-label' ? 'Test button' : null),
              tagName: 'BUTTON',
              textContent: null
            }
          ])
          .mockReturnValueOnce([
            { tagName: 'H1' },
            { tagName: 'H2' }
          ])
      } as unknown as Element;

      // This should hit lines 114-120 (success path)
      expect(mockElement).toBeAccessible();
    });

    it("should exercise error path lines 121-126", () => {
      const mockElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([
            {
              getAttribute: vi.fn(() => null),
              tagName: 'BUTTON',
              textContent: null
            }
          ])
          .mockReturnValueOnce([])
      } as unknown as Element;

      // This should hit lines 121-126 (error path) with Error object
      expect(() => {
        expect(mockElement).toBeAccessible();
      }).toThrow();
    });

    it("should exercise non-Error exception path line 122", () => {
      const mockElement = {
        querySelectorAll: vi.fn(() => {
          throw "Non-error string"; // This hits the non-Error path in line 122
        })
      } as unknown as Element;

      // This should hit line 122 (error instanceof Error ? ... : 'Unknown error')
      expect(() => {
        expect(mockElement).toBeAccessible();
      }).toThrow();
    });

    it("should exercise all accessibility helper paths", () => {
      // Test checkAriaLabels with various scenarios
      const scenarios = [
        {
          name: "button with aria-label",
          element: {
            querySelectorAll: vi.fn()
              .mockReturnValueOnce([
                {
                  getAttribute: vi.fn((attr: string) => attr === 'aria-label' ? 'Click me' : null),
                  tagName: 'BUTTON',
                  textContent: null
                }
              ])
              .mockReturnValueOnce([])
          }
        },
        {
          name: "button with text content",
          element: {
            querySelectorAll: vi.fn()
              .mockReturnValueOnce([
                {
                  getAttribute: vi.fn(() => null),
                  tagName: 'BUTTON',
                  textContent: 'Click me'
                }
              ])
              .mockReturnValueOnce([])
          }
        },
        {
          name: "button with title",
          element: {
            querySelectorAll: vi.fn()
              .mockReturnValueOnce([
                {
                  getAttribute: vi.fn((attr: string) => attr === 'title' ? 'Click me' : null),
                  tagName: 'BUTTON',
                  textContent: null
                }
              ])
              .mockReturnValueOnce([])
          }
        },
        {
          name: "heading hierarchy test",
          element: {
            querySelectorAll: vi.fn()
              .mockReturnValueOnce([])
              .mockReturnValueOnce([
                { tagName: 'H1' },
                { tagName: 'H2' },
                { tagName: 'H3' }
              ])
          }
        }
      ];

      scenarios.forEach(({ name, element }) => {
        expect(element as Element).toBeAccessible();
      });
    });
  });

  describe("toHaveValidMarkup matcher comprehensive coverage", () => {
    it("should exercise line 132 with children > 0", () => {
      const mockElement = {
        children: { length: 2 },
        textContent: null
      } as unknown as Element;

      // This hits line 132: element.children.length > 0 (true case)
      expect(mockElement).toHaveValidMarkup();
    });

    it("should exercise line 132 with textContent?.trim()", () => {
      const mockElement = {
        children: { length: 0 },
        textContent: 'Valid content'
      } as unknown as Element;

      // This hits line 132: element.textContent?.trim() (true case)
      expect(mockElement).toHaveValidMarkup();
    });

    it("should exercise line 132 with both false", () => {
      const mockElement = {
        children: { length: 0 },
        textContent: null
      } as unknown as Element;

      // This hits line 132: both conditions false
      expect(() => {
        expect(mockElement).toHaveValidMarkup();
      }).toThrow();
    });

    it("should exercise line 132 optional chaining with undefined", () => {
      const mockElement = {
        children: { length: 0 },
        textContent: undefined
      } as unknown as Element;

      // This hits line 132: textContent?.trim() with undefined
      expect(() => {
        expect(mockElement).toHaveValidMarkup();
      }).toThrow();
    });

    it("should exercise line 132 optional chaining with empty string", () => {
      const mockElement = {
        children: { length: 0 },
        textContent: ''
      } as unknown as Element;

      // This hits line 132: textContent?.trim() with empty string
      expect(() => {
        expect(mockElement).toHaveValidMarkup();
      }).toThrow();
    });

    it("should exercise line 132 optional chaining with whitespace", () => {
      const mockElement = {
        children: { length: 0 },
        textContent: '   '
      } as unknown as Element;

      // This hits line 132: textContent?.trim() with whitespace (becomes empty)
      expect(() => {
        expect(mockElement).toHaveValidMarkup();
      }).toThrow();
    });

    it("should exercise lines 133-137 message functions", () => {
      // Test valid element (lines 134-135)
      const validElement = {
        children: { length: 1 },
        textContent: null
      } as unknown as Element;
      
      expect(validElement).toHaveValidMarkup();

      // Test invalid element (lines 136-137)
      const invalidElement = {
        children: { length: 0 },
        textContent: null
      } as unknown as Element;

      expect(() => {
        expect(invalidElement).toHaveValidMarkup();
      }).toThrow();
    });

    it("should exercise all textContent scenarios", () => {
      const textContentScenarios = [
        { textContent: 'valid text', shouldPass: true },
        { textContent: null, shouldPass: false },
        { textContent: undefined, shouldPass: false },
        { textContent: '', shouldPass: false },
        { textContent: '   ', shouldPass: false },
        { textContent: '\t\n\r  ', shouldPass: false },
        { textContent: 'a', shouldPass: true },
      ];

      textContentScenarios.forEach(({ textContent, shouldPass }) => {
        const element = {
          children: { length: 0 },
          textContent
        } as unknown as Element;

        if (shouldPass) {
          expect(element).toHaveValidMarkup();
        } else {
          expect(() => {
            expect(element).toHaveValidMarkup();
          }).toThrow();
        }
      });
    });
  });

  describe("Edge cases for complete coverage", () => {
    it("should test complex accessibility scenarios", () => {
      // Test complex heading hierarchy
      const complexHeadingElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce([
            { tagName: 'H1' },
            { tagName: 'H2' },
            { tagName: 'H2' },
            { tagName: 'H3' },
            { tagName: 'H3' },
            { tagName: 'H4' }
          ])
      } as unknown as Element;

      expect(complexHeadingElement).toBeAccessible();
    });

    it("should test error scenarios in accessibility helpers", () => {
      // Test heading hierarchy error
      const badHeadingElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce([
            { tagName: 'H1' },
            { tagName: 'H3' } // Skip H2
          ])
      } as unknown as Element;

      expect(() => {
        expect(badHeadingElement).toBeAccessible();
      }).toThrow();

      // Test missing aria label
      const badAriaElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([
            {
              getAttribute: vi.fn(() => null),
              tagName: 'BUTTON',
              textContent: null
            }
          ])
          .mockReturnValueOnce([])
      } as unknown as Element;

      expect(() => {
        expect(badAriaElement).toBeAccessible();
      }).toThrow();
    });

    it("should exercise all DOM query scenarios", () => {
      // Test empty queries
      const emptyElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([])
          .mockReturnValueOnce([])
      } as unknown as Element;

      expect(emptyElement).toBeAccessible();

      // Test multiple interactive elements
      const multipleInteractiveElement = {
        querySelectorAll: vi.fn()
          .mockReturnValueOnce([
            {
              getAttribute: vi.fn((attr: string) => attr === 'aria-label' ? 'Button 1' : null),
              tagName: 'BUTTON',
              textContent: null
            },
            {
              getAttribute: vi.fn(() => null),
              tagName: 'A',
              textContent: 'Link text'
            },
            {
              getAttribute: vi.fn((attr: string) => attr === 'title' ? 'Input field' : null),
              tagName: 'INPUT',
              textContent: null
            }
          ])
          .mockReturnValueOnce([])
      } as unknown as Element;

      expect(multipleInteractiveElement).toBeAccessible();
    });
  });
});