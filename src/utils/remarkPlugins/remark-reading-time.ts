import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";
import type { ReadingTimeResult } from "@/types/remark";

/**
 * Calculates the reading time of a given text and sets it as frontmatter data.
 * @returns A remark plugin function
 */
export function remarkReadingTime() {
  return function (tree: Root, file: any): void {
    const textContent = toString(tree);
    const { minutes }: ReadingTimeResult = getReadingTime(textContent);

    // Set the reading time in the frontmatter
    if (file && file.data?.astro?.frontmatter) {
      file.data.astro.frontmatter.readingTime = Math.ceil(minutes);
    }
  };
}
