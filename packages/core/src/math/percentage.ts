import type { PercentageResult, PercentageChangeResult } from './types';

export function percentage(value: number, total: number): PercentageResult {
  if (total === 0) {
    throw new Error('Total cannot be zero');
  }

  const pct = (value / total) * 100;

  return {
    value,
    total,
    percentage: pct,
    formatted: `${pct}%`,
  };
}

export function percentageChange(from: number, to: number): PercentageChangeResult {
  if (from === 0) {
    throw new Error('Cannot calculate percentage change from zero');
  }

  const change = ((to - from) / Math.abs(from)) * 100;
  const sign = change >= 0 ? '+' : '';
  const formatted = `${sign}${change}%`;

  return {
    from,
    to,
    change,
    formatted,
  };
}
