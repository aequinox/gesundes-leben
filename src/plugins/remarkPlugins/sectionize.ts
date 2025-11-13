import type { Properties } from "hast";
import type { Heading, Parent, Root, RootContent } from "mdast";
import { findAfter } from "unist-util-find-after";

/** Function to test if a node is a heading */
type HeadingMatcher = (node: RootContent) => boolean;

/** Section creation options */
interface SectionizeOptions {
  /** Maximum heading depth */
  readonly maxDepth?: number;
  /** Function to get section data */
  readonly getSectionData?: (depth: number) => SectionNode["data"];
  /** Custom heading matcher */
  // readonly headingMatcher?: HeadingMatcher;
}

/** Root content with heading depth */
export type RootContentWithHeading = RootContent & {
  /** Heading depth */
  readonly depth?: number;
};

/** Section node HTML properties */
export interface SectionNodeProperties extends Properties {
  /** Animation on scroll */
  readonly "data-aos"?: string;
  /** CSS classes */
  readonly class?: string;
}

/** Section node in markdown AST */
export interface SectionNode extends Parent {
  /** Node type */
  readonly type: "section";
  /** Section depth */
  readonly depth: number;
  /** Child nodes */
  readonly children: RootContent[];
  /** Node data */
  readonly data: {
    /** HTML element name */
    readonly hName: string;
    /** HTML properties */
    readonly hProperties: SectionNodeProperties;
  };
}

const DEFAULT_OPTIONS: Required<SectionizeOptions> = {
  maxDepth: 6,

  getSectionData: (_depth: number) => ({
    hName: "section",
    hProperties: {
      "data-aos": "fade-up",
    },
  }),
};

/**
 * Creates a remark plugin to transform headings into sections
 * @param options - Configuration options for sectionizing
 * @returns A remark plugin function
 */
export function remarkSectionize(
  options: SectionizeOptions = {}
): (tree: Root) => Root {
  const { maxDepth, getSectionData } = { ...DEFAULT_OPTIONS, ...options };

  return function transform(tree: Root): Root {
    let index = 0;
    let node: RootContent | undefined;

    while ((node = tree.children[index])) {
      if (node.type === "heading" && (node as Heading).depth <= maxDepth) {
        sectionize(node as Heading, index, tree, getSectionData);
      }
      index++;
    }

    return tree;
  };
}

/**
 * Creates a section in the AST
 * @param heading - The heading node to create a section for
 * @param index - The index of the heading in the parent's children
 * @param parent - The parent node (Root or SectionNode) containing the heading
 * @param getSectionData - Function to get section data based on depth
 */
function sectionize(
  heading: Heading,
  index: number,
  parent: Root | SectionNode,
  getSectionData: Required<SectionizeOptions>["getSectionData"]
): void {
  const depth = heading.depth;

  const isEndOfSection: HeadingMatcher = (node: RootContentWithHeading) =>
    node.type === "heading" && (node.depth ?? 0) <= depth;

  const endNode = findAfter(parent, heading, isEndOfSection);
  const endIndex = endNode
    ? parent.children.indexOf(endNode)
    : parent.children.length;

  const sectionContent = parent.children.slice(index, endIndex);

  const section: SectionNode = {
    type: "section",
    depth,
    children: sectionContent,
    data: getSectionData(depth),
  };

  parent.children.splice(index, sectionContent.length, section);
}

export default remarkSectionize;
