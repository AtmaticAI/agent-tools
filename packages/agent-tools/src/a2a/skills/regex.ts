import * as regex from '../../regex';
import type { Skill, TaskInput, Part } from '../types';

export const regexSkill: Skill = {
  id: 'regex-operations',
  name: 'Regex Processing',
  description:
    'Test, replace, extract, and validate regular expressions with full match details',
  tags: ['regex', 'pattern', 'match', 'replace', 'extract'],
  examples: [
    'Test if string matches email pattern',
    'Replace all occurrences using regex',
    'Extract all matches with groups',
    'Validate a regex pattern syntax',
  ],
  inputModes: ['text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleRegexSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'test': {
      const result = regex.test(data as string, options.pattern as string, {
        flags: options.flags as string,
        multiline: options.multiline as boolean,
        caseInsensitive: options.caseInsensitive as boolean,
        global: options.global as boolean,
      });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'replace': {
      const result = regex.replace(
        data as string,
        options.pattern as string,
        options.replacement as string,
        {
          flags: options.flags as string,
          multiline: options.multiline as boolean,
          caseInsensitive: options.caseInsensitive as boolean,
          global: options.global as boolean,
        },
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'extract': {
      const result = regex.extract(data as string, options.pattern as string, {
        flags: options.flags as string,
        multiline: options.multiline as boolean,
        caseInsensitive: options.caseInsensitive as boolean,
        global: options.global as boolean,
      });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'validate': {
      const result = regex.validate(
        data as string,
        options.flags as string,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown Regex action: ${action}`);
  }
}
