import { compare as jsonPatchCompare } from 'fast-json-patch';
import type { DiffResult, DiffOperation } from './types';

export function diff(a: string, b: string): DiffResult {
  let parsedA: unknown;
  let parsedB: unknown;

  try {
    parsedA = JSON.parse(a);
  } catch (error) {
    throw new Error(`Invalid JSON (first argument): ${(error as Error).message}`);
  }

  try {
    parsedB = JSON.parse(b);
  } catch (error) {
    throw new Error(`Invalid JSON (second argument): ${(error as Error).message}`);
  }

  return diffValues(parsedA, parsedB);
}

export function diffValues(a: unknown, b: unknown): DiffResult {
  const operations = jsonPatchCompare(
    a as object,
    b as object
  ) as DiffOperation[];

  const summary = {
    added: 0,
    removed: 0,
    changed: 0,
  };

  for (const op of operations) {
    switch (op.op) {
      case 'add':
        summary.added++;
        break;
      case 'remove':
        summary.removed++;
        break;
      case 'replace':
        summary.changed++;
        break;
    }
  }

  return {
    identical: operations.length === 0,
    operations,
    summary,
  };
}

export function applyPatch(
  input: string,
  operations: DiffOperation[]
): string {
  const parsed = JSON.parse(input);

  for (const op of operations) {
    applyOperation(parsed, op);
  }

  return JSON.stringify(parsed, null, 2);
}

function applyOperation(obj: unknown, operation: DiffOperation): void {
  const pathParts = operation.path.split('/').filter(Boolean);

  if (pathParts.length === 0) {
    throw new Error('Cannot apply operation to root');
  }

  const parent = getParent(obj, pathParts);
  const key = pathParts[pathParts.length - 1];

  switch (operation.op) {
    case 'add':
    case 'replace':
      if (Array.isArray(parent)) {
        const index = parseInt(key, 10);
        if (operation.op === 'add') {
          parent.splice(index, 0, operation.value);
        } else {
          parent[index] = operation.value;
        }
      } else if (typeof parent === 'object' && parent !== null) {
        (parent as Record<string, unknown>)[key] = operation.value;
      }
      break;
    case 'remove':
      if (Array.isArray(parent)) {
        parent.splice(parseInt(key, 10), 1);
      } else if (typeof parent === 'object' && parent !== null) {
        delete (parent as Record<string, unknown>)[key];
      }
      break;
  }
}

function getParent(obj: unknown, pathParts: string[]): unknown {
  let current = obj;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (Array.isArray(current)) {
      current = current[parseInt(part, 10)];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}
