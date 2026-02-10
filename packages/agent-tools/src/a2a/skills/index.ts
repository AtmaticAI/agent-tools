import { jsonSkill, handleJsonSkill } from './json';
import { csvSkill, handleCsvSkill } from './csv';
import { pdfSkill, handlePdfSkill } from './pdf';
import { xmlSkill, handleXmlSkill } from './xml';
import { excelSkill, handleExcelSkill } from './excel';
import { imageSkill, handleImageSkill } from './image';
import { markdownSkill, handleMarkdownSkill } from './markdown';
import { archiveSkill, handleArchiveSkill } from './archive';
import { regexSkill, handleRegexSkill } from './regex';
import { diffSkill, handleDiffSkill } from './diff';
import { sqlSkill, handleSqlSkill } from './sql';
import { cryptoSkill, handleCryptoSkill } from './crypto';
import { datetimeSkill, handleDatetimeSkill } from './datetime';
import { textSkill, handleTextSkill } from './text';
import { mathSkill, handleMathSkill } from './math';
import { colorSkill, handleColorSkill } from './color';
import { physicsSkill, handlePhysicsSkill } from './physics';
import { structuralSkill, handleStructuralSkill } from './structural';
import type { Skill, TaskInput, Part } from '../types';

export const skills: Skill[] = [
  jsonSkill,
  csvSkill,
  pdfSkill,
  xmlSkill,
  excelSkill,
  imageSkill,
  markdownSkill,
  archiveSkill,
  regexSkill,
  diffSkill,
  sqlSkill,
  cryptoSkill,
  datetimeSkill,
  textSkill,
  mathSkill,
  colorSkill,
  physicsSkill,
  structuralSkill,
];

export async function handleSkill(
  skillId: string,
  input: TaskInput
): Promise<Part[]> {
  switch (skillId) {
    case 'json-operations':
      return handleJsonSkill(input);
    case 'csv-operations':
      return handleCsvSkill(input);
    case 'pdf-operations':
      return handlePdfSkill(input);
    case 'xml-operations':
      return handleXmlSkill(input);
    case 'excel-operations':
      return handleExcelSkill(input);
    case 'image-operations':
      return handleImageSkill(input);
    case 'markdown-operations':
      return handleMarkdownSkill(input);
    case 'archive-operations':
      return handleArchiveSkill(input);
    case 'regex-operations':
      return handleRegexSkill(input);
    case 'diff-operations':
      return handleDiffSkill(input);
    case 'sql-operations':
      return handleSqlSkill(input);
    case 'crypto-operations':
      return handleCryptoSkill(input);
    case 'datetime-operations':
      return handleDatetimeSkill(input);
    case 'text-operations':
      return handleTextSkill(input);
    case 'math-operations':
      return handleMathSkill(input);
    case 'color-operations':
      return handleColorSkill(input);
    case 'physics-operations':
      return handlePhysicsSkill(input);
    case 'structural-operations':
      return handleStructuralSkill(input);
    default:
      throw new Error(`Unknown skill: ${skillId}`);
  }
}

export { jsonSkill, csvSkill, pdfSkill };
export { handleJsonSkill, handleCsvSkill, handlePdfSkill };
export { xmlSkill, excelSkill, imageSkill, markdownSkill, archiveSkill };
export { handleXmlSkill, handleExcelSkill, handleImageSkill, handleMarkdownSkill, handleArchiveSkill };
export { regexSkill, diffSkill, sqlSkill, cryptoSkill, datetimeSkill };
export { handleRegexSkill, handleDiffSkill, handleSqlSkill, handleCryptoSkill, handleDatetimeSkill };
export { textSkill, mathSkill, colorSkill };
export { handleTextSkill, handleMathSkill, handleColorSkill, handlePhysicsSkill };
export { physicsSkill };
export { structuralSkill, handleStructuralSkill };
