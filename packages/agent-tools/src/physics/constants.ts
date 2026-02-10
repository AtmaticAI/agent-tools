import type { PhysicalConstant } from './types';

const CONSTANTS: Record<string, PhysicalConstant> = {
  c: { name: 'Speed of Light', symbol: 'c', value: 299792458, unit: 'm/s', category: 'universal' },
  G: { name: 'Gravitational Constant', symbol: 'G', value: 6.67430e-11, unit: 'N·m²/kg²', category: 'universal' },
  h: { name: 'Planck Constant', symbol: 'h', value: 6.62607015e-34, unit: 'J·s', category: 'quantum' },
  hbar: { name: 'Reduced Planck Constant', symbol: 'ℏ', value: 1.054571817e-34, unit: 'J·s', category: 'quantum' },
  k_B: { name: 'Boltzmann Constant', symbol: 'k_B', value: 1.380649e-23, unit: 'J/K', category: 'thermodynamics' },
  N_A: { name: 'Avogadro Number', symbol: 'N_A', value: 6.02214076e23, unit: '1/mol', category: 'chemistry' },
  R: { name: 'Gas Constant', symbol: 'R', value: 8.314462618, unit: 'J/(mol·K)', category: 'thermodynamics' },
  e: { name: 'Elementary Charge', symbol: 'e', value: 1.602176634e-19, unit: 'C', category: 'electromagnetic' },
  epsilon_0: { name: 'Vacuum Permittivity', symbol: 'ε₀', value: 8.8541878128e-12, unit: 'F/m', category: 'electromagnetic' },
  mu_0: { name: 'Vacuum Permeability', symbol: 'μ₀', value: 1.25663706212e-6, unit: 'N/A²', category: 'electromagnetic' },
  m_e: { name: 'Electron Mass', symbol: 'm_e', value: 9.1093837015e-31, unit: 'kg', category: 'atomic' },
  m_p: { name: 'Proton Mass', symbol: 'm_p', value: 1.67262192369e-27, unit: 'kg', category: 'atomic' },
  sigma: { name: 'Stefan-Boltzmann Constant', symbol: 'σ', value: 5.670374419e-8, unit: 'W/(m²·K⁴)', category: 'thermodynamics' },
  g: { name: 'Standard Gravity', symbol: 'g', value: 9.80665, unit: 'm/s²', category: 'mechanics' },
  atm: { name: 'Standard Atmosphere', symbol: 'atm', value: 101325, unit: 'Pa', category: 'mechanics' },
  k_e: { name: 'Coulomb Constant', symbol: 'k_e', value: 8.9875517923e9, unit: 'N·m²/C²', category: 'electromagnetic' },
};

export function getConstant(key: string): PhysicalConstant {
  const c = CONSTANTS[key];
  if (!c) {
    throw new Error(`Unknown constant: ${key}. Available: ${Object.keys(CONSTANTS).join(', ')}`);
  }
  return { ...c };
}

export function listConstants(category?: string): PhysicalConstant[] {
  const all = Object.values(CONSTANTS).map((c) => ({ ...c }));
  if (category) {
    return all.filter((c) => c.category === category);
  }
  return all;
}
