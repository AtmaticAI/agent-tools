import type { IdealGasResult, HeatTransferResult, ThermalExpansionResult, CarnotResult } from './types';

const R = 8.314462618;

export function idealGasLaw(params: {
  pressure?: number;
  volume?: number;
  moles?: number;
  temperature?: number;
}): IdealGasResult {
  const known = Object.entries(params).filter(([, v]) => v !== undefined);
  if (known.length < 3) {
    throw new Error('Need at least 3 of: pressure (Pa), volume (m³), moles (mol), temperature (K)');
  }

  let { pressure, volume, moles, temperature } = params;

  if (pressure === undefined) {
    pressure = (moles! * R * temperature!) / volume!;
  } else if (volume === undefined) {
    volume = (moles! * R * temperature!) / pressure;
  } else if (moles === undefined) {
    moles = (pressure * volume!) / (R * temperature!);
  } else if (temperature === undefined) {
    temperature = (pressure * volume!) / (moles * R);
  }

  return { pressure: pressure!, volume: volume!, moles: moles!, temperature: temperature!, unit: 'SI (Pa, m³, mol, K)' };
}

export function heatTransfer(mass: number, specificHeat: number, temperatureChange: number): HeatTransferResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  if (specificHeat <= 0) throw new Error('Specific heat must be positive');
  const heat = mass * specificHeat * temperatureChange;
  return { heat, mass, specificHeat, temperatureChange, unit: 'J' };
}

export function thermalExpansion(
  originalLength: number,
  coefficient: number,
  temperatureChange: number
): ThermalExpansionResult {
  if (originalLength < 0) throw new Error('Original length must be non-negative');
  const expansion = originalLength * coefficient * temperatureChange;
  const finalLength = originalLength + expansion;
  return { originalLength, coefficient, temperatureChange, expansion, finalLength };
}

export function carnotEfficiency(hotTemperature: number, coldTemperature: number): CarnotResult {
  if (hotTemperature <= 0 || coldTemperature <= 0) throw new Error('Temperatures must be positive (in Kelvin)');
  if (coldTemperature >= hotTemperature) throw new Error('Hot temperature must be greater than cold temperature');
  const efficiency = 1 - coldTemperature / hotTemperature;
  return { hotTemperature, coldTemperature, efficiency, efficiencyPercent: `${(efficiency * 100).toFixed(2)}%` };
}
