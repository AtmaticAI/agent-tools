import { diff } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const diffSkill: Skill = {
  id: 'diff-operations',
  name: 'Diff & Patch Processing',
  description:
    'Compare text, generate unified diffs, apply patches, and parse patch files',
  tags: ['diff', 'patch', 'compare', 'unified', 'merge'],
  examples: [
    'Compare two text documents',
    'Generate unified diff output',
    'Apply a patch to source text',
    'Parse a unified patch file',
  ],
  inputModes: ['text/plain'],
  outputModes: ['text/plain', 'application/json'],
};

export async function handleDiffSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'compare': {
      const { a, b } = data as { a: string; b: string };
      const result = diff.compare(a, b, {
        type: options.type as diff.DiffType,
        context: options.context as number,
        ignoreWhitespace: options.ignoreWhitespace as boolean,
      });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'unified': {
      const { a, b } = data as { a: string; b: string };
      const result = diff.unifiedDiff(a, b, {
        fromFile: options.fromFile as string,
        toFile: options.toFile as string,
        context: options.context as number,
      });
      return [{ type: 'text', text: result }];
    }

    case 'apply': {
      const { source, patch } = data as { source: string; patch: string };
      const result = diff.apply(source, patch, {
        fuzz: options.fuzz as number,
      });
      return [{ type: 'text', text: result }];
    }

    case 'parse': {
      const result = diff.parsePatchFile(data as string);
      return [{ type: 'data', data: { patches: result } as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown Diff action: ${action}`);
  }
}
