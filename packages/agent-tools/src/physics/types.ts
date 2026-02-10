export interface PhysicalConstant {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  category: string;
}

export interface KinematicsResult {
  displacement: number;
  initialVelocity: number;
  finalVelocity: number;
  acceleration: number;
  time: number;
}

export interface ProjectileResult {
  range: number;
  maxHeight: number;
  flightTime: number;
  initialVelocity: number;
  angle: number;
  velocityAtPeak: number;
}

export interface ForceResult {
  force: number;
  mass: number;
  acceleration: number;
  unit: string;
}

export interface EnergyResult {
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  unit: string;
}

export interface GravitationalForceResult {
  force: number;
  mass1: number;
  mass2: number;
  distance: number;
  unit: string;
}

export interface MomentumResult {
  momentum: number;
  mass: number;
  velocity: number;
  unit: string;
}

export interface OrbitalVelocityResult {
  orbitalVelocity: number;
  escapeVelocity: number;
  mass: number;
  radius: number;
  unit: string;
}

export interface OhmsLawResult {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
}

export interface ResistorResult {
  configuration: 'series' | 'parallel';
  resistors: number[];
  totalResistance: number;
  unit: string;
}

export interface CoulombResult {
  force: number;
  charge1: number;
  charge2: number;
  distance: number;
  isAttractive: boolean;
  unit: string;
}

export interface CapacitorResult {
  configuration: 'series' | 'parallel';
  capacitors: number[];
  totalCapacitance: number;
  unit: string;
}

export interface RCCircuitResult {
  resistance: number;
  capacitance: number;
  timeConstant: number;
  halfLife: number;
  unit: string;
}

export interface WaveResult {
  frequency: number;
  wavelength: number;
  speed: number;
  period: number;
}

export interface DopplerResult {
  observedFrequency: number;
  sourceFrequency: number;
  sourceVelocity: number;
  observerVelocity: number;
  mediumSpeed: number;
  approaching: boolean;
}

export interface SnellResult {
  n1: number;
  n2: number;
  angle1: number;
  angle2: number;
  totalInternalReflection: boolean;
  criticalAngle: number | null;
}

export interface LensResult {
  focalLength: number;
  objectDistance: number;
  imageDistance: number;
  magnification: number;
  imageType: 'real' | 'virtual';
}

export interface DecibelResult {
  intensity1: number;
  intensity2: number;
  decibels: number;
}

export interface IdealGasResult {
  pressure: number;
  volume: number;
  moles: number;
  temperature: number;
  unit: string;
}

export interface HeatTransferResult {
  heat: number;
  mass: number;
  specificHeat: number;
  temperatureChange: number;
  unit: string;
}

export interface ThermalExpansionResult {
  originalLength: number;
  coefficient: number;
  temperatureChange: number;
  expansion: number;
  finalLength: number;
}

export interface CarnotResult {
  hotTemperature: number;
  coldTemperature: number;
  efficiency: number;
  efficiencyPercent: string;
}

export interface LorentzResult {
  velocity: number;
  speedOfLight: number;
  beta: number;
  gamma: number;
}

export interface TimeDilationResult {
  properTime: number;
  dilatedTime: number;
  velocity: number;
  gamma: number;
}

export interface LengthContractionResult {
  properLength: number;
  contractedLength: number;
  velocity: number;
  gamma: number;
}

export interface MassEnergyResult {
  mass: number;
  energy: number;
  unit: string;
}

export type PhysicsUnitCategory = 'force' | 'energy' | 'power' | 'pressure' | 'speed';

export interface PhysicsUnitResult {
  value: number;
  from: string;
  to: string;
  result: number;
  category: PhysicsUnitCategory;
}
