/**
 * Shared Helper Utilities for Linking System
 *
 * Provides common operations used across linking services:
 * - Array manipulation (grouping, sorting, filtering)
 * - Time utilities (date formatting, grouping)
 * - Data aggregation
 *
 * Single Responsibility: Reusable helper functions
 */

import type { DailyGroup } from "./types";

/**
 * Group array items by a key
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Get top N items by score
 */
export function topN<T>(
  items: T[],
  n: number,
  scoreFn: (item: T) => number
): T[] {
  return [...items].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, n);
}

/**
 * Count occurrences of items
 */
export function countBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, number> {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

/**
 * Convert counts object to sorted array
 */
export function countsToArray(
  counts: Record<string, number>,
  limit?: number
): Array<{ key: string; count: number }> {
  const array = Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  return limit ? array.slice(0, limit) : array;
}

/**
 * Group items by field value
 */
export function groupByField<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T
): Record<string, T[]> {
  return groupBy(items, (item) => String(item[field] || "unknown"));
}

/**
 * Count items by field value
 */
export function countByField<T extends Record<string, unknown>>(
  items: T[],
  field: keyof T
): Record<string, number> {
  return countBy(items, (item) => String(item[field] || "unknown"));
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate average
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimals
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if timestamp is within time range (days)
 */
export function isWithinTimeframe(timestamp: number, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return timestamp >= cutoff;
}

/**
 * Group events by day
 */
export function groupByDay<T extends { timestamp: number }>(
  events: T[]
): DailyGroup<T>[] {
  const grouped = groupBy(events, (event) => formatDate(event.timestamp));

  return Object.entries(grouped)
    .map(([date, dayEvents]) => ({
      date,
      events: dayEvents,
      count: dayEvents.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate click-through rate
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return percentage(clicks, impressions);
}

/**
 * Get unique values from array
 */
export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/**
 * Get unique values by key function
 */
export function uniqueBy<T>(
  items: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((flat, array) => [...flat, ...array], []);
}

/**
 * Remove duplicates from array of objects by key
 */
export function deduplicateBy<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T
): T[] {
  return uniqueBy(items, (item) => String(item[key]));
}

/**
 * Sort by multiple keys
 */
export function sortBy<T>(
  items: T[],
  compareFns: Array<(a: T, b: T) => number>
): T[] {
  return [...items].sort((a, b) => {
    for (const compareFn of compareFns) {
      const result = compareFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Create compare function for sorting by field
 */
export function compareBy<T>(
  field: keyof T,
  order: "asc" | "desc" = "asc"
): (a: T, b: T) => number {
  return (a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === bVal) return 0;

    let result = 0;
    if (aVal < bVal) result = -1;
    if (aVal > bVal) result = 1;

    return order === "desc" ? -result : result;
  };
}

/**
 * Calculate median
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = average(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = average(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

/**
 * Safe division (returns 0 if divisor is 0)
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate date range
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(formatDate(current.getTime()));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Fill missing dates in daily data with zeros
 */
export function fillMissingDates<T extends { date: string; count: number }>(
  data: T[],
  startDate: Date,
  endDate: Date,
  defaultValue: Omit<T, "date"> = { count: 0 } as Omit<T, "date">
): T[] {
  const dateRange = generateDateRange(startDate, endDate);
  const dataMap = new Map(data.map((item) => [item.date, item]));

  return dateRange.map((date) => {
    if (dataMap.has(date)) {
      return dataMap.get(date)!;
    }
    return { ...defaultValue, date } as T;
  });
}

/**
 * Export data to CSV string
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) return "";

  const keys = headers || (Object.keys(data[0]) as Array<keyof T>);
  const headerRow = keys.join(",");

  const rows = data.map((item) =>
    keys.map((key) => {
      const value = item[key as keyof T];
      // Escape values with commas or quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  );

  return [headerRow, ...rows].join("\n");
}

/**
 * Parse CSV string to objects
 */
export function parseCSV(csv: string): Array<Record<string, string>> {
  const lines = csv.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",");
  const data: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    data.push(obj);
  }

  return data;
}
