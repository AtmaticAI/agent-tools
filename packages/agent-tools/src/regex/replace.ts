import type { RegexReplaceResult, RegexOptions } from './types';
import { buildFlags } from './utils';

export function replace(
  input: string,
  pattern: string,
  replacement: string,
  options: RegexOptions = {}
): RegexReplaceResult {
  const flags = buildFlags({ ...options, global: options.global ?? true });
  const regex = new RegExp(pattern, flags);

  let replacements = 0;
  const output = input.replace(regex, (...args) => {
    replacements++;
    const groups = args[args.length - 1];
    let result = replacement;

    if (typeof groups === 'object' && groups !== null) {
      for (const [key, value] of Object.entries(groups)) {
        result = result.replace(new RegExp(`\\$<${key}>`, 'g'), String(value ?? ''));
      }
    }

    for (let i = 1; i < args.length - 2; i++) {
      result = result.replace(new RegExp(`\\$${i}`, 'g'), args[i] ?? '');
    }

    return result;
  });

  return { output, replacements };
}
