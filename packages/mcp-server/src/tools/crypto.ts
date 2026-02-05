import { crypto as cryptoTools } from '@agent-tools/core';
import type { McpTool } from './index';

export const cryptoMcpTools: McpTool[] = [
  {
    name: 'agent_tools_crypto_hash',
    description:
      'Hash a string using MD5, SHA-1, SHA-256, SHA-384, or SHA-512. Returns the hex digest.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'String to hash' },
        algorithm: {
          type: 'string',
          enum: ['md5', 'sha1', 'sha256', 'sha384', 'sha512'],
          description: 'Hash algorithm (default: sha256)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = cryptoTools.hash(
        args.input as string,
        args.algorithm as cryptoTools.HashAlgorithm
      );
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_crypto_hmac',
    description:
      'Generate an HMAC (Hash-based Message Authentication Code) for a string with a secret key.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Message to authenticate' },
        key: { type: 'string', description: 'Secret key for HMAC' },
        algorithm: {
          type: 'string',
          enum: ['md5', 'sha1', 'sha256', 'sha384', 'sha512'],
          description: 'Hash algorithm (default: sha256)',
        },
      },
      required: ['input', 'key'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = cryptoTools.hmac(args.input as string, args.key as string, {
        algorithm: args.algorithm as cryptoTools.HashAlgorithm,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_crypto_encode',
    description:
      'Encode a string to Base64, Hex, URL-encoded, or HTML-encoded format.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'String to encode' },
        format: {
          type: 'string',
          enum: ['base64', 'hex', 'url', 'html'],
          description: 'Encoding format',
        },
      },
      required: ['input', 'format'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = cryptoTools.encode(
        args.input as string,
        args.format as cryptoTools.EncodingFormat
      );
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_crypto_decode',
    description:
      'Decode a string from Base64, Hex, URL-encoded, or HTML-encoded format.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Encoded string to decode' },
        format: {
          type: 'string',
          enum: ['base64', 'hex', 'url', 'html'],
          description: 'Encoding format to decode from',
        },
      },
      required: ['input', 'format'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = cryptoTools.decode(
        args.input as string,
        args.format as cryptoTools.EncodingFormat
      );
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_crypto_jwt_decode',
    description:
      'Decode a JWT token without verification. Returns header, payload, signature, and expiration status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        token: { type: 'string', description: 'JWT token to decode' },
      },
      required: ['token'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = cryptoTools.decodeJwt(args.token as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_crypto_uuid',
    description: 'Generate a new UUID v4.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
    handler: async () => {
      const result = cryptoTools.generateUuid();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_crypto_checksum',
    description:
      'Calculate the checksum of data. Useful for verifying file integrity. Accepts text or base64-encoded binary.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Text or base64-encoded data' },
        algorithm: {
          type: 'string',
          enum: ['md5', 'sha1', 'sha256', 'sha384', 'sha512'],
          description: 'Hash algorithm (default: sha256)',
        },
        base64: {
          type: 'boolean',
          description: 'Whether input is base64-encoded binary (default: false)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const data = args.base64
        ? Buffer.from(args.input as string, 'base64')
        : (args.input as string);
      const result = cryptoTools.checksum(data, args.algorithm as cryptoTools.HashAlgorithm);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
