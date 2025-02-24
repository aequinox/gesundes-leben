/**
 * @module getFormattedDate
 * @description
 * Provides utilities for formatting dates and times according to locale settings.
 * Implements caching strategies for improved performance and consistent formatting.
 *
 * @example
 * ```typescript
 * import { formatDate, formatTime } from './utils/getFormattedDate';
 *
 * const date = formatDate('2024-02-24');
 * const time = formatTime('2024-02-24T15:30:00');
 * ```
 */

import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";

/**
 * Represents a formatted date and time with consistent structure.
 *
 * @property dt - JavaScript Date object
 * @property date - Formatted date string
 * @property time - Formatted time string
 */
export interface FormattedDateTime {
  dt: Date;
  date: string;
  time: string;
}

/**
 * Cache for date formatters to improve performance.
 * Stores Intl.DateTimeFormat instances keyed by their configuration.
 *
 * @internal
 */
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Gets or creates a cached date formatter for consistent formatting.
 * Uses memoization to improve performance by reusing formatter instances.
 *
 * @param options - Configuration options for the formatter
 * @returns Cached Intl.DateTimeFormat instance
 *
 * @example
 * ```typescript
 * const formatter = getDateFormatter({
 *   year: 'numeric',
 *   month: 'short',
 *   day: 'numeric'
 * });
 * ```
 * @internal
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

/**
 * Default options for date formatting.
 * Provides a consistent date format across the application.
 *
 * @constant
 * @internal
 */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
} as const;

/**
 * Default options for time formatting.
 * Provides a consistent time format across the application.
 *
 * @constant
 * @internal
 */
const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
} as const;

/**
 * Safely creates a Date object from various input types.
 * Provides input validation and consistent error handling.
 *
 * @param input - Date input in various formats
 * @returns Valid JavaScript Date object
 * @throws {Error} If input cannot be converted to a valid date
 *
 * @example
 * ```typescript
 * const date1 = createSafeDate('2024-02-24');
 * const date2 = createSafeDate(new Date());
 * const date3 = createSafeDate(1708809600000);
 * ```
 * @internal
 */
function createSafeDate(input: string | Date | number): Date {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${input}`);
  }

  return date;
}

/**
 * Formats a date and time according to locale settings.
 * Handles both publication and modification dates for content.
 *
 * @param input - Object containing publication and optional modification dates
 * @returns Formatted date and time object with consistent structure
 * @throws {Error} If publication date is missing or invalid
 *
 * @example
 * ```typescript
 * const formatted = formattedDateTime({
 *   pubDatetime: '2024-02-24',
 *   modDatetime: '2024-02-25'
 * });
 * // Returns: { dt: Date, date: '24 Feb 2024', time: '15:30' }
 * ```
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
 * Formats a date string according to locale settings.
 * Provides consistent date formatting across the application.
 *
 * @param date - Date to format (string or Date object)
 * @returns Locale-aware formatted date string
 * @throws {Error} If the date is invalid or cannot be formatted
 *
 * @example
 * ```typescript
 * const formatted = formatDate('2024-02-24');
 * // Returns: '24 Feb 2024'
 * ```
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
 * Formats a time string according to locale settings.
 * Provides consistent time formatting across the application.
 *
 * @param date - Date to format (string or Date object)
 * @returns Locale-aware formatted time string
 * @throws {Error} If the date is invalid or cannot be formatted
 *
 * @example
 * ```typescript
 * const formatted = formatTime('2024-02-24T15:30:00');
 * // Returns: '15:30'
 * ```
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
