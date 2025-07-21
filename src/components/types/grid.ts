// Grid Types
import type { CSSClasses } from "./css";
import type { Item } from "./item";

/** Item grid configuration */
export interface ItemGrid {
  /** Grid items */
  readonly items: readonly Item[];
  /** Number of columns */
  readonly columns?: 1 | 2 | 3 | 4;
  /** Default icon for items */
  readonly defaultIcon?: string;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}
