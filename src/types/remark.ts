/**
 * Type definitions for remark plugins and transformations.
 * @module remark
 */

import type { Root, RootContent, Node, Parent } from "mdast";
import type { Properties } from "hast";

/** Remark context with Astro frontmatter */
export interface RemarkContext {
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

/** Remark plugin type */
export type RemarkPlugin = (
  tree: Root,
  context: RemarkContext
) => void | Promise<void>;

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

/** Function to test if a node is a heading */
export type HeadingMatcher = (node: RootContent) => boolean;

/** Section creation options */
export interface SectionizeOptions {
  /** Maximum heading depth */
  readonly maxDepth?: number;
  /** Function to get section data */
  readonly getSectionData?: (depth: number) => SectionNode["data"];
  /** Custom heading matcher */
  // readonly headingMatcher?: HeadingMatcher;
}

/** Node predicate test */
export type PredicateTest<T extends Node> = (node: T) => boolean;

/** Node test type */
export type Test = string | PredicateTest<Node>;

/** Node visitor function */
export type BuildVisitor<T extends Node> = (node: T) => void;

/** Root content with heading depth */
export type RootContentWithHeading = RootContent & {
  /** Heading depth */
  readonly depth?: number;
};

/** Markdown processing options */
export interface MarkdownOptions {
  /** GFM (GitHub Flavored Markdown) */
  readonly gfm?: boolean;
  /** Footnotes support */
  readonly footnotes?: boolean;
  /** Math expressions */
  readonly math?: boolean;
  /** Custom plugins */
  readonly plugins?: RemarkPlugin[];
  /** Syntax highlighting */
  readonly highlight?: boolean;
  /** Table of contents */
  readonly toc?:
    | boolean
    | {
        /** Maximum heading depth */
        readonly maxDepth?: number;
        /** Heading levels to include */
        readonly levels?: number[];
      };
}

/** Code block options */
export interface CodeBlockOptions {
  /** Programming language */
  readonly lang?: string;
  /** Line numbers */
  readonly showLineNumbers?: boolean;
  /** Highlighted lines */
  readonly highlightLines?: number[];
  /** Line number start */
  readonly startLine?: number;
  /** File name */
  readonly fileName?: string;
  /** Copy button */
  readonly showCopyButton?: boolean;
}

/** Table of contents entry */
export interface TocEntry {
  /** Entry depth */
  readonly depth: number;
  /** Entry text */
  readonly text: string;
  /** Entry ID */
  readonly id: string;
  /** Child entries */
  readonly children: TocEntry[];
}

/** Remark transformer function */
export type RemarkTransformer = (tree: Root) => Root | Promise<Root>;

/** Plugin options */
export interface PluginOptions {
  /** Plugin name */
  readonly name: string;
  /** Plugin options */
  readonly options?: Record<string, unknown>;
  /** Plugin transformer */
  readonly transform?: RemarkTransformer;
}
