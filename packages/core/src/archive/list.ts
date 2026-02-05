import AdmZip from 'adm-zip';
import type { ArchiveEntry, ArchiveStats } from './types';

export async function list(
  file: Buffer | Uint8Array
): Promise<ArchiveEntry[]> {
  const zip = new AdmZip(Buffer.from(file));
  const entries = zip.getEntries();

  return entries.map((entry) => ({
    path: entry.entryName,
    size: entry.header.size,
    compressedSize: entry.header.compressedSize,
    isDirectory: entry.isDirectory,
    modified: entry.header.time ? new Date(entry.header.time).toISOString() : undefined,
  }));
}

export async function getStats(
  file: Buffer | Uint8Array
): Promise<ArchiveStats> {
  const entries = await list(file);

  let totalSize = 0;
  let compressedSize = 0;
  let fileCount = 0;
  let directoryCount = 0;

  for (const entry of entries) {
    if (entry.isDirectory) {
      directoryCount++;
    } else {
      fileCount++;
      totalSize += entry.size;
      compressedSize += entry.compressedSize ?? entry.size;
    }
  }

  return {
    format: 'zip',
    fileCount,
    directoryCount,
    totalSize,
    compressedSize,
    entries,
  };
}
