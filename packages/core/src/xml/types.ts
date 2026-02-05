export interface XmlParseOptions {
  preserveOrder?: boolean;
  ignoreAttributes?: boolean;
  trimValues?: boolean;
}

export interface XmlFormatOptions {
  indent?: number;
  newline?: boolean;
}

export interface XmlValidationError {
  line?: number;
  message: string;
}

export interface XmlValidationResult {
  valid: boolean;
  errors: XmlValidationError[];
}

export interface XmlQueryResult {
  matches: unknown[];
  count: number;
}

export interface XmlStats {
  elements: number;
  attributes: number;
  textNodes: number;
  depth: number;
  sizeBytes: number;
}

export type XmlConvertFormat = 'xml' | 'json';
