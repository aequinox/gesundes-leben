import { format, parseISO, isValid, parse } from 'date-fns';
import { ConversionError } from '../../errors';
import { custom_date_formatting, include_time_with_date } from '../../settings';

/**
 * Format a date from various formats according to settings
 *
 * @param dateStr - Date string in RFC2822 or ISO format
 * @param fieldName - Name of the date field for error messages
 * @returns Formatted date string
 * @throws ConversionError When date parsing fails
 */
export function formatDate(dateStr: string, fieldName: string): string {
  try {
    // Try to parse the date as ISO first
    let parsedDate = parseISO(dateStr);
    
    // If ISO parsing fails, try RFC2822 format (WordPress export format)
    if (!isValid(parsedDate)) {
      // RFC2822 format example: "Fri, 28 Mar 2025 13:00:16 +0000"
      // Try to parse with a pattern that matches this format
      try {
        parsedDate = parse(dateStr, 'EEE, dd MMM yyyy HH:mm:ss xxxx', new Date());
      } catch (parseError) {
        // If that fails too, try another common WordPress format
        try {
          parsedDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
        } catch (parseError2) {
          // If all parsing attempts fail, throw an error
          throw new ConversionError(`Invalid ${fieldName} format: ${dateStr}`);
        }
      }
    }

    // Validate the parsed date
    if (!isValid(parsedDate)) {
      throw new ConversionError(`Invalid ${fieldName} format: ${dateStr}`);
    }

    // Apply custom formatting based on settings
    return applyCustomFormatting(parsedDate, fieldName);
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw new ConversionError(`Failed to process ${fieldName}`, error);
  }
}

/**
 * Apply custom date formatting based on settings
 *
 * @param date - Date object to format
 * @param fieldName - Name of the date field for error messages
 * @returns Formatted date string
 */
function applyCustomFormatting(date: Date, fieldName: string): string {
  if (custom_date_formatting) {
    return format(date, custom_date_formatting);
  } else if (include_time_with_date) {
    return date.toISOString();
  } else {
    return date.toISOString().split('T')[0];
  }
}
