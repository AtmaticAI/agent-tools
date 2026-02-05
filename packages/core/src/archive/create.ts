import archiver from 'archiver';
import { PassThrough } from 'stream';
import type { ArchiveCreateOptions, ArchiveFile } from './types';

export async function create(
  files: ArchiveFile[],
  options: ArchiveCreateOptions = {}
): Promise<Uint8Array> {
  const format = options.format ?? 'zip';
  const level = options.compressionLevel ?? 6;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const output = new PassThrough();

    output.on('data', (chunk: Buffer) => chunks.push(chunk));
    output.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    output.on('error', reject);

    const archiverFormat = format === 'tar.gz' ? 'tar' : format;
    const archiverOptions =
      format === 'tar.gz'
        ? { gzip: true, gzipOptions: { level } }
        : format === 'zip'
          ? { zlib: { level } }
          : {};

    const archive = archiver(archiverFormat as 'zip' | 'tar', archiverOptions);
    archive.on('error', reject);
    archive.pipe(output);

    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize();
  });
}
