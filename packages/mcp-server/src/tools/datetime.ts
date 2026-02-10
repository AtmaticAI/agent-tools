import { datetime } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const datetimeTools: McpTool[] = [
  {
    name: 'agent_tools_datetime_parse',
    description:
      'Parse a date string (ISO, Unix timestamp, RFC 2822, SQL) into a structured object with year, month, day, timezone, and more.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'Date string or Unix timestamp to parse',
        },
        timezone: {
          type: 'string',
          description: 'Timezone to interpret the date in (default: utc)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.parseDate(args.input as string, args.timezone as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_datetime_format',
    description:
      'Format a date string using a Luxon format pattern. Supports timezone conversion.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'ISO date string to format' },
        format: {
          type: 'string',
          description: 'Luxon format pattern (e.g., "yyyy-MM-dd HH:mm:ss")',
        },
        timezone: {
          type: 'string',
          description: 'Target timezone (default: utc)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.formatDate(args.input as string, {
        format: args.format as string,
        timezone: args.timezone as string,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_datetime_now',
    description: 'Get the current date and time with full details in a specified timezone.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        timezone: {
          type: 'string',
          description: 'Timezone (default: utc)',
        },
      },
      required: [],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.now(args.timezone as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_datetime_add',
    description:
      'Add time to a date. Specify years, months, weeks, days, hours, minutes, and/or seconds to add.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'ISO date string' },
        years: { type: 'number', description: 'Years to add' },
        months: { type: 'number', description: 'Months to add' },
        weeks: { type: 'number', description: 'Weeks to add' },
        days: { type: 'number', description: 'Days to add' },
        hours: { type: 'number', description: 'Hours to add' },
        minutes: { type: 'number', description: 'Minutes to add' },
        seconds: { type: 'number', description: 'Seconds to add' },
        timezone: { type: 'string', description: 'Timezone' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.add(
        args.input as string,
        {
          years: args.years as number,
          months: args.months as number,
          weeks: args.weeks as number,
          days: args.days as number,
          hours: args.hours as number,
          minutes: args.minutes as number,
          seconds: args.seconds as number,
        },
        args.timezone as string
      );
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_datetime_subtract',
    description:
      'Subtract time from a date. Specify years, months, weeks, days, hours, minutes, and/or seconds to subtract.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'ISO date string' },
        years: { type: 'number', description: 'Years to subtract' },
        months: { type: 'number', description: 'Months to subtract' },
        weeks: { type: 'number', description: 'Weeks to subtract' },
        days: { type: 'number', description: 'Days to subtract' },
        hours: { type: 'number', description: 'Hours to subtract' },
        minutes: { type: 'number', description: 'Minutes to subtract' },
        seconds: { type: 'number', description: 'Seconds to subtract' },
        timezone: { type: 'string', description: 'Timezone' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.subtract(
        args.input as string,
        {
          years: args.years as number,
          months: args.months as number,
          weeks: args.weeks as number,
          days: args.days as number,
          hours: args.hours as number,
          minutes: args.minutes as number,
          seconds: args.seconds as number,
        },
        args.timezone as string
      );
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_datetime_diff',
    description:
      'Calculate the difference between two dates. Returns years, months, days, hours, minutes, seconds and totals.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        a: { type: 'string', description: 'First date (ISO string)' },
        b: { type: 'string', description: 'Second date (ISO string)' },
      },
      required: ['a', 'b'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.diff(args.a as string, args.b as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_datetime_timezone_convert',
    description:
      'Convert a date from one timezone to another. Returns the converted date with offset information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'ISO date string' },
        from: { type: 'string', description: 'Source timezone (e.g., "America/New_York")' },
        to: { type: 'string', description: 'Target timezone (e.g., "Asia/Tokyo")' },
      },
      required: ['input', 'from', 'to'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.convertTimezone(
        args.input as string,
        args.from as string,
        args.to as string
      );
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_datetime_cron',
    description:
      'Parse a cron expression. Returns a human-readable description and the next scheduled run times.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string',
          description: 'Cron expression (5 fields: min hour dom month dow)',
        },
        count: {
          type: 'number',
          description: 'Number of next run times to return (default: 5)',
        },
      },
      required: ['expression'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = datetime.parseCron(
        args.expression as string,
        args.count as number
      );
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_datetime_timezones',
    description: 'List all available IANA timezone names.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
    handler: async () => {
      const result = datetime.listTimezones();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
