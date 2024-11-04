import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";

/**
 * Formats a date and time.
 * @param input - Datetime input.
 * @returns Formatted date and time.
 */
export const formattedDateTime = ({
  pubDatetime,
  modDatetime,
}: DateTimeInput) => {
  const dt = new Date(
    modDatetime && new Date(modDatetime) > new Date(pubDatetime)
      ? modDatetime
      : pubDatetime
  );

  const date = dt.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const time = dt.toLocaleTimeString(LOCALE.langTag, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    dt,
    date,
    time,
  };
};
