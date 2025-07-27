/**
 * Type definitions for remark plugins and transformations.
 * @module remark
 */
import type { Node, Root } from "mdast";

/** Node predicate test */
export type PredicateTest<T extends Node> = (node: T) => boolean;

/** Node test type */
export type Test = string | PredicateTest<Node>;

/** Node visitor function */
export type BuildVisitor<T extends Node> = (node: T) => void;

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
