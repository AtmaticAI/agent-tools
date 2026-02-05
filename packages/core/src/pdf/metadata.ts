import { PDFDocument } from 'pdf-lib';
import type { PDFMetadata, PDFInfo, PageInfo } from './types';
import { toUint8Array } from './utils';

export async function getInfo(file: Buffer | Uint8Array): Promise<PDFInfo> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData, { ignoreEncryption: true });

  return {
    pageCount: pdf.getPageCount(),
    metadata: {
      title: pdf.getTitle(),
      author: pdf.getAuthor(),
      subject: pdf.getSubject(),
      keywords: pdf.getKeywords()?.split(',').map((k) => k.trim()),
      creator: pdf.getCreator(),
      producer: pdf.getProducer(),
      creationDate: pdf.getCreationDate(),
      modificationDate: pdf.getModificationDate(),
    },
    encrypted: false,
    version: 'PDF-1.7',
  };
}

export async function getMetadata(file: Buffer | Uint8Array): Promise<PDFMetadata> {
  const info = await getInfo(file);
  return info.metadata;
}

export async function setMetadata(
  file: Buffer | Uint8Array,
  metadata: Partial<PDFMetadata>
): Promise<Uint8Array> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);

  if (metadata.title !== undefined) pdf.setTitle(metadata.title);
  if (metadata.author !== undefined) pdf.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdf.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdf.setKeywords(metadata.keywords);
  if (metadata.creator !== undefined) pdf.setCreator(metadata.creator);
  if (metadata.producer !== undefined) pdf.setProducer(metadata.producer);

  return pdf.save();
}

export async function getPageInfo(file: Buffer | Uint8Array): Promise<PageInfo[]> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);

  const pages = pdf.getPages();
  return pages.map((page, index) => ({
    index,
    width: page.getWidth(),
    height: page.getHeight(),
    rotation: page.getRotation().angle,
  }));
}

export async function getPageCount(file: Buffer | Uint8Array): Promise<number> {
  const fileData = toUint8Array(file);
  const pdf = await PDFDocument.load(fileData);
  return pdf.getPageCount();
}
