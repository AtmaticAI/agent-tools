import { createTwoFilesPatch, createPatch } from 'diff';
import type { UnifiedDiffOptions } from './types';

export function unifiedDiff(
  a: string,
  b: string,
  options: UnifiedDiffOptions = {}
): string {
  const fromFile = options.fromFile ?? 'a';
  const toFile = options.toFile ?? 'b';
  const context = options.context ?? 3;

  return createTwoFilesPatch(fromFile, toFile, a, b, undefined, undefined, {
    context,
  });
}

export function createUnifiedPatch(
  fileName: string,
  original: string,
  modified: string,
  context: number = 3
): string {
  return createPatch(fileName, original, modified, undefined, undefined, {
    context,
  });
}
