import type { StatisticsResult } from './types';

function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

export function calculateStats(numbers: number[]): StatisticsResult {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate statistics for an empty array');
  }

  const count = numbers.length;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  const mean = sum / count;

  const sorted = [...numbers].sort((a, b) => a - b);

  // Median
  let median: number;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Mode
  const frequencyMap = new Map<number, number>();
  for (const n of numbers) {
    frequencyMap.set(n, (frequencyMap.get(n) || 0) + 1);
  }
  let maxFrequency = 0;
  for (const freq of frequencyMap.values()) {
    if (freq > maxFrequency) maxFrequency = freq;
  }
  const mode: number[] = [];
  for (const [value, freq] of frequencyMap.entries()) {
    if (freq === maxFrequency) mode.push(value);
  }
  mode.sort((a, b) => a - b);

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Variance (population variance)
  const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  // Percentiles using linear interpolation
  const percentiles = {
    p25: getPercentile(sorted, 25),
    p50: getPercentile(sorted, 50),
    p75: getPercentile(sorted, 75),
    p90: getPercentile(sorted, 90),
    p99: getPercentile(sorted, 99),
  };

  return {
    count,
    sum,
    mean,
    median,
    mode,
    min,
    max,
    range,
    standardDeviation,
    variance,
    percentiles,
  };
}
