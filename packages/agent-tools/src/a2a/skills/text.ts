import * as text from '../../text';
import type { Skill, TaskInput, Part } from '../types';

export const textSkill: Skill = {
  id: 'text-operations',
  name: 'Text Utilities',
  description:
    'Case conversion, slugify, word count, truncation, lorem ipsum, similarity, and template interpolation',
  tags: ['text', 'case', 'slug', 'stats', 'truncate', 'lorem', 'similarity', 'template'],
  examples: [
    'Convert "hello world" to camelCase',
    'Slugify a title for URL',
    'Get word count and reading time',
    'Compare two strings for similarity',
    'Interpolate template variables',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleTextSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'case': {
      const result = text.convertCase(data as string, options.to as text.CaseType);
      return [{ type: 'text', text: result }];
    }

    case 'slugify': {
      const result = text.slugify(data as string, options.separator as string);
      return [{ type: 'text', text: result }];
    }

    case 'stats': {
      const result = text.getTextStats(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'truncate': {
      const result = text.truncate(data as string, {
        length: options.length as number,
        boundary: options.boundary as 'character' | 'word',
        suffix: options.suffix as string,
      });
      return [{ type: 'text', text: result }];
    }

    case 'lorem': {
      const result = text.generateLorem(
        options.count as number,
        options.unit as 'words' | 'sentences' | 'paragraphs'
      );
      return [{ type: 'text', text: result }];
    }

    case 'similarity': {
      const { a, b } = data as { a: string; b: string };
      const result = text.similarity(a, b);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'template': {
      const result = text.interpolate(
        data as string,
        options.variables as Record<string, string>
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown text action: ${action}`);
  }
}
