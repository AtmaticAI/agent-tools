import { NextResponse } from 'next/server';
import { formatBytes } from '@/lib/utils';

const DEFAULT_MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES =
  (Number(process.env.MAX_FILE_SIZE_MB) || DEFAULT_MAX_FILE_SIZE_MB) * 1024 * 1024;

export function validateBase64File(
  base64: string,
  label = 'File'
): NextResponse | null {
  const byteLength = Buffer.from(base64, 'base64').length;
  if (byteLength > MAX_FILE_SIZE_BYTES) {
    const limitMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return NextResponse.json(
      {
        error: `${label} exceeds ${limitMB}MB limit (got ${formatBytes(byteLength)})`,
      },
      { status: 413 }
    );
  }
  return null;
}

export function validateBase64Files(
  files: string[],
  maxTotal = MAX_FILE_SIZE_BYTES * 3
): NextResponse | null {
  let totalBytes = 0;
  for (let i = 0; i < files.length; i++) {
    const singleError = validateBase64File(files[i], `File ${i + 1}`);
    if (singleError) return singleError;
    totalBytes += Buffer.from(files[i], 'base64').length;
  }
  if (totalBytes > maxTotal) {
    const limitMB = maxTotal / (1024 * 1024);
    return NextResponse.json(
      {
        error: `Total file size exceeds ${limitMB}MB limit (got ${formatBytes(totalBytes)})`,
      },
      { status: 413 }
    );
  }
  return null;
}
