export interface DateTimeInput {
  readonly pubDatetime: string | Date;
  readonly modDatetime?: string | Date | null;
}

export interface FormattedDateTime {
  readonly datetime: Date;
  readonly date: string;
  readonly time: string;
  readonly isoString: string;
}

export interface DateTimeFormatOptions {
  readonly year: "numeric" | "2-digit";
  readonly month: "numeric" | "2-digit" | "long" | "short" | "narrow";
  readonly day: "numeric" | "2-digit";
}

export interface TimeFormatOptions {
  readonly hour: "numeric" | "2-digit";
  readonly minute: "numeric" | "2-digit";
  readonly second?: "numeric" | "2-digit";
}

export type DateInput = string | Date | null | undefined;

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}
