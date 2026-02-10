import { PDFDocument } from 'pdf-lib';
import type { SplitOptions } from './types';
import { parsePageRanges, parseRangesToGroups, toUint8Array } from './utils';

export async function split(
  file: Buffer | Uint8Array,
  options: SplitOptions
): Promise<Uint8Array[]> {
  const { ranges } = options;
  const fileData = toUint8Array(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const totalPages = sourcePdf.getPageCount();

  const rangeGroups = parseRangesToGroups(ranges, totalPages);
  const results: Uint8Array[] = [];

  for (const range of rangeGroups) {
    const newPdf = await PDFDocument.create();
    const pageIndices: number[] = [];

    for (let i = range.start; i <= range.end; i++) {
      pageIndices.push(i - 1);
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    results.push(await newPdf.save());
  }

  return results;
}

export async function extractPages(
  file: Buffer | Uint8Array,
  pageRange: string
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const totalPages = sourcePdf.getPageCount();

  const pages = parsePageRanges(pageRange, totalPages);
  const newPdf = await PDFDocument.create();

  const pageIndices = pages.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  return newPdf.save();
}

export async function splitEveryN(
  file: Buffer | Uint8Array,
  n: number
): Promise<Uint8Array[]> {
  const fileData = toUint8Array(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const totalPages = sourcePdf.getPageCount();

  const ranges: string[] = [];
  for (let i = 1; i <= totalPages; i += n) {
    const end = Math.min(i + n - 1, totalPages);
    ranges.push(`${i}-${end}`);
  }

  return split(file, { ranges: ranges.join(',') });
}

export async function splitIntoSingle(
  file: Buffer | Uint8Array
): Promise<Uint8Array[]> {
  return splitEveryN(file, 1);
}
