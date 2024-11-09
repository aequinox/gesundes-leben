import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";
import { IconCalendarTime, IconCalendarMonth } from "@tabler/icons-react";

/**
 * Component props interface with strict typing
 */
interface Props extends DateTimeInput {
  /** Size variant for the component */
  size?: "sm" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Publication datetime */
  pubDatetime: string | Date;
  /** Modification datetime */
  modDatetime?: string | Date;
}

/**
 * Locale-specific strings for i18n
 */
const localeStrings = {
  published: LOCALE.lang === "en" ? "Published on" : "Veröffentlicht am",
  updated: LOCALE.lang === "en" ? "Updated on" : "Aktualisiert am",
  at: LOCALE.lang === "en" ? "at" : "um",
} as const;

/**
 * Formats a datetime value according to the current locale
 */
const FormattedDatetime = ({
  pubDatetime,
  modDatetime,
}: DateTimeInput): JSX.Element => {
  const myDatetime = new Date(
    modDatetime && modDatetime > new Date(pubDatetime)
      ? modDatetime
      : pubDatetime
  );

  const date = myDatetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const time = myDatetime.toLocaleTimeString(LOCALE.langTag, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <time
        dateTime={myDatetime.toISOString()}
        title={myDatetime.toLocaleString(LOCALE.langTag)}
      >
        {date}
      </time>
      <span aria-hidden="true" className="select-none">
        {" "}
        |{" "}
      </span>
      <span className="sr-only">{localeStrings.at}</span>
      <span className="text-nowrap">{time}</span>
    </>
  );
};

/**
 * Datetime component that displays a formatted date and time with an icon
 */
export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
}: Props): JSX.Element {
  const isUpdated =
    modDatetime && new Date(modDatetime) > new Date(pubDatetime);
  const ariaLabel = isUpdated ? localeStrings.updated : localeStrings.published;

  // Precompute classes for better performance
  const iconClasses = [
    "inline-block",
    "fill-skin-basex bg-indigo-500",
    size === "sm" ? "scale-90" : "scale-100",
    "h-6",
    "w-6",
    "min-w-[1.5rem]",
  ].join(" ");

  const textClasses = ["italic", size === "sm" ? "text-sm" : "text-base"].join(
    " "
  );

  return (
    <div
      className={`icon-tabler flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {isUpdated ? (
        <IconCalendarTime
          stroke={2}
          className={iconClasses}
          aria-hidden="true"
          role="presentation"
        />
      ) : (
        <IconCalendarMonth
          stroke={2}
          className={iconClasses}
          aria-hidden="true"
          role="presentation"
        />
      )}
      <span className={textClasses}>
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
      </span>
    </div>
  );
}
