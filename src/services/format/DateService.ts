/**
 * @module DateService
 * @description
 * Service for date formatting and manipulation with locale support.
 * Provides a consistent API for date operations throughout the application.
 */

import { LOCALE } from "@/config";
import type { DateTimeInput } from "@/types/datetime";
import type { IConfigService } from "@/core/config/ConfigService";
import { configService } from "@/core/config/ConfigService";

/**
 * Represents a formatted date and time with consistent structure
 */
export interface FormattedDateTime {
  dt: Date;
  date: string;
  time: string;
}

/**
 * Interface for date service operations
 */
export interface IDateService {
  /**
   * Format a date and time according to locale settings
   */
  formatDateTime(input: DateTimeInput): FormattedDateTime;

  /**
   * Format a date string according to locale settings
   */
  formatDate(date: string | Date): string;

  /**
   * Format a time string according to locale settings
   */
  formatTime(date: string | Date): string;

  /**
   * Create a safe date object from various input types
   */
  createSafeDate(input: string | Date | number): Date;
}

/**
 * Implementation of the date service
 */
export class DateService implements IDateService {
  private dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

  private readonly DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  private readonly TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  constructor(private config: IConfigService = configService) {}

  /**
   * Gets or creates a cached date formatter for consistent formatting
   */
  private getDateFormatter(
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat {
    // Ensure locale is a string
    const locale =
      typeof LOCALE.langTag === "string"
        ? LOCALE.langTag
        : Array.isArray(LOCALE.langTag)
          ? LOCALE.langTag[0]
          : "en-US";

    const key = JSON.stringify({ locale, ...options });
    let formatter = this.dateFormatterCache.get(key);

    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, options);
      this.dateFormatterCache.set(key, formatter);
    }

    return formatter;
  }

  /**
   * Create a safe date object from various input types
   */
  createSafeDate(input: string | Date | number): Date {
    const date = input instanceof Date ? input : new Date(input);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date input: ${input}`);
    }

    return date;
  }

  /**
   * Format a date and time according to locale settings
   */
  formatDateTime(input: DateTimeInput): FormattedDateTime {
    if (!input.pubDatetime) {
      throw new Error("Publication date is required");
    }

    try {
      const pubDate = this.createSafeDate(input.pubDatetime);
      const modDate = input.modDatetime
        ? this.createSafeDate(input.modDatetime)
        : null;

      // Use modification date if it exists and is newer than publication date
      const dt = modDate && modDate > pubDate ? modDate : pubDate;

      const dateFormatter = this.getDateFormatter(this.DATE_FORMAT_OPTIONS);
      const timeFormatter = this.getDateFormatter(this.TIME_FORMAT_OPTIONS);

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
   * Format a date string according to locale settings
   */
  formatDate(date: string | Date): string {
    try {
      const safeDate = this.createSafeDate(date);
      const formatter = this.getDateFormatter(this.DATE_FORMAT_OPTIONS);
      return formatter.format(safeDate);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to format date: ${errorMessage}`);
    }
  }

  /**
   * Format a time string according to locale settings
   */
  formatTime(date: string | Date): string {
    try {
      const safeDate = this.createSafeDate(date);
      const formatter = this.getDateFormatter(this.TIME_FORMAT_OPTIONS);
      return formatter.format(safeDate);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to format time: ${errorMessage}`);
    }
  }
}

// Export singleton instance for convenience
export const dateService = new DateService();
