import type { Image, Root } from "mdast";
import { visit } from "unist-util-visit";

/** Remark context with Astro frontmatter */
interface RemarkContext {
  /** Context data */
  readonly data: {
    /** Astro-specific data */
    readonly astro: {
      /** Frontmatter data */
      readonly frontmatter: {
        /** Reading time in minutes */
        readingTime?: number;
        /** Content ID */
        readonly id?: string;
        /** Additional frontmatter properties */
        readonly [key: string]: unknown;
      };
    };
  };
}

/** Image link configuration */
export interface ImageLinkOptions {
  /** Base URL for images */
  readonly prefixUrl: string;
  /** Image processing options */
  readonly processing?: {
    /** Image width */
    readonly width?: number;
    /** Image height */
    readonly height?: number;
    /** Image format */
    readonly format?: "png" | "jpg" | "webp" | "avif";
    /** Image quality */
    readonly quality?: number;
  };
  /** Loading strategy */
  readonly loading?: "lazy" | "eager";
}

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
/* eslint no-unused-vars: "off" */
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
