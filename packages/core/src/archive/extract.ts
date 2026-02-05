import AdmZip from 'adm-zip';
import type { ArchiveFile, ArchiveExtractOptions } from './types';

export async function extract(
  file: Buffer | Uint8Array,
  options: ArchiveExtractOptions = {}
): Promise<ArchiveFile[]> {
  const zip = new AdmZip(Buffer.from(file));
  const entries = zip.getEntries();
  const results: ArchiveFile[] = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    if (options.files && !options.files.includes(entry.entryName)) {
      continue;
    }

    results.push({
      path: entry.entryName,
      content: entry.getData(),
    });
  }

  return results;
}
