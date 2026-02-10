import type { ExtractTextOptions } from './types';
import { toUint8Array, parsePageRanges } from './utils';

export async function extractText(
  file: Buffer | Uint8Array,
  options: ExtractTextOptions = {}
): Promise<string> {
  const { pages: pageNums } = options;
  const fileData = toUint8Array(file);

  try {
    const pdfParse = await import('pdf-parse');
    const parser = pdfParse.default || pdfParse;

    if (pageNums && pageNums.length > 0) {
      const result = await parser(Buffer.from(fileData), {
        max: Math.max(...pageNums),
      });

      return result.text;
    }

    const result = await parser(Buffer.from(fileData));
    return result.text;
  } catch (error) {
    throw new Error(`Failed to extract text: ${(error as Error).message}`);
  }
}

export async function extractTextFromPages(
  file: Buffer | Uint8Array,
  pageRange: string
): Promise<Record<number, string>> {
  const fileData = toUint8Array(file);

  try {
    const pdfParse = await import('pdf-parse');
    const parser = pdfParse.default || pdfParse;

    const result = await parser(Buffer.from(fileData));
    const totalPages = result.numpages;
    const pages = parsePageRanges(pageRange, totalPages);

    const pageTexts: Record<number, string> = {};

    const fullText = result.text;
    const textPerPage = fullText.length / totalPages;

    for (const pageNum of pages) {
      const start = (pageNum - 1) * textPerPage;
      const end = pageNum * textPerPage;
      pageTexts[pageNum] = fullText.slice(start, end).trim();
    }

    return pageTexts;
  } catch (error) {
    throw new Error(`Failed to extract text: ${(error as Error).message}`);
  }
}

export async function hasText(file: Buffer | Uint8Array): Promise<boolean> {
  try {
    const text = await extractText(file);
    return text.trim().length > 0;
  } catch {
    return false;
  }
}
