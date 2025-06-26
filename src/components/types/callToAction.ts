// Call to Action Types
import type { ButtonType } from ".";

/** Available call to action variants */
export const CALL_TO_ACTION_VARIANTS = [
  "default",
  "accent",
  "outline",
  "ghost",
  "subtle",
  "text",
  "link",
  "icon",
] as const;

/** Call to action variant type */
export type CallToActionVariant = (typeof CALL_TO_ACTION_VARIANTS)[number];

/** Call to action configuration */
export interface CallToAction {
  /** Visual style variant */
  readonly variant?: CallToActionVariant;
  /** Button text */
  readonly text?: string;
  /** Icon identifier */
  readonly icon?: string;
  /** Additional CSS classes */
  readonly class?: string;
  /** HTML button type */
  readonly type?: ButtonType;
  /** Open in new tab flag */
  readonly newTab?: boolean;
  /** Link destination URL */
  readonly href?: string;
  /** Whether the button is disabled */
  readonly disabled?: boolean;
  /** Whether to use full width */
  readonly fullWidth?: boolean;
  /** Whether to show loading state */
  readonly loading?: boolean;
  /** Accessible label */
  readonly ariaLabel?: string;
  /** Icon position (start or end) */
  readonly iconPosition?: "start" | "end";
}
