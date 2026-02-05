import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ToolCategory, ToolSettings, SettingsRepository } from '@agent-tools/core/settings';
import { SettingsService, ALL_TOOL_CATEGORIES, DEFAULT_SETTINGS } from '@agent-tools/core/settings';

// ---------------------------------------------------------------------------
// In-memory repository for testing (avoids filesystem I/O)
// ---------------------------------------------------------------------------

class InMemorySettingsRepository implements SettingsRepository {
  private settings: ToolSettings;

  constructor(initial?: ToolSettings) {
    this.settings = initial ?? {
      ...DEFAULT_SETTINGS,
      enabled: { ...DEFAULT_SETTINGS.enabled },
      updatedAt: new Date().toISOString(),
    };
  }

  getDefaults(): ToolSettings {
    return {
      ...DEFAULT_SETTINGS,
      enabled: { ...DEFAULT_SETTINGS.enabled },
      updatedAt: new Date().toISOString(),
    };
  }

  async load(): Promise<ToolSettings> {
    return { ...this.settings, enabled: { ...this.settings.enabled } };
  }

  async save(settings: ToolSettings): Promise<void> {
    this.settings = { ...settings, enabled: { ...settings.enabled } };
  }
}

// ---------------------------------------------------------------------------
// 1. Settings Service Tests
// ---------------------------------------------------------------------------

describe('SettingsService', () => {
  let repo: InMemorySettingsRepository;
  let service: SettingsService;

  beforeEach(() => {
    repo = new InMemorySettingsRepository();
    service = new SettingsService(repo);
  });

  it('should return all 16 tools enabled by default', async () => {
    const settings = await service.getSettings();

    expect(Object.keys(settings.enabled)).toHaveLength(ALL_TOOL_CATEGORIES.length);
    expect(ALL_TOOL_CATEGORIES).toHaveLength(16);

    for (const category of ALL_TOOL_CATEGORIES) {
      expect(settings.enabled[category]).toBe(true);
    }
  });

  it('should include all expected tool categories', async () => {
    const settings = await service.getSettings();
    const categories = Object.keys(settings.enabled) as ToolCategory[];

    const expectedCategories: ToolCategory[] = [
      'json', 'csv', 'pdf', 'xml', 'excel', 'image',
      'markdown', 'archive', 'regex', 'diff', 'sql', 'crypto', 'datetime',
    ];

    for (const cat of expectedCategories) {
      expect(categories).toContain(cat);
    }
  });

  it('should update settings and persist changes', async () => {
    const updated = await service.updateSettings({ json: false, xml: false });

    expect(updated.enabled.json).toBe(false);
    expect(updated.enabled.xml).toBe(false);
    // Other tools remain enabled
    expect(updated.enabled.csv).toBe(true);
    expect(updated.enabled.crypto).toBe(true);

    // Verify the update persisted (fetch again through the service)
    service.invalidateCache();
    const reloaded = await service.getSettings();
    expect(reloaded.enabled.json).toBe(false);
    expect(reloaded.enabled.xml).toBe(false);
  });

  it('should return correct enabled status via isToolEnabled', async () => {
    expect(await service.isToolEnabled('json')).toBe(true);
    expect(await service.isToolEnabled('crypto')).toBe(true);

    await service.updateSettings({ json: false });

    expect(await service.isToolEnabled('json')).toBe(false);
    expect(await service.isToolEnabled('crypto')).toBe(true);
  });

  it('should use cache for repeated reads within TTL', async () => {
    const loadSpy = vi.spyOn(repo, 'load');

    await service.getSettings();
    await service.getSettings();
    await service.getSettings();

    // First call hits the repo, subsequent calls should use cache
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it('should refresh after cache invalidation', async () => {
    const loadSpy = vi.spyOn(repo, 'load');

    await service.getSettings();
    service.invalidateCache();
    await service.getSettings();

    expect(loadSpy).toHaveBeenCalledTimes(2);
  });

  it('should include version and updatedAt in settings', async () => {
    const settings = await service.getSettings();

    expect(settings.version).toBe(1);
    expect(typeof settings.updatedAt).toBe('string');
    expect(settings.updatedAt.length).toBeGreaterThan(0);
  });

  it('should update the updatedAt timestamp on save', async () => {
    const before = await service.getSettings();
    const beforeTimestamp = before.updatedAt;

    // Small delay to ensure timestamp differs
    await new Promise((resolve) => setTimeout(resolve, 10));

    const after = await service.updateSettings({ sql: false });
    expect(after.updatedAt).not.toBe(beforeTimestamp);
  });

  it('should handle partial updates without resetting other tools', async () => {
    // Disable two tools
    await service.updateSettings({ json: false, csv: false });

    // Now update only one
    const result = await service.updateSettings({ json: true });

    expect(result.enabled.json).toBe(true);
    expect(result.enabled.csv).toBe(false); // still disabled
  });
});

// ---------------------------------------------------------------------------
// 2. Tool Guard Tests
// ---------------------------------------------------------------------------

describe('guardTool', () => {
  // We test guardTool by mocking the settingsService module. The guard function
  // imports settingsService from '@agent-tools/core/settings' and calls
  // isToolEnabled. We mock the whole module to control the return value.

  beforeEach(() => {
    vi.resetModules();
  });

  it('should return null (allowed) when tool is enabled', async () => {
    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: {
        isToolEnabled: vi.fn().mockResolvedValue(true),
      },
    }));

    const { guardTool } = await import('@/lib/tool-guard');
    const result = await guardTool('json');

    expect(result).toBeNull();
  });

  it('should return a 404 JSON response when tool is disabled', async () => {
    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: {
        isToolEnabled: vi.fn().mockResolvedValue(false),
      },
    }));

    const { guardTool } = await import('@/lib/tool-guard');
    const result = await guardTool('xml');

    expect(result).not.toBeNull();
    expect(result!.status).toBe(404);

    const body = await result!.json();
    expect(body.error).toContain('xml');
    expect(body.error).toContain('disabled');
  });

  it('should include the tool category name in the error message', async () => {
    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: {
        isToolEnabled: vi.fn().mockResolvedValue(false),
      },
    }));

    const { guardTool } = await import('@/lib/tool-guard');
    const result = await guardTool('crypto');

    const body = await result!.json();
    expect(body.error).toContain('crypto');
  });
});

// ---------------------------------------------------------------------------
// 3. Route Handler Tests (XML format and SQL format)
// ---------------------------------------------------------------------------
// Next.js route handlers export async POST functions that accept NextRequest
// and return NextResponse. We can call them directly after mocking the guard.

describe('API Route: /api/xml/format', () => {
  beforeEach(() => {
    vi.resetModules();
    // Mock the tool guard to always allow
    vi.doMock('@/lib/tool-guard', () => ({
      guardTool: vi.fn().mockResolvedValue(null),
    }));
  });

  it('should format valid XML', async () => {
    const { POST } = await import('@/app/api/xml/format/route');

    const request = new Request('http://localhost/api/xml/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '<root><child>text</child></root>' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(typeof body.data).toBe('string');
    // Formatted XML should contain the original content
    expect(body.data).toContain('root');
    expect(body.data).toContain('child');
    expect(body.data).toContain('text');
  });

  it('should return 400 when input is missing', async () => {
    const { POST } = await import('@/app/api/xml/format/route');

    const request = new Request('http://localhost/api/xml/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Input XML string required');
  });

  it('should accept custom indent option', async () => {
    const { POST } = await import('@/app/api/xml/format/route');

    const request = new Request('http://localhost/api/xml/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: '<root><child>text</child></root>',
        indent: 4,
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeDefined();
  });

  it('should return 404 when tool is disabled', async () => {
    vi.resetModules();
    // Import NextResponse for the mock
    const { NextResponse } = await import('next/server');
    vi.doMock('@/lib/tool-guard', () => ({
      guardTool: vi.fn().mockResolvedValue(
        NextResponse.json(
          { error: 'The "xml" tool category is currently disabled.' },
          { status: 404 }
        )
      ),
    }));

    const { POST } = await import('@/app/api/xml/format/route');

    const request = new Request('http://localhost/api/xml/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '<root/>' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(404);
  });
});

describe('API Route: /api/sql/format', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/lib/tool-guard', () => ({
      guardTool: vi.fn().mockResolvedValue(null),
    }));
  });

  it('should format valid SQL', async () => {
    const { POST } = await import('@/app/api/sql/format/route');

    const request = new Request('http://localhost/api/sql/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'SELECT id, name FROM users WHERE active = 1' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(typeof body.data).toBe('string');
    // Formatted SQL should preserve the query structure
    expect(body.data.toUpperCase()).toContain('SELECT');
    expect(body.data.toUpperCase()).toContain('FROM');
  });

  it('should return 400 when input is missing', async () => {
    const { POST } = await import('@/app/api/sql/format/route');

    const request = new Request('http://localhost/api/sql/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Input SQL string required');
  });

  it('should accept dialect and uppercase options', async () => {
    const { POST } = await import('@/app/api/sql/format/route');

    const request = new Request('http://localhost/api/sql/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'select * from users',
        uppercase: true,
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toBeDefined();
  });
});

describe('API Route: /api/crypto/hash', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/lib/tool-guard', () => ({
      guardTool: vi.fn().mockResolvedValue(null),
    }));
  });

  it('should hash a string with default algorithm', async () => {
    const { POST } = await import('@/app/api/crypto/hash/route');

    const request = new Request('http://localhost/api/crypto/hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'hello world' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.result).toBeDefined();
  });

  it('should return 400 when input is missing', async () => {
    const { POST } = await import('@/app/api/crypto/hash/route');

    const request = new Request('http://localhost/api/crypto/hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Input string required');
  });

  it('should accept a specific algorithm', async () => {
    const { POST } = await import('@/app/api/crypto/hash/route');

    const request = new Request('http://localhost/api/crypto/hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'test', algorithm: 'sha256' }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 4. Settings API Route Handler Tests
// ---------------------------------------------------------------------------

describe('API Route: /api/settings', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('GET should return settings with all tools enabled by default', async () => {
    const inMemoryService = new SettingsService(new InMemorySettingsRepository());

    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: inMemoryService,
    }));

    const { GET } = await import('@/app/api/settings/route');
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.enabled).toBeDefined();
    expect(Object.keys(body.enabled)).toHaveLength(16);

    for (const category of ALL_TOOL_CATEGORIES) {
      expect(body.enabled[category]).toBe(true);
    }
  });

  it('PUT should update settings successfully', async () => {
    const inMemoryService = new SettingsService(new InMemorySettingsRepository());

    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: inMemoryService,
    }));

    const { PUT } = await import('@/app/api/settings/route');

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: { json: false, sql: false } }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.settings.enabled.json).toBe(false);
    expect(body.settings.enabled.sql).toBe(false);
    expect(body.settings.enabled.csv).toBe(true);
  });

  it('PUT should return 400 when enabled object is missing', async () => {
    const inMemoryService = new SettingsService(new InMemorySettingsRepository());

    vi.doMock('@agent-tools/core/settings', () => ({
      settingsService: inMemoryService,
    }));

    const { PUT } = await import('@/app/api/settings/route');

    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ something: 'else' }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('enabled');
  });
});
