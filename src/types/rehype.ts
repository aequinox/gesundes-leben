import type { Properties, Element, Root } from "hast";

export interface HeadingWrapperProps {
  readonly tagName: string;
}

export interface SVGProperties extends Properties {
  readonly width?: number;
  readonly height?: number;
  readonly version?: number;
  readonly viewBox?: string;
  readonly xmlns?: string;
  readonly class?: string;
  [key: string]: any;
}

export interface PathProperties extends Properties {
  readonly fillRule?: "evenodd";
  readonly fill?: string;
  readonly d?: string;
  [key: string]: any;
}

export interface SRLabelProperties extends Properties {
  readonly "aria-label"?: string;
  readonly "is:raw"?: boolean;
  [key: string]: any;
}

export interface AnchorIconProperties extends Properties {
  readonly ariaHidden?: string;
  [key: string]: any;
}

export interface AutolinkConfig {
  readonly behavior: "append" | "prepend" | "wrap" | "before" | "after";
  readonly group: (props: HeadingWrapperProps) => Element;
  readonly content: (heading: Element) => (Element | Root)[];
}
