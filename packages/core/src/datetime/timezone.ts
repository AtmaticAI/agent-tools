import { DateTime } from 'luxon';
import type { TimezoneConvertResult } from './types';

export function convertTimezone(
  input: string,
  fromTimezone: string,
  toTimezone: string
): TimezoneConvertResult {
  const dtFrom = DateTime.fromISO(input, { zone: fromTimezone });
  if (!dtFrom.isValid) {
    throw new Error(`Unable to parse date: ${input} in timezone ${fromTimezone}`);
  }

  const dtTo = dtFrom.setZone(toTimezone);
  if (!dtTo.isValid) {
    throw new Error(`Invalid target timezone: ${toTimezone}`);
  }

  const offsetFrom = dtFrom.offset;
  const offsetTo = dtTo.offset;
  const diffMinutes = offsetTo - offsetFrom;
  const sign = diffMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(diffMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  return {
    input: dtFrom.toISO()!,
    inputTimezone: fromTimezone,
    output: dtTo.toISO()!,
    outputTimezone: toTimezone,
    offsetDifference: `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
  };
}

export function listTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}
