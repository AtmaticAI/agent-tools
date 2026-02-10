import type { MaterialProperties } from './types';

const MATERIALS: MaterialProperties[] = [
  {
    name: 'ASTM A36 Steel',
    category: 'steel',
    E: 200e9,
    fy: 250e6,
    fu: 400e6,
    density: 7850,
    poissonsRatio: 0.26,
    thermalExpansion: 12e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'ASTM A992 Steel',
    category: 'steel',
    E: 200e9,
    fy: 345e6,
    fu: 450e6,
    density: 7850,
    poissonsRatio: 0.26,
    thermalExpansion: 12e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Stainless Steel 304',
    category: 'steel',
    E: 193e9,
    fy: 215e6,
    fu: 515e6,
    density: 7930,
    poissonsRatio: 0.29,
    thermalExpansion: 17.3e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Aluminum 6061-T6',
    category: 'aluminum',
    E: 68.9e9,
    fy: 276e6,
    fu: 310e6,
    density: 2700,
    poissonsRatio: 0.33,
    thermalExpansion: 23.6e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Aluminum 2024-T3',
    category: 'aluminum',
    E: 73.1e9,
    fy: 345e6,
    fu: 483e6,
    density: 2780,
    poissonsRatio: 0.33,
    thermalExpansion: 23.2e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Concrete C20/25',
    category: 'concrete',
    E: 30e9,
    fy: 20e6,
    fu: 25e6,
    density: 2400,
    poissonsRatio: 0.2,
    thermalExpansion: 10e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Concrete C30/37',
    category: 'concrete',
    E: 33e9,
    fy: 30e6,
    fu: 37e6,
    density: 2400,
    poissonsRatio: 0.2,
    thermalExpansion: 10e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Concrete C40/50',
    category: 'concrete',
    E: 35e9,
    fy: 40e6,
    fu: 50e6,
    density: 2400,
    poissonsRatio: 0.2,
    thermalExpansion: 10e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Douglas Fir',
    category: 'timber',
    E: 12.4e9,
    fy: 36e6,
    fu: 52e6,
    density: 530,
    poissonsRatio: 0.29,
    thermalExpansion: 3.6e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Southern Pine',
    category: 'timber',
    E: 13.7e9,
    fy: 41e6,
    fu: 59e6,
    density: 560,
    poissonsRatio: 0.33,
    thermalExpansion: 3.6e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
  {
    name: 'Copper C11000',
    category: 'other',
    E: 130e9,
    fy: 69e6,
    fu: 220e6,
    density: 8940,
    poissonsRatio: 0.33,
    thermalExpansion: 17.3e-6,
    Eunit: 'Pa',
    fyUnit: 'Pa',
    fuUnit: 'Pa',
    densityUnit: 'kg/m³',
    thermalExpansionUnit: '1/°C',
  },
];

/**
 * Get material properties by name (case-insensitive partial match).
 */
export function getMaterial(name: string): MaterialProperties {
  const lower = name.toLowerCase();
  const found = MATERIALS.find((m) => m.name.toLowerCase().includes(lower));
  if (!found) {
    const available = MATERIALS.map((m) => m.name).join(', ');
    throw new Error(`Material "${name}" not found. Available: ${available}`);
  }
  return { ...found };
}

/**
 * List materials, optionally filtered by category.
 */
export function listMaterials(category?: string): MaterialProperties[] {
  if (!category) return MATERIALS.map((m) => ({ ...m }));
  const lower = category.toLowerCase();
  const filtered = MATERIALS.filter((m) => m.category.toLowerCase() === lower);
  if (filtered.length === 0) {
    const categories = [...new Set(MATERIALS.map((m) => m.category))].join(', ');
    throw new Error(`No materials found in category "${category}". Available categories: ${categories}`);
  }
  return filtered.map((m) => ({ ...m }));
}
