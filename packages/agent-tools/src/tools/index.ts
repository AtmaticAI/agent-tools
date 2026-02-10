import { jsonTools } from './json';
import { csvTools } from './csv';
import { pdfTools } from './pdf';
import { xmlTools } from './xml';
import { excelTools } from './excel';
import { imageTools } from './image';
import { markdownTools } from './markdown';
import { archiveTools } from './archive';
import { regexTools } from './regex';
import { diffTools } from './diff';
import { sqlTools } from './sql';
import { cryptoMcpTools } from './crypto';
import { datetimeTools } from './datetime';
import { textTools } from './text';
import { mathTools } from './math';
import { colorTools } from './color';
import { physicsTools } from './physics';
import { structuralTools } from './structural';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<{
    content: { type: 'text'; text: string }[];
    isError?: boolean;
  }>;
}

export const allTools = [
  ...jsonTools,
  ...csvTools,
  ...pdfTools,
  ...xmlTools,
  ...excelTools,
  ...imageTools,
  ...markdownTools,
  ...archiveTools,
  ...regexTools,
  ...diffTools,
  ...sqlTools,
  ...cryptoMcpTools,
  ...datetimeTools,
  ...textTools,
  ...mathTools,
  ...colorTools,
  ...physicsTools,
  ...structuralTools,
] as unknown as McpTool[];

export { jsonTools, csvTools, pdfTools };
export { xmlTools, excelTools, imageTools, markdownTools, archiveTools };
export { regexTools, diffTools, sqlTools, cryptoMcpTools, datetimeTools };
export { textTools, mathTools, colorTools, physicsTools };
export { structuralTools };
