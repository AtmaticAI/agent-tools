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
import { parseToolCalls, executeToolCalls, type ToolCallResult, type ChatFile } from '@/lib/chat-tool-executor';
import { validateBase64File } from '@/lib/validate-file';
import { formatBytes } from '@/lib/utils';
import { getLogger } from '@/lib/logger';

interface ChatRequestBody {
  message: string;
  enabledCategories: Record<string, boolean>;
  model?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  files?: ChatFile[];
}

const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';
const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
const MAX_LOG_CONTENT = 1000;

const tracer = trace.getTracer('agent-tools-chat');

function truncate(str: string, max = MAX_LOG_CONTENT): string {
  return str.length > max ? str.slice(0, max) + '...[truncated]' : str;
}

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

async function callLLM(
  messages: { role: string; content: string }[],
  model: string,
  parentSpan?: Span
): Promise<{ content: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }> {
  const log = getLogger('chat');
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const doCall = async (span?: Span) => {
    span?.setAttributes({
      'llm.model': model,
      'llm.message_count': messages.length,
    });

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
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
        if (attempt > 0) {
          log.info({ event: 'chat.retry_succeeded', attempt: attempt + 1 });
        }
        return { content, usage };
      } catch (e) {
        lastError = e as Error;
        // Don't retry non-transient errors
        if (lastError.message === 'AI_NOT_CONFIGURED' || lastError.message === 'CREDITS_EXHAUSTED') {
          throw lastError;
        }
        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_BASE_MS * Math.pow(2, attempt); // 1s, 2s, 4s
          log.warn({ event: 'chat.retry', attempt: attempt + 1, delay, error: lastError.message });
          span?.addEvent('llm.retry', { attempt: attempt + 1, delay, error: lastError.message });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
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
      const { message, enabledCategories, model, history, files } = body;

      if (!message || typeof message !== 'string') {
        parentSpan.end();
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Validate attached files
      if (files && files.length > 0) {
        if (files.length > 3) {
          parentSpan.end();
          return NextResponse.json(
            { error: 'Maximum 3 files per message' },
            { status: 400 }
          );
        }
        for (const f of files) {
          const sizeError = validateBase64File(f.base64, f.name);
          if (sizeError) {
            parentSpan.end();
            return sizeError;
          }
        }
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
      const hasFiles = files && files.length > 0;
      const fileContext = hasFiles
        ? files
            .map((f, i) => `- __file:${i}__: ${f.name} (${formatBytes(f.size)}, ${f.type})`)
            .join('\n')
        : undefined;
      const systemPrompt = buildSystemPrompt(enabledCategories || {}, fileContext);

      const messages: { role: string; content: string }[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add history
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-20)) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // Augment user message with file references
      let userContent = message;
      if (hasFiles) {
        userContent += `\n\n---\nAttached files (use __file:N__ as the file parameter value in tool calls):\n${fileContext}`;
      }

      messages.push({ role: 'user', content: userContent });

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

      // Tool execution loop (max 3 rounds for multi-step workflows)
      const MAX_TOOL_ROUNDS = 3;
      const toolResults: ToolCallResult[] = [];

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const toolCalls = parseToolCalls(assistantResponse);
        if (toolCalls.length === 0) break;

        // Execute each tool call with its own span
        const roundResults: ToolCallResult[] = [];
        for (const tc of toolCalls) {
          await tracer.startActiveSpan(`tool.execute.${tc.tool}`, async (toolSpan) => {
            const startTime = Date.now();
            toolSpan.setAttributes({
              'tool.name': tc.tool,
              'tool.arguments': truncate(JSON.stringify(tc.arguments)),
            });

            try {
              const [result] = await executeToolCalls([tc], enabledCategories || {}, files);
              roundResults.push(result);
              toolSpan.setAttributes({
                'tool.success': result.success,
                'tool.duration_ms': Date.now() - startTime,
              });
              toolSpan.setStatus({ code: SpanStatusCode.OK });
            } catch (err) {
              toolSpan.recordException(err as Error);
              toolSpan.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
              roundResults.push({ tool: tc.tool, success: false, result: (err as Error).message });
            } finally {
              toolSpan.end();
            }
          });
        }

        toolResults.push(...roundResults);

        // Truncate large base64 results before sending to LLM (keep for client response)
        const toolResultsText = roundResults
          .map((r) => {
            const resultText = r.result.length > 500 && /^[A-Za-z0-9+/=\s]+$/.test(r.result.trim())
              ? `[Base64 file data, ${formatBytes(Buffer.from(r.result.trim(), 'base64').length)}]`
              : r.result;
            return `Tool: ${r.tool}\nStatus: ${r.success ? 'Success' : 'Error'}\nResult:\n${resultText}`;
          })
          .join('\n\n---\n\n');

        messages.push({ role: 'assistant', content: assistantResponse });

        const isLastRound = round === MAX_TOOL_ROUNDS - 1;
        messages.push({
          role: 'user',
          content: isLastRound
            ? `Here are the tool execution results:\n\n${toolResultsText}\n\nPlease summarize the results for the user in a clear, helpful way.`
            : `Here are the tool execution results:\n\n${toolResultsText}\n\nIf you need to call more tools to complete the task, do so now. Otherwise, summarize the results for the user.`,
        });

        try {
          const result = await callLLM(messages, selectedModel, parentSpan);
          assistantResponse = result.content;
        } catch {
          assistantResponse = `I executed the tools. Here are the results:\n\n${roundResults.map((r) => `**${r.tool}**: ${r.success ? r.result : `Error - ${r.result}`}`).join('\n\n')}`;
          break;
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

      // Sanitize LLM response: strip base64 data and broken image references
      assistantResponse = assistantResponse
        // Remove markdown images with data URIs: ![...](data:...)
        .replace(/!\[[^\]]*\]\(data:[^)]+\)/g, '')
        // Remove markdown images with long base64 strings: ![...](AAAA...)
        .replace(/!\[[^\]]*\]\([A-Za-z0-9+/=]{100,}\)/g, '')
        // Remove raw base64 blocks (100+ chars of base64 on their own line)
        .replace(/^[A-Za-z0-9+/=]{100,}$/gm, '')
        // Remove leftover data: URIs
        .replace(/data:[a-z]+\/[a-z.+-]+;base64,[A-Za-z0-9+/=]+/g, '')
        // Collapse multiple blank lines
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Extract downloadable file outputs from tool results
      const TOOL_FILE_TYPES: Record<string, { ext: string; mime: string }> = {
        agent_tools_pdf_fill_form: { ext: 'pdf', mime: 'application/pdf' },
        agent_tools_pdf_split: { ext: 'pdf', mime: 'application/pdf' },
        agent_tools_pdf_merge: { ext: 'pdf', mime: 'application/pdf' },
        agent_tools_image_resize: { ext: 'png', mime: 'image/png' },
        agent_tools_image_convert: { ext: 'png', mime: 'image/png' },
        agent_tools_archive_create: { ext: 'zip', mime: 'application/zip' },
      };

      const fileOutputs: { name: string; base64: string; mime: string }[] = [];
      const clientToolResults = toolResults.map((r) => {
        const fileType = TOOL_FILE_TYPES[r.tool];
        if (fileType && r.success && r.result.length > 500 && /^[A-Za-z0-9+/=\s]+$/.test(r.result.trim())) {
          const idx = fileOutputs.length;
          fileOutputs.push({
            name: `output-${idx + 1}.${fileType.ext}`,
            base64: r.result.trim(),
            mime: fileType.mime,
          });
          return { ...r, result: `[File generated: output-${idx + 1}.${fileType.ext}]` };
        }
        return r;
      });

      parentSpan.setStatus({ code: SpanStatusCode.OK });
      parentSpan.end();

      return NextResponse.json({
        message: assistantResponse,
        toolResults: clientToolResults.length > 0 ? clientToolResults : undefined,
        fileOutputs: fileOutputs.length > 0 ? fileOutputs : undefined,
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
