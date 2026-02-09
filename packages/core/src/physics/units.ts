import type { PhysicsUnitCategory, PhysicsUnitResult } from './types';

const forceFactors: Record<string, number> = {
  n: 1, kn: 1000, dyn: 1e-5, lbf: 4.44822, kgf: 9.80665,
};

const energyFactors: Record<string, number> = {
  j: 1, kj: 1000, cal: 4.184, kcal: 4184, ev: 1.602176634e-19, kwh: 3.6e6, btu: 1055.06, erg: 1e-7,
};

const powerFactors: Record<string, number> = {
  w: 1, kw: 1000, mw: 1e6, hp: 745.7, 'btu/h': 0.293071,
};

const pressureFactors: Record<string, number> = {
  pa: 1, kpa: 1000, mpa: 1e6, atm: 101325, bar: 100000, psi: 6894.76, torr: 133.322, mmhg: 133.322,
};

const speedFactors: Record<string, number> = {
  'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knots: 0.514444, 'ft/s': 0.3048,
};

function getFactors(category: PhysicsUnitCategory): Record<string, number> {
  switch (category) {
    case 'force': return forceFactors;
    case 'energy': return energyFactors;
    case 'power': return powerFactors;
    case 'pressure': return pressureFactors;
    case 'speed': return speedFactors;
    default: throw new Error(`Unknown physics unit category: ${category}`);
  }
}

export function convertPhysicsUnit(
  value: number,
  from: string,
  to: string,
  category: PhysicsUnitCategory
): PhysicsUnitResult {
  const factors = getFactors(category);
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  if (!(fromLower in factors)) {
    throw new Error(`Unknown ${category} unit: ${from}. Available: ${Object.keys(factors).join(', ')}`);
  }
  if (!(toLower in factors)) {
    throw new Error(`Unknown ${category} unit: ${to}. Available: ${Object.keys(factors).join(', ')}`);
  }

  const baseValue = value * factors[fromLower];
  const result = baseValue / factors[toLower];

  return { value, from: fromLower, to: toLower, result, category };
}
