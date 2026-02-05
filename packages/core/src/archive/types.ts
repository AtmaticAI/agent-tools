export type ArchiveFormat = 'zip' | 'tar' | 'tar.gz';

export interface ArchiveEntry {
  path: string;
  size: number;
  compressedSize?: number;
  isDirectory: boolean;
  modified?: string;
}

export interface ArchiveCreateOptions {
  format?: ArchiveFormat;
  compressionLevel?: number;
}

export interface ArchiveExtractOptions {
  files?: string[];
}

export interface ArchiveStats {
  format: string;
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  compressedSize: number;
  entries: ArchiveEntry[];
}

export interface ArchiveFile {
  path: string;
  content: Buffer;
}
