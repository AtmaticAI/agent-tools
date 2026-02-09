import { structural } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const structuralSkill: Skill = {
  id: 'structural-operations',
  name: 'Structural Engineering',
  description:
    'Stress analysis, beam design, column buckling, cross-section properties, soil mechanics, and material database',
  tags: ['structural', 'stress', 'beams', 'columns', 'sections', 'soils', 'materials', 'civil'],
  examples: [
    'Calculate normal stress',
    'Analyze simply supported beam',
    'Calculate Euler buckling load',
    'Get I-beam section properties',
    'Calculate Terzaghi bearing capacity',
    'Look up A36 steel properties',
    'Calculate lateral earth pressure',
    'Compute factor of safety',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleStructuralSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'normalStress': {
      const { force, area } = data as { force: number; area: number };
      const result = structural.normalStress(force, area);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'shearStress': {
      const { force, area } = data as { force: number; area: number };
      const result = structural.shearStress(force, area);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'strain': {
      const { deltaLength, originalLength } = data as { deltaLength: number; originalLength: number };
      const result = structural.strain(deltaLength, originalLength);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'youngsModulus': {
      const { stress, strain: strainVal } = data as { stress: number; strain: number };
      const result = structural.youngsModulus(stress, strainVal);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'factorOfSafety': {
      const { ultimateStress, workingStress } = data as { ultimateStress: number; workingStress: number };
      const result = structural.factorOfSafety(ultimateStress, workingStress);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'hoopStress': {
      const { pressure, radius, thickness } = data as { pressure: number; radius: number; thickness: number };
      const result = structural.hoopStress(pressure, radius, thickness);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'simplySupported': {
      const { length, load, loadType, E, I, loadPosition } = data as {
        length: number; load: number; loadType: structural.BeamLoadType;
        E?: number; I?: number; loadPosition?: number;
      };
      const result = structural.simplySupported(length, load, loadType, E, I, loadPosition);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'cantilever': {
      const { length, load, loadType, E, I, loadPosition } = data as {
        length: number; load: number; loadType: structural.CantileverLoadType;
        E?: number; I?: number; loadPosition?: number;
      };
      const result = structural.cantilever(length, load, loadType, E, I, loadPosition);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'eulerBuckling': {
      const { E, I, length, endCondition } = data as {
        E: number; I: number; length: number; endCondition: structural.EndCondition;
      };
      const result = structural.eulerBuckling(E, I, length, endCondition);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'slendernessRatio': {
      const { effectiveLength, radiusOfGyration } = data as { effectiveLength: number; radiusOfGyration: number };
      const result = structural.slendernessRatio(effectiveLength, radiusOfGyration);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'rectangleSection': {
      const { width, height } = data as { width: number; height: number };
      const result = structural.rectangleSection(width, height);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'circularSection': {
      const { diameter } = data as { diameter: number };
      const result = structural.circularSection(diameter);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'hollowCircularSection': {
      const { outerDiameter, innerDiameter } = data as { outerDiameter: number; innerDiameter: number };
      const result = structural.hollowCircularSection(outerDiameter, innerDiameter);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'iBeamSection': {
      const { flangeWidth, flangeThickness, webHeight, webThickness } = data as {
        flangeWidth: number; flangeThickness: number; webHeight: number; webThickness: number;
      };
      const result = structural.iBeamSection(flangeWidth, flangeThickness, webHeight, webThickness);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'terzaghiBearing': {
      const { cohesion, depth, unitWeight, frictionAngle, foundationType } = data as {
        cohesion: number; depth: number; unitWeight: number; frictionAngle: number;
        foundationType: structural.FoundationType;
      };
      const result = structural.terzaghiBearing(cohesion, depth, unitWeight, frictionAngle, foundationType);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'lateralEarthPressure': {
      const { unitWeight, height, frictionAngle, pressureType } = data as {
        unitWeight: number; height: number; frictionAngle: number;
        pressureType: structural.EarthPressureType;
      };
      const result = structural.lateralEarthPressure(unitWeight, height, frictionAngle, pressureType);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'settlement': {
      const { load, area, elasticModulus, thickness } = data as {
        load: number; area: number; elasticModulus: number; thickness: number;
      };
      const result = structural.settlement(load, area, elasticModulus, thickness);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'getMaterial': {
      const result = structural.getMaterial(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    case 'listMaterials': {
      const result = structural.listMaterials(options.category as string | undefined);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }
    default:
      throw new Error(`Unknown structural action: ${action}`);
  }
}
