import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";

export interface FormattedDateTime {
  dt: Date;
  date: string;
  time: string;
}

// Cache for date formatters to improve performance
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Gets or creates a cached date formatter
 * @param options - Intl.DateTimeFormatOptions
 * @returns Cached formatter instance
 */
function getDateFormatter(
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = JSON.stringify({ locale: LOCALE.langTag, ...options });
  let formatter = dateFormatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE.langTag, options);
    dateFormatterCache.set(key, formatter);
  }

  return formatter;
}

// Export for testing
export { dateFormatterCache, getDateFormatter };

// Reusable date format options
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
} as const;

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
} as const;

/**
 * Safely creates a Date object from various input types
 * @param input - Date input (string, Date, or number)
 * @returns Valid Date object
 * @throws {Error} If input is invalid
 */
function createSafeDate(input: string | Date | number): Date {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${input}`);
  }

  return date;
}

/**
 * Formats a date and time according to locale settings
 * @param input - Datetime input containing publication and modification dates
 * @returns Formatted date and time object
 * @throws {Error} If neither pubDatetime nor modDatetime is valid
 */
export function formattedDateTime({
  pubDatetime,
  modDatetime,
}: DateTimeInput): FormattedDateTime {
  if (!pubDatetime) {
    throw new Error("Publication date is required");
  }

  try {
    const pubDate = createSafeDate(pubDatetime);
    const modDate = modDatetime ? createSafeDate(modDatetime) : null;

    // Use modification date if it exists and is newer than publication date
    const dt = modDate && modDate > pubDate ? modDate : pubDate;

    const dateFormatter = getDateFormatter(DATE_FORMAT_OPTIONS);
    const timeFormatter = getDateFormatter(TIME_FORMAT_OPTIONS);

    return {
      dt,
      date: dateFormatter.format(dt),
      time: timeFormatter.format(dt),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to format datetime: ${errorMessage}`);
  }
}

/**
 * Formats a date string according to locale settings
 * @param date - Date string or Date object to format
 * @returns Formatted date string
 * @throws {Error} If the date is invalid
 */
export function formatDate(date: string | Date): string {
  try {
    const safeDate = createSafeDate(date);
    const formatter = getDateFormatter(DATE_FORMAT_OPTIONS);
    return formatter.format(safeDate);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to format date: ${errorMessage}`);
  }
}

/**
 * Formats a time string according to locale settings
 * @param date - Date string or Date object to format
 * @returns Formatted time string
 * @throws {Error} If the date is invalid
 */
export function formatTime(date: string | Date): string {
  try {
    const safeDate = createSafeDate(date);
    const formatter = getDateFormatter(TIME_FORMAT_OPTIONS);
    return formatter.format(safeDate);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to format time: ${errorMessage}`);
  }
}
