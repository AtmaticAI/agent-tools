import { NextResponse } from 'next/server';
import { trace, SpanStatusCode, type Span } from '@opentelemetry/api';
import {
  getSession,
  createSession,
  setSessionCookie,
  getMessageLimit,
  type ChatSession,
} from '@/lib/chat-session';
import { buildSystemPrompt } from '@/lib/chat-system-prompt';
import { parseToolCalls, executeToolCalls, type ToolCallResult } from '@/lib/chat-tool-executor';
import { getLogger } from '@/lib/logger';

interface ChatRequestBody {
  message: string;
  enabledCategories: Record<string, boolean>;
  model?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

const DEFAULT_MODEL = 'microsoft/Phi-4-mini-instruct';
const HF_ENDPOINT = 'https://api-inference.huggingface.co/v1/chat/completions';
const MAX_LOG_CONTENT = 1000;

const tracer = trace.getTracer('agent-tools-chat');

function truncate(str: string, max = MAX_LOG_CONTENT): string {
  return str.length > max ? str.slice(0, max) + '...[truncated]' : str;
}

async function callLLM(
  messages: { role: string; content: string }[],
  model: string,
  parentSpan?: Span
): Promise<{ content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const doCall = async (span?: Span) => {
    span?.setAttributes({
      'llm.model': model,
      'llm.message_count': messages.length,
    });

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

    span?.setAttribute('llm.response_status', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      if (response.status === 402 || response.status === 429) {
        throw new Error('CREDITS_EXHAUSTED');
      }
      throw new Error(`HF API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage;

    if (usage && span) {
      span.setAttributes({
        'llm.usage.prompt_tokens': usage.prompt_tokens ?? 0,
        'llm.usage.completion_tokens': usage.completion_tokens ?? 0,
        'llm.usage.total_tokens': usage.total_tokens ?? 0,
      });
    }

    span?.setStatus({ code: SpanStatusCode.OK });
    return { content, usage };
  };

  if (parentSpan) {
    return tracer.startActiveSpan('llm.call', (span) => {
      return doCall(span)
        .then((result) => { span.end(); return result; })
        .catch((err) => {
          span.recordException(err);
          span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
          span.end();
          throw err;
        });
    });
  }

  return doCall();
}

export async function POST(request: Request) {
  return tracer.startActiveSpan('chat.request', async (parentSpan) => {
    const log = getLogger('chat');
    try {
      const body: ChatRequestBody = await request.json();
      const { message, enabledCategories, model, history } = body;

      if (!message || typeof message !== 'string') {
        parentSpan.end();
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Session management
      let session: ChatSession | null = await getSession();
      if (!session) {
        session = createSession();
      }

      const selectedModel = model || process.env.CHAT_MODEL || DEFAULT_MODEL;

      parentSpan.setAttributes({
        'chat.session_id': session.id,
        'chat.model': selectedModel,
      });

      // Log user message
      log.info({
        event: 'chat.user_message',
        sessionId: session.id,
        role: 'user',
        content: truncate(message),
        model: selectedModel,
        timestamp: new Date().toISOString(),
      });
      parentSpan.addEvent('chat.message', {
        'message.role': 'user',
        'message.content': truncate(message),
      });

      // Check message limit
      const limit = getMessageLimit();
      if (limit > 0 && session.messageCount >= limit) {
        parentSpan.end();
        return NextResponse.json({
          limited: true,
          message: `You've reached the free message limit (${limit} messages). Visit atmatic.ai/tools for unlimited access.`,
          url: 'https://atmatic.ai/tools',
        });
      }

      // Build conversation
      const systemPrompt = buildSystemPrompt(enabledCategories || {});

      const messages: { role: string; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add history
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-20)) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: 'user', content: message });

      // First LLM call
      let assistantResponse: string;
      try {
        const result = await callLLM(messages, selectedModel, parentSpan);
        assistantResponse = result.content;
      } catch (e) {
        const err = e as Error;
        if (err.message === 'AI_NOT_CONFIGURED') {
          parentSpan.end();
          return NextResponse.json({
            error: 'AI service is not configured. Set the HF_TOKEN environment variable.',
            code: 'AI_NOT_CONFIGURED',
          }, { status: 503 });
        }
        if (err.message === 'CREDITS_EXHAUSTED') {
          parentSpan.end();
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
        // Execute each tool call with its own span
        toolResults = [];
        for (const tc of toolCalls) {
          await tracer.startActiveSpan(`tool.execute.${tc.tool}`, async (toolSpan) => {
            const startTime = Date.now();
            toolSpan.setAttributes({
              'tool.name': tc.tool,
              'tool.arguments': truncate(JSON.stringify(tc.arguments)),
            });

            try {
              const [result] = await executeToolCalls([tc], enabledCategories || {});
              toolResults.push(result);
              toolSpan.setAttributes({
                'tool.success': result.success,
                'tool.duration_ms': Date.now() - startTime,
              });
              toolSpan.setStatus({ code: SpanStatusCode.OK });
            } catch (err) {
              toolSpan.recordException(err as Error);
              toolSpan.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
              toolResults.push({ tool: tc.tool, success: false, result: (err as Error).message });
            } finally {
              toolSpan.end();
            }
          });
        }

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
          const result = await callLLM(messages, selectedModel, parentSpan);
          assistantResponse = result.content;
        } catch {
          assistantResponse = `I executed the tools. Here are the results:\n\n${toolResults.map((r) => `**${r.tool}**: ${r.success ? r.result : `Error - ${r.result}`}`).join('\n\n')}`;
        }
      }

      // Log assistant response
      const toolsUsed = toolResults.length > 0 ? toolResults.map((r) => r.tool) : undefined;
      log.info({
        event: 'chat.assistant_message',
        sessionId: session.id,
        role: 'assistant',
        content: truncate(assistantResponse),
        model: selectedModel,
        toolsUsed,
        timestamp: new Date().toISOString(),
      });
      parentSpan.addEvent('chat.message', {
        'message.role': 'assistant',
        'message.content': truncate(assistantResponse),
      });

      // Update session
      session.messageCount += 1;
      await setSessionCookie(session);

      const messagesRemaining =
        limit > 0 ? Math.max(0, limit - session.messageCount) : null;

      parentSpan.setStatus({ code: SpanStatusCode.OK });
      parentSpan.end();

      return NextResponse.json({
        message: assistantResponse,
        toolResults: toolResults.length > 0 ? toolResults : undefined,
        messagesRemaining,
      });
    } catch (error) {
      const err = error as Error;
      log.error({
        event: 'chat.error',
        error: err.message,
        stack: err.stack,
      });
      parentSpan.recordException(err);
      parentSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      parentSpan.end();

      return NextResponse.json(
        { error: `Chat failed: ${err.message}` },
        { status: 500 }
      );
    }
  });
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
