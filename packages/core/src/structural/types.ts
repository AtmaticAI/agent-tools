// Stress & Strain
export interface NormalStressResult {
  force: number;
  area: number;
  stress: number;
  unit: string;
}

export interface ShearStressResult {
  force: number;
  area: number;
  stress: number;
  unit: string;
}

export interface StrainResult {
  deltaLength: number;
  originalLength: number;
  strain: number;
  unit: string;
}

export interface YoungsModulusResult {
  stress: number;
  strain: number;
  youngsModulus: number;
  unit: string;
}

export interface FactorOfSafetyResult {
  ultimateStress: number;
  workingStress: number;
  factorOfSafety: number;
}

export interface HoopStressResult {
  pressure: number;
  radius: number;
  thickness: number;
  hoopStress: number;
  longitudinalStress: number;
  unit: string;
}

// Beams
export type BeamLoadType = 'point-center' | 'point-custom' | 'uniform' | 'triangular';
export type CantileverLoadType = 'point-end' | 'point-custom' | 'uniform';

export interface BeamResult {
  length: number;
  load: number;
  loadType: string;
  reactionLeft: number;
  reactionRight: number;
  maxMoment: number;
  maxShear: number;
  maxDeflection: number | null;
  momentUnit: string;
  shearUnit: string;
  deflectionUnit: string | null;
}

export interface CantileverResult {
  length: number;
  load: number;
  loadType: string;
  reactionForce: number;
  reactionMoment: number;
  maxMoment: number;
  maxShear: number;
  maxDeflection: number | null;
  momentUnit: string;
  shearUnit: string;
  deflectionUnit: string | null;
}

// Columns
export type EndCondition = 'pinned-pinned' | 'fixed-free' | 'fixed-pinned' | 'fixed-fixed';

export interface EulerBucklingResult {
  elasticModulus: number;
  momentOfInertia: number;
  length: number;
  endCondition: EndCondition;
  effectiveLengthFactor: number;
  effectiveLength: number;
  criticalLoad: number;
  unit: string;
}

export type ColumnClassification = 'short' | 'intermediate' | 'long';

export interface SlendernessRatioResult {
  effectiveLength: number;
  radiusOfGyration: number;
  slendernessRatio: number;
  classification: ColumnClassification;
}

// Sections
export interface RectangleSectionResult {
  width: number;
  height: number;
  area: number;
  Ixx: number;
  Iyy: number;
  Sx: number;
  Sy: number;
  rx: number;
  ry: number;
}

export interface CircularSectionResult {
  diameter: number;
  area: number;
  I: number;
  S: number;
  r: number;
}

export interface HollowCircularSectionResult {
  outerDiameter: number;
  innerDiameter: number;
  area: number;
  I: number;
  S: number;
  r: number;
}

export interface IBeamSectionResult {
  flangeWidth: number;
  flangeThickness: number;
  webHeight: number;
  webThickness: number;
  totalHeight: number;
  area: number;
  Ixx: number;
  Iyy: number;
  Sx: number;
  Sy: number;
  rx: number;
  ry: number;
}

// Soils
export type FoundationType = 'strip' | 'square' | 'circular';
export type EarthPressureType = 'active' | 'passive' | 'at-rest';

export interface TerzaghiBearingResult {
  cohesion: number;
  depth: number;
  unitWeight: number;
  frictionAngle: number;
  foundationType: FoundationType;
  bearingCapacity: number;
  Nc: number;
  Nq: number;
  Ngamma: number;
  unit: string;
}

export interface LateralEarthPressureResult {
  unitWeight: number;
  height: number;
  frictionAngle: number;
  pressureType: EarthPressureType;
  coefficient: number;
  pressureAtBase: number;
  totalForce: number;
  pressureUnit: string;
  forceUnit: string;
}

export interface SettlementResult {
  load: number;
  area: number;
  elasticModulus: number;
  thickness: number;
  stress: number;
  settlement: number;
  unit: string;
}

// Materials
export interface MaterialProperties {
  name: string;
  category: string;
  E: number;
  fy: number;
  fu: number;
  density: number;
  poissonsRatio: number;
  thermalExpansion: number;
  Eunit: string;
  fyUnit: string;
  fuUnit: string;
  densityUnit: string;
  thermalExpansionUnit: string;
}
