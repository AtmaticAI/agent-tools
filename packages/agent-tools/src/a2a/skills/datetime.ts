import * as datetime from '../../datetime';
import type { Skill, TaskInput, Part } from '../types';

export const datetimeSkill: Skill = {
  id: 'datetime-operations',
  name: 'Date/Time Processing',
  description:
    'Parse, format, compute, convert timezones, and analyze date/time values and cron expressions',
  tags: ['datetime', 'timezone', 'cron', 'format', 'parse'],
  examples: [
    'Parse this date string',
    'Format date as YYYY-MM-DD',
    'Get current time in UTC',
    'Add 30 days to a date',
    'Subtract 2 hours from a date',
    'Calculate difference between two dates',
    'Convert from UTC to America/New_York',
    'List all available timezones',
    'Parse a cron expression',
  ],
  inputModes: ['text/plain'],
  outputModes: ['text/plain', 'application/json'],
};

export async function handleDatetimeSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'parse': {
      const result = datetime.parseDate(
        data as string,
        options.timezone as string,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'format': {
      const result = datetime.formatDate(data as string, {
        format: options.format as string,
        timezone: options.timezone as string,
        locale: options.locale as string,
      });
      return [{ type: 'text', text: result }];
    }

    case 'now': {
      const result = datetime.now(options.timezone as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'add': {
      const result = datetime.add(
        data as string,
        {
          years: options.years as number,
          months: options.months as number,
          weeks: options.weeks as number,
          days: options.days as number,
          hours: options.hours as number,
          minutes: options.minutes as number,
          seconds: options.seconds as number,
        },
        options.timezone as string,
      );
      return [{ type: 'text', text: result }];
    }

    case 'subtract': {
      const result = datetime.subtract(
        data as string,
        {
          years: options.years as number,
          months: options.months as number,
          weeks: options.weeks as number,
          days: options.days as number,
          hours: options.hours as number,
          minutes: options.minutes as number,
          seconds: options.seconds as number,
        },
        options.timezone as string,
      );
      return [{ type: 'text', text: result }];
    }

    case 'diff': {
      const { a, b } = data as { a: string; b: string };
      const result = datetime.diff(a, b);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'convertTimezone': {
      const result = datetime.convertTimezone(
        data as string,
        options.from as string,
        options.to as string,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'listTimezones': {
      const result = datetime.listTimezones();
      return [{ type: 'data', data: { timezones: result } }];
    }

    case 'parseCron': {
      const result = datetime.parseCron(
        data as string,
        options.count as number,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown DateTime action: ${action}`);
  }
}
