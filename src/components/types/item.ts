import type { CallToAction, CSSClasses, Image } from ".";

/** Generic item configuration */
export interface Item {
  /** Item title */
  readonly title: string;
  /** Item description */
  readonly description?: string;
  /** Icon identifier */
  readonly icon?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
  /** Call to action button */
  readonly callToAction?: CallToAction;
  /** Associated image */
  readonly image?: Image;
}
