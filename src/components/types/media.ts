import type { ImageMetadata } from "astro";

// Media Types
/** Valid image source types */
export type ImageSource = string | ImageMetadata;

/** Image configuration */
export interface Image {
  /** Image source URL or metadata */
  readonly src: ImageSource;
  /** Alt text for accessibility */
  readonly alt: string;
  /** Optional width */
  readonly width?: number;
  /** Optional height */
  readonly height?: number;
  /** Optional loading strategy */
  readonly loading?: "lazy" | "eager";
}

/** Video configuration */
export interface Video {
  /** Video source URL */
  readonly src: string;
  /** Video MIME type */
  readonly type?: string;
  /** Autoplay flag */
  readonly autoplay?: boolean;
  /** Loop flag */
  readonly loop?: boolean;
  /** Muted flag */
  readonly muted?: boolean;
  /** Controls flag */
  readonly controls?: boolean;
}
