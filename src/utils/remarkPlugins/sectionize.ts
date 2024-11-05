import { findAfter } from "unist-util-find-after";
import type { Root, RootContent, Heading } from "mdast";
// import type { Root, RootContent, Heading, Parent, Node, Data } from "mdast";
import type {
  SectionNode,
  HeadingMatcher,
  SectionizeOptions,
  RootContentWithHeading,
} from "@/types/remark";

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
 * @param parent - The parent node containing the heading
 * @param getSectionData - Function to get section data based on depth
 */
function sectionize(
  heading: Heading | any,
  index: number,
  parent: Root | any,
  getSectionData: Required<SectionizeOptions>["getSectionData"]
): void {
  const depth = heading.depth;

  const isEndOfSection: HeadingMatcher | any = (node: RootContentWithHeading) =>
    node.type === "heading" && node.depth <= depth;

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
