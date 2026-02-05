export type DiffType = 'line' | 'word' | 'char';

export interface DiffOptions {
  type?: DiffType;
  context?: number;
  ignoreWhitespace?: boolean;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  count: number;
}

export interface DiffResult {
  identical: boolean;
  changes: DiffChange[];
  stats: {
    additions: number;
    deletions: number;
    unchanged: number;
  };
}

export interface PatchOptions {
  fuzz?: number;
}

export interface UnifiedDiffOptions {
  fromFile?: string;
  toFile?: string;
  context?: number;
}
