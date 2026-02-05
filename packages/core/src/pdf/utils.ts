import type { PageRange } from './types';

export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.toLowerCase() === 'all') {
      for (let i = 1; i <= totalPages; i++) {
        pages.add(i);
      }
      continue;
    }

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10) || 1;
      const end = parseInt(endStr, 10) || totalPages;

      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
        pages.add(i);
      }
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }
  }

  return [...pages].sort((a, b) => a - b);
}

export function parseRangesToGroups(
  rangeStr: string,
  totalPages: number
): PageRange[] {
  const ranges: PageRange[] = [];
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.toLowerCase() === 'all') {
      ranges.push({ start: 1, end: totalPages });
      continue;
    }

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10) || 1;
      const end = parseInt(endStr, 10) || totalPages;
      ranges.push({
        start: Math.max(1, start),
        end: Math.min(totalPages, end),
      });
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= totalPages) {
        ranges.push({ start: page, end: page });
      }
    }
  }

  return ranges;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function toUint8Array(data: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (Buffer.isBuffer(data)) {
    return new Uint8Array(data);
  }
  throw new Error('Invalid data type');
}
