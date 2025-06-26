import { LOCALE } from "@/config";

/**
 * Valid input types for date operations
 */
export type DateInput = string | Date | number;

/**
 * Locale configuration interface
 */
export interface LocaleConfig {
  /** Primary language code */
  readonly lang: string;

  /** BCP 47 language tags for better SEO */
  readonly langTag: readonly string[];
}

/**
 * Date formatting options
 */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

/**
 * Cache for date formatters to improve performance
 */
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Gets or creates a cached date formatter for consistent formatting
 * @param options - Formatting options for the date
 * @returns A date formatter instance
 */
const getDateFormatter = (
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  // Resolve locale from configuration
  const locale = resolveLocale();

  // Create cache key from locale and options
  const key = JSON.stringify({ locale, ...options });

  // Return cached formatter or create new one
  let formatter = dateFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatterCache.set(key, formatter);
  }

  return formatter;
};

/**
 * Resolves the locale from configuration
 * @returns Resolved locale string
 */
const resolveLocale = (): string => {
  if (typeof LOCALE.langTag === "string") {
    return LOCALE.langTag;
  }

  if (Array.isArray(LOCALE.langTag) && LOCALE.langTag.length > 0) {
    return LOCALE.langTag[0];
  }

  // Fallback to default locale
  return "en-US";
};

/**
 * Creates a safe Date object from various input types
 * @param input - Date input (string, Date object, or timestamp)
 * @returns Valid Date object
 * @throws Error if input cannot be converted to a valid date
 */
export const createSafeDate = (input: DateInput): Date => {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${input}`);
  }

  return date;
};

/**
 * Formats a date string according to locale settings
 * @param date - Date input (string or Date object)
 * @returns Formatted date string
 * @throws Error if formatting fails
 */
export const formatDate = (date: DateInput): string => {
  try {
    const safeDate = createSafeDate(date);
    const formatter = getDateFormatter(DATE_FORMAT_OPTIONS);
    return formatter.format(safeDate);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to format date: ${errorMessage}`);
  }
};
