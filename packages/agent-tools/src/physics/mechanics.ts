import type { ForceResult, EnergyResult, GravitationalForceResult, MomentumResult, OrbitalVelocityResult } from './types';

const G = 6.67430e-11;

export function calculateForce(mass: number, acceleration: number): ForceResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  return { force: mass * acceleration, mass, acceleration, unit: 'N' };
}

export function calculateEnergy(
  mass: number,
  velocity: number,
  height: number = 0,
  gravity: number = 9.80665
): EnergyResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  const kineticEnergy = 0.5 * mass * velocity * velocity;
  const potentialEnergy = mass * gravity * height;
  return { kineticEnergy, potentialEnergy, totalEnergy: kineticEnergy + potentialEnergy, unit: 'J' };
}

export function gravitationalForce(mass1: number, mass2: number, distance: number): GravitationalForceResult {
  if (distance <= 0) throw new Error('Distance must be positive');
  if (mass1 < 0 || mass2 < 0) throw new Error('Mass must be non-negative');
  const force = (G * mass1 * mass2) / (distance * distance);
  return { force, mass1, mass2, distance, unit: 'N' };
}

export function calculateMomentum(mass: number, velocity: number): MomentumResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  return { momentum: mass * velocity, mass, velocity, unit: 'kg·m/s' };
}

export function orbitalMechanics(mass: number, radius: number): OrbitalVelocityResult {
  if (mass < 0) throw new Error('Mass must be non-negative');
  if (radius <= 0) throw new Error('Radius must be positive');
  const orbitalVelocity = Math.sqrt((G * mass) / radius);
  const escapeVelocity = Math.sqrt((2 * G * mass) / radius);
  return { orbitalVelocity, escapeVelocity, mass, radius, unit: 'm/s' };
}

export function calculateWork(
  force: number,
  distance: number,
  angleDegrees: number = 0
): { work: number; force: number; distance: number; angle: number; unit: string } {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const work = force * distance * Math.cos(angleRad);
  return { work, force, distance, angle: angleDegrees, unit: 'J' };
}
