import type { JwtPayload } from './types';

function base64UrlDecode(str: string): string {
  // Replace base64url characters with standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  // Use atob for browser, Buffer for Node.js
  if (typeof atob === 'function') {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: must have 3 parts separated by dots');
  }

  const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;

  const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;

  const result: JwtPayload = {
    header,
    payload,
    signature: parts[2],
  };

  if (typeof payload.exp === 'number') {
    const expDate = new Date(payload.exp * 1000);
    result.expired = expDate < new Date();
    result.expiresAt = expDate.toISOString();
  }

  return result;
}
