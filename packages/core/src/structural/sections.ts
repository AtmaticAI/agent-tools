import type {
  RectangleSectionResult,
  CircularSectionResult,
  HollowCircularSectionResult,
  IBeamSectionResult,
} from './types';

/**
 * Rectangular cross-section properties.
 * Ixx = bh³/12, Iyy = hb³/12
 */
export function rectangleSection(width: number, height: number): RectangleSectionResult {
  if (width <= 0) throw new Error('Width must be positive');
  if (height <= 0) throw new Error('Height must be positive');

  const area = width * height;
  const Ixx = (width * height * height * height) / 12;
  const Iyy = (height * width * width * width) / 12;
  const Sx = (width * height * height) / 6;
  const Sy = (height * width * width) / 6;
  const rx = height / Math.sqrt(12);
  const ry = width / Math.sqrt(12);

  return { width, height, area, Ixx, Iyy, Sx, Sy, rx, ry };
}

/**
 * Solid circular cross-section properties.
 * I = πd⁴/64
 */
export function circularSection(diameter: number): CircularSectionResult {
  if (diameter <= 0) throw new Error('Diameter must be positive');

  const r2 = diameter / 2;
  const area = Math.PI * r2 * r2;
  const I = (Math.PI * diameter * diameter * diameter * diameter) / 64;
  const S = (Math.PI * diameter * diameter * diameter) / 32;
  const r = diameter / 4;

  return { diameter, area, I, S, r };
}

/**
 * Hollow circular cross-section properties.
 * I = π(D⁴ - d⁴)/64
 */
export function hollowCircularSection(outerDiameter: number, innerDiameter: number): HollowCircularSectionResult {
  if (outerDiameter <= 0) throw new Error('Outer diameter must be positive');
  if (innerDiameter < 0) throw new Error('Inner diameter must be non-negative');
  if (innerDiameter >= outerDiameter) throw new Error('Inner diameter must be less than outer diameter');

  const D = outerDiameter;
  const d = innerDiameter;
  const area = (Math.PI / 4) * (D * D - d * d);
  const I = (Math.PI / 64) * (D * D * D * D - d * d * d * d);
  const S = (Math.PI / (32 * D)) * (D * D * D * D - d * d * d * d);
  const r = Math.sqrt(I / area);

  return { outerDiameter, innerDiameter, area, I, S, r };
}

/**
 * I-beam (wide flange) cross-section properties.
 * Uses parallel axis theorem for Ixx.
 */
export function iBeamSection(
  flangeWidth: number,
  flangeThickness: number,
  webHeight: number,
  webThickness: number
): IBeamSectionResult {
  if (flangeWidth <= 0) throw new Error('Flange width must be positive');
  if (flangeThickness <= 0) throw new Error('Flange thickness must be positive');
  if (webHeight <= 0) throw new Error('Web height must be positive');
  if (webThickness <= 0) throw new Error('Web thickness must be positive');

  const totalHeight = webHeight + 2 * flangeThickness;

  // Areas
  const flangeArea = flangeWidth * flangeThickness;
  const webArea = webHeight * webThickness;
  const area = 2 * flangeArea + webArea;

  // Ixx using parallel axis theorem
  // Web contribution: bh³/12 (centroidal)
  const IxxWeb = (webThickness * webHeight * webHeight * webHeight) / 12;
  // Flange contribution: bh³/12 + Ad² for each flange
  const IxxFlangeSelf = (flangeWidth * flangeThickness * flangeThickness * flangeThickness) / 12;
  const flangeCenterDist = (webHeight + flangeThickness) / 2;
  const IxxFlangeParallel = flangeArea * flangeCenterDist * flangeCenterDist;
  const Ixx = IxxWeb + 2 * (IxxFlangeSelf + IxxFlangeParallel);

  // Iyy
  const IyyFlanges = 2 * (flangeThickness * flangeWidth * flangeWidth * flangeWidth) / 12;
  const IyyWeb = (webHeight * webThickness * webThickness * webThickness) / 12;
  const Iyy = IyyFlanges + IyyWeb;

  // Section moduli
  const Sx = (2 * Ixx) / totalHeight;
  const Sy = (2 * Iyy) / flangeWidth;

  // Radii of gyration
  const rx = Math.sqrt(Ixx / area);
  const ry = Math.sqrt(Iyy / area);

  return {
    flangeWidth,
    flangeThickness,
    webHeight,
    webThickness,
    totalHeight,
    area,
    Ixx,
    Iyy,
    Sx,
    Sy,
    rx,
    ry,
  };
}
