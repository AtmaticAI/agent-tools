export interface RegexMatch {
  match: string;
  index: number;
  groups: Record<string, string>;
}

export interface RegexTestResult {
  matches: boolean;
  matchCount: number;
  results: RegexMatch[];
}

export interface RegexReplaceResult {
  output: string;
  replacements: number;
}

export interface RegexExtractResult {
  matches: string[];
  groups: Record<string, string>[];
  count: number;
}

export interface RegexValidationResult {
  valid: boolean;
  error?: string;
}

export interface RegexOptions {
  flags?: string;
  multiline?: boolean;
  caseInsensitive?: boolean;
  global?: boolean;
}
