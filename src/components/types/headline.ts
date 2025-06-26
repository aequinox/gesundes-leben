import type { CSSClasses } from ".";

/** Headline component properties */
export interface Headline {
  /** Main title text */
  readonly title: string;
  /** Secondary subtitle text */
  readonly subtitle?: string;
  /** Small text above the title */
  readonly tagline?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}
