import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

/** Reading time calculation result */
export interface ReadingTimeResult {
  /** Human-readable text */
  readonly text: string;
  /** Time in minutes */
  readonly minutes: number;
  /** Time in milliseconds */
  readonly time: number;
  /** Word count */
  readonly words: number;
  /** Reading speed (words per minute) */
  readonly wpm?: number;
  /** Success flag */
  // readonly success: boolean;
}

/**
 * A remark plugin that calculates the reading time for the content of a Markdown Abstract Syntax Tree (AST)
 * and assigns it to the frontmatter of the corresponding file.
 *
 * @returns A transformer function that processes the AST and file metadata.
 *
 * The transformer extracts text from the AST, calculates the reading time in minutes, and updates the
 * `readingTime` field in the frontmatter of the file with the calculated value rounded up to the nearest minute.
 */

export function remarkReadingTime() {
  return (
    tree: Root,
    file: { data?: { astro?: { frontmatter?: Record<string, unknown> } } }
  ) => {
    const textOnPage = toString(tree);
    const { minutes }: ReadingTimeResult = getReadingTime(textOnPage);

    // Set the reading time in the frontmatter
    if (file.data?.astro?.frontmatter) {
      file.data.astro.frontmatter.readingTime = Math.ceil(minutes);
    }
  };
}
