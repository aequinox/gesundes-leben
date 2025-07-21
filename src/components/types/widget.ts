// Widget Types
import type { CSSClasses } from "./css";

/** Available widget background styles */
export const WIDGET_BACKGROUNDS = [
  "default",
  "alternate",
  "primary",
  "secondary",
  "dark",
] as const;

/** Widget background type */
export type WidgetBackground = (typeof WIDGET_BACKGROUNDS)[number];

/** Base widget properties */
export interface Widget {
  /** Unique identifier */
  readonly id?: string;
  /** Dark mode flag */
  readonly isDark?: boolean;
  /** Background style */
  readonly bg?: WidgetBackground;
  /** Additional CSS classes */
  readonly classes?: CSSClasses;
}
