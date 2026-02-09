import { NextResponse } from 'next/server';
import {
  getSession,
  createSession,
  setSessionCookie,
  getMessageLimit,
  type ChatSession,
} from '@/lib/chat-session';
import { buildSystemPrompt } from '@/lib/chat-system-prompt';
import { parseToolCalls, executeToolCalls, type ToolCallResult } from '@/lib/chat-tool-executor';

interface ChatRequestBody {
  message: string;
  enabledCategories: Record<string, boolean>;
  model?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const DEFAULT_MODEL = 'microsoft/Phi-4-mini-instruct';
const HF_ENDPOINT = 'https://api-inference.huggingface.co/v1/chat/completions';

async function callLLM(
  messages: { role: string; content: string }[],
  model: string
): Promise<string> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const response = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hfToken}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    if (response.status === 402 || response.status === 429) {
      throw new Error('CREDITS_EXHAUSTED');
    }
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, enabledCategories, model, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Session management
    let session: ChatSession | null = await getSession();
    if (!session) {
      session = createSession();
    }

    // Check message limit
    const limit = getMessageLimit();
    if (limit > 0 && session.messageCount >= limit) {
      return NextResponse.json({
        limited: true,
        message: `You've reached the free message limit (${limit} messages). Visit atmatic.ai/tools for unlimited access.`,
        url: 'https://atmatic.ai/tools',
      });
    }

    // Build conversation
    const systemPrompt = buildSystemPrompt(enabledCategories || {});
    const selectedModel = model || process.env.CHAT_MODEL || DEFAULT_MODEL;

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-20)) {
        // Keep last 20 messages for context
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    // First LLM call
    let assistantResponse: string;
    try {
      assistantResponse = await callLLM(messages, selectedModel);
    } catch (e) {
      const err = e as Error;
      if (err.message === 'AI_NOT_CONFIGURED') {
        return NextResponse.json({
          error: 'AI service is not configured. Set the HF_TOKEN environment variable.',
          code: 'AI_NOT_CONFIGURED',
        }, { status: 503 });
      }
      if (err.message === 'CREDITS_EXHAUSTED') {
        return NextResponse.json({
          error: 'AI credits exhausted',
          code: 'CREDITS_EXHAUSTED',
        }, { status: 503 });
      }
      throw e;
    }

    // Check for tool calls in response
    let toolResults: ToolCallResult[] = [];
    const toolCalls = parseToolCalls(assistantResponse);

    if (toolCalls.length > 0) {
      toolResults = await executeToolCalls(toolCalls, enabledCategories || {});

      // Build tool results context and re-call LLM
      const toolResultsText = toolResults
        .map(
          (r) =>
            `Tool: ${r.tool}\nStatus: ${r.success ? 'Success' : 'Error'}\nResult:\n${r.result}`
        )
        .join('\n\n---\n\n');

      messages.push({ role: 'assistant', content: assistantResponse });
      messages.push({
        role: 'user',
        content: `Here are the tool execution results:\n\n${toolResultsText}\n\nPlease summarize the results for the user in a clear, helpful way.`,
      });

      try {
        assistantResponse = await callLLM(messages, selectedModel);
      } catch {
        // If second call fails, use original response with tool results
        assistantResponse = `I executed the tools. Here are the results:\n\n${toolResults.map((r) => `**${r.tool}**: ${r.success ? r.result : `Error - ${r.result}`}`).join('\n\n')}`;
      }
    }

    // Update session
    session.messageCount += 1;
    await setSessionCookie(session);

    const messagesRemaining =
      limit > 0 ? Math.max(0, limit - session.messageCount) : null;

    return NextResponse.json({
      message: assistantResponse,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      messagesRemaining,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: `Chat failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  const limit = getMessageLimit();
  const hasToken = !!process.env.HF_TOKEN;

  return NextResponse.json({
    hasSession: !!session,
    messageCount: session?.messageCount ?? 0,
    messageLimit: limit,
    messagesRemaining: limit > 0 && session ? Math.max(0, limit - session.messageCount) : null,
    configured: hasToken,
    model: process.env.CHAT_MODEL || DEFAULT_MODEL,
  });
}
