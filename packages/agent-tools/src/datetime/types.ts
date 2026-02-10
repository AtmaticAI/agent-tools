export interface DateTimeFormatOptions {
  format?: string;
  timezone?: string;
  locale?: string;
}

export interface DateTimeDiffResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalMilliseconds: number;
}

export interface TimezoneConvertResult {
  input: string;
  inputTimezone: string;
  output: string;
  outputTimezone: string;
  offsetDifference: string;
}

export interface CronParseResult {
  valid: boolean;
  description: string;
  nextRuns: string[];
  error?: string;
}

export interface DateTimeAddOptions {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface DateTimeInfo {
  iso: string;
  unix: number;
  unixMs: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
  isLeapYear: boolean;
  timezone: string;
  offset: string;
}
