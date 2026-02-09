import { createHmac, randomBytes, randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'agent-tools-chat-session';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSecret(): string {
  if (process.env.CHAT_SESSION_SECRET) return process.env.CHAT_SESSION_SECRET;
  // Fallback: random per-instance (sessions won't survive restart)
  if (!(globalThis as Record<string, unknown>).__chatSecret) {
    (globalThis as Record<string, unknown>).__chatSecret = randomBytes(32).toString('hex');
  }
  return (globalThis as Record<string, unknown>).__chatSecret as string;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export interface ChatSession {
  id: string;
  messageCount: number;
  createdAt: number;
}

export function createSession(): ChatSession {
  return {
    id: randomUUID(),
    messageCount: 0,
    createdAt: Date.now(),
  };
}

export async function getSession(): Promise<ChatSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const dotIdx = raw.lastIndexOf('.');
  if (dotIdx === -1) return null;

  const payload = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);

  if (sign(payload) !== sig) return null;

  try {
    const session: ChatSession = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );
    // Check expiry
    if (Date.now() - session.createdAt > SESSION_TTL_MS) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: ChatSession): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(session)).toString('base64');
  const sig = sign(payload);
  cookieStore.set(COOKIE_NAME, `${payload}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function getMessageLimit(): number {
  const limit = parseInt(process.env.CHAT_MESSAGE_LIMIT ?? '0', 10);
  return isNaN(limit) ? 0 : limit;
}
