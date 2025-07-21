import type { CallToAction } from "./callToAction";
import type { Headline } from "./headline";
import type { Item } from "./item";
import type { ImageSource, Video } from "./media";
import type { Widget } from "./widget";

/** Features section configuration */
export interface Features extends Omit<Headline, "classes">, Widget {
  /** Feature image */
  readonly image?: ImageSource;
  /** Feature video */
  readonly video?: Video;
  /** Feature items */
  readonly items?: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  readonly defaultIcon?: string;
  /** Primary call to action */
  readonly callToAction1?: CallToAction;
  /** Secondary call to action */
  readonly callToAction2?: CallToAction;
  /** Whether to reverse layout */
  readonly isReversed?: boolean;
  /** Whether content comes before */
  readonly isBeforeContent?: boolean;
  /** Whether content comes after */
  readonly isAfterContent?: boolean;
}
