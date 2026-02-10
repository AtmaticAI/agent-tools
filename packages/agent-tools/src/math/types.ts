export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi';
export type WeightUnit = 'mg' | 'g' | 'kg' | 'oz' | 'lb' | 'ton';
export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';
export type DataUnit = 'b' | 'kb' | 'mb' | 'gb' | 'tb';
export type UnitCategory = 'length' | 'weight' | 'temperature' | 'data';

export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hex';

export interface UnitConversionResult {
  value: number;
  from: string;
  to: string;
  result: number;
}

export interface BaseConversionResult {
  input: string;
  fromBase: NumberBase;
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  standardDeviation: number;
  variance: number;
  percentiles: { p25: number; p50: number; p75: number; p90: number; p99: number };
}

export interface NumberFormatOptions {
  locale?: string;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface PercentageResult {
  value: number;
  total: number;
  percentage: number;
  formatted: string;
}

export interface PercentageChangeResult {
  from: number;
  to: number;
  change: number;
  formatted: string;
}
