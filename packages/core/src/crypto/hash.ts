import { createHash, createHmac, randomUUID } from 'crypto';
import type { HashAlgorithm, HashResult, HmacOptions, HmacResult, ChecksumResult, UuidResult } from './types';

export function hash(
  input: string,
  algorithm: HashAlgorithm = 'sha256'
): HashResult {
  const h = createHash(algorithm).update(input).digest('hex');
  return {
    algorithm,
    hash: h,
    inputLength: input.length,
  };
}

export function hmac(
  input: string,
  key: string,
  options: HmacOptions = {}
): HmacResult {
  const algorithm = options.algorithm ?? 'sha256';
  const h = createHmac(algorithm, key).update(input).digest('hex');
  return {
    algorithm,
    hmac: h,
  };
}

export function checksum(
  data: Buffer | Uint8Array | string,
  algorithm: HashAlgorithm = 'sha256'
): ChecksumResult {
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  const h = createHash(algorithm).update(buffer).digest('hex');
  return {
    algorithm,
    checksum: h,
    sizeBytes: buffer.length,
  };
}

export function generateUuid(): UuidResult {
  // Use Web Crypto API in browser, Node.js crypto otherwise
  let uuid: string;
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    uuid = globalThis.crypto.randomUUID();
  } else {
    uuid = randomUUID();
  }
  return {
    uuid,
    version: 4,
  };
}
