import { math } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const mathSkill: Skill = {
  id: 'math-operations',
  name: 'Math Utilities',
  description:
    'Unit conversion, base conversion, statistics, number formatting, and percentage calculations',
  tags: ['math', 'convert', 'base', 'statistics', 'format', 'percentage'],
  examples: [
    'Convert 5 kilometers to miles',
    'Convert 255 from decimal to hex',
    'Calculate mean and standard deviation',
    'Format number as currency',
    'Calculate percentage change',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleMathSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'convert': {
      const { value, from, to } = data as { value: number; from: string; to: string };
      const result = math.convertUnit(value, from, to, options.category as math.UnitCategory);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'base': {
      const result = math.convertBase(data as string, options.fromBase as math.NumberBase);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'statistics': {
      const result = math.calculateStats(data as number[]);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'format': {
      const result = math.formatNumber(data as number, {
        locale: options.locale as string,
        style: options.style as 'decimal' | 'currency' | 'percent',
        currency: options.currency as string,
        minimumFractionDigits: options.minimumFractionDigits as number,
        maximumFractionDigits: options.maximumFractionDigits as number,
      });
      return [{ type: 'text', text: result }];
    }

    case 'percentage': {
      const { value, total } = data as { value: number; total: number };
      const result = math.percentage(value, total);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'percentageChange': {
      const { from, to } = data as { from: number; to: number };
      const result = math.percentageChange(from, to);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown math action: ${action}`);
  }
}
