import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

const transport =
  process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined;

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});

export function getLogger(module?: string) {
  const span = trace.getSpan(context.active());
  const spanContext = span?.spanContext();

  const bindings: Record<string, string> = {};
  if (module) bindings.module = module;
  if (spanContext?.traceId) bindings.traceId = spanContext.traceId;
  if (spanContext?.spanId) bindings.spanId = spanContext.spanId;

  return baseLogger.child(bindings);
}

export default baseLogger;
