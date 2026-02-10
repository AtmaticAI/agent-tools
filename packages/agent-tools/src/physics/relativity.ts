import type { LorentzResult, TimeDilationResult, LengthContractionResult, MassEnergyResult } from './types';

const C = 299792458;

export function lorentzFactor(velocity: number): LorentzResult {
  if (Math.abs(velocity) >= C) throw new Error('Velocity must be less than the speed of light');
  const beta = velocity / C;
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return { velocity, speedOfLight: C, beta, gamma };
}

export function timeDilation(properTime: number, velocity: number): TimeDilationResult {
  if (properTime < 0) throw new Error('Proper time must be non-negative');
  const { gamma } = lorentzFactor(velocity);
  const dilatedTime = properTime * gamma;
  return { properTime, dilatedTime, velocity, gamma };
}

export function lengthContraction(properLength: number, velocity: number): LengthContractionResult {
  if (properLength < 0) throw new Error('Proper length must be non-negative');
  const { gamma } = lorentzFactor(velocity);
  const contractedLength = properLength / gamma;
  return { properLength, contractedLength, velocity, gamma };
}

export function massEnergy(mass: number): MassEnergyResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  const energy = mass * C * C;
  return { mass, energy, unit: 'J' };
}

export function energyToMass(energy: number): MassEnergyResult {
  if (energy < 0) throw new Error('Energy must be non-negative');
  const mass = energy / (C * C);
  return { mass, energy, unit: 'kg' };
}
