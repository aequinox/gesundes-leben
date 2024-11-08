import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";
import { Icon } from "astro-icon/components";

/**
 * Component props interface with strict typing
 */
interface Props extends DateTimeInput {
  /** Size variant for the component */
  size?: "sm" | "lg";
  /** Additional CSS classes */
  className?: string;
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
  const iconName = `tabler:calendar-${isUpdated ? "time" : "month"}`;
  const ariaLabel = isUpdated ? localeStrings.updated : localeStrings.published;

  // Precompute classes for better performance
  const iconClasses = {
    "inline-block": true,
    "fill-skin-base": true,
    "scale-90": size === "sm",
    "scale-100": size !== "sm",
    "h-6": true,
    "w-6": true,
    "min-w-[1.5rem]": true,
  };

  const textClasses = ["italic", size === "sm" ? "text-sm" : "text-base"].join(
    " "
  );

  return (
    <div
      className={`flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <Icon
        name={iconName}
        class:list={iconClasses}
        aria-hidden="true"
        role="presentation"
      />
      <span className={textClasses}>
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
      </span>
    </div>
  );
}
