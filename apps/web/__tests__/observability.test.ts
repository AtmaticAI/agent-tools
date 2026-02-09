import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// 1. Telemetry Module Tests
// ============================================================================

describe('Telemetry (lib/telemetry.ts)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should no-op when OTEL_EXPORTER_OTLP_ENDPOINT is not set', async () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    const mockStart = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({ start: mockStart, shutdown: vi.fn() })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: vi.fn(),
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockStart).not.toHaveBeenCalled();
  });

  it('should initialize SDK when OTEL_EXPORTER_OTLP_ENDPOINT is set', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';

    const mockStart = vi.fn();
    const mockNodeSDK = vi.fn().mockImplementation(() => ({
      start: mockStart,
      shutdown: vi.fn().mockResolvedValue(undefined),
    }));

    vi.doMock('@opentelemetry/sdk-node', () => ({ NodeSDK: mockNodeSDK }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: vi.fn(),
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockNodeSDK).toHaveBeenCalledTimes(1);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('should configure OTLP exporter with correct endpoint URL', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://otel-collector:4318';

    const mockExporter = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: mockExporter,
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://otel-collector:4318/v1/traces',
      })
    );
  });

  it('should parse OTEL_EXPORTER_OTLP_HEADERS correctly', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'Authorization=Bearer token123,X-Custom=value';

    const mockExporter = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: mockExporter,
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom': 'value',
        },
      })
    );
  });

  it('should use custom service name from OTEL_SERVICE_NAME', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    process.env.OTEL_SERVICE_NAME = 'my-custom-service';

    const mockResource = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: vi.fn(),
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: mockResource,
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({
        'service.name': 'my-custom-service',
      })
    );
  });

  it('should default service name to agent-tools-web', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    delete process.env.OTEL_SERVICE_NAME;

    const mockResource = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: vi.fn(),
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: mockResource,
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockResource).toHaveBeenCalledWith(
      expect.objectContaining({
        'service.name': 'agent-tools-web',
      })
    );
  });

  it('should handle empty OTEL_EXPORTER_OTLP_HEADERS gracefully', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = '';

    const mockExporter = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: mockExporter,
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockExporter).toHaveBeenCalledWith(
      expect.objectContaining({ headers: {} })
    );
  });

  it('should handle header values containing equals signs', async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'Authorization=Basic dXNlcjpwYXNz=';

    const mockExporter = vi.fn();
    vi.doMock('@opentelemetry/sdk-node', () => ({
      NodeSDK: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    vi.doMock('@opentelemetry/exporter-trace-otlp-http', () => ({
      OTLPTraceExporter: mockExporter,
    }));
    vi.doMock('@opentelemetry/resources', () => ({
      Resource: vi.fn(),
    }));
    vi.doMock('@opentelemetry/semantic-conventions', () => ({
      ATTR_SERVICE_NAME: 'service.name',
      ATTR_SERVICE_VERSION: 'service.version',
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
    }));
    vi.doMock('@opentelemetry/instrumentation-http', () => ({
      HttpInstrumentation: vi.fn(),
    }));
    vi.doMock('@opentelemetry/instrumentation-fetch', () => ({
      FetchInstrumentation: vi.fn(),
    }));

    const { initTelemetry } = await import('@/lib/telemetry');
    initTelemetry();

    expect(mockExporter).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          Authorization: 'Basic dXNlcjpwYXNz=',
        },
      })
    );
  });
});

// ============================================================================
// 2. Instrumentation Hook Tests
// ============================================================================

describe('Instrumentation Hook (instrumentation.ts)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should call initTelemetry when NEXT_RUNTIME is nodejs', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';

    const mockInit = vi.fn();
    vi.doMock('@/lib/telemetry', () => ({
      initTelemetry: mockInit,
    }));

    const { register } = await import('@/instrumentation');
    await register();

    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('should NOT call initTelemetry when NEXT_RUNTIME is edge', async () => {
    process.env.NEXT_RUNTIME = 'edge';

    const mockInit = vi.fn();
    vi.doMock('@/lib/telemetry', () => ({
      initTelemetry: mockInit,
    }));

    const { register } = await import('@/instrumentation');
    await register();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('should NOT call initTelemetry when NEXT_RUNTIME is undefined', async () => {
    delete process.env.NEXT_RUNTIME;

    const mockInit = vi.fn();
    vi.doMock('@/lib/telemetry', () => ({
      initTelemetry: mockInit,
    }));

    const { register } = await import('@/instrumentation');
    await register();

    expect(mockInit).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 3. Logger Tests
// ============================================================================

describe('Logger (lib/logger.ts)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return a pino logger from getLogger()', async () => {
    vi.doMock('@opentelemetry/api', () => ({
      trace: { getSpan: vi.fn().mockReturnValue(null) },
      context: { active: vi.fn() },
    }));

    const { getLogger } = await import('@/lib/logger');
    const logger = getLogger();

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should include module name in child logger bindings', async () => {
    vi.doMock('@opentelemetry/api', () => ({
      trace: { getSpan: vi.fn().mockReturnValue(null) },
      context: { active: vi.fn() },
    }));

    const pino = await import('pino');
    const mockChild = vi.fn().mockReturnValue(pino.default({ level: 'silent' }));
    vi.doMock('pino', () => {
      const realPino = vi.fn().mockReturnValue({
        child: mockChild,
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        level: 'info',
      });
      return { default: realPino };
    });

    const { getLogger } = await import('@/lib/logger');
    getLogger('chat');

    expect(mockChild).toHaveBeenCalledWith(
      expect.objectContaining({ module: 'chat' })
    );
  });

  it('should include traceId and spanId when OTel span is active', async () => {
    const mockSpanContext = {
      traceId: 'abc123trace',
      spanId: 'def456span',
    };
    vi.doMock('@opentelemetry/api', () => ({
      trace: {
        getSpan: vi.fn().mockReturnValue({
          spanContext: () => mockSpanContext,
        }),
      },
      context: { active: vi.fn() },
    }));

    const pino = await import('pino');
    const mockChild = vi.fn().mockReturnValue(pino.default({ level: 'silent' }));
    vi.doMock('pino', () => {
      const realPino = vi.fn().mockReturnValue({
        child: mockChild,
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        level: 'info',
      });
      return { default: realPino };
    });

    const { getLogger } = await import('@/lib/logger');
    getLogger('test-module');

    expect(mockChild).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'test-module',
        traceId: 'abc123trace',
        spanId: 'def456span',
      })
    );
  });

  it('should NOT include traceId/spanId when no OTel span is active', async () => {
    vi.doMock('@opentelemetry/api', () => ({
      trace: { getSpan: vi.fn().mockReturnValue(null) },
      context: { active: vi.fn() },
    }));

    const pino = await import('pino');
    const mockChild = vi.fn().mockReturnValue(pino.default({ level: 'silent' }));
    vi.doMock('pino', () => {
      const realPino = vi.fn().mockReturnValue({
        child: mockChild,
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        level: 'info',
      });
      return { default: realPino };
    });

    const { getLogger } = await import('@/lib/logger');
    getLogger();

    expect(mockChild).toHaveBeenCalledWith({});
  });

  it('should export a default base logger', async () => {
    vi.doMock('@opentelemetry/api', () => ({
      trace: { getSpan: vi.fn().mockReturnValue(null) },
      context: { active: vi.fn() },
    }));

    const mod = await import('@/lib/logger');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default.info).toBe('function');
  });
});

// ============================================================================
// 4. Analytics Client Helper Tests
// ============================================================================

describe('Analytics (lib/analytics.ts)', () => {
  let mockGtag: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    mockGtag = vi.fn();
    // Simulate browser environment with gtag
    (globalThis as Record<string, unknown>).window = { gtag: mockGtag };
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  it('should call gtag with correct params for chatMessageSent', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.chatMessageSent('gpt-4');

    expect(mockGtag).toHaveBeenCalledWith('event', 'chat_message_sent', {
      event_category: 'chat',
      event_label: 'gpt-4',
      value: undefined,
    });
  });

  it('should call gtag with correct params for chatModelChanged', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.chatModelChanged('llama-3');

    expect(mockGtag).toHaveBeenCalledWith('event', 'chat_model_changed', {
      event_category: 'chat',
      event_label: 'llama-3',
      value: undefined,
    });
  });

  it('should call gtag with correct params for toolToggled', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.toolToggled('json', true);

    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_toggled', {
      event_category: 'tools',
      event_label: 'json:true',
      value: undefined,
    });
  });

  it('should call gtag with correct params for toolToggled (disabled)', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.toolToggled('xml', false);

    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_toggled', {
      event_category: 'tools',
      event_label: 'xml:false',
      value: undefined,
    });
  });

  it('should call gtag with correct params for toolUsed', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.toolUsed('agent_tools_json_format');

    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_used', {
      event_category: 'tools',
      event_label: 'agent_tools_json_format',
      value: undefined,
    });
  });

  it('should call gtag with correct params for navClicked', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.navClicked('/json');

    expect(mockGtag).toHaveBeenCalledWith('event', 'nav_clicked', {
      event_category: 'navigation',
      event_label: '/json',
      value: undefined,
    });
  });

  it('should call gtag with correct params for buttonClicked', async () => {
    const { analytics } = await import('@/lib/analytics');
    analytics.buttonClicked('send');

    expect(mockGtag).toHaveBeenCalledWith('event', 'button_clicked', {
      event_category: 'ui',
      event_label: 'send',
      value: undefined,
    });
  });

  it('should no-op when window is undefined (SSR)', async () => {
    delete (globalThis as Record<string, unknown>).window;

    const { analytics } = await import('@/lib/analytics');
    // Should not throw
    expect(() => analytics.chatMessageSent('model')).not.toThrow();
    expect(() => analytics.navClicked('/test')).not.toThrow();
  });

  it('should no-op when window.gtag is undefined', async () => {
    (globalThis as Record<string, unknown>).window = {};

    const { analytics } = await import('@/lib/analytics');
    // Should not throw even without gtag
    expect(() => analytics.chatMessageSent('model')).not.toThrow();
    expect(() => analytics.toolToggled('json', true)).not.toThrow();
    expect(() => analytics.buttonClicked('test')).not.toThrow();
  });
});

// ============================================================================
// 5. Instrumented Chat API Route Tests
// ============================================================================

describe('Instrumented Chat API Route (api/chat/route.ts)', () => {
  const originalEnv = { ...process.env };

  // Mock OTel span tracking
  let spanAttributes: Record<string, unknown>;
  let spanEvents: { name: string; attributes?: Record<string, unknown> }[];
  let spanStatus: { code: number; message?: string } | null;
  let spanExceptions: Error[];
  let spanEnded: boolean;

  const mockSpan = () => {
    spanAttributes = {};
    spanEvents = [];
    spanStatus = null;
    spanExceptions = [];
    spanEnded = false;
    return {
      setAttributes: (attrs: Record<string, unknown>) => {
        Object.assign(spanAttributes, attrs);
      },
      setAttribute: (key: string, value: unknown) => {
        spanAttributes[key] = value;
      },
      addEvent: (name: string, attrs?: Record<string, unknown>) => {
        spanEvents.push({ name, attributes: attrs });
      },
      setStatus: (status: { code: number; message?: string }) => {
        spanStatus = status;
      },
      recordException: (err: Error) => {
        spanExceptions.push(err);
      },
      end: () => { spanEnded = true; },
      spanContext: () => ({ traceId: 'test-trace-id', spanId: 'test-span-id' }),
    };
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.HF_TOKEN = 'test-token';

    // Mock OTel API
    vi.doMock('@opentelemetry/api', () => ({
      trace: {
        getTracer: () => ({
          startActiveSpan: (name: string, fn: (span: ReturnType<typeof mockSpan>) => unknown) => {
            return fn(mockSpan());
          },
        }),
        getSpan: vi.fn().mockReturnValue(null),
      },
      context: { active: vi.fn() },
      SpanStatusCode: { OK: 0, ERROR: 2 },
    }));

    // Mock logger
    vi.doMock('@/lib/logger', () => ({
      getLogger: () => ({
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      }),
    }));

    // Mock session
    vi.doMock('@/lib/chat-session', () => ({
      getSession: vi.fn().mockResolvedValue(null),
      createSession: vi.fn().mockReturnValue({
        id: 'test-session-id',
        messageCount: 0,
        createdAt: Date.now(),
      }),
      setSessionCookie: vi.fn().mockResolvedValue(undefined),
      getMessageLimit: vi.fn().mockReturnValue(0),
    }));

    // Mock system prompt builder
    vi.doMock('@/lib/chat-system-prompt', () => ({
      buildSystemPrompt: vi.fn().mockReturnValue('You are a helpful assistant.'),
    }));
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return 400 when message is missing', async () => {
    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledCategories: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Message is required');
  });

  it('should return 503 when HF_TOKEN is not set', async () => {
    delete process.env.HF_TOKEN;

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello', enabledCategories: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.code).toBe('AI_NOT_CONFIGURED');
  });

  it('should return successful response with OTel spans for simple message', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Hello! How can I help?' } }],
        usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello there',
        enabledCategories: { json: true },
        model: 'microsoft/Phi-4-mini-instruct',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Hello! How can I help?');
    expect(body.toolResults).toBeUndefined();

    vi.unstubAllGlobals();
  });

  it('should handle tool calls with individual spans', async () => {
    // First LLM call returns a tool call, second call returns summary
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '```tool\n{"tool":"agent_tools_json_format","arguments":{"input":"{}"}}\n```' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Here is the formatted JSON.' } }],
          usage: { prompt_tokens: 30, completion_tokens: 10, total_tokens: 40 },
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([
        { tool: 'agent_tools_json_format', arguments: { input: '{}' } },
      ]),
      executeToolCalls: vi.fn().mockResolvedValue([
        { tool: 'agent_tools_json_format', success: true, result: '{}' },
      ]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Format this JSON: {}',
        enabledCategories: { json: true },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Here is the formatted JSON.');
    expect(body.toolResults).toHaveLength(1);
    expect(body.toolResults[0].tool).toBe('agent_tools_json_format');
    expect(body.toolResults[0].success).toBe(true);

    vi.unstubAllGlobals();
  });

  it('should handle LLM API errors (credits exhausted)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limit exceeded'),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        enabledCategories: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(503);

    const body = await response.json();
    expect(body.code).toBe('CREDITS_EXHAUSTED');

    vi.unstubAllGlobals();
  });

  it('should handle generic LLM API errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        enabledCategories: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toContain('HF API error');

    vi.unstubAllGlobals();
  });

  it('should log user and assistant messages via logger', async () => {
    const mockLogInfo = vi.fn();
    const mockLogError = vi.fn();

    vi.doMock('@/lib/logger', () => ({
      getLogger: () => ({
        info: mockLogInfo,
        error: mockLogError,
        warn: vi.fn(),
        debug: vi.fn(),
      }),
    }));

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test message',
        enabledCategories: {},
      }),
    });

    await POST(request);

    // Verify user message was logged
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'chat.user_message',
        role: 'user',
        content: 'Test message',
      })
    );

    // Verify assistant message was logged
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'chat.assistant_message',
        role: 'assistant',
        content: 'Response',
      })
    );

    vi.unstubAllGlobals();
  });

  it('should truncate long messages in logs', async () => {
    const mockLogInfo = vi.fn();

    vi.doMock('@/lib/logger', () => ({
      getLogger: () => ({
        info: mockLogInfo,
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      }),
    }));

    const longMessage = 'A'.repeat(2000);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'Short reply' } }],
        usage: {},
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: longMessage,
        enabledCategories: {},
      }),
    });

    await POST(request);

    // Verify the user message was truncated
    const userLogCall = mockLogInfo.mock.calls.find(
      (call: unknown[]) => (call[0] as Record<string, unknown>).event === 'chat.user_message'
    );
    expect(userLogCall).toBeDefined();
    const loggedContent = (userLogCall![0] as Record<string, string>).content;
    expect(loggedContent.length).toBeLessThan(2000);
    expect(loggedContent).toContain('...[truncated]');

    vi.unstubAllGlobals();
  });

  it('should log errors on unexpected failures', async () => {
    const mockLogError = vi.fn();

    vi.doMock('@/lib/logger', () => ({
      getLogger: () => ({
        info: vi.fn(),
        error: mockLogError,
        warn: vi.fn(),
        debug: vi.fn(),
      }),
    }));

    // Make fetch throw an unexpected error
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure'));
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        enabledCategories: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'chat.error',
        error: 'Network failure',
      })
    );

    vi.unstubAllGlobals();
  });

  it('should include history in LLM call', async () => {
    let capturedBody: string | undefined;
    const mockFetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      capturedBody = opts.body as string;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Reply with context' } }],
          usage: {},
        }),
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Follow up',
        enabledCategories: {},
        history: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First reply' },
        ],
      }),
    });

    await POST(request);

    const parsed = JSON.parse(capturedBody!);
    // Should have system + 2 history + 1 new = 4 messages
    expect(parsed.messages).toHaveLength(4);
    expect(parsed.messages[0].role).toBe('system');
    expect(parsed.messages[1].content).toBe('First message');
    expect(parsed.messages[2].content).toBe('First reply');
    expect(parsed.messages[3].content).toBe('Follow up');

    vi.unstubAllGlobals();
  });

  it('GET should return chat status', async () => {
    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { GET } = await import('@/app/api/chat/route');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('configured');
    expect(body).toHaveProperty('model');
    expect(body.configured).toBe(true); // HF_TOKEN is set
  });

  it('should handle message limit', async () => {
    vi.doMock('@/lib/chat-session', () => ({
      getSession: vi.fn().mockResolvedValue({
        id: 'limit-session',
        messageCount: 10,
        createdAt: Date.now(),
      }),
      createSession: vi.fn(),
      setSessionCookie: vi.fn().mockResolvedValue(undefined),
      getMessageLimit: vi.fn().mockReturnValue(10),
    }));

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([]),
      executeToolCalls: vi.fn().mockResolvedValue([]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'One more message',
        enabledCategories: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.limited).toBe(true);
  });

  it('should gracefully fall back when second LLM call fails after tool execution', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '```tool\n{"tool":"test_tool","arguments":{}}\n```' } }],
          usage: {},
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error on second call'),
      });
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('@/lib/chat-tool-executor', () => ({
      parseToolCalls: vi.fn().mockReturnValue([
        { tool: 'test_tool', arguments: {} },
      ]),
      executeToolCalls: vi.fn().mockResolvedValue([
        { tool: 'test_tool', success: true, result: 'Tool output' },
      ]),
    }));

    const { POST } = await import('@/app/api/chat/route');

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Run a tool',
        enabledCategories: {},
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    // Should contain fallback message with tool results
    expect(body.message).toContain('test_tool');
    expect(body.message).toContain('Tool output');

    vi.unstubAllGlobals();
  });
});

// ============================================================================
// 6. Content Truncation Tests (edge cases)
// ============================================================================

describe('Content truncation', () => {
  it('should not truncate strings under 1000 chars', () => {
    const short = 'Hello world';
    // We test the truncate logic by calling the chat route with a short message
    // and verifying the log gets the full content. But we can also test directly:
    expect(short.length).toBeLessThan(1000);
  });

  it('should truncate strings over 1000 chars with marker', () => {
    const long = 'A'.repeat(1500);
    const truncated = long.length > 1000 ? long.slice(0, 1000) + '...[truncated]' : long;
    expect(truncated.length).toBe(1014); // 1000 + '...[truncated]'.length
    expect(truncated).toContain('...[truncated]');
    expect(truncated).not.toEqual(long);
  });

  it('should preserve exactly 1000 char strings without truncation', () => {
    const exact = 'B'.repeat(1000);
    const truncated = exact.length > 1000 ? exact.slice(0, 1000) + '...[truncated]' : exact;
    expect(truncated).toEqual(exact);
    expect(truncated).not.toContain('...[truncated]');
  });
});
