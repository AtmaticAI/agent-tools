import { crypto as cryptoTools } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const cryptoSkill: Skill = {
  id: 'crypto-operations',
  name: 'Crypto & Encoding Processing',
  description:
    'Hash, HMAC, checksum, encode, decode, decode JWTs, and generate UUIDs',
  tags: ['crypto', 'hash', 'encode', 'decode', 'jwt', 'uuid'],
  examples: [
    'Hash text with SHA-256',
    'Generate HMAC with a secret key',
    'Compute file checksum',
    'Encode string to base64',
    'Decode base64 string',
    'Decode and inspect a JWT token',
    'Generate a new UUID',
  ],
  inputModes: ['text/plain', 'application/octet-stream'],
  outputModes: ['text/plain', 'application/json'],
};

export async function handleCryptoSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'hash': {
      const result = cryptoTools.hash(
        data as string,
        options.algorithm as cryptoTools.HashAlgorithm,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'hmac': {
      const result = cryptoTools.hmac(
        data as string,
        options.key as string,
        {
          algorithm: options.algorithm as cryptoTools.HashAlgorithm,
        },
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'checksum': {
      const result = cryptoTools.checksum(
        data as string,
        options.algorithm as cryptoTools.HashAlgorithm,
      );
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'encode': {
      const result = cryptoTools.encode(
        data as string,
        options.format as cryptoTools.EncodingFormat,
      );
      return [{ type: 'text', text: result }];
    }

    case 'decode': {
      const result = cryptoTools.decode(
        data as string,
        options.format as cryptoTools.EncodingFormat,
      );
      return [{ type: 'text', text: result }];
    }

    case 'jwt': {
      const result = cryptoTools.decodeJwt(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'uuid': {
      const result = cryptoTools.generateUuid();
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown Crypto action: ${action}`);
  }
}
