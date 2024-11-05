import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";
import type {
  RemarkContext,
  ReadingTimeResult,
  RemarkPlugin,
} from "@/types/remark";

/**
 * Calculates the reading time of a given text and sets it as frontmatter data.
 * @returns A remark plugin function
 */
export function remarkReadingTime(): RemarkPlugin {
  return function (tree: Root, context: RemarkContext): void {
    const textContent = toString(tree);
    const { minutes }: ReadingTimeResult = getReadingTime(textContent);

    // Set the reading time in the frontmatter
    if (context.data?.astro?.frontmatter) {
      context.data.astro.frontmatter.readingTime = Math.ceil(minutes);
    }
  };
}
