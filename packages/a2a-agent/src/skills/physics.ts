import { physics } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const physicsSkill: Skill = {
  id: 'physics-operations',
  name: 'Physics Calculator',
  description:
    'Physical constants, kinematics, mechanics, electricity, waves, thermodynamics, relativity, and unit conversions',
  tags: ['physics', 'kinematics', 'mechanics', 'electricity', 'waves', 'thermodynamics', 'relativity', 'constants'],
  examples: [
    'Look up physical constants',
    'Calculate projectile motion',
    'Solve kinematics equations',
    'Calculate gravitational force',
    'Apply Ohm\'s law',
    'Calculate ideal gas law',
    'Compute Lorentz factor',
    'Convert physics units',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handlePhysicsSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'getConstant': {
      const result = physics.getConstant(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'listConstants': {
      const result = physics.listConstants(options.category as string | undefined);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'kinematics': {
      const result = physics.solveKinematics(data as { displacement?: number; initialVelocity?: number; finalVelocity?: number; acceleration?: number; time?: number });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'projectile': {
      const { initialVelocity, angle, gravity } = data as { initialVelocity: number; angle: number; gravity?: number };
      const result = physics.projectileMotion(initialVelocity, angle, gravity);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'freeFall': {
      const { height, gravity } = data as { height: number; gravity?: number };
      const result = physics.freeFall(height, gravity);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'force': {
      const { mass, acceleration } = data as { mass: number; acceleration: number };
      const result = physics.calculateForce(mass, acceleration);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'energy': {
      const { mass, velocity, height, gravity } = data as { mass: number; velocity: number; height?: number; gravity?: number };
      const result = physics.calculateEnergy(mass, velocity, height, gravity);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'gravity': {
      const { mass1, mass2, distance } = data as { mass1: number; mass2: number; distance: number };
      const result = physics.gravitationalForce(mass1, mass2, distance);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'momentum': {
      const { mass, velocity } = data as { mass: number; velocity: number };
      const result = physics.calculateMomentum(mass, velocity);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'orbital': {
      const { mass, radius } = data as { mass: number; radius: number };
      const result = physics.orbitalMechanics(mass, radius);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'ohmsLaw': {
      const result = physics.ohmsLaw(data as { voltage?: number; current?: number; resistance?: number });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'resistors': {
      const { values, configuration } = data as { values: number[]; configuration: 'series' | 'parallel' };
      const result = physics.resistors(values, configuration);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'wave': {
      const result = physics.waveEquation(data as { frequency?: number; wavelength?: number; speed?: number });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'idealGas': {
      const result = physics.idealGasLaw(data as { pressure?: number; volume?: number; moles?: number; temperature?: number });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'lorentz': {
      const result = physics.lorentzFactor(data as number);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'massEnergy': {
      const result = physics.massEnergy(data as number);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'convertUnit': {
      const { value, from, to, category } = data as { value: number; from: string; to: string; category: string };
      const result = physics.convertPhysicsUnit(value, from, to, category as physics.PhysicsUnitCategory);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    default:
      throw new Error(`Unknown physics action: ${action}`);
  }
}
