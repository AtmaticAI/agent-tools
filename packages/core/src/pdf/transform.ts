import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import type { RotateOptions, WatermarkOptions, CompressOptions } from './types';
import { parsePageRanges, toUint8Array } from './utils';

export async function rotate(
  file: Buffer | Uint8Array,
  options: RotateOptions
): Promise<Uint8Array> {
  const { pages: pageRange, degrees: deg } = options;
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);

  const allPages = pdf.getPages();
  const pagesToRotate = pageRange
    ? parsePageRanges(pageRange.join(','), allPages.length)
    : Array.from({ length: allPages.length }, (_, i) => i + 1);

  for (const pageNum of pagesToRotate) {
    const page = allPages[pageNum - 1];
    if (page) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + deg));
    }
  }

  return pdf.save();
}

export async function addWatermark(
  file: Buffer | Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const {
    text = 'WATERMARK',
    opacity = 0.3,
    rotation = -45,
    position = 'center',
    fontSize = 50,
    color = { r: 0.5, g: 0.5, b: 0.5 },
  } = options;

  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const x = (width - textWidth) / 2;
    let y = height / 2;

    if (position === 'top') {
      y = height - fontSize - 20;
    } else if (position === 'bottom') {
      y = 20;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return pdf.save();
}

export async function reorderPages(
  file: Buffer | Uint8Array,
  newOrder: number[]
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const sourcePdf = await PDFDocument.load(fileData);
  const newPdf = await PDFDocument.create();

  const pageIndices = newOrder.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  return newPdf.save();
}

export async function deletePage(
  file: Buffer | Uint8Array,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);
  const totalPages = pdf.getPageCount();

  const sortedPageNumbers = [...pageNumbers].sort((a, b) => b - a);

  for (const pageNum of sortedPageNumbers) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      pdf.removePage(pageNum - 1);
    }
  }

  return pdf.save();
}

export async function compress(
  file: Buffer | Uint8Array,
  _options: CompressOptions = { quality: 'medium' }
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);

  return pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}
