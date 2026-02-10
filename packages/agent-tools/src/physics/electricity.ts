import type { OhmsLawResult, ResistorResult, CoulombResult, CapacitorResult, RCCircuitResult } from './types';

const K_E = 8.9875517923e9;

export function ohmsLaw(params: { voltage?: number; current?: number; resistance?: number }): OhmsLawResult {
  const known = Object.entries(params).filter(([, v]) => v !== undefined);
  if (known.length < 2) {
    throw new Error('Need at least 2 of: voltage, current, resistance');
  }

  let { voltage, current, resistance } = params;

  if (voltage === undefined) {
    voltage = current! * resistance!;
  } else if (current === undefined) {
    if (resistance === 0) throw new Error('Resistance cannot be zero when solving for current');
    current = voltage / resistance!;
  } else if (resistance === undefined) {
    if (current === 0) throw new Error('Current cannot be zero when solving for resistance');
    resistance = voltage / current;
  }

  const power = voltage! * current!;
  return { voltage: voltage!, current: current!, resistance: resistance!, power };
}

export function resistors(values: number[], configuration: 'series' | 'parallel'): ResistorResult {
  if (values.length === 0) throw new Error('Need at least one resistor value');
  if (values.some((v) => v < 0)) throw new Error('Resistor values must be non-negative');

  let totalResistance: number;
  if (configuration === 'series') {
    totalResistance = values.reduce((sum, r) => sum + r, 0);
  } else {
    if (values.some((v) => v === 0)) throw new Error('Parallel resistors cannot have zero resistance');
    totalResistance = 1 / values.reduce((sum, r) => sum + 1 / r, 0);
  }

  return { configuration, resistors: values, totalResistance, unit: 'Ω' };
}

export function coulombsLaw(charge1: number, charge2: number, distance: number): CoulombResult {
  if (distance <= 0) throw new Error('Distance must be positive');
  const force = (K_E * Math.abs(charge1 * charge2)) / (distance * distance);
  const isAttractive = (charge1 > 0 && charge2 < 0) || (charge1 < 0 && charge2 > 0);
  return { force, charge1, charge2, distance, isAttractive, unit: 'N' };
}

export function capacitors(values: number[], configuration: 'series' | 'parallel'): CapacitorResult {
  if (values.length === 0) throw new Error('Need at least one capacitor value');
  if (values.some((v) => v <= 0)) throw new Error('Capacitor values must be positive');

  let totalCapacitance: number;
  if (configuration === 'parallel') {
    totalCapacitance = values.reduce((sum, c) => sum + c, 0);
  } else {
    totalCapacitance = 1 / values.reduce((sum, c) => sum + 1 / c, 0);
  }

  return { configuration, capacitors: values, totalCapacitance, unit: 'F' };
}

export function rcCircuit(resistance: number, capacitance: number): RCCircuitResult {
  if (resistance <= 0) throw new Error('Resistance must be positive');
  if (capacitance <= 0) throw new Error('Capacitance must be positive');
  const timeConstant = resistance * capacitance;
  const halfLife = timeConstant * Math.LN2;
  return { resistance, capacitance, timeConstant, halfLife, unit: 's' };
}
