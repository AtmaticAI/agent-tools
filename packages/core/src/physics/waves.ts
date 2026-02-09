import type { WaveResult, DopplerResult, SnellResult, LensResult, DecibelResult } from './types';

export function waveEquation(params: { frequency?: number; wavelength?: number; speed?: number }): WaveResult {
  const known = Object.entries(params).filter(([, v]) => v !== undefined);
  if (known.length < 2) {
    throw new Error('Need at least 2 of: frequency, wavelength, speed');
  }

  let { frequency, wavelength, speed } = params;

  if (speed === undefined) {
    speed = frequency! * wavelength!;
  } else if (frequency === undefined) {
    if (wavelength === 0) throw new Error('Wavelength cannot be zero');
    frequency = speed / wavelength!;
  } else if (wavelength === undefined) {
    if (frequency === 0) throw new Error('Frequency cannot be zero');
    wavelength = speed / frequency;
  }

  return { frequency: frequency!, wavelength: wavelength!, speed: speed!, period: 1 / frequency! };
}

export function dopplerEffect(
  sourceFrequency: number,
  sourceVelocity: number,
  observerVelocity: number,
  mediumSpeed: number = 343,
  approaching: boolean = true
): DopplerResult {
  if (sourceFrequency <= 0) throw new Error('Source frequency must be positive');
  if (Math.abs(sourceVelocity) >= mediumSpeed) throw new Error('Source velocity must be less than medium speed');

  let observedFrequency: number;
  if (approaching) {
    observedFrequency = sourceFrequency * ((mediumSpeed + observerVelocity) / (mediumSpeed - sourceVelocity));
  } else {
    observedFrequency = sourceFrequency * ((mediumSpeed - observerVelocity) / (mediumSpeed + sourceVelocity));
  }

  return { observedFrequency, sourceFrequency, sourceVelocity, observerVelocity, mediumSpeed, approaching };
}

export function snellsLaw(n1: number, n2: number, angle1Degrees: number): SnellResult {
  if (n1 <= 0 || n2 <= 0) throw new Error('Refractive indices must be positive');
  if (angle1Degrees < 0 || angle1Degrees >= 90) throw new Error('Angle must be between 0 and 90 degrees');

  const angle1Rad = (angle1Degrees * Math.PI) / 180;
  const sinAngle2 = (n1 * Math.sin(angle1Rad)) / n2;

  let criticalAngle: number | null = null;
  if (n1 > n2) {
    criticalAngle = (Math.asin(n2 / n1) * 180) / Math.PI;
  }

  if (Math.abs(sinAngle2) > 1) {
    return { n1, n2, angle1: angle1Degrees, angle2: NaN, totalInternalReflection: true, criticalAngle };
  }

  const angle2Degrees = (Math.asin(sinAngle2) * 180) / Math.PI;
  return { n1, n2, angle1: angle1Degrees, angle2: angle2Degrees, totalInternalReflection: false, criticalAngle };
}

export function thinLens(params: { focalLength?: number; objectDistance?: number; imageDistance?: number }): LensResult {
  const known = Object.entries(params).filter(([, v]) => v !== undefined);
  if (known.length < 2) {
    throw new Error('Need at least 2 of: focalLength, objectDistance, imageDistance');
  }

  let { focalLength, objectDistance, imageDistance } = params;

  if (focalLength === undefined) {
    focalLength = 1 / (1 / objectDistance! + 1 / imageDistance!);
  } else if (objectDistance === undefined) {
    objectDistance = 1 / (1 / focalLength - 1 / imageDistance!);
  } else if (imageDistance === undefined) {
    imageDistance = 1 / (1 / focalLength - 1 / objectDistance);
  }

  const magnification = -imageDistance! / objectDistance!;
  const imageType = imageDistance! > 0 ? 'real' : 'virtual';

  return { focalLength: focalLength!, objectDistance: objectDistance!, imageDistance: imageDistance!, magnification, imageType };
}

export function decibelConversion(intensity1: number, intensity2: number): DecibelResult {
  if (intensity1 <= 0 || intensity2 <= 0) throw new Error('Intensities must be positive');
  const decibels = 10 * Math.log10(intensity2 / intensity1);
  return { intensity1, intensity2, decibels };
}
