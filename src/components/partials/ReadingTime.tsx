import { LOCALE } from "@/config";
import { IconClock } from "@tabler/icons-react";

/**
 * Component props interface with strict typing
 */
interface Props {
  /** Reading time in minutes */
  readingTime?: number;
  /** Size variant for the component */
  size?: "sm" | "lg";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Locale-specific strings for i18n
 */
const localeStrings = {
  minutes: LOCALE.lang === "en" ? "minutes" : "Minuten",
  readingTime: LOCALE.lang === "en" ? "reading time" : "Lesezeit",
} as const;

/**
 * ReadingTime component that displays estimated reading time with an icon
 */
export default function ReadingTime({
  readingTime,
  size = "sm",
  className = "",
}: Props): JSX.Element | null {
  if (!readingTime) return null;

  // Precompute classes for better performance
  const iconClasses = {
    "inline-block": true,
    "fill-skin-base": true,
    "h-5": size === "sm",
    "w-5": size === "sm",
    "scale-100": size !== "sm",
    "min-w-[1.25rem]": true,
  };

  const textClasses = ["italic", size === "sm" ? "text-sm" : "text-base"].join(
    " "
  );

  const ariaLabel = `${readingTime} ${localeStrings.minutes} ${localeStrings.readingTime}`;

  return (
    <div
      className={`icon-tabler flex items-center gap-1 opacity-80 transition-opacity hover:opacity-100 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <IconClock
        stroke={2}
        className={Object.entries(iconClasses)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(" ")}
        aria-hidden="true"
        role="presentation"
      />
      <span className={textClasses}>
        {readingTime}&nbsp;{localeStrings.minutes}
      </span>
    </div>
  );
}
