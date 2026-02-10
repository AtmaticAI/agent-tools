import type { ToolCategory, ToolSettings } from './types';

export const ALL_TOOL_CATEGORIES: ToolCategory[] = [
  'json',
  'crypto',
  'sql',
  'regex',
  'diff',
  'csv',
  'datetime',
  'markdown',
  'xml',
  'pdf',
  'excel',
  'image',
  'archive',
  'text',
  'math',
  'color',
  'physics',
  'structural',
];

export const TOOL_METADATA: { id: ToolCategory; name: string; description: string }[] = [
  { id: 'json', name: 'JSON Studio', description: 'Format, validate, query, convert, and diff JSON documents' },
  { id: 'crypto', name: 'Crypto & Encoding', description: 'Hash, encode, decode, and work with JWTs' },
  { id: 'sql', name: 'SQL Studio', description: 'Format, parse, and validate SQL queries' },
  { id: 'regex', name: 'Regex Tester', description: 'Test, replace, and extract with regular expressions' },
  { id: 'diff', name: 'Diff & Patch', description: 'Compare texts and apply unified diffs' },
  { id: 'csv', name: 'CSV Viewer', description: 'Parse, filter, convert, and analyze CSV data' },
  { id: 'datetime', name: 'Date/Time Tools', description: 'Parse, format, convert timezones, and analyze cron expressions' },
  { id: 'markdown', name: 'Markdown Studio', description: 'Convert, generate TOC, and analyze Markdown documents' },
  { id: 'xml', name: 'XML Studio', description: 'Parse, format, validate, and convert XML documents' },
  { id: 'pdf', name: 'PDF Toolkit', description: 'Merge, split, extract text, and generate PDFs' },
  { id: 'excel', name: 'Excel Viewer', description: 'Parse, convert, and analyze Excel workbooks' },
  { id: 'image', name: 'Image Toolkit', description: 'Resize, convert, and extract metadata from images' },
  { id: 'archive', name: 'Archive Manager', description: 'Create, extract, and list archive contents' },
  { id: 'text', name: 'Text Utilities', description: 'Case conversion, slugify, word count, similarity, and template interpolation' },
  { id: 'math', name: 'Math Utilities', description: 'Unit conversion, base conversion, statistics, and number formatting' },
  { id: 'color', name: 'Color Utilities', description: 'Color parsing, conversion, contrast checking, palette generation, and blending' },
  { id: 'physics', name: 'Physics Calculator', description: 'Constants, kinematics, mechanics, electricity, waves, thermodynamics, and relativity' },
  { id: 'structural', name: 'Structural Engineering', description: 'Stress analysis, beam design, column buckling, cross-sections, soil mechanics, and materials' },
];

export const DEFAULT_SETTINGS: ToolSettings = {
  enabled: Object.fromEntries(ALL_TOOL_CATEGORIES.map((c) => [c, true])) as Record<ToolCategory, boolean>,
  version: 1,
  updatedAt: new Date().toISOString(),
};
