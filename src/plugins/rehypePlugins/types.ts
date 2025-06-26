/**
 * Type definitions for rehype plugins and transformations.
 * @module rehype
 */
import type { Element, Properties, Root } from "hast";

/** HTML heading levels */
export const enum HeadingLevel {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  H6 = "h6",
}

/** Heading wrapper properties */
export interface HeadingWrapperProps {
  /** HTML tag name */
  readonly tagName: HeadingLevel | string;
  /** Additional attributes */
  readonly attributes?: Properties;
}

/** Screen reader label properties */
export type SRLabelProperties = Properties & {
  /** Aria label */
  readonly "aria-label"?: string;
  /** Raw HTML flag */
  readonly "is:raw"?: boolean;
};

/** Anchor icon properties */
export type AnchorIconProperties = Properties & {
  /** Aria hidden state */
  readonly ariaHidden?: "true" | "false";
  /** Icon class */
  readonly class?: string;
};

/** Autolink heading behavior */
export const enum AutolinkBehavior {
  Append = "append",
  Prepend = "prepend",
  Wrap = "wrap",
  Before = "before",
  After = "after",
}

/** Autolink configuration */
export interface AutolinkConfig {
  /** Link placement behavior */
  readonly behavior: AutolinkBehavior;
  /** Group element generator */
  readonly group: (props: HeadingWrapperProps) => Element;
  /** Content generator */
  readonly content: (heading: Element) => (Element | Root)[];
  /** Custom class names */
  readonly className?: string;
  /** Properties for the anchor element */
  readonly properties?: Properties;
}

/** Custom properties for elements with data attributes */
export type DataAttributes = {
  [K in string as K extends `data-${string}` ? K : never]: string;
};

/** Rehype element with data */
export interface RehypeElement extends Element {
  /** Element properties */
  readonly properties: Properties & {
    /** Class names */
    readonly className?: string[];
    /** ID attribute */
    readonly id?: string;
  } & DataAttributes;
}

/** Plugin options for rehype processing */
export interface RehypePluginOptions {
  /** Whether to process math expressions */
  readonly math?: boolean;
  /** Whether to add syntax highlighting */
  readonly highlight?: boolean;
  /** Whether to add heading links */
  readonly headingLinks?: boolean;
  /** Custom element handlers */
  readonly handlers?: Record<string, (element: Element) => Element | null>;
  /** Additional HTML attributes */
  readonly attributes?: Record<string, Record<string, string>>;
}

/** Transform options for rehype elements */
export interface TransformOptions {
  /** Source language */
  readonly from?: string;
  /** Target language */
  readonly to?: string;
  /** Whether to preserve whitespace */
  readonly preserveWhitespace?: boolean;
  /** Custom transformers */
  readonly transformers?: Array<(tree: Element) => Element>;
}

/** Sanitization options for HTML content */
export interface SanitizeOptions {
  /** Allowed HTML tags */
  readonly allowedTags?: string[];
  /** Allowed HTML attributes */
  readonly allowedAttributes?: Record<string, string[]>;
  /** Whether to allow custom data attributes */
  readonly allowedDataAttributes?: boolean;
  /** Custom sanitization rules */
  readonly customRules?: Array<(element: Element) => boolean>;
}

/** Base HTML attributes */
export interface BaseAttributes extends Properties {
  /** ID attribute */
  readonly id?: string;
  /** Class names */
  readonly className?: string[];
}

/** Heading attributes */
export type HeadingAttributes = BaseAttributes & DataAttributes;

/** Link attributes */
export interface LinkAttributes extends BaseAttributes {
  /** HREF attribute */
  readonly href?: string;
  /** Target attribute */
  readonly target?: "_blank" | "_self" | "_parent" | "_top";
  /** Rel attribute */
  readonly rel?: string;
}

/** Element reference */
export interface ElementRef {
  /** Current element */
  readonly current: Element | null;
}

/** Plugin context */
export interface PluginContext {
  /** File path */
  readonly filePath?: string;
  /** Base URL */
  readonly baseUrl?: string;
  /** Additional data */
  readonly data?: Record<string, unknown>;
}
