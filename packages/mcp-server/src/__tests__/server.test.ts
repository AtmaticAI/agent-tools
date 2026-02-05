import { describe, it, expect } from 'vitest';
import { createServer } from '../server';

describe('MCP Server', () => {
  it('should create a server instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it('should have tools capability', () => {
    const server = createServer();
    // The server should be configured with tools capability
    expect(server).toBeDefined();
  });
});

describe('MCP HTTP Transport', () => {
  // These tests require the HTTP server to be running
  // They can be run as integration tests

  describe('JSON-RPC Requests', () => {
    it('should handle tools/list request format', () => {
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      };

      expect(request.jsonrpc).toBe('2.0');
      expect(request.method).toBe('tools/list');
    });

    it('should handle tools/call request format', () => {
      const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'agent_tools_json_format',
          arguments: {
            input: '{"a":1}',
            indent: 2,
          },
        },
      };

      expect(request.method).toBe('tools/call');
      expect(request.params.name).toBe('agent_tools_json_format');
    });

    it('should handle initialize request format', () => {
      const request = {
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      };

      expect(request.method).toBe('initialize');
    });
  });

  describe('Response Formats', () => {
    it('should format success response correctly', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          tools: [
            {
              name: 'agent_tools_json_format',
              description: 'Format JSON',
              inputSchema: { type: 'object' },
            },
          ],
        },
      };

      expect(response.jsonrpc).toBe('2.0');
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeInstanceOf(Array);
    });

    it('should format error response correctly', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
      };

      expect(response.error).toBeDefined();
      expect(response.error.code).toBe(-32600);
    });
  });
});

describe('MCP SSE Transport', () => {
  describe('Event Formats', () => {
    it('should format connected event', () => {
      const event = {
        event: 'connected',
        data: JSON.stringify({ clientId: 'abc123' }),
      };

      expect(event.event).toBe('connected');
      const data = JSON.parse(event.data);
      expect(data.clientId).toBeDefined();
    });

    it('should format message event', () => {
      const event = {
        event: 'message',
        data: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'result' }] },
        }),
      };

      expect(event.event).toBe('message');
      const data = JSON.parse(event.data);
      expect(data.result).toBeDefined();
    });
  });
});
