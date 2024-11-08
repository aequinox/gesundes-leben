/**
 * Date and time related type definitions.
 * @module datetime
 */

/** Valid date input types */
export type DateInput = string | Date | null | undefined;

/** Date-time input configuration */
export interface DateTimeInput {
  /** Publication datetime */
  readonly pubDatetime: string | Date;
  /** Modification datetime */
  readonly modDatetime?: DateInput;
}

/** Formatted date-time output */
export interface FormattedDateTime {
  /** JavaScript Date object */
  readonly datetime: Date;
  /** Formatted date string */
  readonly date: string;
  /** Formatted time string */
  readonly time: string;
  /** ISO 8601 string */
  readonly isoString: string;
  /** Unix timestamp */
  readonly timestamp: number;
  /** Relative time (e.g., "2 hours ago") */
  readonly relative?: string;
}

/** Date formatting options */
export interface DateFormatOptions {
  /** Year format */
  readonly year: "numeric" | "2-digit";
  /** Month format */
  readonly month: "numeric" | "2-digit" | "long" | "short" | "narrow";
  /** Day format */
  readonly day: "numeric" | "2-digit";
  /** Locale identifier */
  readonly locale?: string;
  /** Time zone */
  readonly timeZone?: string;
}

/** Time formatting options */
export interface TimeFormatOptions {
  /** Hour format */
  readonly hour: "numeric" | "2-digit";
  /** Minute format */
  readonly minute: "numeric" | "2-digit";
  /** Second format */
  readonly second?: "numeric" | "2-digit";
  /** Hour12 flag */
  readonly hour12?: boolean;
  /** Locale identifier */
  readonly locale?: string;
  /** Time zone */
  readonly timeZone?: string;
}

/** Date range configuration */
export interface DateRange {
  /** Start date */
  readonly start: Date;
  /** End date */
  readonly end: Date;
  /** Optional label */
  readonly label?: string;
}

/** Date comparison operators */
export const enum DateComparisonOperator {
  Before = "before",
  After = "after",
  Equal = "equal",
  NotEqual = "notEqual",
  Between = "between",
}

/** Date granularity options */
export const enum DateGranularity {
  Year = "year",
  Month = "month",
  Day = "day",
  Hour = "hour",
  Minute = "minute",
  Second = "second",
}

/** Relative time units */
export const enum RelativeTimeUnit {
  Years = "years",
  Months = "months",
  Weeks = "weeks",
  Days = "days",
  Hours = "hours",
  Minutes = "minutes",
  Seconds = "seconds",
}

/** Date-time validation rules */
export interface DateTimeValidation {
  /** Minimum allowed date */
  readonly min?: Date;
  /** Maximum allowed date */
  readonly max?: Date;
  /** Required flag */
  readonly required?: boolean;
  /** Granularity level */
  readonly granularity?: DateGranularity;
  /** Custom validation function */
  readonly validate?: (date: Date) => boolean;
}
