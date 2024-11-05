import { visit } from "unist-util-visit";
import type { Root, Image } from "mdast";
import type { RemarkContext, ImageLinkOptions } from "@/types/remark";

/**
 * Validates if a URL is absolute or starts with specific paths
 * @param url - URL to validate
 * @returns boolean indicating if URL is absolute or has specific path
 */
const isAbsoluteOrSpecialPath = (url: string): boolean =>
  /^(http|\/images\/|\/)/.test(url);

/**
 * Replaces relative links in a tree with absolute links by prefixing them with a base URL.
 * @param options - Configuration options for link replacement
 * @returns A remark plugin function
 * @throws Error if required options or frontmatter are missing
 */
export function replaceRelativeLinks(
  options: ImageLinkOptions
): (tree: Root, context: RemarkContext) => void {
  if (!options.prefixUrl) {
    throw new Error("Missing required `prefixUrl` option.");
  }

  const { prefixUrl } = options;

  return (tree: Root, context: RemarkContext): void => {
    const { id } = context.data?.astro?.frontmatter;

    if (!id) {
      throw new Error("Missing required `id` in frontmatter.");
    }

    visit(tree, "image", (node: Image) => {
      if (!isAbsoluteOrSpecialPath(node.url)) {
        node.url = `${prefixUrl}/${id}/${node.url}`;
      }
    });
  };
}
