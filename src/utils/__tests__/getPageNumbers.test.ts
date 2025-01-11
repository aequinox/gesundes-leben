import { describe, expect, test, vi } from "vitest";
import calculatePageNumbers from "../getPageNumbers";

// Mock the SITE config
vi.mock("@/config", () => ({
  SITE: {
    postPerPage: 5,
  },
}));

describe("calculatePageNumbers", () => {
  test("returns empty array for 0 posts", () => {
    const result = calculatePageNumbers(0);
    expect(result).toEqual([]);
  });

  test("returns [1] for posts less than posts per page", () => {
    const result = calculatePageNumbers(3);
    expect(result).toEqual([1]);
  });

  test("returns correct pages for exact multiple of posts per page", () => {
    const result = calculatePageNumbers(10);
    expect(result).toEqual([1, 2]);
  });

  test("returns correct pages for non-exact multiple of posts per page", () => {
    const result = calculatePageNumbers(12);
    expect(result).toEqual([1, 2, 3]);
  });

  test("handles large number of posts", () => {
    const result = calculatePageNumbers(25);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("throws error for negative number of posts", () => {
    expect(() => calculatePageNumbers(-1)).toThrow(
      "Number of posts cannot be negative"
    );
  });

  test("handles single post", () => {
    const result = calculatePageNumbers(1);
    expect(result).toEqual([1]);
  });

  test("handles posts exactly equal to posts per page", () => {
    const result = calculatePageNumbers(5);
    expect(result).toEqual([1]);
  });
});
