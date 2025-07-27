/**
 * Button Class Builder
 *
 * Utility for building button CSS classes based on props.
 * Centralizes class composition logic.
 *
 * Single Responsibility: CSS class composition
 */
import {
  animationStyles,
  buttonBaseClasses,
  cn,
  focusStyles,
} from "@/utils/ui/designSystem";

import {
  shapeClasses,
  sizeClasses,
  stateClasses,
  variantClasses,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from "./ButtonVariants";

export interface ButtonClassOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  shape: ButtonShape;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
  className?: string;
}

/**
 * Builds the complete CSS class string for a button
 */
export function buildButtonClasses(options: ButtonClassOptions): string {
  const {
    variant,
    size,
    shape,
    disabled,
    loading,
    fullWidth,
    className = "",
  } = options;

  // Base classes that apply to all buttons
  const baseClasses = [
    ...buttonBaseClasses,
    ...animationStyles.transitions.all,
    ...focusStyles.ring,
    ...animationStyles.hover.lift,
    ...animationStyles.motionSafe,
  ];

  // Variant-specific classes
  const variantSpecificClasses =
    variantClasses[variant] || variantClasses.default;

  // Size-specific classes (but not for 'link' variant which has its own sizing)
  const sizeSpecificClasses = variant === "link" ? [] : sizeClasses[size];

  // Shape-specific classes (only if not default, to avoid overriding size classes)
  const shapeSpecificClasses = shape === "default" ? [] : shapeClasses[shape];

  // State classes
  const stateSpecificClasses = [
    ...(disabled ? stateClasses.disabled : []),
    ...(loading ? stateClasses.loading : []),
    ...(fullWidth ? stateClasses.fullWidth : []),
  ];

  // Combine all classes
  return cn(
    baseClasses,
    variantSpecificClasses,
    sizeSpecificClasses,
    shapeSpecificClasses,
    stateSpecificClasses,
    className
  );
}
