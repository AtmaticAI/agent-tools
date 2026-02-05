import {
  diffLines,
  diffWords,
  diffChars,
  type Change,
} from 'diff';
import type { DiffOptions, DiffResult, DiffChange } from './types';

export function compare(
  a: string,
  b: string,
  options: DiffOptions = {}
): DiffResult {
  const type = options.type ?? 'line';

  let rawChanges: Change[];

  switch (type) {
    case 'word':
      rawChanges = diffWords(a, b, {
        ignoreWhitespace: options.ignoreWhitespace,
      });
      break;
    case 'char':
      rawChanges = diffChars(a, b);
      break;
    case 'line':
    default:
      rawChanges = diffLines(a, b, {
        ignoreWhitespace: options.ignoreWhitespace,
      });
      break;
  }

  const changes: DiffChange[] = rawChanges.map((c) => ({
    type: c.added ? 'added' : c.removed ? 'removed' : 'unchanged',
    value: c.value,
    count: c.count ?? 0,
  }));

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (const change of changes) {
    switch (change.type) {
      case 'added':
        additions += change.count;
        break;
      case 'removed':
        deletions += change.count;
        break;
      case 'unchanged':
        unchanged += change.count;
        break;
    }
  }

  return {
    identical: additions === 0 && deletions === 0,
    changes,
    stats: { additions, deletions, unchanged },
  };
}
