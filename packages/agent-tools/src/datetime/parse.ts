import { DateTime } from 'luxon';
import type { DateTimeInfo, DateTimeFormatOptions } from './types';

export function parseDate(
  input: string,
  timezone?: string
): DateTimeInfo {
  let dt: DateTime;

  const unixNum = Number(input);
  if (!isNaN(unixNum) && String(unixNum) === input.trim()) {
    dt = unixNum > 1e12
      ? DateTime.fromMillis(unixNum, { zone: timezone ?? 'utc' })
      : DateTime.fromSeconds(unixNum, { zone: timezone ?? 'utc' });
  } else {
    dt = DateTime.fromISO(input, { zone: timezone ?? 'utc' });
    if (!dt.isValid) {
      dt = DateTime.fromRFC2822(input, { zone: timezone ?? 'utc' });
    }
    if (!dt.isValid) {
      dt = DateTime.fromSQL(input, { zone: timezone ?? 'utc' });
    }
  }

  if (!dt.isValid) {
    throw new Error(`Unable to parse date: ${input} (${dt.invalidReason})`);
  }

  return {
    iso: dt.toISO()!,
    unix: Math.floor(dt.toSeconds()),
    unixMs: dt.toMillis(),
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
    second: dt.second,
    dayOfWeek: dt.weekdayLong!,
    dayOfYear: dt.ordinal,
    weekNumber: dt.weekNumber,
    isLeapYear: dt.isInLeapYear,
    timezone: dt.zoneName!,
    offset: dt.toFormat('ZZ'),
  };
}

export function formatDate(
  input: string,
  options: DateTimeFormatOptions = {}
): string {
  const tz = options.timezone ?? 'utc';
  let dt = DateTime.fromISO(input, { zone: tz });
  if (!dt.isValid) {
    dt = DateTime.fromMillis(Number(input), { zone: tz });
  }

  if (!dt.isValid) {
    throw new Error(`Unable to parse date: ${input}`);
  }

  if (options.format) {
    return dt.toFormat(options.format);
  }

  return dt.toISO()!;
}

export function now(timezone?: string): DateTimeInfo {
  const dt = DateTime.now().setZone(timezone ?? 'utc');
  return parseDate(dt.toISO()!, timezone);
}
