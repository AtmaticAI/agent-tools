export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512';

export type EncodingFormat = 'base64' | 'hex' | 'url' | 'html';

export interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
  inputLength: number;
}

export interface HmacOptions {
  algorithm?: HashAlgorithm;
}

export interface HmacResult {
  algorithm: HashAlgorithm;
  hmac: string;
}

export interface JwtPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  expired?: boolean;
  expiresAt?: string;
}

export interface ChecksumResult {
  algorithm: HashAlgorithm;
  checksum: string;
  sizeBytes: number;
}

export interface UuidResult {
  uuid: string;
  version: number;
}
