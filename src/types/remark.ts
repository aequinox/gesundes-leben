import type { Root, RootContent, Node, Parent } from "mdast";

export interface RemarkContext {
  readonly data: {
    readonly astro: {
      frontmatter: {
        readingTime?: number;
        id?: string;
        [key: string]: any;
      };
    };
  };
}

export interface ReadingTimeResult {
  readonly text: string;
  readonly minutes: number;
  readonly time: number;
  readonly words: number;
}

export type RemarkPlugin = (tree: Root, context: RemarkContext) => void;

export interface ImageLinkOptions {
  readonly prefixUrl: string;
}

export interface SectionNode extends Parent {
  readonly type: "section";
  readonly depth: number;
  readonly children: RootContent[];
  readonly data: {
    readonly hName: string;
    readonly hProperties: {
      readonly "data-aos"?: string;
      readonly class?: string;
      [key: string]: any;
    };
  };
}

export type HeadingMatcher = (node: RootContent) => boolean;

export interface SectionizeOptions {
  readonly maxDepth?: number;
  readonly getSectionData?: (depth: number) => SectionNode["data"];
}

export type PredicateTest<T extends Node> = (node: T) => boolean;

export type Test = string | PredicateTest<Node>;

export type BuildVisitor<T extends Node> = (node: T) => void;

export type RootContentWithHeading = RootContent & { depth?: number };
