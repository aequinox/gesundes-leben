import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";

export interface FormattedDateTime {
  dt: Date;
  date: string;
  time: string;
}

/**
 * Formats a date and time according to locale settings.
 * @param input - Datetime input containing publication and modification dates.
 * @returns Formatted date and time object.
 * @throws {Error} If neither pubDatetime nor modDatetime is valid.
 */
export const formattedDateTime = ({
  pubDatetime,
  modDatetime,
}: DateTimeInput): FormattedDateTime => {
  // Validate input dates
  const pubDate = new Date(pubDatetime);
  const modDate = modDatetime ? new Date(modDatetime) : null;

  if (isNaN(pubDate.getTime())) {
    throw new Error('Invalid publication date');
  }

  if (modDate && isNaN(modDate.getTime())) {
    throw new Error('Invalid modification date');
  }

  // Use modification date if it exists and is newer than publication date
  const dt = modDate && modDate > pubDate ? modDate : pubDate;

  // Format date according to locale
  const date = dt.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Format time according to locale
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

/**
 * Formats a date string according to locale settings.
 * @param date - Date string or Date object to format.
 * @returns Formatted date string.
 * @throws {Error} If the date is invalid.
 */
export const formatDate = (date: string | Date): string => {
  const dt = new Date(date);
  
  if (isNaN(dt.getTime())) {
    throw new Error('Invalid date');
  }

  return dt.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a time string according to locale settings.
 * @param date - Date string or Date object to format.
 * @returns Formatted time string.
 * @throws {Error} If the date is invalid.
 */
export const formatTime = (date: string | Date): string => {
  const dt = new Date(date);
  
  if (isNaN(dt.getTime())) {
    throw new Error('Invalid date');
  }

  return dt.toLocaleTimeString(LOCALE.langTag, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
