import { PDFDocument } from 'pdf-lib';
import type { MergeOptions } from './types';
import { parsePageRanges, toUint8Array } from './utils';

export async function merge(
  files: (Buffer | Uint8Array)[],
  options: MergeOptions = {}
): Promise<Uint8Array> {
  const { pageRanges } = options;

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const fileData = toUint8Array(files[i]);
    const sourcePdf = await PDFDocument.load(fileData);
    const totalPages = sourcePdf.getPageCount();

    let pagesToCopy: number[];

    if (pageRanges && pageRanges[i]) {
      pagesToCopy = parsePageRanges(pageRanges[i], totalPages);
    } else {
      pagesToCopy = Array.from({ length: totalPages }, (_, j) => j + 1);
    }

    const pageIndices = pagesToCopy.map((p) => p - 1);
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  return mergedPdf.save();
}

export async function mergeAll(files: (Buffer | Uint8Array)[]): Promise<Uint8Array> {
  return merge(files);
}

export async function appendPages(
  target: Buffer | Uint8Array,
  source: Buffer | Uint8Array,
  pageRange?: string
): Promise<Uint8Array> {
  const targetPdf = await PDFDocument.load(toUint8Array(target));
  const sourcePdf = await PDFDocument.load(toUint8Array(source));

  const totalPages = sourcePdf.getPageCount();
  const pagesToCopy = pageRange
    ? parsePageRanges(pageRange, totalPages)
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  const pageIndices = pagesToCopy.map((p) => p - 1);
  const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);

  for (const page of copiedPages) {
    targetPdf.addPage(page);
  }

  return targetPdf.save();
}
