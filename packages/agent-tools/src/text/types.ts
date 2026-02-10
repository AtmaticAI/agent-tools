export type CaseType = 'camel' | 'snake' | 'kebab' | 'pascal' | 'title' | 'sentence' | 'upper' | 'lower' | 'constant';

export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMs: number;
}

export interface TruncateOptions {
  length: number;
  boundary?: 'character' | 'word';
  suffix?: string;
}

export interface SimilarityResult {
  distance: number;
  similarity: number;
}

export interface TemplateResult {
  result: string;
  missingKeys: string[];
}
