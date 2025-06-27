import type { 
  InteractiveComponentProps, 
  NavigationComponentProps, 
  SizeVariant, 
  ShapeVariant 
} from "./base";

/** Available button types */
export const BUTTON_TYPES = ["button", "submit", "reset"] as const;

/** Button type */
export type ButtonType = (typeof BUTTON_TYPES)[number];

/** Button visual variants */
export const BUTTON_VARIANTS = [
  "default",
  "accent", 
  "outline",
  "ghost",
  "subtle",
  "text",
  "link",
  "icon"
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Extended button props that combine interactive and navigation capabilities */
export interface ButtonProps extends InteractiveComponentProps, 
  Partial<NavigationComponentProps> {
  /** Visual style variant */
  variant?: ButtonVariant;
  
  /** Size variant */
  size?: SizeVariant;
  
  /** Shape variant */
  shape?: ShapeVariant;
  
  /** Button/link text content */
  text?: string;
  
  /** Icon identifier from astro-icon */
  icon?: string;
  
  /** Icon position relative to text */
  iconPosition?: "start" | "end";
  
  /** HTML button type */
  type?: ButtonType;
  
  /** Whether to use full width */
  fullWidth?: boolean;
}
