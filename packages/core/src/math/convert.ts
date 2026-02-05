import type { UnitCategory, UnitConversionResult } from './types';

const lengthFactors: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const weightFactors: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ton: 907185,
};

const dataFactors: Record<string, number> = {
  b: 1,
  kb: 1024,
  mb: Math.pow(1024, 2),
  gb: Math.pow(1024, 3),
  tb: Math.pow(1024, 4),
};

const temperatureUnits = new Set(['celsius', 'fahrenheit', 'kelvin']);

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value;

  // Convert to Celsius first
  let celsius: number;
  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = (value - 32) * 5 / 9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      throw new Error(`Unknown temperature unit: ${from}`);
  }

  // Convert from Celsius to target
  switch (to) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return celsius * 9 / 5 + 32;
    case 'kelvin':
      return celsius + 273.15;
    default:
      throw new Error(`Unknown temperature unit: ${to}`);
  }
}

function getFactors(category: UnitCategory): Record<string, number> {
  switch (category) {
    case 'length':
      return lengthFactors;
    case 'weight':
      return weightFactors;
    case 'data':
      return dataFactors;
    default:
      throw new Error(`No conversion factors for category: ${category}`);
  }
}

export function convertUnit(
  value: number,
  from: string,
  to: string,
  category: UnitCategory
): UnitConversionResult {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  if (category === 'temperature') {
    if (!temperatureUnits.has(fromLower)) {
      throw new Error(`Unit '${from}' does not belong to category 'temperature'`);
    }
    if (!temperatureUnits.has(toLower)) {
      throw new Error(`Unit '${to}' does not belong to category 'temperature'`);
    }
    const result = convertTemperature(value, fromLower, toLower);
    return { value, from: fromLower, to: toLower, result };
  }

  const factors = getFactors(category);

  if (!(fromLower in factors)) {
    throw new Error(`Unit '${from}' does not belong to category '${category}'`);
  }
  if (!(toLower in factors)) {
    throw new Error(`Unit '${to}' does not belong to category '${category}'`);
  }

  // Convert to base unit, then to target unit
  const baseValue = value * factors[fromLower];
  const result = baseValue / factors[toLower];

  return { value, from: fromLower, to: toLower, result };
}
