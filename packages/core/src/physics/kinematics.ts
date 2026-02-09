import type { KinematicsResult, ProjectileResult } from './types';

export function solveKinematics(params: {
  displacement?: number;
  initialVelocity?: number;
  finalVelocity?: number;
  acceleration?: number;
  time?: number;
}): KinematicsResult {
  const known = Object.entries(params).filter(([, v]) => v !== undefined);
  if (known.length < 3) {
    throw new Error('Need at least 3 of: displacement, initialVelocity, finalVelocity, acceleration, time');
  }

  let { displacement, initialVelocity, finalVelocity, acceleration, time } = params;

  // Solve for initialVelocity first (before displacement) so that
  // cases like (v, a, t) can derive u, then use u to find s.
  if (initialVelocity === undefined) {
    if (finalVelocity !== undefined && acceleration !== undefined && time !== undefined) {
      initialVelocity = finalVelocity - acceleration * time;
    } else if (displacement !== undefined && time !== undefined && acceleration !== undefined) {
      initialVelocity = (displacement - 0.5 * acceleration * time * time) / time;
    } else if (finalVelocity !== undefined && acceleration !== undefined && displacement !== undefined) {
      initialVelocity = Math.sqrt(finalVelocity * finalVelocity - 2 * acceleration * displacement);
    }
    // If still undefined, displacement section may resolve it later
  }

  if (displacement === undefined) {
    if (initialVelocity !== undefined && time !== undefined && acceleration !== undefined) {
      displacement = initialVelocity * time + 0.5 * acceleration * time * time;
    } else if (initialVelocity !== undefined && finalVelocity !== undefined && time !== undefined) {
      displacement = ((initialVelocity + finalVelocity) / 2) * time;
    } else if (finalVelocity !== undefined && initialVelocity !== undefined && acceleration !== undefined) {
      displacement = (finalVelocity * finalVelocity - initialVelocity * initialVelocity) / (2 * acceleration);
    } else {
      throw new Error('Cannot solve for displacement with the given parameters');
    }
  }

  // Re-check initialVelocity now that displacement may be known
  if (initialVelocity === undefined) {
    if (displacement !== undefined && time !== undefined && acceleration !== undefined) {
      initialVelocity = (displacement - 0.5 * acceleration * time * time) / time;
    } else if (finalVelocity !== undefined && acceleration !== undefined && displacement !== undefined) {
      initialVelocity = Math.sqrt(finalVelocity * finalVelocity - 2 * acceleration * displacement);
    } else {
      throw new Error('Cannot solve for initialVelocity with the given parameters');
    }
  }

  if (finalVelocity === undefined) {
    if (initialVelocity !== undefined && acceleration !== undefined && time !== undefined) {
      finalVelocity = initialVelocity + acceleration * time;
    } else if (initialVelocity !== undefined && acceleration !== undefined && displacement !== undefined) {
      finalVelocity = Math.sqrt(initialVelocity * initialVelocity + 2 * acceleration * displacement);
    } else {
      throw new Error('Cannot solve for finalVelocity with the given parameters');
    }
  }

  if (acceleration === undefined) {
    if (initialVelocity !== undefined && finalVelocity !== undefined && time !== undefined) {
      acceleration = (finalVelocity - initialVelocity) / time;
    } else if (initialVelocity !== undefined && finalVelocity !== undefined && displacement !== undefined) {
      acceleration = (finalVelocity * finalVelocity - initialVelocity * initialVelocity) / (2 * displacement);
    } else {
      throw new Error('Cannot solve for acceleration with the given parameters');
    }
  }

  if (time === undefined) {
    if (initialVelocity !== undefined && finalVelocity !== undefined && acceleration !== undefined && acceleration !== 0) {
      time = (finalVelocity - initialVelocity) / acceleration;
    } else if (displacement !== undefined && initialVelocity !== undefined && acceleration !== undefined) {
      const a = 0.5 * acceleration;
      const b = initialVelocity;
      const c = -displacement;
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) throw new Error('No real solution for time');
      time = (-b + Math.sqrt(discriminant)) / (2 * a);
      if (time < 0) time = (-b - Math.sqrt(discriminant)) / (2 * a);
    } else {
      throw new Error('Cannot solve for time with the given parameters');
    }
  }

  return {
    displacement: displacement!,
    initialVelocity: initialVelocity!,
    finalVelocity: finalVelocity!,
    acceleration: acceleration!,
    time: time!,
  };
}

export function projectileMotion(
  initialVelocity: number,
  angleDegrees: number,
  gravity: number = 9.80665
): ProjectileResult {
  if (initialVelocity < 0) throw new Error('Initial velocity must be non-negative');
  if (angleDegrees < 0 || angleDegrees > 90) throw new Error('Angle must be between 0 and 90 degrees');

  const angleRad = (angleDegrees * Math.PI) / 180;
  const sin = Math.sin(angleRad);
  const cos = Math.cos(angleRad);
  const sin2 = Math.sin(2 * angleRad);

  const range = (initialVelocity * initialVelocity * sin2) / gravity;
  const maxHeight = (initialVelocity * initialVelocity * sin * sin) / (2 * gravity);
  const flightTime = (2 * initialVelocity * sin) / gravity;
  const velocityAtPeak = initialVelocity * cos;

  return { range, maxHeight, flightTime, initialVelocity, angle: angleDegrees, velocityAtPeak };
}

export function freeFall(
  height: number,
  gravity: number = 9.80665
): { height: number; time: number; finalVelocity: number } {
  if (height < 0) throw new Error('Height must be non-negative');
  const time = Math.sqrt((2 * height) / gravity);
  const finalVelocity = gravity * time;
  return { height, time, finalVelocity };
}
