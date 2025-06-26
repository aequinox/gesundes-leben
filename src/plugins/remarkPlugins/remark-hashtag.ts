import { slugify } from "../../utils/slugs";
import type { Root, RootContent, Link, Text, Html } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Configuration options for the hashtag plugin
 */
interface HashtagOptions {
  /** Hashtags that should be styled but not linked */
  excludedTags?: string[];
  /** Base URL for tag pages */
  baseUrl?: string;
  /** CSS class for styled hashtags */
  hashtagClass?: string;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<HashtagOptions> = {
  excludedTags: ["weildueswertbist", "sogehtgesund"],
  baseUrl: "/tags",
  hashtagClass: "hashtag",
};

/**
 * Regular expression for matching hashtags
 * Supports Unicode letters, digits, underscores, and hyphens
 */
const HASHTAG_REGEX = /(#[\p{L}\p{N}_-]+)/gu;
const HASHTAG_MATCH_REGEX = /^#([\p{L}\p{N}_-]+)$/u;


/**
 * Creates a link node for a hashtag
 * @param hashtag The hashtag to link to
 * @param baseUrl The base URL for tag pages
 * @returns A link node with the hashtag text as its child
 */
const createHashtagLink = (hashtag: string, baseUrl: string): Link => {
  return {
    type: "link",
    url: `${baseUrl}/${slugify(hashtag.toLowerCase())}/`,
    children: [
      {
        type: "text",
        value: `#${hashtag}`,
      },
    ],
  };
};


/**
 * Creates an HTML node for a styled hashtag
 * @param hashtag The hashtag to style
 * @param cssClass The CSS class for styling the hashtag
 * @returns An HTML node with a `<span>` element wrapping the hashtag
 */
const createStyledHashtag = (hashtag: string, cssClass: string): Html => {
  return {
    type: "html",
    value: `<span class="${cssClass}">${hashtag}</span>`,
  };
};


/**
 * Creates a plain text node
 * @param value The text content of the node
 * @returns A text node with the given value
 */
function createTextNode(value: string): Text {
  return {
    type: "text",
    value,
  };
}


/**
 * Checks if a given hashtag is in the list of excluded hashtags.
 * 
 * @param hashtag - The hashtag to check.
 * @param excludedTags - An array of hashtags to exclude.
 * @returns A boolean indicating whether the hashtag is excluded.
 */

const isExcludedHashtag = (
  hashtag: string,
  excludedTags: string[]
): boolean => {
  return excludedTags.includes(hashtag.toLowerCase());
};


  /**
   * Process a single text part of a node.
   * 
   * If the part matches the hashtag regex, it's either linked or styled.
   * If the hashtag is in the list of excluded hashtags, it's styled with
   * `options.hashtagClass`. Otherwise, it's linked with
   * `createHashtagLink`.
   * 
   * If the part doesn't match the hashtag regex, it's returned as a plain
   * text node.
   * 
   * @param part - The text part to process.
   * @param options - The plugin configuration options.
   * @returns A root content node (either a text, link, or html node).
   */
const processTextPart = (
  part: string,
  options: Required<HashtagOptions>
): RootContent => {
  const hashtagMatch = part.match(HASHTAG_MATCH_REGEX);

  if (!hashtagMatch) {
    return createTextNode(part);
  }

  const hashtag = hashtagMatch[1];

  if (isExcludedHashtag(hashtag, options.excludedTags)) {
    return createStyledHashtag(hashtag, options.hashtagClass);
  }

  return createHashtagLink(hashtag, options.baseUrl);
};


/**
 * A remark plugin that processes hashtags within a Markdown Abstract Syntax Tree (AST).
 *
 * This plugin identifies text nodes containing hashtags and transforms them based on
 * configuration options. Hashtags that match the specified regex are either styled or
 * linked. Excluded hashtags are styled using a specified CSS class, while others are
 * converted into clickable links pointing to a base URL.
 *
 * @param options Optional configuration for the hashtag processing, including:
 *   - `excludedTags`: An array of hashtags to be excluded from linking.
 *   - `baseUrl`: The base URL used for hashtag links.
 *   - `hashtagClass`: The CSS class used for styling excluded hashtags.
 *
 * @returns A transformer function that processes the AST, identifying and transforming
 * text parts containing hashtags into styled or linked nodes.
 */

export const remarkHashtag: Plugin<[HashtagOptions?], Root> = (
  options: HashtagOptions = {}
) => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      // Early return if conditions aren't met
      if (!parent || typeof index !== "number" || !node.value.includes("#")) {
        return;
      }

      try {
        const parts = node.value.split(HASHTAG_REGEX);
        const newNodes: RootContent[] = [];

        for (const part of parts) {
          if (part) {
            newNodes.push(processTextPart(part, config));
          }
        }

        // Only replace if we have multiple nodes (transformation occurred)
        if (newNodes.length > 1) {
          parent.children.splice(index, 1, ...newNodes);
          return index + newNodes.length;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return;
      }
    });
  };
};
