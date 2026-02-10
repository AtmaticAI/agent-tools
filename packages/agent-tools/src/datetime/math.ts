import { DateTime } from 'luxon';
import type { DateTimeAddOptions, DateTimeDiffResult } from './types';

export function add(
  input: string,
  amount: DateTimeAddOptions,
  timezone?: string
): string {
  const dt = DateTime.fromISO(input, { zone: timezone ?? 'utc' });
  if (!dt.isValid) {
    throw new Error(`Unable to parse date: ${input}`);
  }

  const result = dt.plus(amount);
  return result.toISO()!;
}

export function subtract(
  input: string,
  amount: DateTimeAddOptions,
  timezone?: string
): string {
  const dt = DateTime.fromISO(input, { zone: timezone ?? 'utc' });
  if (!dt.isValid) {
    throw new Error(`Unable to parse date: ${input}`);
  }

  const result = dt.minus(amount);
  return result.toISO()!;
}

export function diff(
  a: string,
  b: string
): DateTimeDiffResult {
  const dtA = DateTime.fromISO(a, { zone: 'utc' });
  const dtB = DateTime.fromISO(b, { zone: 'utc' });

  if (!dtA.isValid || !dtB.isValid) {
    throw new Error('Unable to parse one or both dates');
  }

  const duration = dtB.diff(dtA, [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
  ]);

  const totalMs = dtB.toMillis() - dtA.toMillis();

  return {
    years: Math.floor(duration.years),
    months: Math.floor(duration.months),
    days: Math.floor(duration.days),
    hours: Math.floor(duration.hours),
    minutes: Math.floor(duration.minutes),
    seconds: Math.floor(duration.seconds),
    totalDays: Math.floor(totalMs / 86400000),
    totalHours: Math.floor(totalMs / 3600000),
    totalMinutes: Math.floor(totalMs / 60000),
    totalSeconds: Math.floor(totalMs / 1000),
    totalMilliseconds: totalMs,
  };
}
