import type { CronParseResult } from './types';

const _FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseCron(expression: string, count: number = 5): CronParseResult {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return {
      valid: false,
      description: '',
      nextRuns: [],
      error: `Expected 5 fields, got ${parts.length}`,
    };
  }

  try {
    const description = describeCron(parts);
    const nextRuns = getNextRuns(parts, count);

    return {
      valid: true,
      description,
      nextRuns: nextRuns.map((d) => d.toISOString()),
    };
  } catch (e) {
    return {
      valid: false,
      description: '',
      nextRuns: [],
      error: (e as Error).message,
    };
  }
}

function describeCron(parts: string[]): string {
  const [min, hour, dom, month, dow] = parts;
  const segments: string[] = [];

  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Every minute';
  }

  if (min !== '*') segments.push(`at minute ${min}`);
  if (hour !== '*') segments.push(`at hour ${hour}`);
  if (dom !== '*') segments.push(`on day ${dom} of the month`);
  if (month !== '*') {
    const m = parseInt(month);
    segments.push(`in ${!isNaN(m) && m >= 1 && m <= 12 ? MONTH_NAMES[m] : month}`);
  }
  if (dow !== '*') {
    const d = parseInt(dow);
    segments.push(`on ${!isNaN(d) && d >= 0 && d <= 6 ? DAY_NAMES[d] : dow}`);
  }

  return segments.join(', ') || 'Every minute';
}

function getNextRuns(parts: string[], count: number): Date[] {
  const runs: Date[] = [];
  const now = new Date();
  const current = new Date(now);
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  const maxIterations = 525600;
  let iterations = 0;

  while (runs.length < count && iterations < maxIterations) {
    if (matchesCron(current, parts)) {
      runs.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
    iterations++;
  }

  return runs;
}

function matchesCron(date: Date, parts: string[]): boolean {
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;

  return (
    matchesField(date.getMinutes(), minExpr, 0, 59) &&
    matchesField(date.getHours(), hourExpr, 0, 23) &&
    matchesField(date.getDate(), domExpr, 1, 31) &&
    matchesField(date.getMonth() + 1, monthExpr, 1, 12) &&
    matchesField(date.getDay(), dowExpr, 0, 6)
  );
}

function matchesField(value: number, expr: string, min: number, max: number): boolean {
  if (expr === '*') return true;

  for (const part of expr.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr);
      const start = range === '*' ? min : parseInt(range);
      for (let i = start; i <= max; i += step) {
        if (i === value) return true;
      }
    } else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (value >= start && value <= end) return true;
    } else {
      if (parseInt(part) === value) return true;
    }
  }

  return false;
}
